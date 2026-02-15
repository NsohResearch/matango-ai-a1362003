import { motion } from "framer-motion";

const steps = [
  { num: "01", title: "Build Your Brand Brain", desc: "Define audience, voice, offer, and proof." },
  { num: "02", title: "Launch with Operators", desc: "Use Campaign Factory, Video Studio, and Scheduler to deploy across channels." },
  { num: "03", title: "Learn & Scale", desc: "Analytics refine messaging and increase performance over time." },
];

const HowItWorks = () => (
  <section className="py-20 px-6 bg-cream-50">
    <div className="container mx-auto max-w-4xl">
      <h2 className="font-display text-3xl font-semibold text-center text-foreground mb-12">How It Works</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((s, i) => (
          <motion.div key={s.num} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-display font-bold text-lg">
              {s.num}
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">{s.title}</h3>
            <p className="text-sm text-muted-foreground">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
