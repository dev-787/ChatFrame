import Navbar from '../components/Navbar';
import Hero from '../components/hero';
import TheWorkspace from '../components/TheWorkspace/TheWorkspace';
import FAQ from '../components/FAQ';
import './Home.scss';

const Home = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <TheWorkspace />
      <FAQ />
    </>
  );
};

export default Home;
