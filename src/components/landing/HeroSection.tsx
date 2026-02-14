import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-6 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-8"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-glow-pulse" />
        AI-Amplified Operators (AAO) for Always-On Growth
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="font-display text-5xl md:text-7xl font-bold text-center max-w-4xl leading-tight"
      >
        End the Marketing{" "}
        <span className="text-gradient-primary">Tool Parade.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-6 text-lg text-muted-foreground text-center max-w-2xl"
      >
        Meet the AI-Amplified Operators (AAO)—digital team members that think, execute, and learn your brand story 24/7. No more context switching. No more fragmented tools. Just continuous growth.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-10 flex flex-wrap items-center justify-center gap-4"
      >
        <Link
          to="/auth?mode=signup"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 font-medium text-primary-foreground hover:bg-primary/90 transition-all glow-primary"
        >
          Build Your Brand Brain <ArrowRight className="h-4 w-4" />
        </Link>
        <button className="inline-flex items-center gap-2 rounded-full border border-border px-8 py-3.5 font-medium text-foreground hover:bg-secondary transition-colors">
          <Play className="h-4 w-4" /> Watch How It Works
        </button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-12 text-sm italic text-muted-foreground"
      >
        "Marketing isn't about tools. It's about operators. Matango.ai deploys AAOs that never sleep."
      </motion.p>
    </section>
  );
};

export default HeroSection;
