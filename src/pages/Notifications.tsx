import DashboardLayout from "@/components/DashboardLayout";
import { Bell, Check, Loader2 } from "lucide-react";
import { useNotifications } from "@/hooks/useData";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const TYPE_ICONS: Record<string, string> = {
  success: "✅",
  info: "ℹ️",
  warning: "⚠️",
  milestone: "🏆",
  invite: "📨",
  publish: "🚀",
};

const NotificationsPage = () => {
  const { data: notifications, isLoading } = useNotifications();
  const qc = useQueryClient();

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["notifications"] });
  };

  const markAllRead = async () => {
    if (!notifications?.length) return;
    const unread = notifications.filter((n) => !n.is_read);
    for (const n of unread) {
      await supabase.from("notifications").update({ is_read: true }).eq("id", n.id);
    }
    qc.invalidateQueries({ queryKey: ["notifications"] });
  };

  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-2">
              <Bell className="h-8 w-8 text-primary" /> Notifications
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-sm">{unreadCount}</span>
              )}
            </h1>
            <p className="mt-1 text-muted-foreground">Stay updated on your campaigns and platform activity.</p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="px-4 py-2 rounded-lg bg-secondary text-sm text-muted-foreground hover:text-foreground flex items-center gap-2">
              <Check className="h-4 w-4" /> Mark All Read
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : notifications && notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div key={n.id}
                onClick={() => !n.is_read && markRead(n.id)}
                className={`glass-card rounded-xl p-4 flex items-start gap-3 cursor-pointer transition-colors ${!n.is_read ? "border-primary/20 bg-primary/5" : ""}`}>
                <span className="text-lg">{TYPE_ICONS[n.type] || "📌"}</span>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">{n.title}</h4>
                  {n.message && <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>}
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    {new Date(n.created_at).toLocaleDateString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-xl p-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-lg font-semibold mb-2">All caught up</h3>
            <p className="text-sm text-muted-foreground">No notifications at this time.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;
