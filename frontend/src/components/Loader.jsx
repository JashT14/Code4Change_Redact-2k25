import React from 'react';
import { Heart } from 'lucide-react';
import './Loader.css';

const Loader = () => {
  return (
    <div className="loader-container">
      <div className="loader-content">
        <div className="loader-icon">
          <Heart className="heart-icon" size={48} />
          <div className="pulse-ring"></div>
          <div className="pulse-ring pulse-ring-delay"></div>
        </div>
        <h1 className="loader-title">Welcome to MediGuard AI</h1>
      </div>
    </div>
  );
};

export default Loader;
