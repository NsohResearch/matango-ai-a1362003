import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Globe, Plus, Loader2, Check, X, RefreshCw, AlertCircle } from "lucide-react";
import { useSocialConnections, useConnectSocial, useDisconnectSocial } from "@/hooks/useData";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PLATFORMS = [
  { id: "instagram", name: "Instagram", icon: "📸", color: "from-pink-500 to-purple-500" },
  { id: "tiktok", name: "TikTok", icon: "🎵", color: "from-cyan-500 to-teal-500" },
  { id: "linkedin", name: "LinkedIn", icon: "💼", color: "from-blue-500 to-blue-700" },
  { id: "twitter", name: "X (Twitter)", icon: "𝕏", color: "from-gray-500 to-gray-700" },
  { id: "youtube", name: "YouTube", icon: "▶️", color: "from-red-500 to-red-700" },
  { id: "facebook", name: "Facebook", icon: "📘", color: "from-blue-600 to-blue-800" },
];

const SocialConnectionsPage = () => {
  const { data: connections, isLoading } = useSocialConnections();
  const connectMutation = useConnectSocial();
  const disconnectMutation = useDisconnectSocial();
  const [connectDialog, setConnectDialog] = useState<string | null>(null);
  const [username, setUsername] = useState("");

  const getConnection = (platformId: string) =>
    connections?.find((c) => c.platform === platformId);

  const handleConnect = () => {
    if (!connectDialog) return;
    connectMutation.mutate(
      { platform: connectDialog, platform_username: username || undefined },
      { onSuccess: () => { setConnectDialog(null); setUsername(""); } }
    );
  };

  const handleDisconnect = (connectionId: string) => {
    if (confirm("Disconnect this platform?")) {
      disconnectMutation.mutate(connectionId);
    }
  };

  const selectedPlatform = PLATFORMS.find(p => p.id === connectDialog);

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold flex items-center gap-2">
            <Globe className="h-8 w-8 text-primary" /> Social Connections
          </h1>
          <p className="mt-1 text-muted-foreground">Connect your social media accounts for publishing.</p>
        </div>

        <div className="glass-card rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Demo Mode</p>
            <p className="text-xs text-muted-foreground">Full OAuth integration requires platform app credentials. Connections are simulated for demonstration.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {PLATFORMS.map((platform) => {
              const conn = getConnection(platform.id);
              return (
                <div key={platform.id} className="glass-card rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center text-lg`}>
                        {platform.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{platform.name}</h3>
                        {conn ? (
                          <p className="text-xs text-muted-foreground">@{conn.platform_username || "connected"}</p>
                        ) : (
                          <p className="text-xs text-muted-foreground">Not connected</p>
                        )}
                      </div>
                    </div>
                    {conn ? (
                      <Check className="h-5 w-5 text-primary" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground/30" />
                    )}
                  </div>
                  {conn ? (
                    <div className="flex gap-2">
                      <button onClick={() => { setConnectDialog(platform.id); setUsername(conn.platform_username || ""); }}
                        className="flex-1 px-3 py-2 rounded-lg bg-secondary text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1">
                        <RefreshCw className="h-3 w-3" /> Reconnect
                      </button>
                      <button onClick={() => handleDisconnect(conn.id)}
                        disabled={disconnectMutation.isPending}
                        className="px-3 py-2 rounded-lg bg-destructive/10 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50">
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => { setConnectDialog(platform.id); setUsername(""); }}
                      className="w-full px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-1">
                      <Plus className="h-3 w-3" /> Connect
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!connectDialog} onOpenChange={(open) => !open && setConnectDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedPlatform && <span className="text-lg">{selectedPlatform.icon}</span>}
              Connect {selectedPlatform?.name}
            </DialogTitle>
            <DialogDescription>
              Enter your {selectedPlatform?.name} username to simulate the connection. Full OAuth will be available in a future update.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Username</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder={`@your_${connectDialog}_handle`} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setConnectDialog(null)}>Cancel</Button>
              <Button onClick={handleConnect} disabled={connectMutation.isPending}>
                {connectMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Connect
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default SocialConnectionsPage;
