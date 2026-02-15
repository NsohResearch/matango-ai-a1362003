import { motion } from "framer-motion";
import { Brain, Bot, RefreshCw } from "lucide-react";

const items = [
  { icon: Brain, title: "Brand Brain", desc: "A persistent memory engine storing your ICP, voice, positioning, and campaign data." },
  { icon: Bot, title: "AI-Amplified Operators (AAOs)", desc: "Specialized AI roles that execute workflows end-to-end: Founder AAO — strategy alignment. Campaign AAO — campaign build & optimization. Influencer AAO — persona-driven content." },
  { icon: RefreshCw, title: "Closed Loop Execution", desc: "Campaigns publish, measure performance, and refine output automatically." },
];

const SolutionSection = () => (
  <section className="py-20 px-6 bg-emerald-950">
    <div className="container mx-auto max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
        <h2 className="font-display text-3xl font-semibold text-cream-50 mb-4">Matango.ai is not another tool.</h2>
        <p className="text-cream-100/60 text-lg">It is an operator system.</p>
      </motion.div>
      <div className="grid md:grid-cols-3 gap-6">
        {items.map((item, i) => (
          <motion.div key={item.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            className="bg-emerald-900/50 border border-emerald-800/50 rounded-xl p-6">
            <item.icon className="h-8 w-8 text-gold-400 mb-3" strokeWidth={1.5} />
            <h3 className="font-display text-lg font-semibold text-cream-50 mb-2">{item.title}</h3>
            <p className="text-sm text-cream-100/50">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default SolutionSection;
