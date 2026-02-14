import { useState } from "react";
import { Shield, ExternalLink, X } from "lucide-react";

interface PrivacyTermsDialogProps {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const PrivacyTermsDialog = ({ open, onClose, onAccept }: PrivacyTermsDialogProps) => {
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);

  if (!open) return null;

  const canContinue = privacyChecked && termsChecked;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl bg-emerald-900 border border-emerald-800/50 p-6 shadow-luxury animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/10">
              <Shield className="h-5 w-5 text-gold-400" />
            </div>
            <h2 className="font-display text-lg font-semibold text-cream-50">Privacy & Terms</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-cream-100/40 hover:text-cream-50 hover:bg-emerald-800/50 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-sm text-cream-100/50 mb-6">
          Before continuing, please review and accept our privacy policy and terms of service.
        </p>

        {/* Checkboxes */}
        <div className="space-y-4 mb-8">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input type="checkbox" checked={privacyChecked} onChange={(e) => setPrivacyChecked(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-emerald-700 bg-emerald-800/50 accent-gold-500 cursor-pointer" />
            <div>
              <span className="text-sm font-medium text-cream-50">
                I have read and agree to the{" "}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-gold-400 hover:underline inline-flex items-center gap-1">
                  Privacy Policy <ExternalLink className="h-3 w-3" />
                </a>
              </span>
              <p className="text-xs text-cream-100/40 mt-0.5">Learn how we collect, use, and protect your personal data.</p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input type="checkbox" checked={termsChecked} onChange={(e) => setTermsChecked(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-emerald-700 bg-emerald-800/50 accent-gold-500 cursor-pointer" />
            <div>
              <span className="text-sm font-medium text-cream-50">
                I agree to the{" "}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-gold-400 hover:underline inline-flex items-center gap-1">
                  Terms of Service <ExternalLink className="h-3 w-3" />
                </a>
              </span>
              <p className="text-xs text-cream-100/40 mt-0.5">By using matango.ai, you agree to our terms and conditions.</p>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button onClick={onClose} className="rounded-lg px-5 py-2.5 text-sm font-medium text-cream-100/50 hover:text-cream-50 hover:bg-emerald-800/50 transition-colors">
            Cancel
          </button>
          <button onClick={onAccept} disabled={!canContinue}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:border hover:border-gold-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            Continue to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyTermsDialog;
