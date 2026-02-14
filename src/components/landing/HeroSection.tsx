import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import kahHero from "@/assets/kah-hero.webp";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-6 overflow-hidden bg-emerald-950">
      {/* Subtle warm halo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold-500/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 rounded-pill border border-gold-500/20 bg-gold-500/5 px-4 py-1.5 text-sm text-gold-400 mb-8"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
        AI-Amplified Operators for Always-On Growth
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="font-display text-5xl md:text-7xl font-semibold text-center max-w-4xl leading-tight text-cream-50"
      >
        One Loop. One Brand Brain.{" "}
        <span className="text-gradient-accent italic">Always-On Growth.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-6 text-lg text-cream-100/60 text-center max-w-2xl font-body"
      >
        Deploy AI-Amplified Operators that remember your brand, execute campaigns,
        and learn from every outcome — 24/7, without burnout.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-10 flex flex-wrap items-center justify-center gap-4"
      >
        <Link
          to="/auth?mode=signup"
          className="inline-flex items-center gap-2 rounded-pill bg-primary px-8 py-3.5 font-medium text-primary-foreground hover:border hover:border-gold-400 hover:shadow-luxury transition-all"
        >
          Start Your Growth Loop <ArrowRight className="h-4 w-4" />
        </Link>
        <button className="inline-flex items-center gap-2 rounded-pill border border-cream-100/20 px-8 py-3.5 font-medium text-cream-50 hover:border-gold-400 hover:text-gold-400 transition-colors">
          <Play className="h-4 w-4" /> Watch Platform Tour
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-16 relative"
      >
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-gold-500/20 to-emerald-500/20 blur-xl" />
        <img
          src={kahHero}
          alt="Ka'h — AI-Amplified Operator"
          className="relative rounded-3xl w-48 h-48 object-cover object-top mx-auto shadow-2xl ring-1 ring-white/10"
        />
        <p className="mt-3 text-sm text-gold-400 font-display">Ka'h — Your AI Operator</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="mt-8 gold-divider w-48"
      />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-6 text-sm italic text-cream-100/40 font-display text-lg"
      >
        "Marketing isn't about tools. It's about operators."
      </motion.p>
    </section>
  );
};

export default HeroSection;
