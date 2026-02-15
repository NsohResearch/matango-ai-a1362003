import { Shield, CreditCard, Users, FileCheck } from "lucide-react";

const items = [
  { icon: Shield, label: "Tenant isolation via RLS" },
  { icon: CreditCard, label: "Stripe for payment compliance" },
  { icon: Users, label: "Role-based access control" },
  { icon: FileCheck, label: "Enterprise SLA options" },
];

const SecurityTrust = () => (
  <section className="py-16 px-6 bg-cream-50">
    <div className="container mx-auto max-w-3xl">
      <h2 className="font-display text-2xl font-semibold text-foreground mb-6">Security & Trust</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3 bg-card border border-border rounded-lg p-4">
            <item.icon className="h-5 w-5 text-primary shrink-0" />
            <span className="text-sm text-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default SecurityTrust;
