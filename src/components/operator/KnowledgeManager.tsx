import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { KNOWLEDGE_CATEGORIES } from "@/lib/operatorToolRegistry";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { FileText, Upload, Plus, Trash2, MessageSquareText, ShieldCheck, Download, Loader2, Sparkles } from "lucide-react";
import { ROOFERS_PACK } from "@/lib/knowledgePacks/roofers";

interface Doc {
  id: string;
  category: string;
  doc_type: "document" | "faq" | "policy";
  title: string;
  content: string | null;
  question: string | null;
  answer: string | null;
  tags: string[] | null;
  status: string;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  storage_path: string | null;
  updated_at: string;
}

const DOC_TYPES = [
  { id: "document", label: "Document", icon: FileText, desc: "PDFs, SOPs, scripts, training materials." },
  { id: "faq", label: "FAQ", icon: MessageSquareText, desc: "Question / answer pairs Ka'h can quote verbatim." },
  { id: "policy", label: "Policy", icon: ShieldCheck, desc: "Guardrails, disclaimers, do-not-say rules." },
] as const;

const BUCKET = "operator-knowledge";

export default function KnowledgeManager({ deploymentId }: { deploymentId: string }) {
  const { user } = useAuth();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [tab, setTab] = useState<"document" | "faq" | "policy">("document");
  const [category, setCategory] = useState<string>(KNOWLEDGE_CATEGORIES[0].id);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await (supabase as any)
      .from("operator_knowledge_docs")
      .select("*")
      .eq("deployment_id", deploymentId)
      .order("updated_at", { ascending: false });
    setDocs(data ?? []);
  };
  useEffect(() => { if (deploymentId) load(); /* eslint-disable-next-line */ }, [deploymentId]);

  const reset = () => {
    setTitle(""); setContent(""); setQuestion(""); setAnswer("");
    setTagsInput(""); setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const add = async () => {
    if (!user) return;
    const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);

    let storage_path: string | null = null;
    let file_url: string | null = null;
    let file_name: string | null = null;
    let file_size: number | null = null;
    let mime_type: string | null = null;

    if (tab === "document") {
      if (!title.trim() && !file) { toast.error("Add a title or a file."); return; }
    } else if (tab === "faq") {
      if (!question.trim() || !answer.trim()) { toast.error("Both question and answer required."); return; }
    } else if (tab === "policy") {
      if (!title.trim() || !content.trim()) { toast.error("Policy needs a name and body."); return; }
    }

    setSaving(true);
    try {
      if (file) {
        const path = `${user.id}/${deploymentId}/${Date.now()}-${file.name.replace(/[^\w.\-]+/g, "_")}`;
        const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });
        if (upErr) throw upErr;
        storage_path = path;
        const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24 * 365);
        file_url = signed?.signedUrl ?? null;
        file_name = file.name;
        file_size = file.size;
        mime_type = file.type || null;
      }

      const row: any = {
        deployment_id: deploymentId,
        user_id: user.id,
        category,
        doc_type: tab,
        title: tab === "faq" ? question.trim().slice(0, 200) : title.trim() || file_name || "Untitled",
        content: tab === "policy" || tab === "document" ? (content || null) : null,
        question: tab === "faq" ? question.trim() : null,
        answer: tab === "faq" ? answer.trim() : null,
        tags,
        status: "active",
        storage_path, file_url, file_name, file_size, mime_type,
      };

      const { error } = await (supabase as any).from("operator_knowledge_docs").insert(row);
      if (error) throw error;
      toast.success(`${tab === "faq" ? "FAQ" : tab === "policy" ? "Policy" : "Document"} added`);
      reset();
      load();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (d: Doc) => {
    if (d.storage_path) await supabase.storage.from(BUCKET).remove([d.storage_path]);
    await (supabase as any).from("operator_knowledge_docs").delete().eq("id", d.id);
    load();
  };

  const [seeding, setSeeding] = useState(false);
  const loadRoofingPack = async () => {
    if (!user) return;
    setSeeding(true);
    try {
      const rows = ROOFERS_PACK.map(d => ({
        deployment_id: deploymentId,
        user_id: user.id,
        category: d.category,
        doc_type: d.doc_type,
        title: d.title,
        content: d.content ?? null,
        question: d.question ?? null,
        answer: d.answer ?? null,
        tags: d.tags ?? [],
        status: "active",
        priority: d.priority ?? 0,
      }));
      const { error } = await (supabase as any).from("operator_knowledge_docs").insert(rows);
      if (error) throw error;
      toast.success(`Loaded ${rows.length} starter docs — edit the templates to match your business.`);
      load();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to load starter pack");
    } finally {
      setSeeding(false);
    }
  };

  const completeness = KNOWLEDGE_CATEGORIES.map(c => ({
    ...c, count: docs.filter(d => d.category === c.id).length,
  }));

  const filtered = docs.filter(d => (d.doc_type ?? "document") === tab);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Knowledge coverage</CardTitle>
          <CardDescription>9 grounding categories — Ka'h answers from this corpus.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {completeness.map(c => (
              <div key={c.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{c.label}</span>
                  <Badge variant={c.count ? "default" : "outline"}>{c.count}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{c.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add to Ka'h's knowledge base</CardTitle>
          <CardDescription>Upload roofing documents, FAQs, and policies. Ka'h grounds every answer in this library.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList className="grid grid-cols-3 w-full sm:w-[420px]">
              {DOC_TYPES.map(t => (
                <TabsTrigger key={t.id} value={t.id} className="gap-2">
                  <t.icon className="h-4 w-4" />{t.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  {KNOWLEDGE_CATEGORIES.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input
                placeholder="Tags (comma separated — e.g. storm, insurance, GAF)"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
              />
            </div>

            <TabsContent value="document" className="space-y-3 mt-4">
              <Input placeholder="Document title (e.g. 2026 Pricing — Architectural shingles)" value={title} onChange={e => setTitle(e.target.value)} />
              <Textarea rows={5} placeholder="Optional summary / extracted text Ka'h can search." value={content} onChange={e => setContent(e.target.value)} />
              <div className="flex items-center gap-3">
                <Input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt,.md,.csv,.xlsx,.png,.jpg,.jpeg" onChange={e => setFile(e.target.files?.[0] ?? null)} />
                {file && <span className="text-xs text-muted-foreground truncate max-w-[200px]">{file.name}</span>}
              </div>
              <p className="text-xs text-muted-foreground">Supported: PDF, DOCX, TXT, MD, CSV, XLSX, images. Stored privately to your account.</p>
            </TabsContent>

            <TabsContent value="faq" className="space-y-3 mt-4">
              <Input placeholder="Question (e.g. Do you handle insurance claims?)" value={question} onChange={e => setQuestion(e.target.value)} />
              <Textarea rows={4} placeholder="Answer Ka'h will use verbatim." value={answer} onChange={e => setAnswer(e.target.value)} />
            </TabsContent>

            <TabsContent value="policy" className="space-y-3 mt-4">
              <Input placeholder="Policy name (e.g. Deductible disclosure, Recording disclosure)" value={title} onChange={e => setTitle(e.target.value)} />
              <Textarea rows={5} placeholder="Policy text — Ka'h will treat as a guardrail." value={content} onChange={e => setContent(e.target.value)} />
            </TabsContent>
          </Tabs>

          <Button onClick={add} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : tab === "document" ? <Upload className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            {tab === "faq" ? "Add FAQ" : tab === "policy" ? "Add policy" : "Add document"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Library ({filtered.length} {tab}{filtered.length === 1 ? "" : "s"})</CardTitle>
          <CardDescription>Switch the tab above to view documents, FAQs, or policies.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nothing here yet — start with company identity, services & pricing, and your top 10 FAQs.
            </p>
          )}
          {filtered.map(d => {
            const Icon = DOC_TYPES.find(t => t.id === (d.doc_type ?? "document"))?.icon ?? FileText;
            return (
              <div key={d.id} className="flex items-start justify-between rounded-lg border p-3 gap-3">
                <div className="flex gap-3 min-w-0">
                  <Icon className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium truncate">{d.title}</span>
                      <Badge variant="outline" className="text-xs">{d.category}</Badge>
                      {(d.tags ?? []).slice(0, 3).map(t => (
                        <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {d.doc_type === "faq" ? `Q: ${d.question} — A: ${d.answer}` : (d.content?.slice(0, 220) ?? d.file_name ?? "")}
                    </p>
                    {d.file_url && (
                      <a href={d.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary mt-1 hover:underline">
                        <Download className="h-3 w-3" /> {d.file_name}
                      </a>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove(d)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
