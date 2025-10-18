import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const country = url.searchParams.get('country');
    const city = url.searchParams.get('city');
    const ageGroup = url.searchParams.get('age_group');
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');

    // Build filters
    let songsQuery = supabase.from('songs').select('*');
    
    if (country) {
      songsQuery = songsQuery.eq('community_country', country);
    }
    if (city) {
      songsQuery = songsQuery.eq('community_region', city);
    }
    if (ageGroup) {
      songsQuery = songsQuery.eq('community_age_group', ageGroup);
    }

    const { data: songs, error: songsError } = await songsQuery;
    
    if (songsError) {
      console.error('Error fetching songs:', songsError);
      return new Response(JSON.stringify({ error: songsError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate engagement metrics by region
    const engagementByRegion: Record<string, any> = {};
    songs?.forEach(song => {
      const region = `${song.community_region}, ${song.community_country}`;
      if (!engagementByRegion[region]) {
        engagementByRegion[region] = {
          region,
          country: song.community_country,
          city: song.community_region,
          totalPlays: 0,
          totalLikes: 0,
          totalShares: 0,
          totalEngagement: 0,
          topGenre: '',
          topArtist: '',
          lat: getLatLng(song.community_country, song.community_region).lat,
          lng: getLatLng(song.community_country, song.community_region).lng,
        };
      }
      
      engagementByRegion[region].totalPlays += song.plays || 0;
      engagementByRegion[region].totalLikes += song.likes || 0;
      engagementByRegion[region].totalShares += song.shares || 0;
      engagementByRegion[region].totalEngagement += (song.plays || 0) + (song.likes || 0) * 2 + (song.shares || 0) * 3;
    });

    // Get top genre and artist per region
    Object.keys(engagementByRegion).forEach(region => {
      const regionSongs = songs?.filter(s => 
        `${s.community_region}, ${s.community_country}` === region
      ) || [];
      
      const genreCounts = new Map<string, number>();
      const artistCounts = new Map<string, number>();
      
      regionSongs.forEach(song => {
        const genreCount = (genreCounts.get(song.genre) || 0) + (song.popularity || 0);
        genreCounts.set(song.genre, genreCount);
        
        const artistCount = (artistCounts.get(song.artist) || 0) + (song.popularity || 0);
        artistCounts.set(song.artist, artistCount);
      });
      
      const topGenre = Array.from(genreCounts.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0] || '';
      const topArtist = Array.from(artistCounts.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0] || '';
      
      engagementByRegion[region].topGenre = topGenre;
      engagementByRegion[region].topArtist = topArtist;
    });

    const engagementData = Object.values(engagementByRegion);

    // Get cluster data
    const { data: clusters } = await supabase
      .from('cluster_assignments')
      .select('*')
      .eq('item_type', 'song')
      .order('created_at', { ascending: false })
      .limit(500);

    return new Response(
      JSON.stringify({
        success: true,
        engagementMap: engagementData,
        clusters: clusters || [],
        filters: { country, city, ageGroup, startDate, endDate },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analytics-dashboard:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to get approximate lat/lng for major cities
function getLatLng(country: string, city: string): { lat: number; lng: number } {
  const locations: Record<string, Record<string, { lat: number; lng: number }>> = {
    India: {
      Delhi: { lat: 28.7041, lng: 77.1025 },
      Mumbai: { lat: 19.0760, lng: 72.8777 },
      Bengaluru: { lat: 12.9716, lng: 77.5946 },
      Chennai: { lat: 13.0827, lng: 80.2707 },
      Kolkata: { lat: 22.5726, lng: 88.3639 },
      Hyderabad: { lat: 17.3850, lng: 78.4867 },
    },
    USA: {
      'New York': { lat: 40.7128, lng: -74.0060 },
      'Los Angeles': { lat: 34.0522, lng: -118.2437 },
      Chicago: { lat: 41.8781, lng: -87.6298 },
      Houston: { lat: 29.7604, lng: -95.3698 },
      Miami: { lat: 25.7617, lng: -80.1918 },
    },
    UK: {
      London: { lat: 51.5074, lng: -0.1278 },
      Manchester: { lat: 53.4808, lng: -2.2426 },
      Birmingham: { lat: 52.4862, lng: -1.8904 },
      Liverpool: { lat: 53.4084, lng: -2.9916 },
    },
    Japan: {
      Tokyo: { lat: 35.6762, lng: 139.6503 },
      Osaka: { lat: 34.6937, lng: 135.5023 },
      Kyoto: { lat: 35.0116, lng: 135.7681 },
    },
    'South Korea': {
      Seoul: { lat: 37.5665, lng: 126.9780 },
      Busan: { lat: 35.1796, lng: 129.0756 },
    },
    France: {
      Paris: { lat: 48.8566, lng: 2.3522 },
      Lyon: { lat: 45.7640, lng: 4.8357 },
      Marseille: { lat: 43.2965, lng: 5.3698 },
    },
  };

  return locations[country]?.[city] || { lat: 0, lng: 0 };
}
