import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useData";
import matangoIcon from "@/assets/matango-icon.png";
import PrivacyTermsDialog from "@/components/PrivacyTermsDialog";
import TheSystemDropdown from "@/components/TheSystemDropdown";
import BrandSwitcher from "@/components/BrandSwitcher";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Brain, BarChart3, Bell, Settings, LogOut } from "lucide-react";

const Navbar = () => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: roles } = useUserRoles();
  const isAdminOrAbove = roles?.includes("admin") || roles?.includes("super_admin");

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
      <header className="fixed top-0 left-0 right-0 z-50 bg-emerald-900 border-b border-emerald-800/50">
        <div className="container mx-auto flex items-center justify-between py-3 px-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={matangoIcon} alt="matango.ai" className="h-8 w-8 rounded-lg" />
              <span className="font-display text-lg font-semibold tracking-tight text-cream-50">
                matango<span className="text-gold-400">.ai</span>
              </span>
            </Link>
            {user && (
              <div className="hidden md:block border-l border-emerald-800/50 pl-4">
                <BrandSwitcher />
              </div>
            )}
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <TheSystemDropdown />
            <Link to="/about" className="text-sm text-cream-100/70 hover:text-gold-400 transition-colors">About</Link>
            <Link to="/pricing" className="text-sm text-cream-100/70 hover:text-gold-400 transition-colors">Pricing</Link>
            <Link to="/support" className="text-sm text-cream-100/70 hover:text-gold-400 transition-colors">Support</Link>
            <Link to="/investors" className="text-sm text-cream-100/70 hover:text-gold-400 transition-colors">Investors</Link>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 text-sm text-cream-100/70 hover:text-cream-50 transition-colors">
                    {user.email?.split("@")[0] || "Account"}
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-emerald-900 border-emerald-800/50">
                  <DropdownMenuLabel className="text-[10px] text-cream-100/40 uppercase tracking-wider">Your Growth Loop</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer text-cream-50 hover:text-gold-400">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/brand-brain" className="cursor-pointer flex items-center gap-2 text-cream-50 hover:text-gold-400">
                      <Brain className="h-4 w-4 text-primary" /> Brand Brain
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-emerald-800/50" />
                  <DropdownMenuItem asChild>
                    <Link to="/notifications" className="cursor-pointer flex items-center gap-2 text-cream-50 hover:text-gold-400">
                      <Bell className="h-4 w-4" /> Notifications
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/account-settings" className="cursor-pointer flex items-center gap-2 text-cream-50 hover:text-gold-400">
                      <Settings className="h-4 w-4" /> Settings
                    </Link>
                  </DropdownMenuItem>
                  {isAdminOrAbove && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer flex items-center gap-2 text-cream-50 hover:text-gold-400">
                        <BarChart3 className="h-4 w-4 text-gold-400" /> Admin Console
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-emerald-800/50" />
                  <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-red-400 hover:text-red-300">
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <button
                  onClick={(e) => handleLoginClick(e, "/auth")}
                  className="text-sm text-cream-100/70 hover:text-gold-400 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={(e) => handleLoginClick(e, "/auth?mode=signup")}
                  className="rounded-pill bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:border hover:border-gold-400 hover:shadow-luxury-sm transition-all"
                >
                  Deploy Your AAO
                </button>
              </>
            )}
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
