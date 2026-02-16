import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import kahHero from "@/assets/kah-hero.webp";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Brain, Megaphone, Calendar, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const capabilities = [
  { icon: Brain, title: "Remembers Your Brand", desc: "Your brand story, ICP, proof points — always in context." },
  { icon: Megaphone, title: "Generates Campaigns", desc: "Ads, posts, scripts, and content — autonomously, on-brand." },
  { icon: Calendar, title: "Publishes on Schedule", desc: "Across every channel, on your calendar, without burnout." },
  { icon: BarChart3, title: "Learns & Optimizes", desc: "Performance data feeds back into strategy, 24/7." },
];

const MeetKah = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main>
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-emerald-950 pt-24 pb-16 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto max-w-5xl grid md:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/5 px-4 py-1.5 text-sm text-gold-400 mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              Your First AI-Amplified Operator
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-semibold text-cream-50 leading-tight">
              Meet <span className="text-gradient-accent italic">Ka'h</span>
            </h1>
            <p className="mt-4 text-lg text-cream-100/60 font-body max-w-md">
              Your brand already has roots. Ka'h helps them spread — generating campaigns, publishing content, and optimizing strategy while you sleep.
            </p>
            <blockquote className="mt-6 border-l-2 border-gold-500/40 pl-4 text-cream-100/50 italic font-display text-lg">
              "Marketing isn't about tools. It's about operators."
            </blockquote>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/auth?mode=signup"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 font-medium text-primary-foreground hover:shadow-luxury transition-all"
              >
                Deploy Ka'h Now <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-gold-500/20 to-emerald-500/20 blur-xl" />
              <img
                src={kahHero}
                alt="Ka'h — AI-Amplified Operator"
                className="relative rounded-3xl w-full max-w-md shadow-2xl ring-1 ring-white/10"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-display text-3xl font-semibold text-center mb-12">What Ka'h Does</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {capabilities.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-xl p-6 flex gap-4"
              >
                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <c.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg">{c.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default MeetKah;
