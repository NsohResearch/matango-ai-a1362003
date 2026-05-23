import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { OPERATORS } from "@/lib/operators";

const OperatorsSection = () => (
  <section className="py-24 px-6 bg-emerald-950">
    <div className="container mx-auto max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <span className="text-xs font-medium text-gold-400 uppercase tracking-[0.2em]">Meet Your AAOs</span>
        <h2 className="font-display text-3xl md:text-5xl font-semibold text-cream-50 mt-3">
          Six operators. <span className="italic text-gradient-accent">One brand.</span>
        </h2>
        <p className="mt-4 text-cream-100/60 max-w-2xl mx-auto">
          Each AI-Amplified Operator has a name, a job, and a memory of your brand. Hire one or all six.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
        {OPERATORS.map((op, i) => (
          <motion.div
            key={op.slug}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="flex flex-col items-center text-center group"
          >
            <Link to={`/personas/${op.slug}`} className="block">
              <div className={`relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-gradient-to-br ${op.accent} ring-2 ring-white/10 group-hover:ring-gold-400/60 transition-all shadow-xl`}>
                <img
                  src={op.image}
                  alt={`${op.name}, ${op.role}`}
                  width={768}
                  height={768}
                  loading="lazy"
                  className="w-full h-full object-cover mix-blend-luminosity opacity-95 group-hover:scale-105 transition-transform duration-500"
                />
                <OpenToWorkBadge />
              </div>
            </Link>
            <h3 className="mt-5 font-display text-xl font-semibold text-cream-50">{op.name}</h3>
            <p className="text-sm text-cream-100/70 mt-1">{op.role}</p>
            <p className="text-[11px] text-cream-100/50 mt-1 max-w-[14rem]">{op.experience}</p>
            {!op.available && (
              <span className="mt-1 text-xs italic text-cream-100/40">Onboarding Underway</span>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-14 flex justify-center">
        <Link
          to="/personas"
          className="inline-flex items-center gap-2 rounded-full bg-gold-500 text-emerald-950 px-7 py-3 font-medium hover:bg-gold-400 transition-all shadow-lg"
        >
          Meet all operators <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  </section>
);

export default OperatorsSection;
