import { useState, useRef, useCallback, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Video, Play, Loader2, Film, Clock, Wand2, X, Zap, Image, FileText,
  ChevronRight, Upload, CheckCircle2, Sparkles, Monitor, Lock, Copy,
  Eye, Trash2, Download, ArrowLeft, Send, Clapperboard, Scissors,
  LayoutGrid, Plus
} from "lucide-react";
import {
  useVideoJobs, useVideoScripts, useInfluencers, useCreateVideoJob,
  useDeleteVideoJob, useAssetLibrary, useCreateAsset, useVideoOutputs,
  useCreateVideoOutput
} from "@/hooks/useData";
import { useAuth } from "@/hooks/useAuth";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { estimateCredits, formatCredits } from "@/lib/credits";
import {
  FORMAT_PRESETS, QUALITY_OPTIONS, MAX_FINAL_RENDERS,
  getPreset, getResolution, getAllowedQualities, type VideoQuality
} from "@/lib/video-formats";
import StepTransition from "@/components/system/StepTransition";
import { supabase } from "@/integrations/supabase/client";
import { resolveAssetUrl } from "@/lib/storage";

/** Resolves a storage path to a displayable image */
const StorageImageThumb = ({ urlOrPath, bucket }: { urlOrPath: string; bucket: string }) => {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    if (urlOrPath.startsWith("http") || urlOrPath.startsWith("data:")) {
      setSrc(urlOrPath);
    } else {
      resolveAssetUrl(urlOrPath, bucket, false).then((url) => url && setSrc(url));
    }
  }, [urlOrPath, bucket]);
  return src ? <img src={src} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full animate-pulse bg-muted" />;
};

type View = "home" | "text-to-video" | "image-to-video" | "my-videos";
type ItvStep = "upload" | "train" | "generate" | "gallery";
type ItvSourceTab = "upload" | "generate";

const TOOL_CARDS = [
  {
    id: "text-to-video" as View,
    icon: FileText,
    label: "Text to Video",
    desc: "Transform scripts into cinematic videos",
    gradient: "from-primary/30 to-primary/5",
  },
  {
    id: "image-to-video" as View,
    icon: Image,
    label: "Image to Video",
    desc: "Animate still images with motion controls",
    gradient: "from-accent/30 to-accent/5",
  },
  {
    id: "my-videos" as View,
    icon: Film,
    label: "My Videos",
    desc: "Browse and manage your generated videos",
    gradient: "from-muted to-secondary",
  },
];

const VideoStudioPage = () => {
  const { data: jobs, isLoading } = useVideoJobs();
  const { data: scripts } = useVideoScripts();
  const { data: influencers } = useInfluencers();
  const { data: assets } = useAssetLibrary();
  const createJob = useCreateVideoJob();
  const createAsset = useCreateAsset();
  const deleteJob = useDeleteVideoJob();
  const { subscription } = useAuth();
  const plan = subscription.plan || "free";
  const allowedQualities = getAllowedQualities(plan);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const scriptId = searchParams.get("scriptId");

  const [view, setView] = useState<View>(scriptId ? "text-to-video" : "home");
  const [quickPrompt, setQuickPrompt] = useState("");

  // Script to Video form
  const [stv, setStv] = useState({
    script_id: scriptId || "",
    influencer_id: searchParams.get("influencerId") || "",
    format_preset: "VERTICAL_9_16",
    background_style: "studio",
    music_mood: "minimal",
    captions: true,
    quality: "720P" as VideoQuality,
  });

  // Image to Video — multi-step state
  const [itvStep, setItvStep] = useState<ItvStep>("upload");
  const [itvSourceTab, setItvSourceTab] = useState<ItvSourceTab>("upload");
  const [itvImages, setItvImages] = useState<{ file: File; preview: string }[]>([]);
  const [itvUploading, setItvUploading] = useState(false);
  const [itvUploadedUrls, setItvUploadedUrls] = useState<string[]>([]);
  const [itvTraining, setItvTraining] = useState(false);
  const [itvTrainProgress, setItvTrainProgress] = useState(0);
  const [itvGenerating, setItvGenerating] = useState(false);
  const [itvJobId, setItvJobId] = useState<string | null>(null);
  const [itvGenPrompt, setItvGenPrompt] = useState("");
  const [itvGenLoading, setItvGenLoading] = useState(false);
  const [itvGenPreview, setItvGenPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [itv, setItv] = useState({
    influencer_id: "",
    duration: 8,
    motion_type: "subtle",
    camera_movement: "push-in",
    lip_sync: false,
    format_preset: "VERTICAL_9_16",
    quality: "720P" as VideoQuality,
  });

  const { data: videoOutputs } = useVideoOutputs(itvJobId || undefined);
  const createVideoOutput = useCreateVideoOutput();

  const MAX_IMAGES = 3;
  const MAX_SIZE_MB = 10;

  const selectedPreset = getPreset(itv.format_preset);
  const selectedRes = getResolution(selectedPreset, itv.quality);
  const isPreview = itv.quality === "PREVIEW_LOW";
  const itvCredits = estimateCredits(isPreview ? "image-to-video-preview" : "image-to-video-final", itv.duration, itv.quality === "PREVIEW_LOW" ? "preview_low" : itv.quality === "4K" ? "pro_4k" : itv.quality === "1080P" ? "hd_1080p" : undefined);

  const finalRenderCount = videoOutputs?.filter((o) => !o.is_preview && ["queued", "running", "succeeded", "completed", "pending"].includes(o.status)).length || 0;
  const canFinalRender = finalRenderCount < MAX_FINAL_RENDERS;

  const selectedScript = scripts?.find((s) => s.id === stv.script_id);
  const sceneCount = selectedScript ? (Array.isArray(selectedScript.scenes) ? selectedScript.scenes.length : 0) : 0;
  const stvPreset = getPreset(stv.format_preset);
  const stvCredits = estimateCredits(stv.quality === "PREVIEW_LOW" ? "script-to-video-preview" : "script-to-video-final", stv.quality === "720P" ? undefined : 30, stv.quality === "PREVIEW_LOW" ? "preview_low" : stv.quality === "4K" ? "pro_4k" : stv.quality === "1080P" ? "hd_1080p" : undefined);

  // Image upload helpers
  const addFiles = useCallback((files: FileList | File[]) => {
    const newFiles = Array.from(files).filter((f) => {
      if (!f.type.startsWith("image/")) { toast.error(`${f.name} is not an image`); return false; }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) { toast.error(`${f.name} exceeds ${MAX_SIZE_MB}MB`); return false; }
      return true;
    });
    setItvImages((prev) => {
      const remaining = MAX_IMAGES - prev.length;
      if (remaining <= 0) { toast.error(`Maximum ${MAX_IMAGES} images allowed`); return prev; }
      const toAdd = newFiles.slice(0, remaining);
      if (newFiles.length > remaining) toast.warning(`Only ${remaining} more image(s) allowed`);
      return [...prev, ...toAdd.map((file) => ({ file, preview: URL.createObjectURL(file) }))];
    });
  }, []);

  const removeImage = (index: number) => {
    setItvImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  // Upload images to storage
  const handleUploadAndTrain = async () => {
    if (itvImages.length === 0) { toast.error("Upload at least 1 image"); return; }
    setItvUploading(true);
    try {
      const paths: string[] = [];
      for (const img of itvImages) {
        const ext = img.file.name.split(".").pop() || "jpg";
        const path = `video-training/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("training-images").upload(path, img.file, { contentType: img.file.type });
        if (error) { console.error("Upload error:", error); toast.error(`Failed to upload ${img.file.name}: ${error.message}`); continue; }
        // Store the path, NOT a signed URL
        paths.push(path);
      }
      if (paths.length === 0) { toast.error("No images were uploaded successfully"); setItvUploading(false); return; }
      setItvUploadedUrls(paths);
      toast.success(`${paths.length} image(s) uploaded`);
      // Skip to generate directly — training is instant for current architecture
      setItvStep("generate");
      toast.success("Images processed! Configure your video settings.");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setItvUploading(false);
    }
  };

  const handleStartTraining = async () => {
    // Instant processing — no fake setTimeout simulation
    setItvTraining(true);
    setItvTrainProgress(100);
    setTimeout(() => {
      setItvTraining(false);
      setItvStep("generate");
      toast.success("Images processed! Ready to generate.");
    }, 800); // Brief UI feedback only
  };

  const handleGenerateVideo = () => {
    if (itvUploadedUrls.length === 0) { toast.error("No uploaded images"); return; }
    if (!isPreview && !canFinalRender) {
      toast.error(`You've reached the max of ${MAX_FINAL_RENDERS} final renders for this project.`);
      return;
    }
    if (!allowedQualities.includes(itv.quality)) {
      toast.error("Launch a higher plan to access this quality level.");
      return;
    }
    setItvGenerating(true);
    for (const url of itvUploadedUrls) {
      createAsset.mutate({ type: "image", url, prompt: "Video training reference", tags: ["training", "image-to-video"] });
    }
    const res = getResolution(selectedPreset, itv.quality);
    // Store storage paths in input_refs, NOT signed URLs
    const imagePaths = itvUploadedUrls.map((u) => {
      // If it's already a path (not a URL), keep it
      if (!u.startsWith("http")) return u;
      // If it's a data URI from AI generation, keep as-is
      if (u.startsWith("data:")) return u;
      // Extract storage path from any full Supabase URL
      const match = u.match(/\/storage\/v1\/object\/(?:public|sign)\/([^?]+)/);
      return match ? match[1] : u;
    });
    createJob.mutate(
      {
        job_type: "image-to-video",
        influencer_id: itv.influencer_id || undefined,
        lip_sync: itv.lip_sync,
        input_refs: {
          images: imagePaths,
          storage_bucket: "training-images",
          motion_type: itv.motion_type,
          camera_movement: itv.camera_movement,
          duration: itv.duration,
          format_preset: itv.format_preset,
          quality: itv.quality,
          width: res.w,
          height: res.h,
        },
      },
      {
        onSuccess: (data: any) => {
          const jobId = data?.id;
          setItvJobId(jobId);
          createVideoOutput.mutate({
            video_job_id: jobId,
            format_preset: itv.format_preset,
            aspect_ratio: selectedPreset.aspect,
            width: res.w,
            height: res.h,
            quality: itv.quality,
            is_preview: isPreview,
            credit_cost: itvCredits,
          });
          createAsset.mutate({
            type: "video",
            prompt: `Image-to-video: ${selectedPreset.label} ${itv.quality} – ${itv.motion_type} motion, ${itv.camera_movement} camera`,
            tags: ["video", "image-to-video", selectedPreset.aspect],
            metadata: { video_job_id: jobId, images: itvUploadedUrls, settings: itv, format: itv.format_preset, quality: itv.quality },
          });
          toast.success(isPreview ? "Preview render queued!" : "Final render queued!");
          setItvGenerating(false);
          setItvStep("gallery");
        },
        onError: () => setItvGenerating(false),
      }
    );
  };

  const handleScriptToVideo = () => {
    if (!stv.script_id) { toast.error("Select a script first"); return; }
    if (!allowedQualities.includes(stv.quality)) { toast.error("Launch a higher plan to access this quality level."); return; }
    createJob.mutate(
      {
        job_type: "text-to-video",
        script_id: stv.script_id || undefined,
        influencer_id: stv.influencer_id || undefined,
        lip_sync: false,
        input_refs: { format_preset: stv.format_preset, quality: stv.quality },
      },
      { onSuccess: () => { toast.success("Video job queued!"); setView("my-videos"); } }
    );
  };

  const handleQuickGenerate = () => {
    if (!quickPrompt.trim()) return;
    toast.info("Quick generation coming soon — use Text to Video for full controls.");
    setView("text-to-video");
  };

  const resetItvFlow = () => {
    setItvStep("upload");
    setItvSourceTab("upload");
    setItvImages([]);
    setItvUploadedUrls([]);
    setItvTrainProgress(0);
    setItvJobId(null);
    setItvGenPrompt("");
    setItvGenPreview(null);
  };

  // AI image generation for Image-to-Video
  const handleGenerateImage = async () => {
    if (!itvGenPrompt.trim()) { toast.error("Enter a prompt to generate an image"); return; }
    setItvGenLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt: itvGenPrompt },
      });
      if (error) throw new Error(error.message || "Generation failed");
      if (data?.error) {
        if (data.error.includes("Rate limit")) toast.error("Rate limit reached. Try again shortly.");
        else if (data.error.includes("credits")) toast.error("AI credits exhausted. Please add funds.");
        else toast.error(data.error);
        return;
      }
      if (data?.image_url) {
        setItvGenPreview(data.image_url);
        toast.success("Image generated! Click 'Use This Image' to continue.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate image");
    } finally {
      setItvGenLoading(false);
    }
  };

  const handleUseGeneratedImage = () => {
    if (!itvGenPreview) return;
    setItvUploadedUrls([itvGenPreview]);
    setItvStep("train");
    toast.success("Image ready! Proceed to training.");
  };

  // Sample image prompts for "Try with one of these"
  const SAMPLE_PROMPTS = [
    { label: "Sunset butterfly", prompt: "A golden butterfly landing on autumn leaves at sunset, cinematic lighting, photorealistic" },
    { label: "Anime character", prompt: "A cheerful anime girl sitting on a watermelon slice in a park, vibrant colors, illustration style" },
    { label: "Cute cat", prompt: "An adorable orange cat detective with a magnifying glass, cartoon style, warm tones" },
    { label: "Street portrait", prompt: "A woman walking with a golden retriever on a city street, candid photography, warm afternoon light" },
  ];

  const imageVideoJobs = jobs?.filter((j) => j.job_type === "image-to-video") || [];

  const ITV_STEPS: { key: ItvStep; label: string; num: number }[] = [
    { key: "upload", label: "Upload", num: 1 },
    { key: "train", label: "Train", num: 2 },
    { key: "generate", label: "Generate", num: 3 },
    { key: "gallery", label: "Gallery", num: 4 },
  ];

  // Format & Quality selector
  const FormatQualityPanel = ({ preset, quality, onPresetChange, onQualityChange }: {
    preset: string; quality: VideoQuality;
    onPresetChange: (v: string) => void; onQualityChange: (v: VideoQuality) => void;
  }) => (
    <div className="space-y-4 p-4 rounded-xl border border-border bg-secondary/30">
      <div className="flex items-center gap-2 mb-1">
        <Monitor className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-semibold">Format & Quality</h4>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">Aspect Ratio</label>
        <div className="grid grid-cols-5 gap-2">
          {FORMAT_PRESETS.map((fp) => {
            const active = fp.id === preset;
            return (
              <button key={fp.id} onClick={() => onPresetChange(fp.id)}
                className={`p-2 rounded-lg border text-center transition-all ${active ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary/30" : "border-border hover:border-primary/40 text-muted-foreground"}`}>
                <div className="text-xs font-semibold">{fp.aspect}</div>
                <div className="text-[10px] mt-0.5 truncate">{fp.label.split("/")[0].trim()}</div>
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">{getPreset(preset).platforms.join(", ")}</p>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">Output Quality</label>
        <div className="grid grid-cols-2 gap-2">
          {QUALITY_OPTIONS.map((q) => {
            const allowed = allowedQualities.includes(q.value);
            const active = q.value === quality;
            return (
              <button key={q.value} onClick={() => allowed && onQualityChange(q.value)} disabled={!allowed}
                className={`p-2.5 rounded-lg border text-left transition-all relative ${
                  active ? "border-primary bg-primary/10 ring-1 ring-primary/30" :
                  allowed ? "border-border hover:border-primary/40" :
                  "border-border/50 opacity-50 cursor-not-allowed"
                }`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{q.label}</span>
                  {!allowed && <Lock className="h-3 w-3 text-muted-foreground" />}
                </div>
                {!allowed && <span className="text-[10px] text-muted-foreground">Higher plan required</span>}
              </button>
            );
          })}
        </div>
      </div>
      {(() => {
        const res = getResolution(getPreset(preset), quality);
        return (
          <div className="text-[10px] text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
            Output: {res.w}×{res.h} · {getPreset(preset).aspect} · {quality === "PREVIEW_LOW" ? "Preview" : quality}
          </div>
        );
      })()}
    </div>
  );

  // Sub-view header with back button
  const SubViewHeader = ({ title, icon: Icon }: { title: string; icon: any }) => (
    <div className="flex items-center gap-3 mb-6">
      <button onClick={() => setView("home")} className="p-2 rounded-lg hover:bg-secondary transition-colors">
        <ArrowLeft className="h-5 w-5 text-muted-foreground" />
      </button>
      <div className="flex items-center gap-2">
        <Icon className="h-6 w-6 text-primary" />
        <h2 className="font-display text-2xl font-bold">{title}</h2>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">

        {/* ═══════════════════════ HOME VIEW ═══════════════════════ */}
        {view === "home" && (
          <>
            {/* Hero Section */}
            <div className="relative rounded-2xl overflow-hidden mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-accent/10" />
              <div className="relative px-8 py-12 lg:py-16 text-center">
                <h1 className="font-display text-3xl lg:text-4xl font-bold mb-3">
                  Describe your ideas and generate
                </h1>
                <p className="text-muted-foreground text-sm lg:text-base mb-8 max-w-xl mx-auto">
                  Transform your words into visual masterpieces. Leverage AI technology to craft breathtaking videos.
                </p>

                {/* Prompt Bar */}
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2 shadow-lg">
                    <Sparkles className="h-5 w-5 text-muted-foreground shrink-0" />
                    <input
                      value={quickPrompt}
                      onChange={(e) => setQuickPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleQuickGenerate()}
                      placeholder="Write a prompt to generate..."
                      className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none py-2"
                    />
                    <button
                      onClick={handleQuickGenerate}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shrink-0"
                    >
                      <Plus className="h-4 w-4" /> Generate
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tool Cards */}
            <div className="mb-8">
              <h2 className="font-display text-lg font-semibold mb-4">Video generation tools</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {TOOL_CARDS.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setView(tool.id)}
                    className="group relative rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-all text-left"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />
                    <div className="relative p-6 flex flex-col gap-3 min-h-[140px]">
                      <tool.icon className="h-8 w-8 text-foreground/80" />
                      <div>
                        <h3 className="font-semibold text-foreground">{tool.label}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{tool.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Videos */}
            {jobs && jobs.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-semibold">Recent creations</h2>
                  <button onClick={() => setView("my-videos")} className="text-xs text-primary hover:underline font-medium">
                    View all →
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {jobs.slice(0, 4).map((job) => (
                    <div key={job.id} className="rounded-xl border border-border overflow-hidden group hover:border-primary/30 transition-all">
                      <div className="aspect-video bg-muted flex items-center justify-center relative">
                        {job.output_url ? (
                          <video src={job.output_url} className="w-full h-full object-cover" />
                        ) : (
                          <Film className="h-8 w-8 text-muted-foreground" />
                        )}
                        {job.status === "completed" && job.output_url && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="h-8 w-8 text-white" />
                          </div>
                        )}
                        {job.status === "processing" && (
                          <div className="absolute bottom-2 left-2 right-2">
                            <div className="h-1 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${job.progress || 0}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium capitalize">{job.job_type?.replace(/-/g, " ")}</span>
                          <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                            job.status === "completed" ? "bg-primary/20 text-primary" :
                            job.status === "processing" ? "bg-accent/20 text-accent-foreground" :
                            job.status === "failed" ? "bg-destructive/20 text-destructive" :
                            "bg-muted text-muted-foreground"
                          }`}>{job.status}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {new Date(job.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {job.output_url && (
                              <a href={job.output_url} download className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted">
                                <Download className="h-3 w-3" />
                              </a>
                            )}
                            <button onClick={() => deleteJob.mutate(job.id)}
                              className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ═══════════════════════ TEXT TO VIDEO ═══════════════════════ */}
        {view === "text-to-video" && (
          <>
            <SubViewHeader title="Text to Video" icon={FileText} />
            <div className="glass-card rounded-xl p-6 border border-primary/20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
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
                    <input type="checkbox" checked={stv.captions} onChange={(e) => setStv((f) => ({ ...f, captions: e.target.checked }))} className="rounded border-border" />
                    Enable Captions
                  </label>
                </div>
              </div>

              <FormatQualityPanel
                preset={stv.format_preset} quality={stv.quality}
                onPresetChange={(v) => setStv((f) => ({ ...f, format_preset: v }))}
                onQualityChange={(v) => setStv((f) => ({ ...f, quality: v }))}
              />

              <div className="flex items-center gap-3 mt-4">
                <button onClick={handleScriptToVideo} disabled={createJob.isPending || !stv.script_id}
                  className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
                  {createJob.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : stv.quality === "PREVIEW_LOW" ? <Eye className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {stv.quality === "PREVIEW_LOW" ? "Generate Preview" : "Render Final"}
                </button>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Zap className="h-3 w-3" /> ~{formatCredits(stvCredits)}
                </span>
              </div>
            </div>
          </>
        )}

        {/* ═══════════════════════ IMAGE TO VIDEO ═══════════════════════ */}
        {view === "image-to-video" && (
          <>
            <SubViewHeader title="Image to Video" icon={Image} />
            <div className="glass-card rounded-xl p-6 lg:p-8 border border-primary/20">
              {/* Header with Start Over */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="font-display text-xl font-bold">Transform Images into Dynamic Videos</h2>
                  <p className="text-sm text-muted-foreground mt-1">Upload any image or let AI generate one, then bring it to life through seamless video generation.</p>
                </div>
                {itvStep !== "upload" && (
                  <button onClick={resetItvFlow} className="text-xs text-muted-foreground hover:text-foreground shrink-0">Start Over</button>
                )}
              </div>

              {/* Step Indicator (compact) */}
              {itvStep !== "upload" && (
                <div className="flex items-center gap-2 mb-6 mt-4">
                  {ITV_STEPS.map((s, i) => {
                    const stepIndex = ITV_STEPS.findIndex((x) => x.key === itvStep);
                    const isActive = s.key === itvStep;
                    const isDone = i < stepIndex;
                    return (
                      <div key={s.key} className="flex items-center gap-2">
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          isActive ? "bg-primary text-primary-foreground" :
                          isDone ? "bg-primary/20 text-primary" :
                          "bg-secondary text-muted-foreground"
                        }`}>
                          {isDone ? <CheckCircle2 className="h-3 w-3" /> : <span>{s.num}.</span>}
                          {s.label}
                        </div>
                        {i < ITV_STEPS.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Step 1: Source Selection (Kling-style) */}
              {itvStep === "upload" && (
                <div className="mt-6">
                  {/* Upload / Generate tabs */}
                  <div className="flex gap-1 mb-5 p-1 bg-secondary rounded-lg w-fit">
                    <button onClick={() => setItvSourceTab("upload")}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${itvSourceTab === "upload" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                      Upload Image
                    </button>
                    <button onClick={() => setItvSourceTab("generate")}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${itvSourceTab === "generate" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                      <Sparkles className="h-3.5 w-3.5" /> Generate Image
                    </button>
                  </div>

                  {/* Upload Tab */}
                  {itvSourceTab === "upload" && (
                    <div>
                      {itvImages.length > 0 && (
                        <div className="flex gap-3 mb-4">
                          {itvImages.map((img, i) => (
                            <div key={i} className="relative w-28 h-28 rounded-xl overflow-hidden border border-border group/thumb">
                              <img src={img.preview} alt={`Reference ${i + 1}`} className="w-full h-full object-cover" />
                              <button onClick={() => removeImage(i)}
                                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {itvImages.length < MAX_IMAGES && (
                        <div onClick={() => fileInputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}
                          className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors bg-secondary/30">
                          <Image className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">
                            Drag your images here or <span className="text-primary font-medium underline underline-offset-2">click to upload</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">PNG, JPG, WebP up to {MAX_SIZE_MB}MB (max {MAX_IMAGES})</p>
                          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" multiple className="hidden"
                            onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Generate Tab */}
                  {itvSourceTab === "generate" && (
                    <div>
                      <div className="flex items-center gap-2 bg-secondary/50 border border-border rounded-xl px-4 py-2 mb-4">
                        <Sparkles className="h-4 w-4 text-muted-foreground shrink-0" />
                        <input
                          value={itvGenPrompt}
                          onChange={(e) => setItvGenPrompt(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && !itvGenLoading && handleGenerateImage()}
                          placeholder="Describe the image you want to create..."
                          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none py-2"
                        />
                        <button onClick={handleGenerateImage} disabled={itvGenLoading || !itvGenPrompt.trim()}
                          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1.5 shrink-0">
                          {itvGenLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                          Generate
                        </button>
                      </div>

                      {itvGenPreview && (
                        <div className="mb-4">
                          <div className="rounded-xl overflow-hidden border border-primary/30 max-w-sm mx-auto">
                            <img src={itvGenPreview} alt="AI Generated" className="w-full aspect-square object-cover" />
                          </div>
                          <button onClick={handleUseGeneratedImage}
                            className="mt-3 mx-auto block px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" /> Use This Image
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Divider */}
                  {itvSourceTab === "upload" && itvImages.length === 0 && !itvGenPreview && (
                    <div className="flex items-center gap-4 my-6">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-muted-foreground font-medium">OR</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                  )}

                  {/* Sample Prompts — "No picture? Try one of these" */}
                  {itvSourceTab === "upload" && itvImages.length === 0 && (
                    <div>
                      <h3 className="font-semibold text-sm mb-3">No picture on hand? Try with one of these</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {SAMPLE_PROMPTS.map((sample, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setItvSourceTab("generate");
                              setItvGenPrompt(sample.prompt);
                            }}
                            className="rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-all group text-left"
                          >
                            <div className="aspect-[4/3] bg-gradient-to-br from-accent/20 via-primary/10 to-secondary flex items-center justify-center">
                              <Sparkles className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div className="p-2">
                              <p className="text-xs font-medium text-foreground truncate">{sample.label}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Continue Button */}
                  {itvSourceTab === "upload" && itvImages.length > 0 && (
                    <div className="flex justify-end mt-5">
                      <button onClick={handleUploadAndTrain} disabled={itvUploading}
                        className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
                        {itvUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
                        {itvUploading ? "Uploading..." : "Continue"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Train */}
              {itvStep === "train" && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-semibold">Training</h4>
                  </div>
                  <div className="flex gap-3 mb-4">
                    {itvUploadedUrls.map((url, i) => (
                      <div key={i} className="w-20 h-20 rounded-lg overflow-hidden border border-border">
                        <StorageImageThumb urlOrPath={url} bucket="training-images" />
                      </div>
                    ))}
                  </div>
                  {itvTraining ? (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Processing images... {itvTrainProgress}%</p>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden mb-4">
                        <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${itvTrainProgress}%` }} />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-muted-foreground mb-4">{itvUploadedUrls.length} image(s) uploaded. Start training to prepare for video generation.</p>
                      <button onClick={handleStartTraining}
                        className="w-full px-5 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 flex items-center justify-center gap-2">
                        <Sparkles className="h-4 w-4" /> Start Training
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Generate */}
              {itvStep === "generate" && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Wand2 className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-semibold">Generate Video</h4>
                  </div>
                  <div className="flex gap-3 mb-4">
                    {itvUploadedUrls.map((url, i) => (
                      <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-primary/30">
                        <StorageImageThumb urlOrPath={url} bucket="training-images" />
                      </div>
                    ))}
                    <div className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-primary mr-1" />
                      <span className="text-xs text-primary font-medium">Trained</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Duration (sec)</label>
                      <select value={itv.duration} onChange={(e) => setItv((f) => ({ ...f, duration: parseInt(e.target.value) }))}
                        className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                        <option value={5}>5s</option><option value={8}>8s</option><option value={10}>10s</option><option value={15}>15s</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Motion Type</label>
                      <select value={itv.motion_type} onChange={(e) => setItv((f) => ({ ...f, motion_type: e.target.value }))}
                        className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                        <option value="subtle">Subtle</option><option value="vlog">Vlog</option><option value="cinematic">Cinematic</option><option value="dramatic">Dramatic</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Camera Movement</label>
                      <select value={itv.camera_movement} onChange={(e) => setItv((f) => ({ ...f, camera_movement: e.target.value }))}
                        className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                        <option value="static">Static</option><option value="push-in">Push In</option><option value="pan">Pan</option><option value="handheld">Handheld</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Influencer</label>
                      <select value={itv.influencer_id} onChange={(e) => setItv((f) => ({ ...f, influencer_id: e.target.value }))}
                        className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                        <option value="">None</option>
                        {influencers?.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={itv.lip_sync} onChange={(e) => setItv((f) => ({ ...f, lip_sync: e.target.checked }))} className="rounded border-border" />
                      Lip Sync (+{formatCredits(estimateCredits("lip-sync"))})
                    </label>
                  </div>
                  <FormatQualityPanel preset={itv.format_preset} quality={itv.quality}
                    onPresetChange={(v) => setItv((f) => ({ ...f, format_preset: v }))}
                    onQualityChange={(v) => setItv((f) => ({ ...f, quality: v as VideoQuality }))} />
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3">
                      <button onClick={handleGenerateVideo} disabled={itvGenerating}
                        className="px-5 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
                        {itvGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : isPreview ? <Eye className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        {itvGenerating ? "Generating..." : isPreview ? "Generate Preview" : "Render Final"}
                      </button>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Zap className="h-3 w-3" /> ~{formatCredits(itvCredits)}
                        {itv.lip_sync ? ` + ${formatCredits(estimateCredits("lip-sync"))} lip-sync` : ""}
                      </span>
                    </div>
                    {!isPreview && (
                      <div className={`text-xs font-medium px-3 py-1.5 rounded-full ${canFinalRender ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                        Final renders: {finalRenderCount} / {MAX_FINAL_RENDERS}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Gallery */}
              {itvStep === "gallery" && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Film className="h-4 w-4 text-primary" />
                      <h4 className="text-sm font-semibold">Generated Videos</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      {canFinalRender && (
                        <button onClick={() => setItvStep("generate")}
                          className="px-3 py-1.5 rounded-lg bg-accent/10 text-accent-foreground text-xs font-medium hover:bg-accent/20 flex items-center gap-1">
                          <Copy className="h-3 w-3" /> Re-render in another size
                        </button>
                      )}
                      <button onClick={resetItvFlow}
                        className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20">
                        + New Video
                      </button>
                    </div>
                  </div>
                  <div className={`mb-4 text-xs font-medium px-3 py-2 rounded-lg w-fit ${canFinalRender ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                    Final renders used: {finalRenderCount} / {MAX_FINAL_RENDERS}
                    {!canFinalRender && " — Duplicate project to generate more."}
                  </div>
                  {videoOutputs && videoOutputs.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Render Outputs</h5>
                      {videoOutputs.map((out) => (
                        <div key={out.id} className="rounded-lg border border-border p-3 flex items-center gap-4">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-xs font-medium">{out.format_preset.replace(/_/g, " ")}</span>
                            <span className="text-[10px] text-muted-foreground">{out.aspect_ratio}</span>
                            <span className="text-[10px] text-muted-foreground">{out.width}×{out.height}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${out.is_preview ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
                              {out.is_preview ? "Preview" : out.quality}
                            </span>
                          </div>
                          <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            out.status === "completed" || out.status === "succeeded" ? "bg-primary/20 text-primary" :
                            out.status === "running" || out.status === "queued" || out.status === "pending" ? "bg-accent/20 text-accent-foreground" :
                            "bg-destructive/20 text-destructive"
                          }`}>{out.status}</span>
                          <span className="text-[10px] text-muted-foreground">{out.credit_cost} cr</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {imageVideoJobs.length > 0 ? (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {imageVideoJobs.map((job) => (
                        <div key={job.id} className="rounded-xl border border-border overflow-hidden group">
                          <div className="aspect-video bg-muted flex items-center justify-center relative">
                            {job.output_url ? (
                              <video src={job.output_url} className="w-full h-full object-cover" controls />
                            ) : (
                              <Film className="h-10 w-10 text-muted-foreground" />
                            )}
                            {job.status === "processing" && (
                              <div className="absolute bottom-2 left-2 right-2">
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${job.progress || 0}%` }} />
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {new Date(job.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                job.status === "completed" ? "bg-primary/20 text-primary" :
                                job.status === "processing" ? "bg-accent/20 text-accent-foreground" :
                                job.status === "failed" ? "bg-destructive/20 text-destructive" :
                                "bg-muted text-muted-foreground"
                              }`}>{job.status}</span>
                            </div>
                            <div className="flex gap-1 mt-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                              {job.output_url && (
                                <a href={job.output_url} download className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted">
                                  <Download className="h-3.5 w-3.5" />
                                </a>
                              )}
                              <button onClick={() => deleteJob.mutate(job.id)}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Film className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Your video is being generated. Check back shortly.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* ═══════════════════════ MY VIDEOS ═══════════════════════ */}
        {view === "my-videos" && (
          <>
            <SubViewHeader title="My Videos" icon={Film} />
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
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="h-10 w-10 text-white" />
                        </div>
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
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {new Date(job.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {job.output_url && (
                            <a href={job.output_url} download className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted">
                              <Download className="h-3.5 w-3.5" />
                            </a>
                          )}
                          <button onClick={() => deleteJob.mutate(job.id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card rounded-xl p-12 text-center">
                <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-lg font-semibold mb-2">No videos yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Generate your first video using Text to Video or Image to Video.</p>
                <button onClick={() => setView("home")} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90">
                  Get Started
                </button>
              </div>
            )}
          </>
        )}

        <StepTransition stepId={3} />
      </div>
    </DashboardLayout>
  );
};

export default VideoStudioPage;
