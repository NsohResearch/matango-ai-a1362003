import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import matangoIcon from "@/assets/matango-icon.png";

const Navbar = () => {
  return (
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
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Login</Link>
          <Link
            to="/auth?mode=signup"
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Deploy Your AAO
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
