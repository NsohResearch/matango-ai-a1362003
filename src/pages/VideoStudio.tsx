import { useState, useRef, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Video, Play, Loader2, Film, Clock, Wand2, X, Zap, Image, FileText, ChevronRight, Upload, CheckCircle2, Sparkles, Monitor, Lock, Copy, Eye } from "lucide-react";
import { useVideoJobs, useVideoScripts, useInfluencers, useCreateVideoJob, useAssetLibrary, useCreateAsset, useVideoOutputs, useCreateVideoOutput } from "@/hooks/useData";
import { useAuth } from "@/hooks/useAuth";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { estimateCredits, formatCredits } from "@/lib/credits";
import { FORMAT_PRESETS, QUALITY_OPTIONS, MAX_FINAL_RENDERS, getPreset, getResolution, getAllowedQualities, type VideoQuality } from "@/lib/video-formats";
import StepTransition from "@/components/system/StepTransition";
import { supabase } from "@/integrations/supabase/client";

type Tab = "script-to-video" | "image-to-video";
type ItvStep = "upload" | "train" | "generate" | "gallery";

const VideoStudioPage = () => {
  const { data: jobs, isLoading } = useVideoJobs();
  const { data: scripts } = useVideoScripts();
  const { data: influencers } = useInfluencers();
  const { data: assets } = useAssetLibrary();
  const createJob = useCreateVideoJob();
  const createAsset = useCreateAsset();
  const { subscription } = useAuth();
  const plan = subscription.plan || "free";
  const allowedQualities = getAllowedQualities(plan);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const scriptId = searchParams.get("scriptId");
  const [activeTab, setActiveTab] = useState<Tab>(scriptId ? "script-to-video" : "script-to-video");

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
  const [itvImages, setItvImages] = useState<{ file: File; preview: string }[]>([]);
  const [itvUploading, setItvUploading] = useState(false);
  const [itvUploadedUrls, setItvUploadedUrls] = useState<string[]>([]);
  const [itvTraining, setItvTraining] = useState(false);
  const [itvTrainProgress, setItvTrainProgress] = useState(0);
  const [itvGenerating, setItvGenerating] = useState(false);
  const [itvJobId, setItvJobId] = useState<string | null>(null);
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

  // Video outputs for current job
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

  // Step 1 → 2: Upload images to storage
  const handleUploadAndTrain = async () => {
    if (itvImages.length === 0) { toast.error("Upload at least 1 image"); return; }
    setItvUploading(true);
    try {
      const urls: string[] = [];
      for (const img of itvImages) {
        const ext = img.file.name.split(".").pop() || "jpg";
        const path = `video-training/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("training-images").upload(path, img.file, { contentType: img.file.type });
        if (error) { console.error("Upload error:", error); toast.error(`Failed to upload ${img.file.name}: ${error.message}`); continue; }
        const { data: signedData, error: signError } = await supabase.storage.from("training-images").createSignedUrl(path, 60 * 60 * 24 * 7); // 7 day signed URL
        if (signError || !signedData?.signedUrl) { console.error("Signed URL error:", signError); toast.error(`Failed to get URL for ${img.file.name}`); continue; }
        urls.push(signedData.signedUrl);
      }
      if (urls.length === 0) { toast.error("No images were uploaded successfully"); setItvUploading(false); return; }
      setItvUploadedUrls(urls);
      toast.success(`${urls.length} image(s) uploaded`);
      setItvStep("train");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setItvUploading(false);
    }
  };

  // Step 2: Simulate training
  const handleStartTraining = async () => {
    setItvTraining(true);
    setItvTrainProgress(0);
    const interval = setInterval(() => {
      setItvTrainProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setItvTraining(false);
          setItvStep("generate");
          toast.success("Training complete! Ready to generate.");
          return 100;
        }
        return p + 10;
      });
    }, 500);
  };

  // Step 3: Generate video
  const handleGenerateVideo = () => {
    if (itvUploadedUrls.length === 0) { toast.error("No uploaded images"); return; }

    // Enforce max 3 final renders
    if (!isPreview && !canFinalRender) {
      toast.error(`You've reached the max of ${MAX_FINAL_RENDERS} final renders for this project. Duplicate project to generate more.`);
      return;
    }

    // Enforce plan quality
    if (!allowedQualities.includes(itv.quality)) {
      toast.error("Upgrade your plan for this quality level.");
      return;
    }

    setItvGenerating(true);

    // Save uploaded images to Asset Gallery
    for (const url of itvUploadedUrls) {
      createAsset.mutate({ type: "image", url, prompt: "Video training reference", tags: ["training", "image-to-video"] });
    }

    const res = getResolution(selectedPreset, itv.quality);

    createJob.mutate(
      {
        job_type: "image-to-video",
        influencer_id: itv.influencer_id || undefined,
        lip_sync: itv.lip_sync,
        input_refs: {
          images: itvUploadedUrls,
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

          // Create video output record
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

          // Save video job reference to Asset Gallery
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
    if (!allowedQualities.includes(stv.quality)) { toast.error("Upgrade your plan for this quality level."); return; }
    createJob.mutate(
      {
        job_type: "text-to-video",
        script_id: stv.script_id || undefined,
        influencer_id: stv.influencer_id || undefined,
        lip_sync: false,
        input_refs: { format_preset: stv.format_preset, quality: stv.quality },
      },
      { onSuccess: () => toast.success("Video job queued! Processing will begin shortly.") }
    );
  };

  const resetItvFlow = () => {
    setItvStep("upload");
    setItvImages([]);
    setItvUploadedUrls([]);
    setItvTrainProgress(0);
    setItvJobId(null);
  };

  const imageVideoJobs = jobs?.filter((j) => j.job_type === "image-to-video") || [];

  const ITV_STEPS: { key: ItvStep; label: string; num: number }[] = [
    { key: "upload", label: "Upload", num: 1 },
    { key: "train", label: "Train", num: 2 },
    { key: "generate", label: "Generate", num: 3 },
    { key: "gallery", label: "Gallery", num: 4 },
  ];

  // Format & Quality selector component
  const FormatQualityPanel = ({ preset, quality, onPresetChange, onQualityChange }: {
    preset: string; quality: VideoQuality;
    onPresetChange: (v: string) => void; onQualityChange: (v: VideoQuality) => void;
  }) => (
    <div className="space-y-4 p-4 rounded-lg border border-border bg-secondary/50">
      <div className="flex items-center gap-2 mb-1">
        <Monitor className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-semibold">Format & Quality</h4>
      </div>

      {/* Format Preset Tiles */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">Aspect Ratio</label>
        <div className="grid grid-cols-5 gap-2">
          {FORMAT_PRESETS.map((fp) => {
            const active = fp.id === preset;
            return (
              <button key={fp.id} onClick={() => onPresetChange(fp.id)}
                className={`p-2 rounded-lg border text-center transition-colors ${active ? "border-primary bg-primary/10 text-foreground" : "border-border hover:border-primary/40 text-muted-foreground"}`}>
                <div className="text-xs font-medium truncate">{fp.aspect}</div>
                <div className="text-[10px] mt-0.5 truncate">{fp.label.split("/")[0].trim()}</div>
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">
          {getPreset(preset).platforms.join(", ")}
        </p>
      </div>

      {/* Quality Selector */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">Output Quality</label>
        <div className="grid grid-cols-2 gap-2">
          {QUALITY_OPTIONS.map((q) => {
            const allowed = allowedQualities.includes(q.value);
            const active = q.value === quality;
            return (
              <button key={q.value} onClick={() => allowed && onQualityChange(q.value)} disabled={!allowed}
                className={`p-2 rounded-lg border text-left transition-colors relative ${
                  active ? "border-primary bg-primary/10" :
                  allowed ? "border-border hover:border-primary/40" :
                  "border-border/50 opacity-50 cursor-not-allowed"
                }`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{q.label}</span>
                  {!allowed && <Lock className="h-3 w-3 text-muted-foreground" />}
                </div>
                {!allowed && (
                  <span className="text-[10px] text-muted-foreground">Upgrade required</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Resolution Info */}
      {(() => {
        const res = getResolution(getPreset(preset), quality);
        return (
          <div className="text-[10px] text-muted-foreground bg-muted px-3 py-1.5 rounded">
            Output: {res.w}×{res.h} · {getPreset(preset).aspect} · {quality === "PREVIEW_LOW" ? "Preview" : quality}
          </div>
        );
      })()}
    </div>
  );

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
            <div className="grid grid-cols-2 gap-4 mb-4">
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
                  <input type="checkbox" checked={stv.captions} onChange={(e) => setStv((f) => ({ ...f, captions: e.target.checked }))}
                    className="rounded border-border" />
                  Enable Captions
                </label>
              </div>
            </div>

            {/* Format & Quality for Script-to-Video */}
            <FormatQualityPanel
              preset={stv.format_preset}
              quality={stv.quality}
              onPresetChange={(v) => setStv((f) => ({ ...f, format_preset: v }))}
              onQualityChange={(v) => setStv((f) => ({ ...f, quality: v }))}
            />

            <div className="flex items-center gap-3 mt-4">
              <button onClick={handleScriptToVideo} disabled={createJob.isPending || !stv.script_id}
                className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
                {createJob.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : stv.quality === "PREVIEW_LOW" ? <Eye className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {stv.quality === "PREVIEW_LOW" ? "Generate Preview" : "Render Final"}
              </button>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Zap className="h-3 w-3" /> ~{formatCredits(stvCredits)}
              </span>
            </div>
          </div>
        )}

        {/* Image to Video — Multi-step */}
        {activeTab === "image-to-video" && (
          <div className="glass-card rounded-xl p-6 mb-6 border border-primary/20">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold flex items-center gap-2">
                <Image className="h-5 w-5 text-primary" /> Image → Video
              </h3>
              {itvStep !== "upload" && (
                <button onClick={resetItvFlow} className="text-xs text-muted-foreground hover:text-foreground">
                  Start Over
                </button>
              )}
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-2 mb-6">
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

            {/* Step 1: Upload */}
            {itvStep === "upload" && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Upload className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-semibold">Reference Images</h4>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Upload 1–3 high-quality images. More images improve training quality.
                </p>

                {itvImages.length > 0 && (
                  <div className="flex gap-3 mb-3">
                    {itvImages.map((img, i) => (
                      <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-border group/thumb">
                        <img src={img.preview} alt={`Reference ${i + 1}`} className="w-full h-full object-cover" />
                        <button onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 p-0.5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {itvImages.length < MAX_IMAGES && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG up to {MAX_SIZE_MB}MB each (max {MAX_IMAGES} images)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      multiple
                      className="hidden"
                      onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }}
                    />
                  </div>
                )}

                <button onClick={handleUploadAndTrain} disabled={itvUploading || itvImages.length === 0}
                  className="mt-4 w-full px-5 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {itvUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {itvUploading ? "Uploading..." : `Upload ${itvImages.length} Image${itvImages.length !== 1 ? "s" : ""} & Continue`}
                </button>
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
                      <img src={url} alt={`Uploaded ${i + 1}`} className="w-full h-full object-cover" />
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
                    <p className="text-sm text-muted-foreground mb-4">
                      {itvUploadedUrls.length} image(s) uploaded. Start training to prepare for video generation.
                    </p>
                    <button onClick={handleStartTraining}
                      className="w-full px-5 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 flex items-center justify-center gap-2">
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
                      <img src={url} alt={`Trained ${i + 1}`} className="w-full h-full object-cover" />
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
                    <input type="checkbox" checked={itv.lip_sync} onChange={(e) => setItv((f) => ({ ...f, lip_sync: e.target.checked }))}
                      className="rounded border-border" />
                    Lip Sync (+{formatCredits(estimateCredits("lip-sync"))})
                  </label>
                </div>

                {/* Format & Quality Panel */}
                <FormatQualityPanel
                  preset={itv.format_preset}
                  quality={itv.quality}
                  onPresetChange={(v) => setItv((f) => ({ ...f, format_preset: v }))}
                  onQualityChange={(v) => setItv((f) => ({ ...f, quality: v as VideoQuality }))}
                />

                {/* Render Count + Actions */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-3">
                    <button onClick={handleGenerateVideo} disabled={itvGenerating}
                      className="px-5 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
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

                {/* Render counter */}
                <div className={`mb-4 text-xs font-medium px-3 py-2 rounded-lg w-fit ${canFinalRender ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                  Final renders used: {finalRenderCount} / {MAX_FINAL_RENDERS}
                  {!canFinalRender && " — Duplicate project to generate more."}
                </div>

                {/* Video Outputs List */}
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
                      <div key={job.id} className="rounded-lg border border-border overflow-hidden group">
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
                        <div className="p-3 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground"><Clock className="h-3 w-3 inline mr-1" />{new Date(job.created_at).toLocaleDateString()}</span>
                          <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            job.status === "completed" ? "bg-primary/20 text-primary" :
                            job.status === "processing" ? "bg-accent/20 text-accent-foreground" :
                            job.status === "failed" ? "bg-destructive/20 text-destructive" :
                            "bg-muted text-muted-foreground"
                          }`}>{job.status}</span>
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
