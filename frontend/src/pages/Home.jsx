import Navbar from '../components/Navbar';
import Hero from '../components/hero';
import TheWorkspace from '../components/TheWorkspace/TheWorkspace';
import HowItWorks from '../components/HowItWorks';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';
import './Home.scss';
import Pricing from '../components/Pricing';
import { Support } from '../components/Support';
import SEOHead from '../components/SEOHead/SEOHead';
import { HOME_JSON_LD } from '../utils/seoSchemas';

const Home = () => {
  return (
    <>
      <SEOHead
        title="ChatFrame — AI-Powered Customer Support Platform"
        description="Automate customer support with AI. ChatFrame resolves tickets 10x faster, achieves 98% CSAT, and integrates with 40+ tools. Deploy a smart chat widget and let AI handle repetitive queries while your team focuses on complex issues. Start free."
        canonical="https://chatframe.com/"
        jsonLd={HOME_JSON_LD}
      />
      <Navbar />
      <main id="main-content">
        <Hero />
        <TheWorkspace />
        <HowItWorks />
        <Pricing />
        <Support />
        <FAQ />
      </main>
      <Footer />
    </>
  );
};

export default Home;
