import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, Check, Lock } from "lucide-react";
import { SYSTEM_STEPS } from "@/lib/system-steps";
import { useSystemStatus } from "@/hooks/useSystemStatus";

const TheSystemDropdown = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { statusByStep } = useSystemStatus();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm text-cream-100/70 hover:text-gold-400 transition-colors"
      >
        The System <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-[320px] bg-emerald-900 border border-emerald-800/50 rounded-xl shadow-luxury overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-emerald-800/50">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-cream-100/30">Sequential Growth Loop</p>
            <p className="text-xs text-cream-100/50 mt-1">Follow the steps 0→9 to build your growth engine.</p>
          </div>
          <div className="max-h-[60vh] overflow-y-auto py-1">
            {SYSTEM_STEPS.map((step) => {
              const status = statusByStep[step.id] ?? "locked";
              const isLocked = status === "locked";
              const isComplete = status === "complete";

              return isLocked ? (
                <div
                  key={step.id}
                  className="flex items-center gap-3 px-4 py-2.5 opacity-40 cursor-not-allowed"
                  title="Complete previous step first"
                >
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-emerald-800/60 text-xs font-bold text-cream-100/40 shrink-0">
                    {step.id}
                  </span>
                  <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-cream-50/40">{step.title}</div>
                  </div>
                </div>
              ) : (
                <Link
                  key={step.id}
                  to={step.route}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-800/50 transition-colors group"
                >
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shrink-0 ${isComplete ? "bg-accent/20 text-accent" : "bg-emerald-800/60 text-cream-100/70 group-hover:text-gold-400"}`}>
                    {isComplete ? <Check className="h-3.5 w-3.5" /> : step.id}
                  </span>
                  <step.icon className={`h-4 w-4 shrink-0 ${isComplete ? "text-accent" : "text-primary"}`} />
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium transition-colors ${isComplete ? "text-accent" : "text-cream-50 group-hover:text-gold-400"}`}>
                      {step.title}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="p-3 border-t border-emerald-800/50">
            <button
              onClick={() => { setOpen(false); navigate("/brand-brain"); }}
              className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Start The System →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TheSystemDropdown;
