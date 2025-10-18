import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EngagementMapProps {
  engagementData: any[];
  onRegionClick?: (region: string, country: string) => void;
}

export function EngagementMap({ engagementData, onRegionClick }: EngagementMapProps) {
  if (!engagementData || engagementData.length === 0) {
    return null;
  }

  // Sort by engagement for top regions
  const sortedData = [...engagementData].sort((a, b) => b.totalEngagement - a.totalEngagement);

  return (
    <Card className="border-border/50 bg-card/50 md:col-span-2">
      <CardHeader>
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <CardTitle>Community Engagement Map</CardTitle>
        </div>
        <CardDescription>Streaming activity across regions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedData.slice(0, 9).map((region) => (
            <div
              key={region.region}
              className="p-4 rounded-lg border border-border/50 bg-card hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => onRegionClick?.(region.city, region.country)}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold">{region.city}</h4>
                  <p className="text-sm text-muted-foreground">{region.country}</p>
                </div>
                <Badge variant="secondary">{region.totalEngagement.toLocaleString()}</Badge>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plays:</span>
                  <span className="font-medium">{region.totalPlays.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Likes:</span>
                  <span className="font-medium">{region.totalLikes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Top Genre:</span>
                  <Badge variant="outline" className="text-xs">{region.topGenre}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
