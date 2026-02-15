import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Brain, Bot, Megaphone, Video, Calendar, BarChart3 } from "lucide-react";

const slides = [
  { icon: Brain, title: "Brand Brain", desc: "Your persistent brand memory engine. Store ICP, voice, positioning, offers, and proof once — reuse everywhere." },
  { icon: Bot, title: "AI-Amplified Operators (AAOs)", desc: "Operators, not chatbots. Role-based AI that executes workflows, not just prompts." },
  { icon: Megaphone, title: "Campaign Factory", desc: "Generate full campaigns in minutes. Scripts, posts, landing copy, and creatives — aligned to your Brand Brain." },
  { icon: Video, title: "Video Studio", desc: "Create AI influencer videos at scale. Script → avatar → publish — without production crews." },
  { icon: Calendar, title: "Scheduler & Publishing", desc: "Deploy across channels. Automated posting with structured distribution logic." },
  { icon: BarChart3, title: "Closed-Loop Analytics", desc: "Campaigns that learn. Feedback improves future output automatically." },
];

const FeatureCarousel = () => {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setIdx((i) => (i + 1) % slides.length), []);
  const prev = useCallback(() => setIdx((i) => (i - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [paused, next]);

  const slide = slides[idx];

  return (
    <section className="py-20 px-6 bg-cream-50" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="container mx-auto max-w-4xl">
        <h2 className="font-display text-3xl md:text-4xl font-semibold text-center text-foreground mb-12">
          The Operator Stack
        </h2>

        <div className="relative min-h-[220px] flex items-center">
          <button onClick={prev} aria-label="Previous feature" className="absolute left-0 z-10 p-2 rounded-full bg-card border border-border hover:border-gold-500/40 transition-colors">
            <ChevronLeft className="h-5 w-5 text-muted-foreground" />
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="flex-1 text-center px-12"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-900 text-gold-400">
                <slide.icon className="h-8 w-8" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-2xl font-semibold text-foreground mb-3">{slide.title}</h3>
              <p className="text-muted-foreground max-w-lg mx-auto">{slide.desc}</p>
            </motion.div>
          </AnimatePresence>

          <button onClick={next} aria-label="Next feature" className="absolute right-0 z-10 p-2 rounded-full bg-card border border-border hover:border-gold-500/40 transition-colors">
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all ${i === idx ? "w-6 bg-primary" : "w-2 bg-border"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCarousel;
