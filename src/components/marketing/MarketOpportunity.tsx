import { motion } from "framer-motion";

const MarketOpportunity = () => (
  <section className="py-16 px-6 bg-cream-50">
    <div className="container mx-auto max-w-3xl">
      <h2 className="font-display text-2xl font-semibold text-foreground mb-6">Market Opportunity</h2>
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <ul className="space-y-3 text-muted-foreground">
          <li>• Digital marketing is a multi-hundred-billion-dollar industry.</li>
          <li>• SMBs and agencies demand automation.</li>
          <li>• Creator economy accelerating.</li>
          <li>• AI-native businesses emerging.</li>
        </ul>
        <p className="mt-6 text-foreground font-medium">The shift: from tool stacks to operator systems.</p>
      </motion.div>
    </div>
  </section>
);

export default MarketOpportunity;
