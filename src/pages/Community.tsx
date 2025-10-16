import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Users } from "lucide-react";

export default function Community() {
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Load existing profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setCountry(profile.country || "");
        setRegion(profile.region || "");
        setAgeGroup(profile.age_group || "");
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          country,
          region,
          age_group: ageGroup,
        })
        .eq("id", session.user.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your community preferences have been saved.",
      });
      navigate("/recommendations");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto border-border/50 animate-fade-in">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-primary/10 glow-effect">
                <Users className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl">Join Your Community</CardTitle>
            <CardDescription className="text-base">
              Select your community to get personalized music recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select value={country} onValueChange={setCountry} required>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50">
                    <SelectItem value="USA">United States</SelectItem>
                    <SelectItem value="UK">United Kingdom</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                    <SelectItem value="Germany">Germany</SelectItem>
                    <SelectItem value="France">France</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Select value={region} onValueChange={setRegion} required>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Select your region" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50">
                    <SelectItem value="West Coast">West Coast</SelectItem>
                    <SelectItem value="East Coast">East Coast</SelectItem>
                    <SelectItem value="Midwest">Midwest</SelectItem>
                    <SelectItem value="South">South</SelectItem>
                    <SelectItem value="London">London</SelectItem>
                    <SelectItem value="Toronto">Toronto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ageGroup">Age Group</Label>
                <Select value={ageGroup} onValueChange={setAgeGroup} required>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Select your age group" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50">
                    <SelectItem value="18-25">18-25</SelectItem>
                    <SelectItem value="26-35">26-35</SelectItem>
                    <SelectItem value="35-50">35-50</SelectItem>
                    <SelectItem value="50+">50+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full gradient-primary hover:opacity-90 transition-opacity"
                disabled={loading}
              >
                {loading ? "Saving..." : "Continue to Recommendations"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
