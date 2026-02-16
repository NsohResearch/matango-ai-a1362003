import { Link } from "react-router-dom";
import matangoIcon from "@/assets/matango-icon.png";

const Footer = () => {
  return (
    <footer className="bg-emerald-950 py-12 px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="gold-divider mb-8" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src={matangoIcon} alt="matango.ai" className="h-6 w-6 rounded-md" />
            <span className="font-display text-sm font-semibold text-cream-50">
              matango<span className="text-gold-400">.ai</span>
            </span>
          </div>
          <nav className="flex flex-wrap items-center gap-6 text-sm text-cream-100/60">
            <Link to="/about" className="hover:text-gold-400 transition-colors">About</Link>
            <span className="text-gold-500/30">·</span>
            <Link to="/pricing" className="hover:text-gold-400 transition-colors">Pricing</Link>
            <span className="text-gold-500/30">·</span>
            <Link to="/meet-kah" className="hover:text-gold-400 transition-colors">Meet Ka'h</Link>
            <span className="text-gold-500/30">·</span>
            <Link to="/support" className="hover:text-gold-400 transition-colors">Support</Link>
            <span className="text-gold-500/30">·</span>
            <Link to="/investors" className="hover:text-gold-400 transition-colors">Investors</Link>
            <span className="text-gold-500/30">·</span>
            <Link to="/privacy" className="hover:text-gold-400 transition-colors">Privacy & Terms</Link>
          </nav>
          <p className="text-xs text-cream-100/40">© 2026 Matango.ai. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
