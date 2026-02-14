import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const About = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-24 pb-16 px-6">
      <div className="container mx-auto max-w-3xl">
        <h1 className="font-display text-4xl font-bold">About Matango.ai</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Matango.ai is the AI-Amplified Operator (AAO) platform that replaces the marketing tool parade with one continuous loop. Built for founders, agencies, and creators who are ready to deploy AI operators—not just tools.
        </p>
        <div className="mt-12 glass-card rounded-xl p-8">
          <h2 className="font-display text-2xl font-semibold mb-4">The One Loop Architecture</h2>
          <p className="text-muted-foreground">
            Remember → Create → Execute → Optimize. Your Brand Brain remembers your ICP, voice, and proof. Campaign Factory creates unified campaigns. The Scheduler publishes everywhere. Analytics closes the loop and feeds insights back into strategy. Always learning, never sleeping.
          </p>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default About;
