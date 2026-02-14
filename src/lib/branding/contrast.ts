// WCAG contrast utilities for branding color validation

export function hexToRgb(hex: string) {
  const h = hex.replace("#", "").trim();
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function srgbToLinear(c: number) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

export function contrastRatio(fgHex: string, bgHex: string) {
  const L1 = relativeLuminance(fgHex);
  const L2 = relativeLuminance(bgHex);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function isContrastOK(ratio: number, mode: "normal" | "large" = "normal") {
  return ratio >= (mode === "normal" ? 4.5 : 3.0);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function rgbToHex(r: number, g: number, b: number) {
  const to = (x: number) => x.toString(16).padStart(2, "0");
  return `#${to(clamp(Math.round(r), 0, 255))}${to(clamp(Math.round(g), 0, 255))}${to(clamp(Math.round(b), 0, 255))}`;
}

export function adjustBrightness(hex: string, delta: number) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r + delta, g + delta, b + delta);
}

export function suggestColorForContrast(params: {
  fgHex: string;
  bgHex: string;
  mode?: "normal" | "large";
}) {
  const mode = params.mode ?? "normal";
  const startRatio = contrastRatio(params.fgHex, params.bgHex);
  if (isContrastOK(startRatio, mode)) {
    return { ok: true, suggestedHex: params.fgHex, ratio: startRatio };
  }

  for (let step = 1; step <= 20; step++) {
    const d = step * 10;
    const darker = adjustBrightness(params.fgHex, -d);
    const rd = contrastRatio(darker, params.bgHex);
    if (isContrastOK(rd, mode)) return { ok: true, suggestedHex: darker, ratio: rd };

    const lighter = adjustBrightness(params.fgHex, d);
    const rl = contrastRatio(lighter, params.bgHex);
    if (isContrastOK(rl, mode)) return { ok: true, suggestedHex: lighter, ratio: rl };
  }

  return { ok: false, suggestedHex: params.fgHex, ratio: startRatio };
}

export function validateBrandPalette(p: {
  primary: string;
  accent: string;
  background: string;
  foreground: string;
}) {
  const tests = [
    { name: "Foreground on background", ratio: contrastRatio(p.foreground, p.background), mode: "normal" as const },
    { name: "Primary on background", ratio: contrastRatio(p.primary, p.background), mode: "normal" as const },
    { name: "Accent on background", ratio: contrastRatio(p.accent, p.background), mode: "large" as const },
    { name: "Foreground on primary", ratio: contrastRatio(p.foreground, p.primary), mode: "normal" as const },
  ];

  const failures = tests
    .filter((t) => !isContrastOK(t.ratio, t.mode))
    .map((t) => ({ ...t, ok: false }));

  return { ok: failures.length === 0, tests, failures };
}
