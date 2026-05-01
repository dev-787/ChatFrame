import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.scss';

import Home from './pages/Home';
import Signup from './pages/Signup';
import Onboarding from './components/Onboarding/Onboarding';
import Login from './components/login/login';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/onboarding" element={<Onboarding />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
