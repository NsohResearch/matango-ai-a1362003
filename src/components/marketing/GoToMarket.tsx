const GoToMarket = () => (
  <section className="py-16 px-6 bg-emerald-950">
    <div className="container mx-auto max-w-3xl">
      <h2 className="font-display text-2xl font-semibold text-cream-50 mb-6">Go-To-Market</h2>
      <div className="flex flex-wrap gap-3">
        {["Founders & creators", "Solopreneurs", "Agencies", "Enterprise marketing teams"].map((s) => (
          <span key={s} className="bg-emerald-900/50 border border-emerald-800/50 rounded-full px-4 py-2 text-sm text-cream-100/70">{s}</span>
        ))}
      </div>
    </div>
  </section>
);

export default GoToMarket;
