import { motion } from "framer-motion";

const VisionStatement = () => (
  <section className="py-20 px-6 bg-cream-50">
    <div className="container mx-auto max-w-3xl text-center">
      <div className="gold-divider mb-12" />
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2 className="font-display text-3xl font-semibold text-foreground mb-6">Vision</h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-4">
          The future of marketing is not more tools. It is intelligent operators working in continuous execution loops.
        </p>
        <p className="text-lg text-foreground font-medium">
          Matango.ai is building the AI-native marketing operating system.
        </p>
      </motion.div>
    </div>
  </section>
);

export default VisionStatement;
