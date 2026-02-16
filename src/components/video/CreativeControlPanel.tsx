import { Sliders, ChevronDown } from "lucide-react";
import { useState } from "react";

interface CreativeControls {
  camera_angle: string;
  lens_type: string;
  depth_of_field: string;
  motion_type: string;
  frame_rate: string;
  aspect_ratio: string;
  color_grading: string;
}

interface CreativeControlPanelProps {
  controls: CreativeControls;
  onChange: (controls: CreativeControls) => void;
}

const DEFAULTS: CreativeControls = {
  camera_angle: "eye-level",
  lens_type: "standard",
  depth_of_field: "normal",
  motion_type: "smooth",
  frame_rate: "24",
  aspect_ratio: "16:9",
  color_grading: "natural",
};

const CreativeControlPanel = ({ controls, onChange }: CreativeControlPanelProps) => {
  const [expanded, setExpanded] = useState(false);

  const update = (key: keyof CreativeControls, value: string) => {
    onChange({ ...controls, [key]: value });
  };

  const selectClass = "w-full rounded-lg border border-border bg-secondary px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50";

  return (
    <div className="rounded-xl border border-border mt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="flex items-center gap-2">
          <Sliders className="h-4 w-4" /> Creative Controls
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="px-4 pb-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Camera Angle</label>
            <select value={controls.camera_angle} onChange={(e) => update("camera_angle", e.target.value)} className={selectClass}>
              <option value="eye-level">Eye Level</option>
              <option value="low-angle">Low Angle</option>
              <option value="high-angle">High Angle</option>
              <option value="dutch">Dutch Angle</option>
              <option value="birds-eye">Bird's Eye</option>
              <option value="worms-eye">Worm's Eye</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Lens Type</label>
            <select value={controls.lens_type} onChange={(e) => update("lens_type", e.target.value)} className={selectClass}>
              <option value="standard">Standard (50mm)</option>
              <option value="wide">Wide Angle (24mm)</option>
              <option value="telephoto">Telephoto (85mm)</option>
              <option value="macro">Macro</option>
              <option value="fisheye">Fisheye</option>
              <option value="anamorphic">Anamorphic</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Depth of Field</label>
            <select value={controls.depth_of_field} onChange={(e) => update("depth_of_field", e.target.value)} className={selectClass}>
              <option value="shallow">Shallow (Bokeh)</option>
              <option value="normal">Normal</option>
              <option value="deep">Deep Focus</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Motion Type</label>
            <select value={controls.motion_type} onChange={(e) => update("motion_type", e.target.value)} className={selectClass}>
              <option value="smooth">Smooth</option>
              <option value="handheld">Handheld</option>
              <option value="steadicam">Steadicam</option>
              <option value="dolly">Dolly</option>
              <option value="crane">Crane</option>
              <option value="drone">Drone</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Frame Rate</label>
            <select value={controls.frame_rate} onChange={(e) => update("frame_rate", e.target.value)} className={selectClass}>
              <option value="24">24 fps (Cinematic)</option>
              <option value="30">30 fps (Standard)</option>
              <option value="60">60 fps (Smooth)</option>
              <option value="120">120 fps (Slow Motion)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Color Grading</label>
            <select value={controls.color_grading} onChange={(e) => update("color_grading", e.target.value)} className={selectClass}>
              <option value="natural">Natural</option>
              <option value="cinematic">Cinematic Warm</option>
              <option value="cool">Cool Tones</option>
              <option value="vintage">Vintage Film</option>
              <option value="noir">Film Noir</option>
              <option value="vivid">Vivid Pop</option>
              <option value="desaturated">Desaturated</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export { DEFAULTS as CREATIVE_CONTROL_DEFAULTS };
export type { CreativeControls };
export default CreativeControlPanel;
