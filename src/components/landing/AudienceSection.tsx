import { motion } from "framer-motion";
import { Rocket, Building2, User } from "lucide-react";

const audiences = [
  {
    icon: Rocket,
    label: "AI Founders & Startups",
    title: "Deploy operators, not tools.",
    desc: "Your AAOs hold brand memory, execute campaigns, and learn from outcomes — 24/7, without burnout.",
  },
  {
    icon: Building2,
    label: "Agencies",
    title: "Scale with operators, not headcount.",
    desc: "Deploy AAOs for each client. White-label the platform. Deliver consistent results without hiring.",
  },
  {
    icon: User,
    label: "Creators",
    title: "Your AAO works while you sleep.",
    desc: "Your Influencer AAO generates content, publishes across channels, and learns what resonates — all on autopilot.",
  },
];

const AudienceSection = () => {
  return (
    <section className="py-24 px-6 bg-emerald-950">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-cream-50">Built For Teams Ready to Deploy AAOs</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {audiences.map((a, i) => (
            <motion.div
              key={a.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-emerald-900/50 border border-emerald-800/50 rounded-xl p-6"
            >
              <a.icon className="h-8 w-8 text-gold-400 mb-3" strokeWidth={1.5} />
              <span className="text-xs font-medium text-gold-400 uppercase tracking-wider">{a.label}</span>
              <h3 className="font-display text-lg font-semibold mt-2 mb-2 text-cream-50">{a.title}</h3>
              <p className="text-sm text-cream-100/50">{a.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AudienceSection;
