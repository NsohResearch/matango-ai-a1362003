import Navbar from "@/components/Navbar";

const PrivacyPolicy = () => (
  <>
    <Navbar />
    <div className="min-h-screen bg-background pt-24 px-6">
      <div className="container mx-auto max-w-3xl py-12">
        <h1 className="font-display text-4xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: February 14, 2026</p>

        <div className="prose prose-invert max-w-none space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly, including your name, email address, and payment information when you create an account or subscribe to our services. We also collect usage data such as features used, content generated, and interaction patterns to improve our platform.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
            <p>Your information is used to provide and improve matango.ai services, process payments, send important notifications, and personalize your experience. We use AI to generate content on your behalf, and your Brand Brain data is used solely to customize outputs for your brand.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">3. Data Storage & Security</h2>
            <p>Your data is stored securely using industry-standard encryption. We use Supabase for database management with row-level security policies. Generated content and assets are stored in encrypted cloud storage.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">4. Data Sharing</h2>
            <p>We do not sell your personal data. We share data only with service providers necessary to operate the platform (payment processing, cloud hosting, AI generation APIs) and when required by law.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">5. Your Rights</h2>
            <p>You have the right to access, export, correct, or delete your personal data. You can request data export or account deletion through your Account Settings. We comply with GDPR and applicable data protection regulations.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">6. Cookies</h2>
            <p>We use essential cookies for authentication and session management. No third-party tracking cookies are used without your consent.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">7. Contact</h2>
            <p>For privacy inquiries, contact us at <a href="mailto:privacy@matango.ai" className="text-primary hover:underline">privacy@matango.ai</a>.</p>
          </section>
        </div>
      </div>
    </div>
  </>
);

export default PrivacyPolicy;
