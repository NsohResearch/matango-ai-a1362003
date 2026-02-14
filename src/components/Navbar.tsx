import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import matangoIcon from "@/assets/matango-icon.png";
import PrivacyTermsDialog from "@/components/PrivacyTermsDialog";

const Navbar = () => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLoginClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    setPendingRedirect(path);
    setShowPrivacy(true);
  };

  const handleAccept = () => {
    setShowPrivacy(false);
    if (pendingRedirect) {
      navigate(pendingRedirect);
      setPendingRedirect(null);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass-card">
        <div className="container mx-auto flex items-center justify-between py-3 px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={matangoIcon} alt="matango.ai" className="h-8 w-8 rounded-lg" />
            <span className="font-display text-lg font-semibold tracking-tight">
              matango<span className="text-primary">.ai</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              The System <ChevronDown className="h-3 w-3" />
            </button>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={(e) => handleLoginClick(e, "/auth")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Login
            </button>
            <button
              onClick={(e) => handleLoginClick(e, "/auth?mode=signup")}
              className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Deploy Your AAO
            </button>
          </div>
        </div>
      </header>

      <PrivacyTermsDialog
        open={showPrivacy}
        onClose={() => { setShowPrivacy(false); setPendingRedirect(null); }}
        onAccept={handleAccept}
      />
    </>
  );
};

export default Navbar;
