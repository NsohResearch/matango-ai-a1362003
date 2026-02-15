import { useState, useEffect } from "react";
import { Star, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Review {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  rating: number;
  review_text: string;
}

const StarRating = ({ value, onChange }: { value: number; onChange?: (v: number) => void }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={`h-5 w-5 ${s <= value ? "fill-gold-400 text-gold-400" : "text-border"} ${onChange ? "cursor-pointer" : ""}`}
        onClick={() => onChange?.(s)}
      />
    ))}
  </div>
);

const Testimonials = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", company: "", rating: 5, review_text: "", honey: "" });

  useEffect(() => {
    supabase
      .from("customer_reviews")
      .select("id, name, role, company, rating, review_text")
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .limit(12)
      .then(({ data }) => { if (data) setReviews(data); });
  }, []);

  const handleSubmit = async () => {
    if (form.honey) return; // honeypot
    if (!user) { toast.error("Please log in to submit a review."); return; }
    if (!form.name.trim() || !form.review_text.trim()) { toast.error("Name and review are required."); return; }

    setSubmitting(true);
    const { error } = await supabase.from("customer_reviews").insert({
      user_id: user.id,
      name: form.name.trim(),
      role: form.role.trim() || null,
      company: form.company.trim() || null,
      rating: form.rating,
      review_text: form.review_text.trim(),
      approved: false,
    });

    setSubmitting(false);
    if (error) {
      if (error.message.includes("can_submit_review")) toast.error("You can only submit one review per 24 hours.");
      else toast.error(error.message);
      return;
    }
    toast.success("Thanks — your review is pending approval.");
    setOpen(false);
    setForm({ name: "", role: "", company: "", rating: 5, review_text: "", honey: "" });
  };

  // Seed reviews for display when DB is empty
  const displayReviews = reviews.length > 0 ? reviews : [
    { id: "1", name: "Founder", role: "SaaS Startup", company: null, rating: 5, review_text: "Matango replaced our agency and cut campaign launch time by 60%." },
    { id: "2", name: "Agency Owner", role: null, company: null, rating: 5, review_text: "We run five brands with one team using AAO orchestration." },
    { id: "3", name: "Creator Entrepreneur", role: null, company: null, rating: 5, review_text: "The Brand Brain alone transformed our messaging consistency." },
  ];

  return (
    <section className="py-20 px-6 bg-cream-50">
      <div className="container mx-auto max-w-5xl">
        <h2 className="font-display text-3xl md:text-4xl font-semibold text-center text-foreground mb-4">
          What Operators Are Saying
        </h2>
        <p className="text-center text-muted-foreground mb-12">Real feedback from the Matango community.</p>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {displayReviews.slice(0, 6).map((r) => (
            <div key={r.id} className="bg-card border border-border rounded-xl p-6">
              <StarRating value={r.rating} />
              <p className="mt-4 text-sm text-foreground italic">"{r.review_text}"</p>
              <p className="mt-4 text-xs text-muted-foreground font-medium">
                — {r.name}{r.role ? `, ${r.role}` : ""}{r.company ? `, ${r.company}` : ""}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" onClick={() => setOpen(true)}>Leave a Review</Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
            <DialogDescription>Share your experience with Matango.ai</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Role</Label><Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="e.g. Founder" /></div>
            <div><Label>Company</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
            <div><Label>Rating</Label><StarRating value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} /></div>
            <div><Label>Review *</Label><Textarea value={form.review_text} onChange={(e) => setForm({ ...form, review_text: e.target.value })} rows={3} /></div>
            {/* honeypot */}
            <input type="text" className="sr-only" tabIndex={-1} autoComplete="off" value={form.honey} onChange={(e) => setForm({ ...form, honey: e.target.value })} />
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Testimonials;
