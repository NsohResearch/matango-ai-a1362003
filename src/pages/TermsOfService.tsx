import Navbar from "@/components/Navbar";

const TermsOfService = () => (
  <>
    <Navbar />
    <div className="min-h-screen bg-background pt-24 px-6">
      <div className="container mx-auto max-w-3xl py-12">
        <h1 className="font-display text-4xl font-bold mb-6">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: February 14, 2026</p>

        <div className="prose prose-invert max-w-none space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using matango.ai ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">2. Description of Service</h2>
            <p>matango.ai is an AI-powered marketing automation platform that provides brand management, content generation, AI influencer creation, video production, campaign management, and multi-channel publishing tools.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">3. Account Responsibility</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must be at least 18 years old to use the Platform.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">4. Subscription & Billing</h2>
            <p>Paid plans are billed monthly or annually. You may cancel at any time; access continues until the end of your billing period. Refunds are provided only as required by applicable law.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">5. Content Ownership</h2>
            <p>You retain ownership of content you create using the Platform, including Brand Brain data, generated images, videos, and campaign assets. matango.ai does not claim ownership of your content.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">6. Acceptable Use</h2>
            <p>You may not use the Platform to generate harmful, illegal, or misleading content. AI-generated influencers must not depict minors. You must comply with all applicable laws regarding advertising, data protection, and intellectual property.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">7. Service Availability</h2>
            <p>We strive for high availability but do not guarantee uninterrupted service. Third-party AI provider outages may temporarily affect generation features.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">8. Limitation of Liability</h2>
            <p>matango.ai is provided "as is." We are not liable for indirect, incidental, or consequential damages arising from your use of the Platform.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">9. Account Deletion</h2>
            <p>You may request account deletion at any time. Data is soft-deleted for 90 days (recoverable), then enters a 12-month retention period before permanent removal.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">10. Contact</h2>
            <p>For questions about these terms, contact us at <a href="mailto:legal@matango.ai" className="text-primary hover:underline">legal@matango.ai</a>.</p>
          </section>
        </div>
      </div>
    </div>
  </>
);

export default TermsOfService;
