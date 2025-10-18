import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, Music, Award, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Analytics() {
  const [genreData, setGenreData] = useState<any[]>([]);
  const [topArtists, setTopArtists] = useState<any[]>([]);
  const [communityGenres, setCommunityGenres] = useState<any[]>([]);
  const [trendingSongs, setTrendingSongs] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const COLORS = ['hsl(258 90% 66%)', 'hsl(280 90% 60%)', 'hsl(260 80% 55%)', 'hsl(270 85% 65%)', 'hsl(250 75% 60%)'];

  useEffect(() => {
    const loadAnalytics = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Get user profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setProfile(profileData);

      // Get all songs for global analytics
      const { data: songs } = await supabase
        .from("songs")
        .select("*");

      if (songs) {
        // Global genre distribution - show only top 6, group rest as "Other"
        const genreMap = new Map<string, number>();
        songs.forEach(song => {
          genreMap.set(song.genre, (genreMap.get(song.genre) || 0) + 1);
        });
        
        const sortedGenres = Array.from(genreMap.entries())
          .sort((a, b) => b[1] - a[1]);
        
        const top6Genres = sortedGenres.slice(0, 6);
        const otherGenres = sortedGenres.slice(6);
        const otherCount = otherGenres.reduce((sum, [_, count]) => sum + count, 0);
        
        const genreChartData = top6Genres.map(([name, value]) => ({
          name,
          value,
        }));
        
        if (otherCount > 0) {
          genreChartData.push({ name: 'Other', value: otherCount });
        }
        
        setGenreData(genreChartData);

        // Top artists by popularity - community specific if profile exists
        let relevantSongs = songs;
        if (profileData?.country && profileData?.region && profileData?.age_group) {
          relevantSongs = songs.filter(s => 
            s.community_country === profileData.country &&
            s.community_region === profileData.region &&
            s.community_age_group === profileData.age_group
          );
        }

        const artistMap = new Map<string, number>();
        relevantSongs.forEach(song => {
          const current = artistMap.get(song.artist) || 0;
          artistMap.set(song.artist, current + song.popularity);
        });

        const artistChartData = Array.from(artistMap.entries())
          .map(([artist, popularity]) => ({ artist, popularity }))
          .sort((a, b) => b.popularity - a.popularity)
          .slice(0, 8);
        
        setTopArtists(artistChartData);

        // Personalized analytics if profile exists
        if (profileData?.country && profileData?.region && profileData?.age_group) {
          // Top genres in user's community
          const communitySongs = songs.filter(s => 
            s.community_country === profileData.country &&
            s.community_region === profileData.region &&
            s.community_age_group === profileData.age_group
          );

          const communityGenreMap = new Map<string, number>();
          communitySongs.forEach(song => {
            const current = communityGenreMap.get(song.genre) || 0;
            communityGenreMap.set(song.genre, current + song.popularity);
          });

          const topCommunityGenres = Array.from(communityGenreMap.entries())
            .map(([genre, popularity]) => ({ genre, popularity }))
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, 5);

          setCommunityGenres(topCommunityGenres);

          // Trending songs in user's city
          const citySongs = songs
            .filter(s => 
              s.community_country === profileData.country &&
              s.community_region === profileData.region
            )
            .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
            .slice(0, 5);

          setTrendingSongs(citySongs);
        }
      }

      setLoading(false);
    };

    loadAnalytics();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto animate-fade-in">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Community Analytics
            </h1>
            <p className="text-muted-foreground text-lg">
              {profile ? `Personalized insights for ${profile.region}, ${profile.country}` : 'Discover what\'s trending across communities'}
            </p>
          </div>

          {loading ? (
            <div className="text-center text-muted-foreground">Loading analytics...</div>
          ) : (
            <>
              {/* Personalized Analytics */}
              {profile?.country && communityGenres.length > 0 && (
                <div className="mb-8 space-y-8">
                  <div className="text-center">
                    <Badge variant="secondary" className="gap-2 py-2 px-4">
                      <Users className="h-4 w-4" />
                      Your Community Analytics
                    </Badge>
                  </div>

                  <div className="grid gap-8 md:grid-cols-2">
                    {/* Top 5 Genres in User's Community */}
                    <Card className="border-border/50 bg-card/50">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <Music className="h-5 w-5 text-primary" />
                          <CardTitle>Top Genres in Your Community</CardTitle>
                        </div>
                        <CardDescription>
                          Most popular genres in {profile.region}, {profile.age_group}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={communityGenres}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis 
                              dataKey="genre" 
                              stroke="hsl(var(--muted-foreground))" 
                              angle={-45}
                              textAnchor="end"
                              height={100}
                            />
                            <YAxis stroke="hsl(var(--muted-foreground))" />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))', 
                                border: '1px solid hsl(var(--border))' 
                              }} 
                            />
                            <Bar dataKey="popularity" fill="hsl(258 90% 66%)" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Trending Songs in City */}
                    <Card className="border-border/50 bg-card/50">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-primary" />
                          <CardTitle>Trending in {profile.region}</CardTitle>
                        </div>
                        <CardDescription>Top songs in your city right now</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {trendingSongs.map((song, index) => (
                            <div key={song.id} className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                                #{index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{song.title}</p>
                                <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                              </div>
                              <Badge variant="outline">{song.popularity}</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Global Analytics */}
              <div className="text-center mb-8">
                <Badge variant="outline" className="gap-2 py-2 px-4">
                  <Award className="h-4 w-4" />
                  Global Trends
                </Badge>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
              {/* Genre Distribution */}
              <Card className="border-border/50 bg-card/50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Music className="h-5 w-5 text-primary" />
                    <CardTitle>Genre Distribution</CardTitle>
                  </div>
                  <CardDescription>Popular genres across all communities</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={genreData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {genreData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))' 
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Artists */}
              <Card className="border-border/50 bg-card/50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <CardTitle>Top Artists</CardTitle>
                  </div>
                  <CardDescription>Most popular artists by community engagement</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topArtists}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="artist" 
                        stroke="hsl(var(--muted-foreground))" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))' 
                        }} 
                      />
                      <Bar dataKey="popularity" fill="hsl(258 90% 66%)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

                {/* Trending Stats */}
                <Card className="border-border/50 bg-card/50 md:col-span-2">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <CardTitle>Community Insights</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center p-6 rounded-lg bg-primary/10">
                      <div className="text-3xl font-bold text-primary mb-2">
                        {genreData.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Active Genres</div>
                    </div>
                    <div className="text-center p-6 rounded-lg bg-primary/10">
                      <div className="text-3xl font-bold text-primary mb-2">
                        {topArtists.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Featured Artists</div>
                    </div>
                    <div className="text-center p-6 rounded-lg bg-primary/10">
                      <div className="text-3xl font-bold text-primary mb-2">
                        {genreData.reduce((acc, curr) => acc + curr.value, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Tracks</div>
                    </div>
                  </div>
                </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
