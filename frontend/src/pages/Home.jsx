import Navbar from '../components/Navbar';
import Hero from '../components/hero';
import HowItWorks from '../components/HowItWorks/HowItWorks';
import './Home.scss';

const Home = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <HowItWorks />
    </>
  );
};

export default Home;
