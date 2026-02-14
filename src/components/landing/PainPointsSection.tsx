import { motion } from "framer-motion";
import { Clock, Brain, Unplug } from "lucide-react";

const painPoints = [
  {
    icon: Clock,
    metric: "4+ hrs/week",
    title: "Context Lost",
    description: "Every tool needs your brand context re-entered. Your ICP, voice, and proof scattered across 10+ platforms.",
  },
  {
    icon: Brain,
    metric: "Zero feedback",
    title: "No Memory",
    description: "Tools don't remember what worked. You're guessing instead of learning from every campaign.",
  },
  {
    icon: Unplug,
    metric: "Broken loop",
    title: "Fragmented Results",
    description: "Analytics in one place, content in another, leads in a third. No unified view of growth.",
  },
];

const PainPointsSection = () => {
  return (
    <section className="py-24 px-6">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold">Sound Familiar?</h2>
          <p className="mt-3 text-muted-foreground">"Tool 1. Tool 2. Tool 3…" By the end of the tutorial, you're teaching tools — not strategy.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {painPoints.map((point, i) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-xl p-6"
            >
              <point.icon className="h-8 w-8 text-accent mb-3" />
              <span className="text-xs font-medium text-accent uppercase tracking-wider">{point.metric}</span>
              <h3 className="font-display text-xl font-semibold mt-2 mb-2">{point.title}</h3>
              <p className="text-sm text-muted-foreground">{point.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PainPointsSection;
