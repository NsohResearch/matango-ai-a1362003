import { motion } from "framer-motion";

const rows = [
  { aspect: "Execution", agency: "Human-heavy execution", tools: "Prompt-based tools", matango: "Operator-driven workflows" },
  { aspect: "Cost", agency: "Expensive retainers", tools: "Disconnected apps", matango: "Unified system" },
  { aspect: "Optimization", agency: "Manual optimization", tools: "No memory persistence", matango: "Persistent Brand Brain" },
  { aspect: "Iteration", agency: "Slow iteration", tools: "Fragmented reporting", matango: "Closed-loop growth engine" },
];

const DifferentiationTable = () => (
  <section className="py-20 px-6 bg-emerald-950">
    <div className="container mx-auto max-w-4xl">
      <h2 className="font-display text-2xl font-semibold text-center text-cream-50 mb-8">Why Matango.ai</h2>
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="overflow-x-auto border border-emerald-800/50 rounded-xl">
        <table className="w-full min-w-[500px] text-sm">
          <thead>
            <tr className="border-b border-emerald-800/50">
              <th className="px-4 py-3 text-left text-cream-100/40 font-medium">Aspect</th>
              <th className="px-4 py-3 text-left text-cream-100/40 font-medium">Traditional Agency</th>
              <th className="px-4 py-3 text-left text-cream-100/40 font-medium">Tool Stack</th>
              <th className="px-4 py-3 text-left text-gold-400 font-medium">Matango.ai</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.aspect} className="border-b border-emerald-800/30 last:border-0">
                <td className="px-4 py-3 text-cream-100/60 font-medium">{r.aspect}</td>
                <td className="px-4 py-3 text-cream-100/40">{r.agency}</td>
                <td className="px-4 py-3 text-cream-100/40">{r.tools}</td>
                <td className="px-4 py-3 text-gold-400 font-medium">{r.matango}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  </section>
);

export default DifferentiationTable;
