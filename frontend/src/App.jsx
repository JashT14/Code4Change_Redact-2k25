import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Loader from './components/Loader';
import { HeroSection } from './components/ui/hero-section-dark';
import Index from './pages/Index';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import PredictionForm from './pages/PredictionForm';
import OCRUpload from './pages/OCRUpload';
import Profile from './pages/Profile';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Show loader for 800ms
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1700);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/hero" element={
            <HeroSection
              title="Welcome to MediGuard AI"
              subtitle={{
                regular: "Transform healthcare with ",
                gradient: "intelligent AI assistance",
              }}
              description="Advanced medical triage and prediction system powered by machine learning and blockchain technology."
              ctaText="Get Started"
              ctaHref="/signup"
              bottomImage={{
                light: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=800&fit=crop",
                dark: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=800&fit=crop&blend=000000&blend-mode=overlay&blend-alpha=40",
              }}
              gridOptions={{
                angle: 65,
                opacity: 0.4,
                cellSize: 50,
                lightLineColor: "#3b82f6",
                darkLineColor: "#22c55e",
              }}
            />
          } />
          <Route path="/login" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/predict" element={<PredictionForm />} />
          <Route path="/upload" element={<OCRUpload />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
