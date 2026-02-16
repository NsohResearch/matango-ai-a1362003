import { Check, X, Minus } from "lucide-react";

type Cell = boolean | string;

const rows: { label: string; free: Cell; basic: Cell; agency: Cell; enterprise: Cell }[] = [
  { label: "Brand Brains / Brands", free: "1", basic: "3", agency: "Unlimited", enterprise: "Unlimited" },
  { label: "AI Generations per Day", free: "5", basic: "100", agency: "Unlimited", enterprise: "Unlimited" },
  { label: "Templates", free: "Starter", basic: "All", agency: "All", enterprise: "All" },
  { label: "K'ah Chat", free: true, basic: true, agency: true, enterprise: true },
  { label: "Video Studio", free: false, basic: true, agency: true, enterprise: true },
  { label: "Video Studio Pro", free: false, basic: false, agency: true, enterprise: true },
  { label: "Campaign Factory", free: false, basic: true, agency: true, enterprise: true },
  { label: "Scheduler", free: false, basic: true, agency: true, enterprise: true },
  { label: "AAO Automation", free: false, basic: false, agency: true, enterprise: true },
  { label: "White Label", free: false, basic: false, agency: true, enterprise: true },
  { label: "Team Collaboration", free: false, basic: false, agency: true, enterprise: true },
  { label: "API Access", free: false, basic: false, agency: true, enterprise: true },
  { label: "A/B Testing", free: false, basic: false, agency: true, enterprise: true },
  { label: "Support Level", free: "Community", basic: "Priority", agency: "Dedicated", enterprise: "Dedicated" },
  { label: "Dedicated CSM", free: false, basic: false, agency: false, enterprise: true },
  { label: "SLA", free: false, basic: false, agency: false, enterprise: true },
  { label: "On-Premise", free: false, basic: false, agency: false, enterprise: true },
  { label: "Custom Integrations", free: false, basic: false, agency: false, enterprise: true },
  { label: "Unlimited Team Seats", free: false, basic: false, agency: false, enterprise: true },
];

const CellValue = ({ value }: { value: Cell }) => {
  if (value === true) return <Check className="h-4 w-4 text-primary mx-auto" />;
  if (value === false) return <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />;
  return <span className="text-sm text-foreground">{value}</span>;
};

const PricingComparisonMatrix = () => (
  <div id="compare" className="mt-16">
    <h2 className="font-display text-2xl font-semibold text-center text-foreground mb-8">Compare Plans</h2>
    <div className="overflow-x-auto border border-border rounded-xl">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="text-left px-4 py-3 font-medium text-muted-foreground sticky left-0 bg-muted/30 z-10 min-w-[180px]">Feature</th>
            <th className="px-4 py-3 font-medium text-center">Free</th>
            <th className="px-4 py-3 font-medium text-center text-primary">Creator</th>
            <th className="px-4 py-3 font-medium text-center">Agency</th>
            <th className="px-4 py-3 font-medium text-center">Agency++</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.label} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
              <td className="px-4 py-3 font-medium text-foreground sticky left-0 bg-inherit z-10">{row.label}</td>
              <td className="px-4 py-3 text-center"><CellValue value={row.free} /></td>
              <td className="px-4 py-3 text-center"><CellValue value={row.basic} /></td>
              <td className="px-4 py-3 text-center"><CellValue value={row.agency} /></td>
              <td className="px-4 py-3 text-center"><CellValue value={row.enterprise} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default PricingComparisonMatrix;
