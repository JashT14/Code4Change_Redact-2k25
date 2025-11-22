import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Index.css';

const Index = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="aurora-wrapper">
      {/* Background Animation Layer */}
      <div className="aurora-bg">
        <div className="aurora-blob blob-1"></div>
        <div className="aurora-blob blob-2"></div>
        <div className="aurora-blob blob-3"></div>
      </div>

      {/* Content Layer */}
      <div className="index-content">
        <h1 className="index-title">
          Welcome to <span className="gradient-text">MediGuard AI</span>
        </h1>
        <p className="index-description">
          Your intelligent healthcare companion powered by advanced AI technology.
        </p>

        <button className="action-button" onClick={handleGetStarted}>
          Get Started
        </button>
      </div>
    </div>
  );
};

export default Index;
