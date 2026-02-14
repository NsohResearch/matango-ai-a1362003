// Credit cost model for all AI operations
export const CREDIT_COSTS = {
  "influencer-assist": 3,
  "script-generate": 8,
  "brand-enrich": 5,
  "campaign-generate": 6,
  "image-to-video-preview": 12,
  "image-to-video-final": 40,
  "script-to-video-preview": 20,
  "script-to-video-final": 70,
  "lip-sync": 15,
  "captions-render": 5,
  "suggestion": 1,
} as const;

export type CreditOperation = keyof typeof CREDIT_COSTS;

export function estimateCredits(op: CreditOperation, durationSeconds?: number, quality?: string): number {
  const base = CREDIT_COSTS[op];
  const qualityMultiplier = quality === "preview_low" ? 0.25
    : quality === "hd_1080p" ? 1.5
    : quality === "pro_4k" ? 2.5
    : 1.0;

  if (durationSeconds && (op.includes("video") || op === "lip-sync")) {
    const units = Math.ceil(durationSeconds / (op.includes("script") ? 10 : 5));
    return Math.round(base * units * qualityMultiplier);
  }

  return Math.round(base * qualityMultiplier);
}

export function formatCredits(credits: number): string {
  return `${credits} credit${credits !== 1 ? "s" : ""}`;
}
