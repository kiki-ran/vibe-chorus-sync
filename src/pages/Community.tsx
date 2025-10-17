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

  const countries = [
    "India",
    "USA", 
    "UK",
    "Japan",
    "South Korea",
    "France"
  ];
  
  const regionsByCountry: Record<string, string[]> = {
    "India": ["Delhi", "Mumbai", "Bengaluru", "Chennai", "Hyderabad", "Pune", "Calicut"],
    "USA": ["New York", "Los Angeles", "Chicago", "Houston", "Miami", "Austin", "Portland", "Las Vegas", "Toronto"],
    "UK": ["London", "Manchester", "Glasgow"],
    "Japan": ["Tokyo", "Osaka"],
    "South Korea": ["Seoul"],
    "France": ["Paris"]
  };
  
  const ageGroups = ["13-18", "19-25", "26-40", "40+"];

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
                <Select value={country} onValueChange={(value) => { setCountry(value); setRegion(""); }} required>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50">
                    {countries.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Region / City</Label>
                <Select value={region} onValueChange={setRegion} required disabled={!country}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder={country ? "Select your region/city" : "Select country first"} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50">
                    {country && regionsByCountry[country]?.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
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
                    {ageGroups.map((ag) => (
                      <SelectItem key={ag} value={ag}>{ag}</SelectItem>
                    ))}
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
