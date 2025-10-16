import { Music, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const Navbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    } else {
      navigate("/");
    }
  };

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Music className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            VibeDiscover
          </span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link to="/community">
            <Button variant="ghost" size="sm">Community</Button>
          </Link>
          <Link to="/recommendations">
            <Button variant="ghost" size="sm">Discover</Button>
          </Link>
          <Link to="/analytics">
            <Button variant="ghost" size="sm">Analytics</Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
};
