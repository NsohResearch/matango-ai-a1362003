import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { HelpCircle, Mail, Shield, Newspaper, Scale, Megaphone } from "lucide-react";
import { Link } from "react-router-dom";

const resources = [
  {
    icon: HelpCircle,
    title: "Help Center",
    desc: "Find answers to frequently asked questions about Matango's platform, features, and billing.",
    color: "from-gold-400 to-gold-600",
    link: "/meet-kah",
    linkLabel: "Browse help topics",
  },
  {
    icon: Mail,
    title: "Contact Us",
    desc: "Connect with our support team for account-specific issues or technical assistance.",
    color: "from-emerald-400 to-emerald-600",
    link: "mailto:support@matango.ai",
    linkLabel: "Send a request",
    external: true,
  },
  {
    icon: Shield,
    title: "Platform Rules",
    desc: "Community guidelines and acceptable-use policies governing the Matango ecosystem.",
    color: "from-cyan-400 to-cyan-600",
    link: "/terms",
    linkLabel: "Read our rules",
  },
  {
    icon: Newspaper,
    title: "Press Inquiries",
    desc: "Connect with Matango's communications team for media requests and press coverage.",
    color: "from-purple-400 to-purple-600",
    link: "mailto:press@matango.ai",
    linkLabel: "Contact press team",
    external: true,
  },
  {
    icon: Scale,
    title: "Legal Requests",
    desc: "Submit legal and regulatory requests, including DMCA takedowns and law-enforcement inquiries.",
    color: "from-rose-400 to-rose-600",
    link: "/privacy",
    linkLabel: "View legal information",
  },
  {
    icon: Megaphone,
    title: "Advertiser Support",
    desc: "Resources for campaign managers and brands running promotions on the Matango platform.",
    color: "from-amber-400 to-amber-600",
    link: "/pricing",
    linkLabel: "View advertising options",
  },
];

const Support = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-28 pb-16 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,hsl(var(--gold-500)/0.12),transparent_60%)]" />
        <div className="container mx-auto max-w-5xl px-6 relative z-10">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-cream-50">
            Support Resources
          </h1>
          <p className="mt-3 text-lg text-cream-100/70 max-w-lg">
            Looking for something? We're here to help!
          </p>
        </div>
      </section>

      {/* Resource cards */}
      <section className="flex-1 py-16 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((r) => {
              const inner = (
                <div className="group bg-card border border-border rounded-xl overflow-hidden hover:border-gold-500/30 hover:shadow-luxury-sm transition-all h-full flex flex-col">
                  <div className={`h-32 bg-gradient-to-br ${r.color} flex items-center justify-center`}>
                    <r.icon className="h-12 w-12 text-white/90" strokeWidth={1.5} />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-display text-lg font-semibold text-card-foreground">
                      {r.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground flex-1">{r.desc}</p>
                    <span className="mt-4 text-sm font-medium text-primary group-hover:text-gold-400 transition-colors">
                      {r.linkLabel} →
                    </span>
                  </div>
                </div>
              );

              if (r.external) {
                return (
                  <a key={r.title} href={r.link} target="_blank" rel="noopener noreferrer">
                    {inner}
                  </a>
                );
              }
              return (
                <Link key={r.title} to={r.link}>
                  {inner}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Support;
