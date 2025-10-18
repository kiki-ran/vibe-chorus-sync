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
    const { country, region, age_group } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user's community songs
    const { data: communitySongs } = await supabase
      .from('songs')
      .select('*')
      .eq('community_country', country)
      .eq('community_region', region)
      .eq('community_age_group', age_group);

    if (!communitySongs || communitySongs.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'No data available for your community' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate user personality metrics (simulated based on community)
    const genres = new Set(communitySongs.map(s => s.genre));
    const avgTempo = communitySongs.reduce((sum, s) => sum + (s.tempo || 0), 0) / communitySongs.length;
    const avgEnergy = communitySongs.reduce((sum, s) => sum + (s.energy || 0), 0) / communitySongs.length;
    const avgValence = communitySongs.reduce((sum, s) => sum + (s.valence || 0), 0) / communitySongs.length;
    const avgDanceability = communitySongs.reduce((sum, s) => sum + (s.danceability || 0), 0) / communitySongs.length;
    const diversityScore = genres.size / communitySongs.length;

    // Get global averages for comparison
    const { data: allSongs } = await supabase
      .from('songs')
      .select('tempo, energy, valence, danceability, genre');

    const globalAvgTempo = (allSongs?.reduce((sum, s) => sum + (s.tempo || 0), 0) || 0) / (allSongs?.length || 1);
    const globalAvgEnergy = (allSongs?.reduce((sum, s) => sum + (s.energy || 0), 0) || 0) / (allSongs?.length || 1);
    const globalAvgValence = (allSongs?.reduce((sum, s) => sum + (s.valence || 0), 0) || 0) / (allSongs?.length || 1);
    const globalAvgDanceability = (allSongs?.reduce((sum, s) => sum + (s.danceability || 0), 0) || 0) / (allSongs?.length || 1);

    // Calculate percentiles
    const tempoPercentile = ((avgTempo / globalAvgTempo) * 100).toFixed(0);
    const energyPercentile = ((avgEnergy / globalAvgEnergy) * 100).toFixed(0);
    const valencePercentile = ((avgValence / globalAvgValence) * 100).toFixed(0);

    // Generate personality summary
    const summary = generatePersonalitySummary({
      avgTempo,
      avgEnergy,
      avgValence,
      diversityScore,
      tempoPercentile,
      energyPercentile,
      valencePercentile,
      region,
    });

    return new Response(
      JSON.stringify({
        success: true,
        personality: {
          user: {
            tempo: Math.round(avgTempo),
            energy: avgEnergy.toFixed(2),
            valence: avgValence.toFixed(2),
            danceability: avgDanceability.toFixed(2),
            diversity: diversityScore.toFixed(2),
          },
          community: {
            tempo: Math.round(globalAvgTempo),
            energy: globalAvgEnergy.toFixed(2),
            valence: globalAvgValence.toFixed(2),
            danceability: globalAvgDanceability.toFixed(2),
          },
          percentiles: {
            tempo: tempoPercentile,
            energy: energyPercentile,
            valence: valencePercentile,
          },
          summary,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in listening-personality:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generatePersonalitySummary(data: any): string {
  const { avgTempo, avgEnergy, avgValence, diversityScore, tempoPercentile, energyPercentile, valencePercentile, region } = data;
  
  let summary = '';
  
  if (avgEnergy > 0.7) {
    summary += `You prefer high-energy, upbeat tracks more than ${energyPercentile}% of users in ${region}. `;
  } else if (avgEnergy < 0.4) {
    summary += `You enjoy calmer, more relaxed music compared to ${100 - energyPercentile}% of listeners in ${region}. `;
  } else {
    summary += `Your energy preferences are well-balanced, similar to most users in ${region}. `;
  }
  
  if (avgValence > 0.7) {
    summary += `You gravitate toward positive, cheerful songs. `;
  } else if (avgValence < 0.4) {
    summary += `You appreciate more melancholic or introspective music. `;
  }
  
  if (diversityScore > 0.3) {
    summary += `Your listening habits show great genre diversity, exploring a wide range of musical styles.`;
  } else {
    summary += `You have strong genre preferences, staying true to your favorite musical styles.`;
  }
  
  return summary;
}
