import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Music, Award, Users, Cpu, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListeningPersonality } from "@/components/analytics/ListeningPersonality";
import { ClusterVisualization } from "@/components/analytics/ClusterVisualization";
import { EngagementMap } from "@/components/analytics/EngagementMap";

export default function Analytics() {
  const [genreData, setGenreData] = useState<any[]>([]);
  const [topArtists, setTopArtists] = useState<any[]>([]);
  const [communityGenres, setCommunityGenres] = useState<any[]>([]);
  const [trendingSongs, setTrendingSongs] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [engagementData, setEngagementData] = useState<any[]>([]);
  const [clusters, setClusters] = useState<any[]>([]);
  const [mlModels, setMlModels] = useState<any[]>([]);
  const [filterCountry, setFilterCountry] = useState<string>("");
  const [filterCity, setFilterCity] = useState<string>("");
  const [filterAgeGroup, setFilterAgeGroup] = useState<string>("");
  const navigate = useNavigate();

  const COLORS = ['hsl(258 90% 66%)', 'hsl(280 90% 60%)', 'hsl(260 80% 55%)', 'hsl(270 85% 65%)', 'hsl(250 75% 60%)', 'hsl(240 70% 50%)'];

  const countries = ['India', 'USA', 'UK', 'Japan', 'South Korea', 'France'];
  const ageGroups = ['13-17', '18-24', '25-34', '35-44', '45+'];

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

      // Initialize filters with user profile
      if (profileData) {
        setFilterCountry(profileData.country || "");
        setFilterCity(profileData.region || "");
        setFilterAgeGroup(profileData.age_group || "");
      }

      await loadData(profileData);
    };

    loadAnalytics();
  }, [navigate]);

  const loadData = async (profileData: any) => {
    // Get all songs
    const { data: songs } = await supabase.from("songs").select("*");

      if (songs) {
        // Global genre distribution - show only top 6, group rest as "Other"
        const genreMap = new Map<string, number>();
        songs.forEach(song => {
          genreMap.set(song.genre, (genreMap.get(song.genre) || 0) + 1);
        });
        
        const sortedGenres = Array.from(genreMap.entries()).sort((a, b) => b[1] - a[1]);
        const top6Genres = sortedGenres.slice(0, 6);
        const otherGenres = sortedGenres.slice(6);
        const otherCount = otherGenres.reduce((sum, [_, count]) => sum + count, 0);
        
        const genreChartData = top6Genres.map(([name, value]) => ({ name, value }));
        if (otherCount > 0) {
          genreChartData.push({ name: 'Other', value: otherCount });
        }
        setGenreData(genreChartData);

        // Top artists by popularity - filtered by community if profile exists
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

          const citySongs = songs
            .filter(s => 
              s.community_country === profileData.country &&
              s.community_region === profileData.region
            )
            .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
            .slice(0, 10);

          setTrendingSongs(citySongs);
        }
      }

      // Load dashboard data (engagement map and clusters)
      try {
        const { data: dashboardData } = await supabase.functions.invoke('analytics-dashboard', {
          body: { 
            country: filterCountry,
            city: filterCity,
            age_group: filterAgeGroup
          }
        });

        if (dashboardData) {
          setEngagementData(dashboardData.engagementMap || []);
          setClusters(dashboardData.clusters || []);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }

      // Load ML models info
      try {
        const { data: modelsData } = await supabase.functions.invoke('ml-models-info');
        if (modelsData) {
          setMlModels(modelsData.models || []);
        }
      } catch (error) {
        console.error('Error loading ML models:', error);
      }

      setLoading(false);
    };

  const handleRegionClick = (city: string, country: string) => {
    setFilterCity(city);
    setFilterCountry(country);
    loadData(profile);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Advanced Analytics Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              {profile ? `Personalized insights for ${profile.region}, ${profile.country}` : 'Discover trends across communities'}
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-8 border-border/50 bg-card/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                <CardTitle>Filters</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Select value={filterCountry} onValueChange={setFilterCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterAgeGroup} onValueChange={setFilterAgeGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select age group" />
                  </SelectTrigger>
                  <SelectContent>
                    {ageGroups.map(age => (
                      <SelectItem key={age} value={age}>{age}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={() => loadData(profile)}>Apply Filters</Button>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="text-center text-muted-foreground">Loading analytics...</div>
          ) : (
            <>
              {/* Listening Personality */}
              {profile?.country && profile?.region && profile?.age_group && (
                <div className="mb-8">
                  <ListeningPersonality 
                    country={profile.country}
                    region={profile.region}
                    ageGroup={profile.age_group}
                  />
                </div>
              )}

              {/* Community Engagement Map */}
              <div className="mb-8">
                <EngagementMap 
                  engagementData={engagementData}
                  onRegionClick={handleRegionClick}
                />
              </div>

              {/* Cluster Visualization */}
              <div className="mb-8">
                <ClusterVisualization clusters={clusters} />
              </div>
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

                    {/* Top 10 Songs in City */}
                    <Card className="border-border/50 bg-card/50">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-primary" />
                          <CardTitle>Top 10 in {profile.region}</CardTitle>
                        </div>
                        <CardDescription>Most popular songs in your city</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto">
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

                {/* ML Models Info */}
                <Card className="border-border/50 bg-card/50 md:col-span-2">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Cpu className="h-5 w-5 text-primary" />
                      <CardTitle>ML Models</CardTitle>
                    </div>
                    <CardDescription>Active recommendation and clustering models</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {mlModels.map((model) => (
                        <div key={model.id} className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                          <h4 className="font-semibold mb-2">{model.model_name}</h4>
                          <p className="text-xs text-muted-foreground mb-3">{model.model_type}</p>
                          {model.metrics && (
                            <div className="space-y-1 text-sm">
                              {Object.entries(model.metrics).slice(0, 2).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-muted-foreground text-xs">{key}:</span>
                                  <Badge variant="outline" className="text-xs">{value as string}</Badge>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
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
