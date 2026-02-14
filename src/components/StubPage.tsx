import DashboardLayout from "@/components/DashboardLayout";

interface StubPageProps {
  title: string;
  description: string;
}

const StubPage = ({ title, description }: StubPageProps) => (
  <DashboardLayout>
    <div className="p-8">
      <h1 className="font-display text-3xl font-bold">{title}</h1>
      <p className="mt-2 text-muted-foreground">{description}</p>
      <div className="mt-8 glass-card rounded-xl p-12 text-center">
        <p className="text-muted-foreground">This module is being migrated. Full functionality coming soon.</p>
      </div>
    </div>
  </DashboardLayout>
);

export default StubPage;
