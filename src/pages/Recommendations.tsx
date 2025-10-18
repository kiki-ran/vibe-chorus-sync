import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Music2, TrendingUp, Users, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
  popularity: number;
  social_ranking: number;
  why?: string;
  confidence?: string;
  rank?: number;
}

interface MLResponse {
  recommendations: Song[];
  method: string;
  ml_model: string;
  total_analyzed?: number;
}

export default function Recommendations() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [mlInfo, setMlInfo] = useState<{ method: string; model: string; analyzed: number } | null>(null);
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

      // Call ML recommendation edge function
      const { data: mlData, error: mlError } = await supabase.functions.invoke('ml-recommendations', {
        body: {
          country: profileData.country,
          region: profileData.region,
          age_group: profileData.age_group
        }
      });

      if (mlError) {
        console.error('ML Error:', mlError);
        toast({
          title: "Error",
          description: "Failed to load ML recommendations",
          variant: "destructive",
        });
      } else {
        const mlResponse = mlData as MLResponse;
        setSongs(mlResponse.recommendations || []);
        setMlInfo({
          method: mlResponse.method,
          model: mlResponse.ml_model,
          analyzed: mlResponse.total_analyzed || 0
        });
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
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-primary animate-pulse" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                AI-Powered Recommendations
              </h1>
            </div>
            {profile && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-lg">
                  Personalized for {profile.region}, {profile.country} • Age {profile.age_group}
                </p>
                {mlInfo && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary" className="gap-1">
                      <Sparkles className="h-3 w-3" />
                      {mlInfo.model}
                    </Badge>
                    {mlInfo.analyzed > 0 && (
                      <span>• Analyzed {mlInfo.analyzed} songs from your community</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid gap-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="border-border/50 bg-card/50">
                  <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : songs.length === 0 ? (
            <Card className="border-border/50 bg-card/50">
              <CardContent className="py-12 text-center">
                <Music2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground text-lg font-medium mb-2">
                  No songs found for your community yet
                </p>
                <p className="text-sm text-muted-foreground">
                  Our ML model is analyzing music preferences in your region. Check back soon!
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
                        {song.rank && song.rank <= 3 && (
                          <TrendingUp className="h-5 w-5 text-primary" />
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center justify-between gap-2">
                        <span>{song.artist}</span>
                        {song.confidence && (
                          <Badge variant="secondary" className="gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {Math.round(parseFloat(song.confidence) * 100)}% match
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="gap-1">
                        {song.genre}
                      </Badge>
                      {song.rank && (
                        <Badge variant="secondary">#{song.rank}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {song.why && (
                      <div className="mb-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                        <p className="text-sm text-muted-foreground italic">{song.why}</p>
                      </div>
                    )}
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
