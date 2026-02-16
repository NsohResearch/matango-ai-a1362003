/**
 * AAOActivityWidget — Shows recent AI operator activity on the dashboard.
 * Adapted from trpc to Supabase.
 */
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bot, Sparkles, MessageSquare, BarChart3, Video, Image,
  Calendar, TrendingUp, Clock, CheckCircle2, Loader2, AlertCircle, Activity,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  content_generation: Sparkles,
  engagement: MessageSquare,
  analytics: BarChart3,
  video_creation: Video,
  image_generation: Image,
  scheduling: Calendar,
  campaign: TrendingUp,
  default: Bot,
};

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-green-500",
  in_progress: "bg-blue-500",
  pending: "bg-yellow-500",
  failed: "bg-red-500",
};

interface AAOActivityWidgetProps {
  compact?: boolean;
  maxItems?: number;
}

export default function AAOActivityWidget({ compact = false, maxItems = 10 }: AAOActivityWidgetProps) {
  const { user } = useAuth();

  const { data: events, isLoading } = useQuery({
    queryKey: ["aao-activity", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analytics_events")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(maxItems);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-display">
            <Activity className="h-4 w-4 text-primary" /> Ka'h Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-display">
          <Activity className="h-4 w-4 text-primary" /> Ka'h Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!events || events.length === 0 ? (
          <div className="text-center py-6">
            <Bot className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No activity yet. Ka'h is ready to work.</p>
          </div>
        ) : (
          <ScrollArea className={compact ? "h-[200px]" : "h-[300px]"}>
            <div className="space-y-2">
              {events.map((event) => {
                const Icon = ACTIVITY_ICONS[event.event_type] || ACTIVITY_ICONS.default;
                return (
                  <div key={event.id} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="p-1 rounded-md bg-primary/10 shrink-0">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate capitalize">{event.event_type.replace(/_/g, " ")}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {event.platform && (
                      <Badge variant="secondary" className="text-[9px] shrink-0">{event.platform}</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
