/**
 * OnboardingGate — Redirects to /onboarding/profile if profile incomplete.
 */
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useData";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface OnboardingGateProps {
  children: React.ReactNode;
  soft?: boolean;
}

export default function OnboardingGate({ children, soft = false }: OnboardingGateProps) {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const [reconciled, setReconciled] = useState(false);

  // Post-checkout reconciliation
  useEffect(() => {
    if (reconciled || !user) return;
    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get("checkout");
    if (checkoutStatus === "success") {
      setReconciled(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("checkout");
      url.searchParams.delete("session_id");
      window.history.replaceState({}, "", url.toString());
      toast.success("Payment successful! Your plan has been activated.");
    } else if (checkoutStatus === "cancel") {
      setReconciled(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("checkout");
      window.history.replaceState({}, "", url.toString());
      toast.info("Checkout cancelled. You can select a plan anytime.");
    }
  }, [user, reconciled]);

  // Redirect to onboarding if profile incomplete
  useEffect(() => {
    if (soft || authLoading || profileLoading || !user || !profile) return;
    // Don't redirect if already on onboarding page
    if (location.pathname.startsWith("/onboarding")) return;
    if (!profile.onboarding_completed) {
      navigate("/onboarding/profile", { replace: true });
    }
  }, [profile, user, authLoading, profileLoading, soft, navigate, location.pathname]);

  if (authLoading || (user && profileLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
