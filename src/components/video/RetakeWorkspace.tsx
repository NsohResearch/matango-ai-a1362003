import { useState, useRef } from "react";
import {
  ArrowLeft, Play, Pause, SkipBack, SkipForward, Scissors, Eye,
  RotateCcw, Sparkles, Zap, Film, Settings2, ChevronDown, Lock,
  Layers
} from "lucide-react";
import { useVideoJobs } from "@/hooks/useData";
import ProviderSelector from "./ProviderSelector";

interface RetakeWorkspaceProps {
  onBack: () => void;
  plan: string;
}

const RetakeWorkspace = ({ onBack, plan }: RetakeWorkspaceProps) => {
  const { data: jobs } = useVideoJobs();
  const completedJobs = jobs?.filter((j) => j.status === "completed" && j.output_url) || [];

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [segmentStart, setSegmentStart] = useState(0);
  const [segmentEnd, setSegmentEnd] = useState(100);
  const [playing, setPlaying] = useState(false);
  const [retakePrompt, setRetakePrompt] = useState("");
  const [preserveStyle, setPreserveStyle] = useState(true);
  const [preserveLighting, setPreserveLighting] = useState(true);
  const [preserveCharacter, setPreserveCharacter] = useState(true);
  const [selectedTier, setSelectedTier] = useState("balanced");
  const [selectedProvider, setSelectedProvider] = useState("auto");
  const [viewMode, setViewMode] = useState<"before" | "after">("before");
  const [selectedVersion, setSelectedVersion] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);

  const selectedJob = completedJobs.find((j) => j.id === selectedJobId);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <Scissors className="h-6 w-6 text-primary" />
          <h2 className="font-display text-2xl font-bold">Retake / Edit Video</h2>
        </div>
      </div>

      {/* Video Source Selector */}
      {!selectedJobId && (
        <div className="glass-card rounded-xl p-6 lg:p-8 border border-primary/20">
          <h3 className="font-display text-lg font-semibold mb-4">Select a Video to Edit</h3>
          {completedJobs.length === 0 ? (
            <div className="text-center py-12">
              <Film className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No completed videos found. Generate a video first to use Retake.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {completedJobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className="rounded-xl border border-border overflow-hidden hover:border-primary/40 transition-all text-left group"
                >
                  <div className="aspect-video bg-muted relative">
                    {job.output_url && <video src={job.output_url} className="w-full h-full object-cover" />}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Scissors className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="p-3">
                    <span className="text-xs font-medium capitalize">{job.job_type?.replace(/-/g, " ")}</span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Three-Column Retake Workspace */}
      {selectedJobId && selectedJob && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* LEFT — Timeline */}
          <div className="lg:col-span-3 glass-card rounded-xl p-4 border border-border">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" /> Timeline
            </h4>

            {/* Scrubber */}
            <div className="space-y-3">
              <div className="relative h-12 bg-secondary rounded-lg overflow-hidden">
                <div
                  className="absolute top-0 bottom-0 bg-primary/20 border-l-2 border-r-2 border-primary"
                  style={{ left: `${segmentStart}%`, width: `${segmentEnd - segmentStart}%` }}
                />
                {/* Waveform placeholder */}
                <div className="absolute inset-0 flex items-center px-2">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} className="flex-1 mx-px">
                      <div className="bg-muted-foreground/30 rounded-full mx-auto" style={{ height: `${Math.random() * 20 + 8}px`, width: "2px" }} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-muted-foreground block mb-1">Start %</label>
                  <input type="range" min={0} max={100} value={segmentStart}
                    onChange={(e) => setSegmentStart(Math.min(parseInt(e.target.value), segmentEnd - 5))}
                    className="w-full accent-primary h-1" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-muted-foreground block mb-1">End %</label>
                  <input type="range" min={0} max={100} value={segmentEnd}
                    onChange={(e) => setSegmentEnd(Math.max(parseInt(e.target.value), segmentStart + 5))}
                    className="w-full accent-primary h-1" />
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground text-center">
                Selected: {segmentStart}% – {segmentEnd}% ({((segmentEnd - segmentStart) / 10).toFixed(1)}s estimated)
              </p>
            </div>

            {/* Version History */}
            <div className="mt-6">
              <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Versions</h5>
              <div className="space-y-1">
                {[
                  { v: 1, label: "Original" },
                  // Future versions would be populated from video_versions
                ].map(({ v, label }) => (
                  <button
                    key={v}
                    onClick={() => setSelectedVersion(v)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                      selectedVersion === v ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    v{v} — {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CENTER — Preview */}
          <div className="lg:col-span-5 glass-card rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("before")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium ${viewMode === "before" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
                >
                  Before
                </button>
                <button
                  onClick={() => setViewMode("after")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium ${viewMode === "after" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
                >
                  After
                </button>
              </div>
              <span className="text-[10px] text-muted-foreground">v{selectedVersion}</span>
            </div>

            <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
              {selectedJob.output_url && (
                <video
                  ref={videoRef}
                  src={selectedJob.output_url}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary">
                <SkipBack className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPlaying(!playing)}
                className="p-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
              <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary">
                <SkipForward className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT — Controls */}
          <div className="lg:col-span-4 glass-card rounded-xl p-4 border border-border space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Edit Controls
            </h4>

            {/* Prompt */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Retake Prompt</label>
              <textarea
                value={retakePrompt}
                onChange={(e) => setRetakePrompt(e.target.value)}
                placeholder="Describe how to modify the selected segment..."
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                rows={3}
              />
            </div>

            {/* Preservation Toggles */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground block">Preservation</label>
              {[
                { key: "style", label: "Style Continuity", state: preserveStyle, setter: setPreserveStyle },
                { key: "lighting", label: "Lighting", state: preserveLighting, setter: setPreserveLighting },
                { key: "character", label: "Character Consistency", state: preserveCharacter, setter: setPreserveCharacter },
              ].map(({ key, label, state, setter }) => (
                <label key={key} className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/30 cursor-pointer">
                  <span className="text-xs text-foreground">{label}</span>
                  <input type="checkbox" checked={state} onChange={(e) => setter(e.target.checked)} className="rounded border-border accent-primary" />
                </label>
              ))}
            </div>

            {/* Provider Selection */}
            <ProviderSelector
              modality="retake"
              selectedProvider={selectedProvider}
              onProviderChange={setSelectedProvider}
              selectedTier={selectedTier}
              onTierChange={setSelectedTier}
              plan={plan}
            />

            {/* Cost Estimate */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/5 border border-accent/10">
              <Zap className="h-4 w-4 text-accent" />
              <span className="text-xs text-muted-foreground">Estimated: ~5 credits</span>
            </div>

            {/* Generate CTA */}
            <button
              disabled={!retakePrompt.trim()}
              className="w-full px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="h-4 w-4" /> Generate Retake
            </button>

            <button
              onClick={() => { setSelectedJobId(null); setRetakePrompt(""); }}
              className="w-full text-xs text-muted-foreground hover:text-foreground text-center py-1"
            >
              ← Choose different video
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetakeWorkspace;
