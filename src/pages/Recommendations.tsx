import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Music2, TrendingUp, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
  popularity: number;
  social_ranking: number;
}

export default function Recommendations() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadRecommendations = async () => {
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

      if (!profileData?.country || !profileData?.region || !profileData?.age_group) {
        toast({
          title: "Set up your community first",
          description: "Please complete your community selection to get recommendations.",
        });
        navigate("/community");
        return;
      }

      setProfile(profileData);

      // Get songs matching the user's community
      const { data: songsData, error } = await supabase
        .from("songs")
        .select("*")
        .eq("community_country", profileData.country)
        .eq("community_region", profileData.region)
        .eq("community_age_group", profileData.age_group)
        .order("social_ranking", { ascending: true })
        .limit(10);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load recommendations",
          variant: "destructive",
        });
      } else {
        setSongs(songsData || []);
      }

      setLoading(false);
    };

    loadRecommendations();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto animate-fade-in">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Your Community's Top Picks
            </h1>
            {profile && (
              <p className="text-muted-foreground text-lg">
                Trending in {profile.region}, {profile.country} • Age {profile.age_group}
              </p>
            )}
          </div>

          {loading ? (
            <div className="text-center text-muted-foreground">Loading recommendations...</div>
          ) : songs.length === 0 ? (
            <Card className="border-border/50 bg-card/50">
              <CardContent className="py-12 text-center">
                <Music2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No songs found for your community yet. Check back soon!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {songs.map((song, index) => (
                <Card 
                  key={song.id} 
                  className="border-border/50 bg-card/50 hover:bg-card transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-xl">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {song.title}
                        {song.social_ranking <= 3 && (
                          <TrendingUp className="h-5 w-5 text-primary" />
                        )}
                      </CardTitle>
                      <CardDescription>{song.artist}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="gap-1">
                        <Users className="h-3 w-3" />
                        Rank {song.social_ranking}
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        {song.genre}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground mb-1">Popularity</div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="gradient-primary h-2 rounded-full transition-all"
                            style={{ width: `${song.popularity}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {song.popularity}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
