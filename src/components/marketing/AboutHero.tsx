import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const AboutHero = () => (
  <section className="relative pt-28 pb-20 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,hsl(var(--gold-500)/0.10),transparent_60%)]" />
    <div className="container mx-auto max-w-4xl px-6 relative z-10 text-center">
      <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl md:text-5xl font-bold text-cream-50 leading-tight">
        The AI Marketing Agency for the Age of AI-Amplified Operators.
      </motion.h1>
      <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4 text-lg text-cream-100/70 max-w-2xl mx-auto">
        Humans set direction. Operators execute, publish, and optimize — continuously.
      </motion.p>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 flex flex-wrap justify-center gap-4">
        <Link to="/auth?mode=signup" className="inline-flex items-center gap-2 rounded-pill bg-primary px-8 py-3.5 font-medium text-primary-foreground hover:border hover:border-gold-400 transition-all">
          Start Free <ArrowRight className="h-4 w-4" />
        </Link>
        <Link to="/pricing" className="inline-flex items-center gap-2 rounded-pill border border-cream-100/20 px-8 py-3.5 font-medium text-cream-50 hover:border-gold-400 hover:text-gold-400 transition-colors">
          View Pricing
        </Link>
      </motion.div>
    </div>
  </section>
);

export default AboutHero;
