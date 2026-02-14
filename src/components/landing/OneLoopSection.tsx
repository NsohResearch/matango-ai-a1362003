import { motion } from "framer-motion";

const steps = [
  { num: "01", label: "Remember", title: "Build Brand Brain", desc: "Define your ICP, voice, claims, and proof once. Your brand memory powers everything." },
  { num: "02", label: "Create", title: "Generate Campaign", desc: "One campaign object creates LinkedIn posts, ads, emails, landing pages, and video scripts." },
  { num: "03", label: "Execute", title: "Publish Everywhere", desc: "Schedule and publish across all channels. Capture leads with built-in UTM tracking." },
  { num: "04", label: "Optimize", title: "Learn & Improve", desc: "Performance feeds back automatically. AI insights tell you what's working and what to try next." },
];

const OneLoopSection = () => {
  return (
    <section className="py-24 px-6">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Matango.ai Replaces the Tool Parade{" "}
            <span className="text-gradient-primary">With One Continuous Loop</span>
          </h2>
          <p className="mt-3 text-muted-foreground">One system. One brand brain. Always-on growth.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-xl p-6 relative overflow-hidden group"
            >
              <div className="absolute top-4 right-4 font-display text-4xl font-bold text-primary/10 group-hover:text-primary/20 transition-colors">
                {step.num}
              </div>
              <span className="text-xs font-medium text-primary uppercase tracking-wider">{step.label}</span>
              <h3 className="font-display text-xl font-semibold mt-2 mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 text-center"
        >
          <span className="inline-flex items-center gap-2 text-sm text-primary">
            <span className="h-2 w-2 rounded-full bg-primary animate-glow-pulse" />
            Continuous improvement loop
          </span>
        </motion.div>
      </div>
    </section>
  );
};

export default OneLoopSection;
