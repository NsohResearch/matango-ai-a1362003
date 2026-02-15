import { motion } from "framer-motion";
import { Shield, Brain, Layers, Globe, Building2 } from "lucide-react";

const moats = [
  { icon: Brain, label: "Persistent Brand Memory (Brand Brain)" },
  { icon: Layers, label: "Role-Based Operator Architecture" },
  { icon: Globe, label: "Multi-Channel Execution" },
  { icon: Building2, label: "White-Label Agency Expansion" },
  { icon: Shield, label: "Enterprise Customization (Agency++)" },
];

const ProductMoat = () => (
  <section className="py-16 px-6 bg-emerald-950">
    <div className="container mx-auto max-w-4xl">
      <h2 className="font-display text-2xl font-semibold text-cream-50 mb-8">Product Moat</h2>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {moats.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 bg-emerald-900/50 border border-emerald-800/50 rounded-lg p-4">
            <m.icon className="h-5 w-5 text-gold-400 shrink-0" />
            <span className="text-sm text-cream-100/70">{m.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ProductMoat;
