import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

const transformations = [
  {
    vague: "We help you save time with AI.",
    specific: "Ka'h answers every missed call — recovering $8K–$15K/month for dental & med spa practices.",
  },
  {
    vague: "We improve your lead response time.",
    specific: "Bashir replies to every lead within 60 seconds — lifting real-estate conversions by 20–40%.",
  },
  {
    vague: "We help with content.",
    specific: "Zuri ships 30 on-brand reels/month — cutting agency content costs by 70%.",
  },
  {
    vague: "We protect your reputation.",
    specific: "Imani replies to every Google review in under 5 minutes — moving roofers from 4.2 → 4.8 stars in 90 days.",
  },
];

const SpecificityShowcase = () => (
  <section className="py-24 px-6 bg-background">
    <div className="container mx-auto max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <span className="text-xs font-medium text-primary uppercase tracking-[0.2em]">Why Matango Wins</span>
        <h2 className="font-display text-3xl md:text-5xl font-semibold mt-3">
          We don't sell <span className="italic line-through opacity-50">"AI tools."</span>
          <br />
          We deploy <span className="italic text-gradient-accent">operators that move numbers.</span>
        </h2>
        <p className="mt-5 text-muted-foreground max-w-2xl mx-auto">
          Vague promises lose deals. Specific outcomes close them. Every AAO is measured against a number you can take to the bank.
        </p>
      </motion.div>

      <div className="space-y-4 max-w-3xl mx-auto">
        {transformations.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="grid md:grid-cols-2 gap-3 md:gap-4"
          >
            <div className="flex gap-3 p-5 rounded-xl bg-destructive/5 border border-destructive/20">
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-destructive/15 flex items-center justify-center mt-0.5">
                <X className="h-3.5 w-3.5 text-destructive" strokeWidth={3} />
              </span>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-destructive">Vague</span>
                <p className="text-sm text-muted-foreground mt-0.5">{t.vague}</p>
              </div>
            </div>
            <div className="flex gap-3 p-5 rounded-xl bg-primary/5 border border-primary/30 shadow-sm">
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                <Check className="h-3.5 w-3.5 text-primary" strokeWidth={3} />
              </span>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">Specific</span>
                <p className="text-sm font-medium mt-0.5">{t.specific}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default SpecificityShowcase;
