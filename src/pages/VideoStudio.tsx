import { useState, useRef, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Video, Play, Loader2, Film, Clock, Wand2, X, Zap, Image, FileText, ChevronRight, Upload, CheckCircle2, Sparkles } from "lucide-react";
import { useVideoJobs, useVideoScripts, useInfluencers, useCreateVideoJob, useAssetLibrary } from "@/hooks/useData";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { estimateCredits, formatCredits } from "@/lib/credits";
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

  // Image to Video — multi-step state
  const [itvStep, setItvStep] = useState<ItvStep>("upload");
  const [itvImages, setItvImages] = useState<{ file: File; preview: string }[]>([]);
  const [itvUploading, setItvUploading] = useState(false);
  const [itvUploadedUrls, setItvUploadedUrls] = useState<string[]>([]);
  const [itvTraining, setItvTraining] = useState(false);
  const [itvTrainProgress, setItvTrainProgress] = useState(0);
  const [itvGenerating, setItvGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [itv, setItv] = useState({
    influencer_id: "",
    duration: 8,
    motion_type: "subtle",
    camera_movement: "push-in",
    lip_sync: false,
    aspect_ratio: "9:16",
    quality: "standard_720p",
  });

  const MAX_IMAGES = 3;
  const MAX_SIZE_MB = 10;

  const itvCredits = estimateCredits("image-to-video-preview", itv.duration, itv.quality);

  const selectedScript = scripts?.find((s) => s.id === stv.script_id);
  const sceneCount = selectedScript ? (Array.isArray(selectedScript.scenes) ? selectedScript.scenes.length : 0) : 0;
  const stvCredits = estimateCredits("script-to-video-preview", stv.quality === "standard_720p" ? undefined : 30, stv.quality);

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
        if (error) { console.error("Upload error:", error); continue; }
        const { data: urlData } = supabase.storage.from("training-images").getPublicUrl(path);
        urls.push(urlData.publicUrl);
      }
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
    setItvGenerating(true);
    createJob.mutate(
      {
        job_type: "image-to-video",
        influencer_id: itv.influencer_id || undefined,
        lip_sync: itv.lip_sync,
        input_refs: { images: itvUploadedUrls, motion_type: itv.motion_type, camera_movement: itv.camera_movement, duration: itv.duration },
      },
      {
        onSuccess: () => {
          toast.success("Image-to-video job queued!");
          setItvGenerating(false);
          setItvStep("gallery");
        },
        onError: () => setItvGenerating(false),
      }
    );
  };

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

  const resetItvFlow = () => {
    setItvStep("upload");
    setItvImages([]);
    setItvUploadedUrls([]);
    setItvTrainProgress(0);
  };

  const imageVideoJobs = jobs?.filter((j) => j.job_type === "image-to-video") || [];

  const ITV_STEPS: { key: ItvStep; label: string; num: number }[] = [
    { key: "upload", label: "Upload", num: 1 },
    { key: "train", label: "Train", num: 2 },
    { key: "generate", label: "Generate", num: 3 },
    { key: "gallery", label: "Gallery", num: 4 },
  ];

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

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
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
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Aspect Ratio</label>
                    <select value={itv.aspect_ratio} onChange={(e) => setItv((f) => ({ ...f, aspect_ratio: e.target.value }))}
                      className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option value="9:16">9:16</option>
                      <option value="16:9">16:9</option>
                      <option value="1:1">1:1</option>
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
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 text-sm pb-2.5">
                      <input type="checkbox" checked={itv.lip_sync} onChange={(e) => setItv((f) => ({ ...f, lip_sync: e.target.checked }))}
                        className="rounded border-border" />
                      Lip Sync (+{formatCredits(estimateCredits("lip-sync"))})
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={handleGenerateVideo} disabled={itvGenerating}
                    className="px-5 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
                    {itvGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    {itvGenerating ? "Generating..." : "Generate Video"}
                  </button>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Zap className="h-3 w-3" /> ~{formatCredits(itvCredits)}
                    {itv.lip_sync ? ` + ${formatCredits(estimateCredits("lip-sync"))} lip-sync` : ""}
                  </span>
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
                  <button onClick={resetItvFlow}
                    className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20">
                    + New Video
                  </button>
                </div>

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
