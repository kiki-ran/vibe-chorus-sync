import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";
import { Network } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ClusterVisualizationProps {
  clusters: any[];
}

const CLUSTER_COLORS = [
  'hsl(258 90% 66%)',
  'hsl(280 90% 60%)',
  'hsl(260 80% 55%)',
  'hsl(270 85% 65%)',
  'hsl(250 75% 60%)',
];

export function ClusterVisualization({ clusters }: ClusterVisualizationProps) {
  if (!clusters || clusters.length === 0) {
    return null;
  }

  const scatterData = clusters.map((cluster) => ({
    x: cluster.coordinates_2d?.x || 0,
    y: cluster.coordinates_2d?.y || 0,
    cluster: cluster.cluster_id,
    label: cluster.cluster_label,
  }));

  // Group by cluster for legend
  const clusterGroups = clusters.reduce((acc, cluster) => {
    if (!acc[cluster.cluster_id]) {
      acc[cluster.cluster_id] = {
        id: cluster.cluster_id,
        label: cluster.cluster_label,
        count: 0,
      };
    }
    acc[cluster.cluster_id].count++;
    return acc;
  }, {} as Record<number, { id: number; label: string; count: number }>);

  return (
    <Card className="border-border/50 bg-card/50 md:col-span-2">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-primary" />
          <CardTitle>Cluster Visualization (K-Means)</CardTitle>
        </div>
        <CardDescription>Song clusters based on audio features and community preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {Object.values(clusterGroups).map((group: { id: number; label: string; count: number }) => (
              <Badge 
                key={group.id} 
                variant="outline"
                style={{ borderColor: CLUSTER_COLORS[group.id % CLUSTER_COLORS.length] }}
              >
                <span 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: CLUSTER_COLORS[group.id % CLUSTER_COLORS.length] }}
                />
                {group.label} ({group.count})
              </Badge>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Component 1" 
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Component 2" 
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))' 
                }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
                        <p className="font-semibold">{data.label}</p>
                        <p className="text-xs text-muted-foreground">Cluster {data.cluster}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter data={scatterData} fill="hsl(258 90% 66%)">
                {scatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CLUSTER_COLORS[entry.cluster % CLUSTER_COLORS.length]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
