import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Music, Award } from "lucide-react";

export default function Analytics() {
  const [genreData, setGenreData] = useState<any[]>([]);
  const [topArtists, setTopArtists] = useState<any[]>([]);
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

      // Get all songs for analytics
      const { data: songs } = await supabase
        .from("songs")
        .select("*");

      if (songs) {
        // Genre distribution
        const genreMap = new Map<string, number>();
        songs.forEach(song => {
          genreMap.set(song.genre, (genreMap.get(song.genre) || 0) + 1);
        });
        
        const genreChartData = Array.from(genreMap.entries()).map(([name, value]) => ({
          name,
          value,
        }));
        setGenreData(genreChartData);

        // Top artists by popularity
        const artistMap = new Map<string, number>();
        songs.forEach(song => {
          const current = artistMap.get(song.artist) || 0;
          artistMap.set(song.artist, current + song.popularity);
        });

        const artistChartData = Array.from(artistMap.entries())
          .map(([artist, popularity]) => ({ artist, popularity }))
          .sort((a, b) => b.popularity - a.popularity)
          .slice(0, 8);
        
        setTopArtists(artistChartData);
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
              Discover what's trending across communities
            </p>
          </div>

          {loading ? (
            <div className="text-center text-muted-foreground">Loading analytics...</div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}
