import { Link } from "react-router-dom";
import matangoIcon from "@/assets/matango-icon.png";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-12 px-6">
      <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <img src={matangoIcon} alt="matango.ai" className="h-6 w-6 rounded-md" />
          <span className="font-display text-sm font-semibold">
            matango<span className="text-primary">.ai</span>
          </span>
        </div>
        <nav className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
          <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
          <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <Link to="/meet-kah" className="hover:text-foreground transition-colors">Meet K'ah</Link>
        </nav>
        <p className="text-xs text-muted-foreground">© 2026 Matango.ai. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
