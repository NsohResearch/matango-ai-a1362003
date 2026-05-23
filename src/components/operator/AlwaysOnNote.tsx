// Reusable "Always on, no overhead" pitch shown across AAO listings.
// Frames each AAO as a tireless employee with zero benefits cost vs. a human hire.
import { Clock, HeartPulse } from "lucide-react";

export const AAO_BENEFITS_SHORT =
  "Available 24/7 · Never sick · No salary, health, dental, vision, 401(k), PTO, or parental-leave overhead.";

export const AAO_BENEFITS_LONG = [
  "Available 24/7/365 — every call, every lead, every shift.",
  "Never calls in sick, never takes a long weekend, never quits.",
  "Zero benefits overhead: no medical, dental, vision, prescription, life/AD&D, supplemental life, EAP, mental-health support, medical advice line, FSAs, or adoption/surrogacy reimbursement.",
  "No 401(k) matching, paid time off, or parental leave to fund.",
  "Onboards in minutes, scales in seconds, costs a fraction of a full-time hire.",
];

export function AlwaysOnLine({ className = "" }: { className?: string }) {
  return (
    <p className={`inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 ${className}`}>
      <Clock className="h-3 w-3" /> 24/7 · Never sick · No benefits overhead
    </p>
  );
}

export function AlwaysOnCallout({ tone = "light" }: { tone?: "light" | "dark" }) {
  const base = tone === "dark"
    ? "border-white/10 bg-white/5 text-cream-100/85"
    : "border-border bg-card text-foreground";
  return (
    <div className={`rounded-2xl border ${base} p-6 sm:p-8 max-w-3xl mx-auto text-left`}>
      <div className="flex items-center gap-2 mb-3">
        <HeartPulse className="h-5 w-5 text-emerald-500" />
        <h3 className="font-display text-xl font-semibold">Always on. Zero overhead.</h3>
      </div>
      <ul className="space-y-2 text-sm leading-relaxed">
        {AAO_BENEFITS_LONG.map((b) => (
          <li key={b} className="flex gap-2">
            <span className="text-emerald-500 mt-0.5">✓</span>
            <span className={tone === "dark" ? "text-cream-100/75" : "text-muted-foreground"}>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
