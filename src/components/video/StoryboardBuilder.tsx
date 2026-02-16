import { useState } from "react";
import { LayoutGrid, Plus, Trash2, GripVertical, Lock, ChevronDown } from "lucide-react";

interface StoryboardScene {
  id: string;
  prompt: string;
  transition: string;
  duration: number;
}

interface StoryboardBuilderProps {
  open: boolean;
  onToggle: (open: boolean) => void;
  scenes: StoryboardScene[];
  onScenesChange: (scenes: StoryboardScene[]) => void;
  plan: string;
}

const TRANSITIONS = ["cut", "fade", "dissolve", "wipe", "zoom"];

const StoryboardBuilder = ({ open, onToggle, scenes, onScenesChange, plan }: StoryboardBuilderProps) => {
  const locked = plan !== "agency" && plan !== "enterprise";

  const addScene = () => {
    onScenesChange([
      ...scenes,
      { id: crypto.randomUUID(), prompt: "", transition: "cut", duration: 5 },
    ]);
  };

  const updateScene = (id: string, key: keyof StoryboardScene, value: any) => {
    onScenesChange(scenes.map((s) => (s.id === id ? { ...s, [key]: value } : s)));
  };

  const removeScene = (id: string) => {
    onScenesChange(scenes.filter((s) => s.id !== id));
  };

  const moveScene = (from: number, to: number) => {
    const updated = [...scenes];
    const [item] = updated.splice(from, 1);
    updated.splice(to, 0, item);
    onScenesChange(updated);
  };

  return (
    <div className="rounded-xl border border-border mt-4 overflow-hidden">
      <button
        onClick={() => !locked && onToggle(!open)}
        disabled={locked}
        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${
          open ? "bg-primary/5 text-foreground border-b border-border" :
          locked ? "text-muted-foreground/60 cursor-not-allowed" :
          "text-muted-foreground hover:text-foreground"
        }`}
      >
        <span className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4" />
          Storyboard View
          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-accent/20 text-accent-foreground font-medium">
            Agency
          </span>
        </span>
        {locked ? <Lock className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />}
      </button>

      {open && !locked && (
        <div className="p-4 space-y-3">
          {scenes.map((scene, idx) => (
            <div key={scene.id} className="flex items-start gap-2 p-3 rounded-lg bg-secondary/30 border border-border">
              <div className="flex flex-col items-center gap-1 pt-1">
                <span className="text-[10px] font-bold text-primary w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                  {idx + 1}
                </span>
                {idx > 0 && (
                  <button onClick={() => moveScene(idx, idx - 1)} className="p-0.5 text-muted-foreground hover:text-foreground">
                    <GripVertical className="h-3 w-3" />
                  </button>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <textarea
                  value={scene.prompt}
                  onChange={(e) => updateScene(scene.id, "prompt", e.target.value)}
                  placeholder={`Scene ${idx + 1} prompt...`}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                  rows={2}
                />
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <label className="text-[10px] text-muted-foreground">Transition:</label>
                    <select
                      value={scene.transition}
                      onChange={(e) => updateScene(scene.id, "transition", e.target.value)}
                      className="rounded border border-border bg-secondary px-2 py-1 text-[10px] text-foreground"
                    >
                      {TRANSITIONS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <label className="text-[10px] text-muted-foreground">Duration:</label>
                    <select
                      value={scene.duration}
                      onChange={(e) => updateScene(scene.id, "duration", parseInt(e.target.value))}
                      className="rounded border border-border bg-secondary px-2 py-1 text-[10px] text-foreground"
                    >
                      {[3, 5, 8, 10, 15].map((d) => (
                        <option key={d} value={d}>{d}s</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button onClick={() => removeScene(scene.id)} className="p-1 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          <button
            onClick={addScene}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Scene
          </button>

          {scenes.length > 0 && (
            <div className="text-[10px] text-muted-foreground text-center">
              Total: {scenes.reduce((a, s) => a + s.duration, 0)}s across {scenes.length} scene{scenes.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StoryboardBuilder;
