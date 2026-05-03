import Navbar from '../components/Navbar';
import Hero from '../components/hero';
import TheWorkspace from '../components/TheWorkspace/TheWorkspace';
import HowItWorks from '../components/HowItWorks';
import FAQ from '../components/FAQ';
import './Home.scss';

const Home = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <TheWorkspace />
      <HowItWorks />
      <FAQ />
    </>
  );
};

export default Home;
