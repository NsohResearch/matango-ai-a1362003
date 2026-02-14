import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 px-6 bg-cream-50">
      <div className="container mx-auto max-w-3xl text-center">
        <div className="gold-divider mb-12" />
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-3xl md:text-5xl font-semibold text-foreground"
        >
          Ready to End the{" "}
          <span className="text-gradient-accent italic">Tool Parade?</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-muted-foreground"
        >
          Start with your Brand Brain. Let the system handle the rest.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <Link
            to="/auth?mode=signup"
            className="inline-flex items-center gap-2 rounded-pill bg-primary px-8 py-3.5 font-medium text-primary-foreground hover:border hover:border-gold-400 hover:shadow-luxury transition-all"
          >
            Build Your Brand Brain <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">Free tier available. No credit card required.</p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
