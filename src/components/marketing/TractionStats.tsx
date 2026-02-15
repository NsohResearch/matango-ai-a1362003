import { traction } from "@/config/metrics";

const TractionStats = () => {
  const hasData = Object.values(traction).some((v) => v !== null);

  if (!hasData) {
    return (
      <section className="py-16 px-6 bg-emerald-950">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="font-display text-2xl font-semibold text-cream-50 mb-4">Traction</h2>
          <p className="text-cream-100/50">Metrics available upon request.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-6 bg-emerald-950">
      <div className="container mx-auto max-w-3xl">
        <h2 className="font-display text-2xl font-semibold text-cream-50 mb-6">Traction</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {traction.users && <Stat label="Users" value={traction.users.toLocaleString()} />}
          {traction.brands && <Stat label="Brands" value={traction.brands.toLocaleString()} />}
          {traction.campaignsLaunched && <Stat label="Campaigns" value={traction.campaignsLaunched.toLocaleString()} />}
          {traction.mrr && <Stat label="MRR" value={`$${traction.mrr.toLocaleString()}`} />}
        </div>
      </div>
    </section>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-emerald-900/50 border border-emerald-800/50 rounded-xl p-4 text-center">
    <div className="font-display text-2xl font-bold text-gold-400">{value}</div>
    <div className="text-xs text-cream-100/50 mt-1">{label}</div>
  </div>
);

export default TractionStats;
