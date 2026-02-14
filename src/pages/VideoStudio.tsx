import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Video, Play, Loader2, Film, Clock, Wand2, X, Zap, Image, FileText, ChevronRight } from "lucide-react";
import { useVideoJobs, useVideoScripts, useInfluencers, useCreateVideoJob, useAssetLibrary } from "@/hooks/useData";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { estimateCredits, formatCredits } from "@/lib/credits";
import StepTransition from "@/components/system/StepTransition";

type Tab = "script-to-video" | "image-to-video";

const VideoStudioPage = () => {
  const { data: jobs, isLoading } = useVideoJobs();
  const { data: scripts } = useVideoScripts();
  const { data: influencers } = useInfluencers();
  const { data: assets } = useAssetLibrary();
  const createJob = useCreateVideoJob();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const scriptId = searchParams.get("scriptId");
  const [activeTab, setActiveTab] = useState<Tab>(scriptId ? "script-to-video" : "script-to-video");

  // Script to Video form
  const [stv, setStv] = useState({
    script_id: scriptId || "",
    influencer_id: searchParams.get("influencerId") || "",
    aspect_ratio: "9:16",
    background_style: "studio",
    music_mood: "minimal",
    captions: true,
    quality: "standard_720p",
  });

  // Image to Video form
  const [itv, setItv] = useState({
    image_asset_id: "",
    influencer_id: "",
    duration: 8,
    motion_type: "subtle",
    camera_movement: "push-in",
    lip_sync: false,
    aspect_ratio: "9:16",
    quality: "standard_720p",
  });

  const imageAssets = assets?.filter((a) => a.type === "image" || a.url?.match(/\.(jpg|jpeg|png|webp)/i));

  const stvCredits = estimateCredits("script-to-video-preview", stv.quality === "standard_720p" ? undefined : 30, stv.quality);
  const itvCredits = estimateCredits("image-to-video-preview", itv.duration, itv.quality);

  const selectedScript = scripts?.find((s) => s.id === stv.script_id);
  const sceneCount = selectedScript ? (Array.isArray(selectedScript.scenes) ? selectedScript.scenes.length : 0) : 0;

  const handleScriptToVideo = () => {
    if (!stv.script_id) { toast.error("Select a script first"); return; }
    createJob.mutate(
      {
        job_type: "text-to-video",
        script_id: stv.script_id || undefined,
        influencer_id: stv.influencer_id || undefined,
        lip_sync: false,
      },
      { onSuccess: () => toast.success("Video job queued! Processing will begin shortly.") }
    );
  };

  const handleImageToVideo = () => {
    if (!itv.image_asset_id) { toast.error("Select an image asset first"); return; }
    createJob.mutate(
      {
        job_type: "image-to-video",
        influencer_id: itv.influencer_id || undefined,
        lip_sync: itv.lip_sync,
      },
      { onSuccess: () => toast.success("Image-to-video job queued!") }
    );
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-2">
              <Video className="h-8 w-8 text-primary" /> Creator OS — Video Studio
            </h1>
            <p className="mt-1 text-muted-foreground">Script→Video and Image→Video creation engine.</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 mb-6 p-1 bg-secondary rounded-lg w-fit">
          <button onClick={() => setActiveTab("script-to-video")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "script-to-video" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <FileText className="h-4 w-4" /> Script → Video
          </button>
          <button onClick={() => setActiveTab("image-to-video")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "image-to-video" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <Image className="h-4 w-4" /> Image → Video
          </button>
        </div>

        {/* Script to Video */}
        {activeTab === "script-to-video" && (
          <div className="glass-card rounded-xl p-6 mb-6 border border-primary/20">
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" /> Script → Video
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Script *</label>
                <select value={stv.script_id} onChange={(e) => setStv((f) => ({ ...f, script_id: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="">Select script</option>
                  {scripts?.map((s) => <option key={s.id} value={s.id}>{s.title || "Untitled"} ({s.duration}s)</option>)}
                </select>
                {selectedScript && (
                  <p className="text-xs text-muted-foreground mt-1">{sceneCount} scenes · {selectedScript.platform}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Influencer</label>
                <select value={stv.influencer_id} onChange={(e) => setStv((f) => ({ ...f, influencer_id: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="">No influencer</option>
                  {influencers?.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Aspect Ratio</label>
                <select value={stv.aspect_ratio} onChange={(e) => setStv((f) => ({ ...f, aspect_ratio: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="9:16">9:16 (Vertical)</option>
                  <option value="16:9">16:9 (Horizontal)</option>
                  <option value="1:1">1:1 (Square)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Background</label>
                <select value={stv.background_style} onChange={(e) => setStv((f) => ({ ...f, background_style: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="studio">Studio</option>
                  <option value="abstract">Abstract</option>
                  <option value="lifestyle">Lifestyle</option>
                  <option value="product-demo">Product Demo</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Music Mood</label>
                <select value={stv.music_mood} onChange={(e) => setStv((f) => ({ ...f, music_mood: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="minimal">Minimal</option>
                  <option value="cinematic">Cinematic</option>
                  <option value="upbeat">Upbeat</option>
                  <option value="professional">Professional</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm pb-2.5">
                  <input type="checkbox" checked={stv.captions} onChange={(e) => setStv((f) => ({ ...f, captions: e.target.checked }))}
                    className="rounded border-border" />
                  Enable Captions
                </label>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleScriptToVideo} disabled={createJob.isPending || !stv.script_id}
                className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
                {createJob.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                Queue Video Render
              </button>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Zap className="h-3 w-3" /> ~{formatCredits(stvCredits)}
              </span>
            </div>
          </div>
        )}

        {/* Image to Video */}
        {activeTab === "image-to-video" && (
          <div className="glass-card rounded-xl p-6 mb-6 border border-primary/20">
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
              <Image className="h-5 w-5 text-primary" /> Image → Video
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Image Asset *</label>
                <select value={itv.image_asset_id} onChange={(e) => setItv((f) => ({ ...f, image_asset_id: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="">Select image...</option>
                  {imageAssets?.map((a) => <option key={a.id} value={a.id}>{a.prompt || a.id.slice(0, 8)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Duration (sec)</label>
                <select value={itv.duration} onChange={(e) => setItv((f) => ({ ...f, duration: parseInt(e.target.value) }))}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value={5}>5s</option>
                  <option value={8}>8s</option>
                  <option value={10}>10s</option>
                  <option value={15}>15s</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Motion Type</label>
                <select value={itv.motion_type} onChange={(e) => setItv((f) => ({ ...f, motion_type: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="subtle">Subtle</option>
                  <option value="vlog">Vlog</option>
                  <option value="cinematic">Cinematic</option>
                  <option value="dramatic">Dramatic</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Camera Movement</label>
                <select value={itv.camera_movement} onChange={(e) => setItv((f) => ({ ...f, camera_movement: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="static">Static</option>
                  <option value="push-in">Push In</option>
                  <option value="pan">Pan</option>
                  <option value="handheld">Handheld</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Aspect Ratio</label>
                <select value={itv.aspect_ratio} onChange={(e) => setItv((f) => ({ ...f, aspect_ratio: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="9:16">9:16</option>
                  <option value="16:9">16:9</option>
                  <option value="1:1">1:1</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm pb-2.5">
                  <input type="checkbox" checked={itv.lip_sync} onChange={(e) => setItv((f) => ({ ...f, lip_sync: e.target.checked }))}
                    className="rounded border-border" />
                  Enable Lip Sync (+{formatCredits(estimateCredits("lip-sync"))})
                </label>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleImageToVideo} disabled={createJob.isPending || !itv.image_asset_id}
                className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
                {createJob.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                Generate Video
              </button>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Zap className="h-3 w-3" /> ~{formatCredits(itvCredits)}
                {itv.lip_sync ? ` + ${formatCredits(estimateCredits("lip-sync"))} lip-sync` : ""}
              </span>
            </div>
          </div>
        )}

        {/* Video Jobs Grid */}
        <h3 className="font-display font-semibold text-lg mb-4 mt-8">Video Jobs</h3>
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
                      job.status === "processing" ? "bg-accent/20 text-accent-foreground" :
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
            <p className="text-sm text-muted-foreground mb-4">Generate a script first, then create your video here.</p>
          </div>
        )}

        <StepTransition stepId={3} />
      </div>
    </DashboardLayout>
  );
};

export default VideoStudioPage;
