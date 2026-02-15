import Navbar from "@/components/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeatureCarousel from "@/components/marketing/FeatureCarousel";
import PainPointsSection from "@/components/landing/PainPointsSection";
import OneLoopSection from "@/components/landing/OneLoopSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import AudienceSection from "@/components/landing/AudienceSection";
import Testimonials from "@/components/marketing/Testimonials";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <FeatureCarousel />
        <PainPointsSection />
        <OneLoopSection />
        <FeaturesSection />
        <AudienceSection />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
