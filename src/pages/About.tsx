import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AboutHero from "@/components/marketing/AboutHero";
import ProblemSection from "@/components/marketing/ProblemSection";
import SolutionSection from "@/components/marketing/SolutionSection";
import HowItWorks from "@/components/marketing/HowItWorks";
import DifferentiationTable from "@/components/marketing/DifferentiationTable";
import VisionStatement from "@/components/marketing/VisionStatement";

const About = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main>
      <AboutHero />
      <ProblemSection />
      <SolutionSection />
      <HowItWorks />
      <DifferentiationTable />
      <VisionStatement />
    </main>
    <Footer />
  </div>
);

export default About;
