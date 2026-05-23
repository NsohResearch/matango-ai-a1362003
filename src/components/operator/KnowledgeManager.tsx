import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { KNOWLEDGE_CATEGORIES } from "@/lib/operatorToolRegistry";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { FileText, Plus, Trash2 } from "lucide-react";

interface Doc { id: string; category: string; title: string; content: string | null; updated_at: string }

export default function KnowledgeManager({ deploymentId }: { deploymentId: string }) {
  const { user } = useAuth();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [category, setCategory] = useState<string>(KNOWLEDGE_CATEGORIES[0].id);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await (supabase as any)
      .from("operator_knowledge_docs").select("*").eq("deployment_id", deploymentId).order("updated_at", { ascending: false });
    setDocs(data ?? []);
  };
  useEffect(() => { if (deploymentId) load(); /* eslint-disable-next-line */ }, [deploymentId]);

  const add = async () => {
    if (!user || !title.trim()) return;
    setSaving(true);
    const { error } = await (supabase as any).from("operator_knowledge_docs").insert({
      deployment_id: deploymentId, user_id: user.id, category, title: title.trim(), content,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Knowledge added"); setTitle(""); setContent(""); load();
  };
  const remove = async (id: string) => {
    await (supabase as any).from("operator_knowledge_docs").delete().eq("id", id);
    load();
  };

  const completeness = KNOWLEDGE_CATEGORIES.map(c => ({
    ...c, count: docs.filter(d => d.category === c.id).length,
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Knowledge coverage</CardTitle><CardDescription>9 grounding categories — Ka'h answers from this corpus.</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {completeness.map(c => (
              <div key={c.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between"><span className="text-sm font-medium">{c.label}</span><Badge variant={c.count ? "default" : "outline"}>{c.count}</Badge></div>
                <p className="text-xs text-muted-foreground mt-1">{c.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Add knowledge</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {KNOWLEDGE_CATEGORIES.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="Title (e.g. Pricing tiers — Architectural shingle)" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <Textarea rows={6} placeholder="Markdown content Ka'h will ground answers in." value={content} onChange={e => setContent(e.target.value)} />
          <Button onClick={add} disabled={saving || !title.trim()}><Plus className="h-4 w-4 mr-2" /> Add document</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Library ({docs.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {docs.length === 0 && <p className="text-sm text-muted-foreground">No docs yet — start with company identity, services & pricing, and service area.</p>}
          {docs.map(d => (
            <div key={d.id} className="flex items-start justify-between rounded-lg border p-3">
              <div className="flex gap-3"><FileText className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <div className="flex items-center gap-2"><span className="text-sm font-medium">{d.title}</span><Badge variant="outline" className="text-xs">{d.category}</Badge></div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{d.content?.slice(0, 220)}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(d.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
