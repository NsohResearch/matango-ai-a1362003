import { motion } from "framer-motion";

const ProblemSection = () => (
  <section className="py-20 px-6 bg-cream-50">
    <div className="container mx-auto max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2 className="font-display text-3xl font-semibold text-foreground mb-6">Marketing today is fragmented.</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Teams juggle multiple AI tools, disconnected schedulers, agencies on retainer, and context lost between campaigns.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Every new campaign rebuilds brand knowledge from scratch. Execution slows. Costs rise. Growth stalls.
        </p>
      </motion.div>
    </div>
  </section>
);

export default ProblemSection;
