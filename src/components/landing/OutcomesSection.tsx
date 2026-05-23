import { motion } from "framer-motion";

const outcomes = [
  {
    stat: "$8K–15K",
    unit: "per month recovered",
    desc: "Missed-call revenue captured by Ka'h for dental & med-spa practices.",
    industry: "Dental · Med Spas",
  },
  {
    stat: "20–40%",
    unit: "lift in conversions",
    desc: "Real-estate leads contacted within 60 seconds by Bashir close at higher rates.",
    industry: "Real Estate",
  },
  {
    stat: "70%",
    unit: "lower content cost",
    desc: "Zuri replaces a $6K/month agency retainer with a daily on-brand content engine.",
    industry: "Roofers · HVAC · Solar",
  },
  {
    stat: "4.2 → 4.8★",
    unit: "average rating in 90 days",
    desc: "Imani replies to every review and drives 3× more 5-star submissions.",
    industry: "Auto Repair · Chiropractors",
  },
  {
    stat: "30–50%",
    unit: "less time hunting info",
    desc: "Sefu's knowledge layer cuts internal search time for service teams.",
    industry: "All verticals",
  },
  {
    stat: "24/7/365",
    unit: "shift coverage",
    desc: "Every AAO works nights, weekends, holidays — without overtime.",
    industry: "All verticals",
  },
];

const OutcomesSection = () => (
  <section className="py-24 px-6 bg-emerald-950">
    <div className="container mx-auto max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <span className="text-xs font-medium text-gold-400 uppercase tracking-[0.2em]">Outcomes, Not Outputs</span>
        <h2 className="font-display text-3xl md:text-5xl font-semibold text-cream-50 mt-3">
          The numbers your AAOs <span className="italic text-gradient-accent">are paid to move.</span>
        </h2>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {outcomes.map((o, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="relative p-7 rounded-2xl bg-emerald-900/40 border border-emerald-800/50 hover:border-gold-400/40 transition-all group"
          >
            <div className="font-display text-4xl md:text-5xl font-semibold text-gold-400 leading-none">
              {o.stat}
            </div>
            <div className="mt-2 text-sm font-medium text-cream-50">{o.unit}</div>
            <p className="mt-3 text-sm text-cream-100/60">{o.desc}</p>
            <span className="mt-5 inline-block text-[10px] uppercase tracking-wider text-gold-400/70 border-t border-emerald-800/60 pt-3 w-full">
              {o.industry}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default OutcomesSection;
