// Video format presets for platform-optimized aspect ratios

export interface FormatPreset {
  id: string;
  label: string;
  aspect: string;
  platforms: string[];
  resolutions: {
    "720P": { w: number; h: number };
    "1080P": { w: number; h: number };
    "4K": { w: number; h: number };
  };
}

export const FORMAT_PRESETS: FormatPreset[] = [
  {
    id: "VERTICAL_9_16",
    label: "TikTok / Reels / Shorts",
    aspect: "9:16",
    platforms: ["TikTok", "IG Reels", "FB Reels", "YT Shorts"],
    resolutions: { "720P": { w: 720, h: 1280 }, "1080P": { w: 1080, h: 1920 }, "4K": { w: 2160, h: 3840 } },
  },
  {
    id: "PORTRAIT_4_5",
    label: "Instagram Feed",
    aspect: "4:5",
    platforms: ["IG Feed"],
    resolutions: { "720P": { w: 720, h: 900 }, "1080P": { w: 1080, h: 1350 }, "4K": { w: 2160, h: 2700 } },
  },
  {
    id: "SQUARE_1_1",
    label: "Square",
    aspect: "1:1",
    platforms: ["IG Feed", "FB Feed"],
    resolutions: { "720P": { w: 720, h: 720 }, "1080P": { w: 1080, h: 1080 }, "4K": { w: 2160, h: 2160 } },
  },
  {
    id: "LANDSCAPE_16_9",
    label: "YouTube / LinkedIn / Web",
    aspect: "16:9",
    platforms: ["YouTube", "LinkedIn", "Web"],
    resolutions: { "720P": { w: 1280, h: 720 }, "1080P": { w: 1920, h: 1080 }, "4K": { w: 3840, h: 2160 } },
  },
  {
    id: "EMBED_4_3",
    label: "Embed / Web Player",
    aspect: "4:3",
    platforms: ["Landing pages", "Courses"],
    resolutions: { "720P": { w: 960, h: 720 }, "1080P": { w: 1440, h: 1080 }, "4K": { w: 2880, h: 2160 } },
  },
];

export type VideoQuality = "PREVIEW_LOW" | "720P" | "1080P" | "4K";

export const QUALITY_OPTIONS: { value: VideoQuality; label: string; plans: string[] }[] = [
  { value: "PREVIEW_LOW", label: "Preview (Low)", plans: ["free", "basic", "agency"] },
  { value: "720P", label: "HD 720p", plans: ["free", "basic", "agency"] },
  { value: "1080P", label: "Full HD 1080p", plans: ["basic", "agency"] },
  { value: "4K", label: "4K Ultra HD", plans: ["agency"] },
];

export const MAX_FINAL_RENDERS = 3;

export function getPreset(id: string): FormatPreset {
  return FORMAT_PRESETS.find((p) => p.id === id) || FORMAT_PRESETS[0];
}

export function getResolution(preset: FormatPreset, quality: VideoQuality) {
  if (quality === "PREVIEW_LOW") return preset.resolutions["720P"]; // preview uses 720p dims
  return preset.resolutions[quality] || preset.resolutions["720P"];
}

export function getAllowedQualities(plan: string): VideoQuality[] {
  return QUALITY_OPTIONS.filter((q) => q.plans.includes(plan)).map((q) => q.value);
}
