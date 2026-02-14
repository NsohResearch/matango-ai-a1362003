import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import WorkflowNav from "@/components/WorkflowNav";
import { Calendar, ChevronLeft, ChevronRight, Plus, Loader2, Clock } from "lucide-react";
import { useScheduledPosts } from "@/hooks/useData";
import { useSearchParams } from "react-router-dom";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from "date-fns";

const PLATFORMS = ["instagram", "tiktok", "linkedin", "twitter", "youtube", "facebook"];
const PLATFORM_COLORS: Record<string, string> = {
  instagram: "bg-pink-500/20 text-pink-400",
  tiktok: "bg-cyan-500/20 text-cyan-400",
  linkedin: "bg-blue-500/20 text-blue-400",
  twitter: "bg-sky-500/20 text-sky-400",
  youtube: "bg-red-500/20 text-red-400",
  facebook: "bg-indigo-500/20 text-indigo-400",
};

const SchedulerPage = () => {
  const { data: posts, isLoading } = useScheduledPosts();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "list">("month");

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const firstDayOffset = startOfMonth(currentMonth).getDay();

  const getPostsForDay = (day: Date) =>
    posts?.filter((p) => isSameDay(new Date(p.scheduled_for), day)) || [];

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl">
        <WorkflowNav />
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-2">
              <Calendar className="h-8 w-8 text-primary" /> Scheduler
            </h1>
            <p className="mt-1 text-muted-foreground">Schedule and auto-publish across all channels.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-border overflow-hidden">
              {(["month", "week", "list"] as const).map((v) => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-3 py-1.5 text-xs font-medium capitalize ${view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {v}
                </button>
              ))}
            </div>
            <button className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 flex items-center gap-2">
              <Plus className="h-4 w-4" /> Schedule Post
            </button>
          </div>
        </div>

        {/* Calendar header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="font-display text-xl font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : view === "month" ? (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="grid grid-cols-7 border-b border-border">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="p-3 text-center text-xs font-medium text-muted-foreground">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: firstDayOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-border bg-muted/20" />
              ))}
              {days.map((day) => {
                const dayPosts = getPostsForDay(day);
                return (
                  <div key={day.toISOString()} className={`min-h-[100px] border-b border-r border-border p-2 ${isToday(day) ? "bg-primary/5" : ""}`}>
                    <span className={`text-xs font-medium ${isToday(day) ? "text-primary" : "text-muted-foreground"}`}>
                      {format(day, "d")}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayPosts.slice(0, 3).map((p) => (
                        <div key={p.id} className={`text-[10px] px-1.5 py-0.5 rounded truncate ${PLATFORM_COLORS[p.platform] || "bg-muted text-muted-foreground"}`}>
                          {p.platform}
                        </div>
                      ))}
                      {dayPosts.length > 3 && (
                        <div className="text-[10px] text-muted-foreground">+{dayPosts.length - 3} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {posts && posts.length > 0 ? posts.map((p) => (
              <div key={p.id} className="glass-card rounded-xl p-4 flex items-center gap-4">
                <div className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize ${PLATFORM_COLORS[p.platform] || "bg-muted text-muted-foreground"}`}>
                  {p.platform}
                </div>
                <div className="flex-1">
                  <p className="text-sm line-clamp-1">{p.content || "No content"}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {format(new Date(p.scheduled_for), "MMM d, HH:mm")}
                </div>
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  p.status === "published" ? "bg-primary/20 text-primary" :
                  p.status === "failed" ? "bg-destructive/20 text-destructive" :
                  "bg-muted text-muted-foreground"
                }`}>{p.status}</span>
              </div>
            )) : (
              <div className="glass-card rounded-xl p-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-lg font-semibold mb-2">No scheduled posts</h3>
                <p className="text-sm text-muted-foreground">Schedule your first post to start publishing.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SchedulerPage;
