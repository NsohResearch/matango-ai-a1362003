import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useData";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const location = useLocation();

  if (loading || (user && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect to onboarding if profile incomplete (but not if already on onboarding)
  if (profile && !profile.onboarding_completed && !location.pathname.startsWith("/onboarding")) {
    return <Navigate to="/onboarding/profile" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
