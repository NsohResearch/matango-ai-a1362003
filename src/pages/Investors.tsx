import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TrendingUp, Calendar, FileText, BarChart3, Users, BookOpen } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const newsReleases = [
  { date: "Feb 10, 2026", title: "Matango Reports Q4 2025 Results; Announces Growth Acceleration Program" },
  { date: "Jan 20, 2026", title: "Matango to Announce Fourth Quarter and Full Year 2025 Results" },
  { date: "Nov 05, 2025", title: "Matango Reports Third Quarter 2025 Results" },
];

const events = [
  { date: "Mar 15, 2026 · 4:00 PM ET", title: "Matango Investor Day 2026" },
  { date: "Feb 10, 2026 · 4:30 PM ET", title: "Matango Q4'25 Earnings Call" },
];

const quarterlyResults = [
  { quarter: "Q4 2025", revenue: "$48.2M", yoy: "+62%" },
  { quarter: "Q3 2025", revenue: "$41.7M", yoy: "+55%" },
  { quarter: "Q2 2025", revenue: "$36.1M", yoy: "+48%" },
];

const governance = [
  { title: "Board of Directors", desc: "Meet the leadership guiding Matango's mission and strategy." },
  { title: "Corporate Governance Guidelines", desc: "Principles and practices governing our board and management." },
  { title: "Committee Composition", desc: "Audit, compensation, and nominating committee details." },
];

const Investors = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-28 pb-20 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,hsl(var(--gold-500)/0.10),transparent_60%)]" />
        <div className="container mx-auto max-w-5xl px-6 relative z-10">
          <p className="text-xs uppercase tracking-widest text-gold-400 mb-3">Investor Relations</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-cream-50 leading-tight">
            Matango<br />Investor Relations
          </h1>
          <p className="mt-4 text-lg text-cream-100/70 max-w-xl">
            Our mission is to empower creators and brands with AI-powered marketing automation, making growth accessible to everyone.
          </p>
          <Button className="mt-6" size="lg" asChild>
            <a href="https://matango-ai.lovable.app" target="_blank" rel="noopener noreferrer">
              Visit Matango.ai
            </a>
          </Button>
        </div>
      </section>

      {/* Overview blurb */}
      <section className="py-12 px-6 border-b border-border">
        <div className="container mx-auto max-w-3xl text-center">
          <p className="text-muted-foreground leading-relaxed">
            Matango is the AI-powered marketing automation platform that helps creators, brands, and agencies deploy autonomous marketing systems. Our proprietary AAO (Autonomous Attention Orchestrator) technology drives content creation, distribution, and optimization at scale.
          </p>
        </div>
      </section>

      {/* Three-column grid */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl grid md:grid-cols-3 gap-8">

          {/* News Releases */}
          <Card className="bg-card border-border">
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <FileText className="h-6 w-6 text-gold-400" />
              <CardTitle className="text-lg">News Releases</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {newsReleases.map((n) => (
                <div key={n.title} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <p className="text-xs text-muted-foreground mb-1">{n.date}</p>
                  <p className="text-sm text-card-foreground font-medium leading-snug hover:text-gold-400 cursor-pointer transition-colors">
                    {n.title}
                  </p>
                </div>
              ))}
              <p className="text-xs text-primary hover:text-gold-400 cursor-pointer transition-colors">View all news →</p>
            </CardContent>
          </Card>

          {/* Investor Events */}
          <Card className="bg-card border-border">
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <Calendar className="h-6 w-6 text-gold-400" />
              <CardTitle className="text-lg">Investor Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {events.map((e) => (
                <div key={e.title} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <p className="text-xs text-muted-foreground mb-1">{e.date}</p>
                  <p className="text-sm text-card-foreground font-medium leading-snug hover:text-gold-400 cursor-pointer transition-colors">
                    {e.title}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quarterly Results */}
          <Card className="bg-card border-border">
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <BarChart3 className="h-6 w-6 text-gold-400" />
              <CardTitle className="text-lg">Quarterly Results</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b border-border">
                    <th className="text-left pb-2 font-medium">Quarter</th>
                    <th className="text-right pb-2 font-medium">Revenue</th>
                    <th className="text-right pb-2 font-medium">YoY</th>
                  </tr>
                </thead>
                <tbody>
                  {quarterlyResults.map((q) => (
                    <tr key={q.quarter} className="border-b border-border last:border-0">
                      <td className="py-2 text-card-foreground">{q.quarter}</td>
                      <td className="py-2 text-right text-card-foreground font-medium">{q.revenue}</td>
                      <td className="py-2 text-right text-emerald-400 font-semibold">{q.yoy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stock & Governance */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl grid md:grid-cols-2 gap-8">

          {/* Stock Info placeholder */}
          <Card className="bg-card border-border">
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <TrendingUp className="h-6 w-6 text-gold-400" />
              <CardTitle className="text-lg">Stock Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-3 mb-4">
                <span className="font-display text-3xl font-bold text-card-foreground">MTNG</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">NYSE</span>
              </div>
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-2xl font-semibold text-card-foreground">$127.43</span>
                <span className="text-sm font-medium text-emerald-400">+2.31 (+1.85%)</span>
              </div>
              <p className="text-xs text-muted-foreground">Data is illustrative. Real-time quotes will be available upon listing.</p>
            </CardContent>
          </Card>

          {/* Governance */}
          <Card className="bg-card border-border">
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <Users className="h-6 w-6 text-gold-400" />
              <CardTitle className="text-lg">Governance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {governance.map((g) => (
                <div key={g.title} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <p className="text-sm text-card-foreground font-medium hover:text-gold-400 cursor-pointer transition-colors">
                    {g.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{g.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SEC filings / Resources */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-5xl text-center">
          <BookOpen className="h-10 w-10 text-gold-400 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">IR Resources</h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-6">
            Access SEC filings, annual reports, investor presentations, and analyst coverage.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {["SEC Filings", "Annual Reports", "Investor Presentations", "Analyst Coverage", "Contact IR"].map((label) => (
              <Button key={label} variant="outline" size="sm" className="cursor-pointer">
                {label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Investors;
