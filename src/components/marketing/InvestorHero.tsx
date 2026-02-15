import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const InvestorHero = () => (
  <section className="relative pt-28 pb-20 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,hsl(var(--gold-500)/0.10),transparent_60%)]" />
    <div className="container mx-auto max-w-4xl px-6 relative z-10">
      <p className="text-xs uppercase tracking-widest text-gold-400 mb-3">Investor Relations</p>
      <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl md:text-5xl font-bold text-cream-50 leading-tight">
        Matango.ai is building the autonomous operating system for marketing.
      </motion.h1>
      <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4 text-lg text-cream-100/70 max-w-2xl">
        Operators replace agencies. Execution becomes continuous.
      </motion.p>
    </div>
  </section>
);

export default InvestorHero;
