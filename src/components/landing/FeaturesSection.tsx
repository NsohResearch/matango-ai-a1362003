import { motion } from "framer-motion";
import { Brain, Target, TrendingUp } from "lucide-react";

const principles = [
  {
    icon: Brain,
    title: "One Brand Brain",
    desc: "Your ICP, voice, claims, and proof live in one place. Never re-enter context again. Every campaign inherits your brand memory.",
  },
  {
    icon: Target,
    title: "Unified Campaign Object",
    desc: "One campaign contains audience, angle, assets, schedule, landing page, ads, emails, and results. Single source of truth.",
  },
  {
    icon: TrendingUp,
    title: "Closed-Loop Learning",
    desc: "Performance feeds strategy automatically. Stop guessing — let data drive your next best action.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 px-6 bg-cream-50">
      <div className="container mx-auto max-w-5xl">
        <div className="gold-divider mb-16" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground">System, Not Tools</h2>
          <p className="mt-3 text-muted-foreground">Three principles that make Matango.ai fundamentally different.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {principles.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-900 text-gold-400">
                <p.icon className="h-7 w-7" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2 text-foreground">{p.title}</h3>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
