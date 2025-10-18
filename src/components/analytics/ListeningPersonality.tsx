import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { User } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ListeningPersonalityProps {
  country: string;
  region: string;
  ageGroup: string;
}

export function ListeningPersonality({ country, region, ageGroup }: ListeningPersonalityProps) {
  const [personality, setPersonality] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPersonality = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('listening-personality', {
          body: { country, region, age_group: ageGroup }
        });

        if (error) throw error;
        setPersonality(data.personality);
      } catch (error) {
        console.error('Error fetching personality:', error);
      } finally {
        setLoading(false);
      }
    };

    if (country && region && ageGroup) {
      fetchPersonality();
    }
  }, [country, region, ageGroup]);

  if (loading) {
    return <Card className="border-border/50 bg-card/50"><CardContent className="p-8 text-center text-muted-foreground">Loading personality...</CardContent></Card>;
  }

  if (!personality) {
    return null;
  }

  const radarData = [
    { metric: 'Tempo', user: personality.user.tempo / 2, community: personality.community.tempo / 2 },
    { metric: 'Energy', user: personality.user.energy * 100, community: personality.community.energy * 100 },
    { metric: 'Valence', user: personality.user.valence * 100, community: personality.community.valence * 100 },
    { metric: 'Danceability', user: personality.user.danceability * 100, community: personality.community.danceability * 100 },
    { metric: 'Diversity', user: personality.user.diversity * 100, community: personality.community.diversity * 100 },
  ];

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <CardTitle>Your Listening Personality</CardTitle>
        </div>
        <CardDescription>How your musical taste compares to the community</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis 
              dataKey="metric" 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" />
            <Radar 
              name="You" 
              dataKey="user" 
              stroke="hsl(258 90% 66%)" 
              fill="hsl(258 90% 66%)" 
              fillOpacity={0.6}
            />
            <Radar 
              name="Community Avg" 
              dataKey="community" 
              stroke="hsl(280 90% 60%)" 
              fill="hsl(280 90% 60%)" 
              fillOpacity={0.3}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))' 
              }} 
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
        <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
          <p className="text-sm text-muted-foreground">{personality.summary}</p>
        </div>
      </CardContent>
    </Card>
  );
}
