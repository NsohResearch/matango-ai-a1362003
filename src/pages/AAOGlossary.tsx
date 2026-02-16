import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Zap, Brain, MessageSquare, BarChart3, Target, Video, Image, Calendar, Users, TrendingUp, Shield, Clock, Sparkles, ArrowRight, CheckCircle2, XCircle } from "lucide-react";

const AAO_TYPES = [
  {
    id: "content", name: "Content AAO", icon: Sparkles, color: "bg-purple-500",
    description: "Generates and optimizes marketing content across all channels",
    capabilities: ["Blog posts and articles", "Social media posts", "Email sequences", "Ad copy variations", "Landing page content", "Video scripts"],
    example: "Ka'h generates 50 LinkedIn post variations from your Brand Brain, A/B tests them, and learns which hooks resonate with your ICP.",
  },
  {
    id: "engagement", name: "Engagement AAO", icon: MessageSquare, color: "bg-blue-500",
    description: "Manages audience interactions and community engagement",
    capabilities: ["Comment responses", "DM handling", "Community moderation", "Lead qualification", "Sentiment analysis", "Conversation routing"],
    example: "Automatically responds to LinkedIn comments within your brand voice, escalating high-intent leads to your sales team.",
  },
  {
    id: "analytics", name: "Analytics AAO", icon: BarChart3, color: "bg-primary",
    description: "Monitors performance metrics and generates actionable insights",
    capabilities: ["Performance tracking", "Trend detection", "Competitive analysis", "ROI calculation", "Anomaly detection", "Predictive modeling"],
    example: "Detects a 23% drop in engagement on Tuesdays and automatically shifts posting schedule to optimize reach.",
  },
  {
    id: "campaign", name: "Campaign AAO", icon: Target, color: "bg-orange-500",
    description: "Orchestrates multi-channel marketing campaigns end-to-end",
    capabilities: ["Campaign planning", "Asset coordination", "A/B testing", "Budget allocation", "Cross-channel sync", "Performance optimization"],
    example: "Launches a 14-day product launch campaign across 4 platforms, automatically adjusting budget allocation based on real-time performance.",
  },
  {
    id: "video", name: "Video AAO", icon: Video, color: "bg-pink-500",
    description: "Creates, edits, and optimizes video content at scale",
    capabilities: ["Script generation", "Scene composition", "Lip-sync integration", "Format adaptation", "Thumbnail generation", "Caption creation"],
    example: "Takes a single product demo script and generates 15 platform-specific versions with optimized hooks and CTAs.",
  },
];

const GLOSSARY = [
  { term: "AAO", definition: "AI-Amplified Operator — an autonomous agent that executes marketing tasks using your Brand Brain as its directive engine." },
  { term: "Brand Brain", definition: "The central knowledge base containing brand voice, ICP personas, differentiators, claims/proof, and forbidden phrases." },
  { term: "One Loop", definition: "Matango's unified workflow: Build → Create → Publish → Analyze → Optimize, powered by a single Brand Brain." },
  { term: "Ka'h", definition: "Matango's first AI influencer and system operator, embodying the AAO concept in action." },
  { term: "ICP", definition: "Ideal Customer Profile — the detailed persona definitions stored in Brand Brain that guide all content targeting." },
  { term: "Growth Loop", definition: "The continuous cycle of content creation, publishing, analysis, and optimization that drives compounding growth." },
  { term: "Operatorware", definition: "Software that deploys AI operators rather than just tools — the category Matango defines." },
  { term: "Campaign Factory", definition: "Multi-channel asset generation engine that creates coordinated content across platforms." },
  { term: "Generation Workspace", definition: "The dedicated environment for creating AI influencer images with consistent character identity." },
  { term: "White Label", definition: "Enterprise capability allowing agencies to rebrand Matango under their own identity." },
];

export default function AAOGlossary() {
  return (
    <DashboardLayout>
      <div className="p-8 max-w-5xl">
        <h1 className="font-display text-3xl font-bold mb-2">AAO Glossary & Reference</h1>
        <p className="text-muted-foreground mb-8">Understanding AI-Amplified Operators and the Matango ecosystem.</p>

        <Tabs defaultValue="types">
          <TabsList className="mb-6">
            <TabsTrigger value="types"><Bot className="h-3.5 w-3.5 mr-1" /> AAO Types</TabsTrigger>
            <TabsTrigger value="glossary"><Brain className="h-3.5 w-3.5 mr-1" /> Glossary</TabsTrigger>
            <TabsTrigger value="architecture"><Zap className="h-3.5 w-3.5 mr-1" /> Architecture</TabsTrigger>
          </TabsList>

          <TabsContent value="types">
            <div className="space-y-4">
              {AAO_TYPES.map((aao) => (
                <Card key={aao.id}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${aao.color}/20`}><aao.icon className="h-5 w-5" /></div>
                      <div>
                        <CardTitle className="text-lg">{aao.name}</CardTitle>
                        <CardDescription>{aao.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Capabilities</h4>
                        <ul className="space-y-1">
                          {aao.capabilities.map((c) => (
                            <li key={c} className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-3 w-3 text-primary shrink-0" />{c}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <h4 className="text-sm font-medium mb-2">Example</h4>
                        <p className="text-sm text-muted-foreground italic">"{aao.example}"</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="glossary">
            <div className="space-y-2">
              {GLOSSARY.map((item) => (
                <Card key={item.term}>
                  <CardContent className="p-4 flex gap-4">
                    <Badge variant="secondary" className="shrink-0 h-fit">{item.term}</Badge>
                    <p className="text-sm text-muted-foreground">{item.definition}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="architecture">
            <Card>
              <CardContent className="p-8">
                <h3 className="font-display text-lg font-semibold mb-4">The One Loop Architecture</h3>
                <div className="flex flex-wrap gap-2 items-center justify-center">
                  {["Brand Brain", "→", "Create", "→", "Publish", "→", "Analyze", "→", "Optimize", "→", "Brand Brain"].map((step, i) => (
                    step === "→" ? <ArrowRight key={i} className="h-4 w-4 text-gold-500" /> :
                    <Badge key={i} variant={step === "Brand Brain" ? "default" : "secondary"} className="text-sm">{step}</Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground text-center mt-6">Each AAO plugs into this loop, executing its specialized function while feeding insights back to the Brand Brain for continuous improvement.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
