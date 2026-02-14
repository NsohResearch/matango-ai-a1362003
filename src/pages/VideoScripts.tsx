import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { FileText, Plus, Loader2, Play, Clock, Film } from "lucide-react";
import { useVideoScripts } from "@/hooks/useData";
import { useNavigate } from "react-router-dom";

const VideoScriptsPage = () => {
  const { data: scripts, isLoading } = useVideoScripts();
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-2">
              <FileText className="h-8 w-8 text-primary" /> Video Scripts
            </h1>
            <p className="mt-1 text-muted-foreground">AI-generated video scripts and storyboards.</p>
          </div>
          <button className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 flex items-center gap-2">
            <Plus className="h-4 w-4" /> New Script
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : scripts && scripts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {scripts.map((s) => (
              <div key={s.id} className="glass-card rounded-xl p-5 hover:border-primary/20 transition-colors group cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <Film className="h-5 w-5 text-primary" />
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                    {s.script_type || "custom"}
                  </span>
                </div>
                <h3 className="font-display font-semibold">{s.title || "Untitled Script"}</h3>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  {s.duration && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {s.duration}s</span>}
                  {s.platform && <span className="capitalize">{s.platform}</span>}
                </div>
                <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => navigate("/video-studio")}
                    className="flex-1 px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 flex items-center justify-center gap-1">
                    <Play className="h-3 w-3" /> Send to Studio
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-xl p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-lg font-semibold mb-2">No scripts yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create AI-powered video scripts for your campaigns.</p>
            <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Create Script</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VideoScriptsPage;
