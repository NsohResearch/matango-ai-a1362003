import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { INDUSTRIES } from "@/lib/operators";

const IndustriesSection = () => (
  <section className="py-24 px-6 bg-background">
    <div className="container mx-auto max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <span className="text-xs font-medium text-primary uppercase tracking-[0.2em]">Industries Winning with AI</span>
        <h2 className="font-display text-3xl md:text-5xl font-semibold mt-3">
          Built for the trades and services <span className="italic">that move the world.</span>
        </h2>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
        {INDUSTRIES.map((ind, i) => (
          <motion.div
            key={ind.slug}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
          >
            <Link
              to={`/industries/${ind.slug}`}
              className="flex items-center gap-3 px-5 py-4 rounded-xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all group"
            >
              <span className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Check className="h-4 w-4" strokeWidth={3} />
              </span>
              <span className="text-2xl" aria-hidden>{ind.emoji}</span>
              <span className="font-display text-lg font-medium group-hover:text-primary transition-colors">
                {ind.name}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>

      <p className="text-center mt-10 text-sm text-muted-foreground">
        Don't see your industry? Your AAOs adapt to any vertical — <Link to="/contact" className="text-primary underline">talk to us</Link>.
      </p>
    </div>
  </section>
);

export default IndustriesSection;
