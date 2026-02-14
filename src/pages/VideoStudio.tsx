import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import WorkflowNav from "@/components/WorkflowNav";
import { Video, Plus, Play, Loader2, Film, Clock, Wand2, X } from "lucide-react";
import { useVideoJobs, useVideoScripts, useInfluencers, useCreateVideoJob } from "@/hooks/useData";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const VideoStudioPage = () => {
  const { data: jobs, isLoading } = useVideoJobs();
  const { data: scripts } = useVideoScripts();
  const { data: influencers } = useInfluencers();
  const createJob = useCreateVideoJob();
  const [searchParams] = useSearchParams();
  const brandId = searchParams.get("brandId");
  const influencerId = searchParams.get("influencerId");
  const scriptId = searchParams.get("scriptId");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    script_id: scriptId || "",
    influencer_id: influencerId || "",
    job_type: "text-to-video",
    lip_sync: false,
  });

  const handleCreate = () => {
    createJob.mutate(
      { ...form, script_id: form.script_id || undefined, influencer_id: form.influencer_id || undefined },
      { onSuccess: () => { setShowCreate(false); toast.success("Video job queued! Processing will begin shortly."); } }
    );
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl">
        <WorkflowNav brandId={brandId} influencerId={influencerId} scriptId={scriptId} />
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-2">
              <Video className="h-8 w-8 text-primary" /> Video Studio
            </h1>
            <p className="mt-1 text-muted-foreground">Script-to-video creation with scene builder and lip sync.</p>
          </div>
          <button onClick={() => setShowCreate(!showCreate)}
            className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 flex items-center gap-2">
            <Plus className="h-4 w-4" /> New Video
          </button>
        </div>

        {showCreate && (
          <div className="glass-card rounded-xl p-6 mb-6 border border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold">Create Video Job</h3>
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Script</label>
                <select value={form.script_id} onChange={(e) => setForm((f) => ({ ...f, script_id: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="">Select script</option>
                  {scripts?.map((s) => <option key={s.id} value={s.id}>{s.title || "Untitled"}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Influencer</label>
                <select value={form.influencer_id} onChange={(e) => setForm((f) => ({ ...f, influencer_id: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="">Select influencer</option>
                  {influencers?.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Job Type</label>
                <select value={form.job_type} onChange={(e) => setForm((f) => ({ ...f, job_type: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="text-to-video">Text to Video</option>
                  <option value="image-to-video">Image to Video</option>
                  <option value="lip-sync">Lip Sync</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.lip_sync} onChange={(e) => setForm((f) => ({ ...f, lip_sync: e.target.checked }))}
                  className="rounded border-border" />
                Enable Lip Sync
              </label>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground">Cancel</button>
              <button onClick={handleCreate} disabled={createJob.isPending}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
                {createJob.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />} Queue Video
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : jobs && jobs.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <div key={job.id} className="glass-card rounded-xl overflow-hidden group">
                <div className="aspect-video bg-muted flex items-center justify-center relative">
                  {job.output_url ? (
                    <video src={job.output_url} className="w-full h-full object-cover" />
                  ) : (
                    <Film className="h-10 w-10 text-muted-foreground" />
                  )}
                  {job.status === "completed" && job.output_url && (
                    <button className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="h-10 w-10 text-white" />
                    </button>
                  )}
                  {job.status === "processing" && (
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${job.progress || 0}%` }} />
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{job.job_type?.replace(/-/g, " ")}</span>
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      job.status === "completed" ? "bg-primary/20 text-primary" :
                      job.status === "processing" ? "bg-accent/20 text-accent" :
                      job.status === "failed" ? "bg-destructive/20 text-destructive" :
                      "bg-muted text-muted-foreground"
                    }`}>{job.status}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {new Date(job.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-xl p-12 text-center">
            <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-lg font-semibold mb-2">No videos yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first AI-generated video.</p>
            <button onClick={() => setShowCreate(true)} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Create Video</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VideoStudioPage;
