import Hero from '../components/Hero';
import ProductMockup from '../components/ProductMockup';
import InteractiveFeaturesShowcase from '../components/InteractiveFeaturesShowcase';
import SocialProof from '../components/SocialProof';
import FAQSection from '../components/FAQSection';
import StickyCTA from '../components/StickyCTA';
import PageShell from '../components/PageShell';

export default function Home() {
  return (
    <StickyCTA>
      <PageShell>
        <Hero />
        <ProductMockup />
        <InteractiveFeaturesShowcase />
        <SocialProof />
        <FAQSection />
      </PageShell>
    </StickyCTA>
  );
}
