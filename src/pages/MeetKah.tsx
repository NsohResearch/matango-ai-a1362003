import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import matangoLogo from "@/assets/matango-logo.png";

const MeetKah = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-24 pb-16 px-6">
      <div className="container mx-auto max-w-3xl text-center">
        <img src={matangoLogo} alt="K'ah" className="mx-auto h-48 w-48 rounded-3xl mb-8" />
        <h1 className="font-display text-4xl font-bold">Meet K'ah</h1>
        <p className="mt-2 text-primary text-lg">Your first AI-Amplified Operator (AAO)</p>
        <blockquote className="mt-8 text-lg italic text-muted-foreground">
          "Your brand already has roots. Let's help them spread."
        </blockquote>
        <div className="mt-12 glass-card rounded-xl p-8 text-left">
          <h2 className="font-display text-2xl font-semibold mb-4">What K'ah Does</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li>• Remembers your brand story, ICP, and proof points</li>
            <li>• Generates campaigns, ads, and content autonomously</li>
            <li>• Publishes across channels on your schedule</li>
            <li>• Learns from performance data to optimize strategy</li>
            <li>• Works 24/7, never burns out</li>
          </ul>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default MeetKah;
