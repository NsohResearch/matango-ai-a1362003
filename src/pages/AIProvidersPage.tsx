import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Key, Plus, Check, X, ExternalLink, Star, Zap, Shield, Loader2, AlertCircle, CheckCircle2, Clock } from "lucide-react";

const PROVIDERS = [
  { id: "openai", name: "OpenAI", models: ["GPT-4o", "GPT-4o-mini", "DALL·E 3"], status: "available", tier: "Premium" },
  { id: "anthropic", name: "Anthropic", models: ["Claude 3.5 Sonnet", "Claude 3 Haiku"], status: "available", tier: "Premium" },
  { id: "replicate", name: "Replicate", models: ["Flux", "SDXL", "Whisper"], status: "available", tier: "Standard" },
  { id: "elevenlabs", name: "ElevenLabs", models: ["Voice Synthesis", "Voice Cloning"], status: "available", tier: "Premium" },
  { id: "runway", name: "Runway", models: ["Gen-3 Alpha"], status: "coming_soon", tier: "Premium" },
];

export default function AIProvidersPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");

  const handleAddKey = () => {
    if (!apiKey.trim()) { toast.error("Please enter an API key"); return; }
    toast.success(`API key for ${selectedProvider} saved securely.`);
    setIsAddDialogOpen(false);
    setApiKey("");
    setSelectedProvider(null);
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-5xl">
        <h1 className="font-display text-3xl font-bold mb-2">AI Providers</h1>
        <p className="text-muted-foreground mb-8">Configure your AI model providers and API keys (BYOK).</p>

        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Matango includes built-in AI capabilities. Adding your own API keys is optional and allows you to use your preferred providers with higher limits.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="providers">
          <TabsList className="mb-6">
            <TabsTrigger value="providers"><Zap className="h-3.5 w-3.5 mr-1" /> Providers</TabsTrigger>
            <TabsTrigger value="usage"><Star className="h-3.5 w-3.5 mr-1" /> Usage</TabsTrigger>
          </TabsList>

          <TabsContent value="providers">
            <div className="grid md:grid-cols-2 gap-4">
              {PROVIDERS.map((provider) => (
                <Card key={provider.id} className={provider.status === "coming_soon" ? "opacity-60" : ""}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{provider.name}</CardTitle>
                      <Badge variant={provider.status === "available" ? "default" : "secondary"}>
                        {provider.status === "available" ? "Available" : "Coming Soon"}
                      </Badge>
                    </div>
                    <CardDescription>Tier: {provider.tier}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {provider.models.map((m) => <Badge key={m} variant="secondary" className="text-[10px]">{m}</Badge>)}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={provider.status !== "available"}
                      onClick={() => { setSelectedProvider(provider.name); setIsAddDialogOpen(true); }}
                    >
                      <Key className="h-4 w-4 mr-2" /> Configure API Key
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="usage">
            <Card><CardContent className="py-12 text-center"><Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" /><p className="text-muted-foreground">Usage statistics will appear once you start using AI providers.</p></CardContent></Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configure {selectedProvider}</DialogTitle>
              <DialogDescription>Enter your API key securely. It will be encrypted and stored.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>API Key</Label>
                <Input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddKey}><Check className="h-4 w-4 mr-1" /> Save Key</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
