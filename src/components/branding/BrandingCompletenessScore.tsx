import { CheckCircle2, Circle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Props {
  hasLogo: boolean;
  hasColors: boolean;
  hasFont: boolean;
  hasFavicon: boolean;
  hasDomainVerified?: boolean;
  isAgency?: boolean;
}

const ITEMS = [
  { key: "hasLogo", label: "Logo uploaded", weight: 30 },
  { key: "hasColors", label: "Colors set", weight: 20 },
  { key: "hasFont", label: "Font selected", weight: 10 },
  { key: "hasFavicon", label: "Favicon uploaded", weight: 10 },
] as const;

const AGENCY_ITEM = { key: "hasDomainVerified" as const, label: "Domain verified", weight: 30 };

export default function BrandingCompletenessScore(props: Props) {
  const items = props.isAgency ? [...ITEMS, AGENCY_ITEM] : ITEMS;
  const total = items.reduce((s, i) => s + i.weight, 0);
  const earned = items.reduce((s, i) => s + (props[i.key] ? i.weight : 0), 0);
  const pct = Math.round((earned / total) * 100);

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Branding Score</span>
        <span className="text-sm font-bold text-gold-400">{pct}%</span>
      </div>
      <Progress value={pct} className="h-2" />
      <ul className="space-y-1.5">
        {items.map((item) => {
          const done = props[item.key];
          return (
            <li key={item.key} className="flex items-center gap-2 text-xs">
              {done ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              ) : (
                <Circle className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span className={done ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
