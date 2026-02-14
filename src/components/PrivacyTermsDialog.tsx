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
      <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-display text-lg font-bold">Privacy & Terms</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Before continuing, please review and accept our privacy policy and terms of service.
        </p>

        {/* Checkboxes */}
        <div className="space-y-4 mb-8">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={privacyChecked}
              onChange={(e) => setPrivacyChecked(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border bg-secondary accent-primary cursor-pointer"
            />
            <div>
              <span className="text-sm font-medium text-foreground">
                I have read and agree to the{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Privacy Policy <ExternalLink className="h-3 w-3" />
                </a>
              </span>
              <p className="text-xs text-muted-foreground mt-0.5">
                Learn how we collect, use, and protect your personal data.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={termsChecked}
              onChange={(e) => setTermsChecked(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border bg-secondary accent-primary cursor-pointer"
            />
            <div>
              <span className="text-sm font-medium text-foreground">
                I agree to the{" "}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Terms of Service <ExternalLink className="h-3 w-3" />
                </a>
              </span>
              <p className="text-xs text-muted-foreground mt-0.5">
                By using matango.ai, you agree to our terms and conditions.
              </p>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onAccept}
            disabled={!canContinue}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyTermsDialog;
