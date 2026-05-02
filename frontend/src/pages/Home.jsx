import Navbar from '../components/Navbar';
import Hero from '../components/hero';
import TheWorkspace from '../components/TheWorkspace/TheWorkspace';
import './Home.scss';

const Home = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <TheWorkspace />
    </>
  );
};

export default Home;
