import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Music, Users, TrendingUp, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/community");
      }
    };
    checkUser();
  }, [navigate]);

  return (
    <div className="min-h-screen gradient-hero">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
          <div className="inline-block mb-6">
            <div className="p-4 rounded-full bg-primary/10 glow-effect">
              <Music className="h-16 w-16 text-primary" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent">
            VibeDiscover
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-4">
            Community-Powered Music Discovery
          </p>
          
          <p className="text-lg text-muted-foreground/80 mb-12 max-w-2xl mx-auto">
            Discover music that resonates with your community. Get personalized recommendations based on your age group, region, and what's trending around you.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="gradient-primary hover:opacity-90 transition-opacity text-lg px-8 py-6 glow-effect"
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/auth")}
              className="text-lg px-8 py-6 border-primary/50 hover:bg-primary/10"
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-6xl mx-auto">
          <div className="text-center p-8 rounded-xl bg-card/50 border border-border/50 hover:border-primary/50 transition-all hover:scale-105">
            <div className="inline-block p-3 rounded-full bg-primary/10 mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Community Based</h3>
            <p className="text-muted-foreground">
              Connect with music lovers from your region and age group
            </p>
          </div>

          <div className="text-center p-8 rounded-xl bg-card/50 border border-border/50 hover:border-primary/50 transition-all hover:scale-105">
            <div className="inline-block p-3 rounded-full bg-primary/10 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Smart Discovery</h3>
            <p className="text-muted-foreground">
              AI-powered recommendations tailored to your community's taste
            </p>
          </div>

          <div className="text-center p-8 rounded-xl bg-card/50 border border-border/50 hover:border-primary/50 transition-all hover:scale-105">
            <div className="inline-block p-3 rounded-full bg-primary/10 mb-4">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Real-Time Trends</h3>
            <p className="text-muted-foreground">
              See what's hot in your community with live analytics
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
