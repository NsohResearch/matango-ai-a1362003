import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2 } from "lucide-react";

const Contact = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [form, setForm] = useState({
    lead_type: searchParams.get("type") || "other",
    name: "",
    email: "",
    company: "",
    message: "",
    honey: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.honey) return;
    if (cooldown) { toast.error("Please wait before submitting again."); return; }
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Name, email, and message are required.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("inbound_leads").insert({
      lead_type: form.lead_type as any,
      name: form.name.trim(),
      email: form.email.trim(),
      company: form.company.trim() || null,
      message: form.message.trim(),
      source_path: window.location.pathname,
      utm_source: searchParams.get("utm_source") || null,
      utm_medium: searchParams.get("utm_medium") || null,
      utm_campaign: searchParams.get("utm_campaign") || null,
      utm_term: searchParams.get("utm_term") || null,
      utm_content: searchParams.get("utm_content") || null,
      user_id: user?.id || null,
    });

    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    setSubmitted(true);
    setCooldown(true);
    setTimeout(() => setCooldown(false), 30000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Thanks — we'll respond shortly.</h1>
            <p className="text-muted-foreground">Your message has been received.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-28 pb-16 px-6">
        <div className="container mx-auto max-w-lg">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Contact Us</h1>
          <p className="text-muted-foreground mb-8">We'd love to hear from you.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label>Inquiry Type</Label>
              <Select value={form.lead_type} onValueChange={(v) => setForm({ ...form, lead_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="investor">Investor</SelectItem>
                  <SelectItem value="agency_plus_plus">Agency++</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Name *</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Email *</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Company</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
            <div><Label>Message *</Label><Textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
            {/* honeypot */}
            <input type="text" className="sr-only" tabIndex={-1} autoComplete="off" value={form.honey} onChange={(e) => setForm({ ...form, honey: e.target.value })} />
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Message"}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
