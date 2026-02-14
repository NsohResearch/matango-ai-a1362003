/**
 * OnboardingProfile — 5-step MIBL onboarding flow.
 * Step 1: Account type (Individual / Company)
 * Step 2: Identity info
 * Step 3: Branding upload
 * Step 4: White-label (Agency only — fields only)
 * Step 5: Confirmation + preview
 */
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useData";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import matangoIcon from "@/assets/matango-icon.png";
import {
  User, Building2, Upload, Palette, CheckCircle2, ArrowRight, ArrowLeft, Loader2,
} from "lucide-react";

type AccountType = "individual" | "company";

interface IndividualFields {
  full_name: string;
  display_name: string;
  phone: string;
  country: string;
  city: string;
  timezone: string;
  role_title: string;
  bio: string;
  website: string;
  linkedin_url: string;
}

interface CompanyFields {
  company_name: string;
  company_email: string;
  company_phone: string;
  address_line1: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  industry: string;
  website: string;
  legal_name: string;
}

interface BrandingFields {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  brand_font: string;
  custom_platform_name: string;
}

const TIMEZONES = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Asia/Tokyo", "Asia/Shanghai",
  "Asia/Kolkata", "Australia/Sydney", "Pacific/Auckland",
];

const INDUSTRIES = [
  "Technology", "Marketing & Advertising", "E-commerce", "Healthcare",
  "Finance", "Education", "Real Estate", "Media & Entertainment",
  "Consulting", "Fashion & Beauty", "Food & Beverage", "Other",
];

const ROLES = [
  "Founder / CEO", "Creator", "Marketer", "CISO", "CMO",
  "Agency Owner", "Freelancer", "Product Manager", "Developer", "Other",
];

const FONTS = [
  "Inter", "Cormorant Garamond", "Playfair Display", "Roboto", "Open Sans",
  "Montserrat", "Lato", "Poppins", "Merriweather", "Source Sans Pro",
];

export default function OnboardingProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const qc = useQueryClient();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>("individual");

  const [individual, setIndividual] = useState<IndividualFields>({
    full_name: "", display_name: "", phone: "", country: "", city: "",
    timezone: "", role_title: "", bio: "", website: "", linkedin_url: "",
  });

  const [company, setCompany] = useState<CompanyFields>({
    company_name: "", company_email: "", company_phone: "", address_line1: "",
    city: "", state: "", country: "", postal_code: "", industry: "",
    website: "", legal_name: "",
  });

  const [branding, setBranding] = useState<BrandingFields>({
    primary_color: "#1B6B4A", secondary_color: "#0A2E1F", accent_color: "#C6A14A",
    brand_font: "Inter", custom_platform_name: "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);

  // Pre-fill from existing profile
  useEffect(() => {
    if (!profile) return;
    setIndividual((prev) => ({
      ...prev,
      full_name: profile.name || "",
      display_name: (profile as any).display_name || "",
      phone: (profile as any).phone || "",
      country: (profile as any).country || "",
      city: (profile as any).city || "",
      timezone: (profile as any).timezone || "",
      role_title: (profile as any).role_title || "",
      bio: (profile as any).bio || "",
      website: (profile as any).website || "",
      linkedin_url: (profile as any).linkedin_url || "",
    }));
    if ((profile as any).account_type) {
      setAccountType((profile as any).account_type as AccountType);
    }
  }, [profile]);

  // Already completed? Redirect
  useEffect(() => {
    if (!isLoading && profile?.onboarding_completed) {
      navigate("/dashboard", { replace: true });
    }
  }, [isLoading, profile, navigate]);

  const totalSteps = accountType === "company" ? 5 : 4;

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `${user!.id}/${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("brand-assets").upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("brand-assets").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Upload files
      let logoUrl: string | undefined;
      let profilePicUrl: string | undefined;

      if (logoFile) {
        logoUrl = await uploadFile(logoFile, "logos");
      }
      if (profilePicFile) {
        profilePicUrl = await uploadFile(profilePicFile, "avatars");
      }

      // Save profile
      const profileUpdate: Record<string, unknown> = {
        account_type: accountType,
        name: individual.full_name,
        display_name: individual.display_name || null,
        phone: individual.phone || null,
        country: individual.country || null,
        city: individual.city || null,
        timezone: individual.timezone || null,
        role_title: individual.role_title || null,
        bio: individual.bio || null,
        website: individual.website || null,
        linkedin_url: individual.linkedin_url || null,
        primary_color: branding.primary_color || null,
        typography_style: branding.brand_font || null,
        onboarding_completed: true,
      };
      if (profilePicUrl) profileUpdate.avatar_url = profilePicUrl;
      if (logoUrl && accountType === "individual") profileUpdate.personal_logo_url = logoUrl;

      const { error: profileErr } = await supabase
        .from("profiles")
        .update(profileUpdate)
        .eq("user_id", user.id);
      if (profileErr) throw profileErr;

      // If company, create/update organization
      if (accountType === "company") {
        const slug = company.company_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50);

        // Check if org exists
        const { data: existingOrg } = await supabase
          .from("organizations")
          .select("id")
          .eq("owner_id", user.id)
          .maybeSingle();

        const orgData: Record<string, unknown> = {
          company_email: company.company_email || null,
          company_phone: company.company_phone || null,
          address_line1: company.address_line1 || null,
          city: company.city || null,
          state: company.state || null,
          country: company.country || null,
          postal_code: company.postal_code || null,
          industry: company.industry || null,
          website: company.website || null,
          legal_name: company.legal_name || null,
          logo_url: logoUrl || null,
        };

        if (existingOrg) {
          await supabase.from("organizations").update(orgData).eq("id", existingOrg.id);
        } else {
          const { data: newOrg, error: orgErr } = await supabase.from("organizations").insert({
            ...orgData,
            name: company.company_name,
            slug,
            owner_id: user.id,
          } as any).select().single();
          if (orgErr) throw orgErr;

          // Create membership
          if (newOrg) {
            await supabase.from("memberships").insert({
              user_id: user.id,
              organization_id: newOrg.id,
              role: "owner",
            });
          }
        }
      }

      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Welcome to Matango! Your identity is set.");
      navigate("/brand-brain", { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (f: File | null) => void,
    setPreview: (p: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File must be under 2MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files allowed");
      return;
    }
    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const canProceed = () => {
    if (step === 1) return true;
    if (step === 2) {
      if (accountType === "individual") return individual.full_name.trim().length > 0;
      return company.company_name.trim().length > 0;
    }
    return true;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-theme="dark">
      {/* Header */}
      <header className="border-b border-sidebar-border bg-sidebar">
        <div className="container mx-auto flex items-center gap-3 py-4 px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={matangoIcon} alt="matango.ai" className="h-8 w-8 rounded-lg" />
            <span className="font-display text-lg font-semibold text-sidebar-foreground">
              matango<span className="text-gold-400">.ai</span>
            </span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto max-w-3xl py-10 px-6">
        {/* Progress */}
        <div className="mb-8">
          <p className="text-sm text-muted-foreground mb-2">Step {step} of {totalSteps}</p>
          <Progress value={(step / totalSteps) * 100} className="h-2" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {step === 1 && "Welcome to Matango.ai"}
          {step === 2 && (accountType === "individual" ? "Your Identity" : "Company Details")}
          {step === 3 && "Branding & Theme"}
          {step === 4 && accountType === "company" && "White-Label Settings"}
          {step === (accountType === "company" ? 5 : 4) && "Confirmation"}
        </h1>
        <p className="text-muted-foreground mb-8">
          {step === 1 && "Let's set up your identity and brand."}
          {step === 2 && "Tell us about yourself."}
          {step === 3 && "Customize your look & feel."}
          {step === 4 && accountType === "company" && "Configure white-label options."}
          {step === (accountType === "company" ? 5 : 4) && "Review and confirm your setup."}
        </p>

        {/* Step 1: Account Type */}
        {step === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card
              className={`p-6 cursor-pointer transition-all border-2 ${
                accountType === "individual" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
              onClick={() => setAccountType("individual")}
            >
              <User className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold text-foreground mb-1">Individual</h3>
              <p className="text-sm text-muted-foreground">
                Personal brand, creator, or solo founder.
              </p>
            </Card>
            <Card
              className={`p-6 cursor-pointer transition-all border-2 ${
                accountType === "company" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
              onClick={() => setAccountType("company")}
            >
              <Building2 className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold text-foreground mb-1">Company / Agency</h3>
              <p className="text-sm text-muted-foreground">
                Business with team, clients, or white-label needs.
              </p>
            </Card>
          </div>
        )}

        {/* Step 2: Identity */}
        {step === 2 && accountType === "individual" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Full Name *</Label>
              <Input value={individual.full_name} onChange={(e) => setIndividual({ ...individual, full_name: e.target.value })} placeholder="Jane Doe" />
            </div>
            <div>
              <Label>Display Name</Label>
              <Input value={individual.display_name} onChange={(e) => setIndividual({ ...individual, display_name: e.target.value })} placeholder="Jane" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={individual.phone} onChange={(e) => setIndividual({ ...individual, phone: e.target.value })} placeholder="+1 555 123 4567" />
            </div>
            <div>
              <Label>Country</Label>
              <Input value={individual.country} onChange={(e) => setIndividual({ ...individual, country: e.target.value })} placeholder="United States" />
            </div>
            <div>
              <Label>City</Label>
              <Input value={individual.city} onChange={(e) => setIndividual({ ...individual, city: e.target.value })} placeholder="San Francisco" />
            </div>
            <div>
              <Label>Timezone</Label>
              <Select value={individual.timezone} onValueChange={(v) => setIndividual({ ...individual, timezone: v })}>
                <SelectTrigger><SelectValue placeholder="Select timezone" /></SelectTrigger>
                <SelectContent>{TIMEZONES.map((tz) => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Role</Label>
              <Select value={individual.role_title} onValueChange={(v) => setIndividual({ ...individual, role_title: v })}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Bio</Label>
              <Textarea value={individual.bio} onChange={(e) => setIndividual({ ...individual, bio: e.target.value })} placeholder="A short bio about yourself..." rows={3} />
            </div>
            <div>
              <Label>Website</Label>
              <Input value={individual.website} onChange={(e) => setIndividual({ ...individual, website: e.target.value })} placeholder="https://yoursite.com" />
            </div>
            <div>
              <Label>LinkedIn URL</Label>
              <Input value={individual.linkedin_url} onChange={(e) => setIndividual({ ...individual, linkedin_url: e.target.value })} placeholder="https://linkedin.com/in/..." />
            </div>
          </div>
        )}

        {step === 2 && accountType === "company" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Company Name *</Label>
              <Input value={company.company_name} onChange={(e) => setCompany({ ...company, company_name: e.target.value })} placeholder="Acme Corp" />
            </div>
            <div>
              <Label>Company Email</Label>
              <Input type="email" value={company.company_email} onChange={(e) => setCompany({ ...company, company_email: e.target.value })} placeholder="hello@acme.com" />
            </div>
            <div>
              <Label>Company Phone</Label>
              <Input value={company.company_phone} onChange={(e) => setCompany({ ...company, company_phone: e.target.value })} placeholder="+1 555 000 0000" />
            </div>
            <div className="md:col-span-2">
              <Label>Address</Label>
              <Input value={company.address_line1} onChange={(e) => setCompany({ ...company, address_line1: e.target.value })} placeholder="123 Main St" />
            </div>
            <div>
              <Label>City</Label>
              <Input value={company.city} onChange={(e) => setCompany({ ...company, city: e.target.value })} placeholder="San Francisco" />
            </div>
            <div>
              <Label>State / Province</Label>
              <Input value={company.state} onChange={(e) => setCompany({ ...company, state: e.target.value })} placeholder="California" />
            </div>
            <div>
              <Label>Country</Label>
              <Input value={company.country} onChange={(e) => setCompany({ ...company, country: e.target.value })} placeholder="United States" />
            </div>
            <div>
              <Label>ZIP / Postal Code</Label>
              <Input value={company.postal_code} onChange={(e) => setCompany({ ...company, postal_code: e.target.value })} placeholder="94105" />
            </div>
            <div>
              <Label>Industry</Label>
              <Select value={company.industry} onValueChange={(v) => setCompany({ ...company, industry: v })}>
                <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                <SelectContent>{INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Website</Label>
              <Input value={company.website} onChange={(e) => setCompany({ ...company, website: e.target.value })} placeholder="https://acme.com" />
            </div>
            <div className="md:col-span-2">
              <Label>Legal Name (for invoices)</Label>
              <Input value={company.legal_name} onChange={(e) => setCompany({ ...company, legal_name: e.target.value })} placeholder="Acme Corp Inc." />
            </div>
          </div>
        )}

        {/* Step 3: Branding */}
        {step === 3 && (
          <div className="space-y-6">
            {/* File uploads */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label>{accountType === "company" ? "Company Logo" : "Profile Picture"}</Label>
                <div className="mt-2 border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  {(accountType === "company" ? logoPreview : profilePicPreview) ? (
                    <img
                      src={(accountType === "company" ? logoPreview : profilePicPreview)!}
                      alt="Preview"
                      className="h-20 w-20 object-cover rounded-lg mx-auto mb-2"
                    />
                  ) : (
                    <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  )}
                  <label className="cursor-pointer text-sm text-primary hover:underline">
                    Upload image (max 2MB)
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        accountType === "company"
                          ? handleFileChange(e, setLogoFile, setLogoPreview)
                          : handleFileChange(e, setProfilePicFile, setProfilePicPreview)
                      }
                    />
                  </label>
                </div>
              </div>

              {accountType === "individual" && (
                <div>
                  <Label>Personal Logo (optional)</Label>
                  <div className="mt-2 border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="h-20 w-20 object-cover rounded-lg mx-auto mb-2" />
                    ) : (
                      <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    )}
                    <label className="cursor-pointer text-sm text-primary hover:underline">
                      Upload logo
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, setLogoFile, setLogoPreview)} />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Primary Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={branding.primary_color}
                    onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
                    className="h-10 w-10 rounded cursor-pointer border-0"
                  />
                  <Input value={branding.primary_color} onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })} className="flex-1" />
                </div>
              </div>
              <div>
                <Label>Secondary Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={branding.secondary_color}
                    onChange={(e) => setBranding({ ...branding, secondary_color: e.target.value })}
                    className="h-10 w-10 rounded cursor-pointer border-0"
                  />
                  <Input value={branding.secondary_color} onChange={(e) => setBranding({ ...branding, secondary_color: e.target.value })} className="flex-1" />
                </div>
              </div>
              <div>
                <Label>Accent Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={branding.accent_color}
                    onChange={(e) => setBranding({ ...branding, accent_color: e.target.value })}
                    className="h-10 w-10 rounded cursor-pointer border-0"
                  />
                  <Input value={branding.accent_color} onChange={(e) => setBranding({ ...branding, accent_color: e.target.value })} className="flex-1" />
                </div>
              </div>
            </div>

            {/* Font */}
            <div>
              <Label>Brand Font</Label>
              <Select value={branding.brand_font} onValueChange={(v) => setBranding({ ...branding, brand_font: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{FONTS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {/* Live Preview */}
            <div>
              <Label className="mb-2 block">Live Preview</Label>
              <Card className="p-4 overflow-hidden" style={{ borderColor: branding.primary_color }}>
                <div className="flex items-center gap-3 mb-4 pb-3 border-b" style={{ borderColor: branding.accent_color }}>
                  {logoPreview ? (
                    <img src={logoPreview} alt="" className="h-8 w-8 rounded" />
                  ) : (
                    <div className="h-8 w-8 rounded" style={{ backgroundColor: branding.primary_color }} />
                  )}
                  <span className="font-semibold text-foreground" style={{ fontFamily: branding.brand_font }}>
                    {accountType === "company" ? company.company_name || "Your Brand" : individual.full_name || "Your Name"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded text-sm text-white" style={{ backgroundColor: branding.primary_color, fontFamily: branding.brand_font }}>
                    Primary Button
                  </button>
                  <button className="px-4 py-2 rounded text-sm border" style={{ borderColor: branding.accent_color, color: branding.accent_color, fontFamily: branding.brand_font }}>
                    Accent Button
                  </button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Step 4: White-label (Company only) */}
        {step === 4 && accountType === "company" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground border border-border rounded-lg p-4 bg-muted/30">
              White-label features require the Agency plan. You can configure these fields now and activate them later.
            </p>
            <div>
              <Label>Custom Platform Name</Label>
              <Input
                value={branding.custom_platform_name}
                onChange={(e) => setBranding({ ...branding, custom_platform_name: e.target.value })}
                placeholder="e.g. ClientGrowth Pro"
              />
            </div>
            <div>
              <Label>Custom Domain (CNAME)</Label>
              <Input placeholder="app.yourdomain.com" disabled />
              <p className="text-xs text-muted-foreground mt-1">Available on Agency plan. DNS verification required.</p>
            </div>
            <div>
              <Label>Custom Support Email</Label>
              <Input placeholder="support@yourdomain.com" disabled />
              <p className="text-xs text-muted-foreground mt-1">Available on Agency plan.</p>
            </div>
          </div>
        )}

        {/* Step 5 (or 4 for individual): Confirmation */}
        {step === totalSteps && (
          <div className="space-y-6">
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="h-6 w-6 text-primary" />
                <h3 className="font-semibold text-foreground text-lg">Review Your Setup</h3>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <div className="text-muted-foreground">Account Type</div>
                <div className="text-foreground font-medium capitalize">{accountType}</div>

                <div className="text-muted-foreground">Name</div>
                <div className="text-foreground font-medium">
                  {accountType === "company" ? company.company_name : individual.full_name}
                </div>

                {accountType === "individual" && individual.role_title && (
                  <>
                    <div className="text-muted-foreground">Role</div>
                    <div className="text-foreground font-medium">{individual.role_title}</div>
                  </>
                )}

                {accountType === "company" && company.industry && (
                  <>
                    <div className="text-muted-foreground">Industry</div>
                    <div className="text-foreground font-medium">{company.industry}</div>
                  </>
                )}

                <div className="text-muted-foreground">Brand Font</div>
                <div className="text-foreground font-medium">{branding.brand_font}</div>

                <div className="text-muted-foreground">Primary Color</div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded" style={{ backgroundColor: branding.primary_color }} />
                  <span className="text-foreground font-medium">{branding.primary_color}</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10">
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>

          {step < totalSteps ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="gap-2">
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleFinish} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Enter The System
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
