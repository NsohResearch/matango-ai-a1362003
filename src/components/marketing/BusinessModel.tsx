const BusinessModel = () => (
  <section className="py-16 px-6 bg-cream-50">
    <div className="container mx-auto max-w-3xl">
      <h2 className="font-display text-2xl font-semibold text-foreground mb-6">Business Model</h2>
      <p className="text-muted-foreground mb-4">Recurring subscription SaaS:</p>
      <p className="text-foreground font-medium mb-6">Free → Basic ($199/mo) → Agency ($399/mo) → Agency++ (Custom)</p>
      <h3 className="font-display text-lg font-semibold text-foreground mb-3">Expansion Levers</h3>
      <ul className="list-disc list-inside text-muted-foreground space-y-1">
        <li>White-label agencies</li>
        <li>API integrations</li>
        <li>Custom AI model training</li>
      </ul>
    </div>
  </section>
);

export default BusinessModel;
