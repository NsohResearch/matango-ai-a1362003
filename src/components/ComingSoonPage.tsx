import DashboardLayout from "@/components/DashboardLayout";
import { Lock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface ComingSoonPageProps {
  title: string;
  description: string;
  icon?: React.ElementType;
  tier?: string;
  alternatives?: { label: string; to: string }[];
}

const ComingSoonPage = ({ title, description, icon: Icon, tier = "Agency", alternatives }: ComingSoonPageProps) => (
  <DashboardLayout>
    <div className="p-8 max-w-2xl mx-auto">
      <div className="glass-card rounded-xl p-12 text-center">
        {Icon ? <Icon className="h-12 w-12 text-primary mx-auto mb-4" /> : <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />}
        <h1 className="font-display text-2xl font-bold mb-2">{title}</h1>
        <p className="text-muted-foreground mb-2">{description}</p>
        <span className="inline-block text-[10px] uppercase tracking-widest bg-gold-500/10 text-gold-500 px-3 py-1 rounded-full font-semibold mb-6">
          {tier} Tier Feature
        </span>
        {alternatives && alternatives.length > 0 && (
          <div className="mt-6 space-y-2">
            <p className="text-xs text-muted-foreground mb-3">In the meantime, try:</p>
            {alternatives.map((alt) => (
              <Link
                key={alt.to}
                to={alt.to}
                className="flex items-center justify-center gap-2 text-sm text-primary hover:text-gold-400 transition-colors"
              >
                {alt.label} <ArrowRight className="h-3 w-3" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  </DashboardLayout>
);

export default ComingSoonPage;
