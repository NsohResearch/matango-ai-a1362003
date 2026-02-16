import { Film, Sparkles, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CinematicUpsellModalProps {
  open: boolean;
  onClose: () => void;
  onContinueBalanced: () => void;
}

const CinematicUpsellModal = ({ open, onClose, onContinueBalanced }: CinematicUpsellModalProps) => {
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 rounded-2xl bg-card border border-accent/30 shadow-2xl overflow-hidden">
        {/* Gold accent border */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent/60 via-accent to-accent/60" />

        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>

        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-5">
            <Film className="h-8 w-8 text-accent" />
          </div>

          <h3 className="font-display text-xl font-bold mb-2">Unlock Cinematic Mode</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Elevate your videos to Hollywood-grade quality with our premium rendering engine.
          </p>

          <div className="space-y-3 text-left mb-8">
            {[
              "4K rendering with enhanced detail",
              "Advanced camera motion & stabilization",
              "Higher temporal consistency",
              "Native audio sync capability",
              "Extended duration (up to 60s)",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-sm">
                <Sparkles className="h-4 w-4 text-accent shrink-0" />
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <button
              onClick={() => { onClose(); navigate("/pricing"); }}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-accent/90 to-accent text-accent-foreground text-sm font-semibold hover:from-accent hover:to-accent/90 transition-all shadow-lg"
            >
              Launch Agency
            </button>
            <button
              onClick={() => { onClose(); onContinueBalanced(); }}
              className="w-full px-6 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Continue in Balanced
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CinematicUpsellModal;
