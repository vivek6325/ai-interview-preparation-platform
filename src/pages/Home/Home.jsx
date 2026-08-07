import { useNavigate } from 'react-router-dom';
import HeroSection from '../../components/landing/HeroSection';
import StatsSection from '../../components/landing/StatsSection';
import FeaturesSection from '../../components/landing/FeaturesSection';
import HowItWorksSection from '../../components/landing/HowItWorksSection';
import DashboardPreviewSection from '../../components/landing/DashboardPreviewSection';
import InterviewPreviewSection from '../../components/landing/InterviewPreviewSection';
import TestimonialsSection from '../../components/landing/TestimonialsSection';
import PricingSection from '../../components/landing/PricingSection';
import FaqSection from '../../components/landing/FaqSection';
import FooterSection from '../../components/landing/FooterSection';

/**
 * Home Component (Landing Page Redesign)
 * Orchestrates 10 modular Vercel/Linear inspired landing page sections:
 * 1. HeroSection
 * 2. StatsSection
 * 3. FeaturesSection
 * 4. HowItWorksSection
 * 5. DashboardPreviewSection
 * 6. InterviewPreviewSection
 * 7. TestimonialsSection
 * 8. PricingSection
 * 9. FaqSection
 * 10. FooterSection
 */
function Home() {
  const navigate = useNavigate();

  const handleStartPractice = () => {
    navigate('/dashboard');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="home-container">
      {/* 1. Hero */}
      <HeroSection onStartPractice={handleStartPractice} onLogin={handleLogin} />

      {/* 2. Trusted Statistics */}
      <StatsSection />

      {/* 3. Features */}
      <FeaturesSection />

      {/* 4. How It Works */}
      <HowItWorksSection />

      {/* 5. Dashboard Preview */}
      <DashboardPreviewSection />

      {/* 6. AI Interview Preview */}
      <InterviewPreviewSection />

      {/* 7. Testimonials */}
      <TestimonialsSection />

      {/* 8. Pricing (Coming Soon) */}
      <PricingSection onStartPractice={handleStartPractice} />

      {/* 9. FAQ */}
      <FaqSection />

      {/* 10. Footer */}
      <FooterSection />
    </div>
  );
}

export default Home;
