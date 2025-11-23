import React from 'react';
import { Activity } from 'lucide-react';

const Loader = () => {
  return (
    <div className="loader-container">
      <div className="loader-content">
        <div className="loader-icon">
          {/* Medical Cross */}
          <div className="medical-cross">
            <div className="cross-horizontal"></div>
            <div className="cross-vertical"></div>
          </div>
          
          {/* Pulse Lines */}
          <svg className="heartbeat-line" viewBox="0 0 200 60" width="200" height="60">
            <polyline
              points="0,30 40,30 45,20 50,40 55,15 60,35 65,30 200,30"
              className="heartbeat-path"
            />
          </svg>
          
          {/* Rotating Circle */}
          <div className="rotating-circle"></div>
        </div>
        
        <h1 className="loader-title">MediGuard AI</h1>
        <p className="loader-subtitle">Initializing Healthcare Intelligence...</p>
        
        {/* Progress Dots */}
        <div className="progress-dots">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
    </div>
  );
};

export default Loader;

const styles = `
/* Loader Container */
.loader-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, 
    rgba(59, 130, 246, 0.03), 
    rgba(16, 185, 129, 0.03)
  );
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.4s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Loader Content */
.loader-content {
  text-align: center;
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Loader Icon Container */
.loader-icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 180px;
  height: 180px;
  margin-bottom: 2rem;
}

/* Medical Cross */
.medical-cross {
  position: relative;
  width: 60px;
  height: 60px;
  z-index: 3;
  animation: crossPulse 4.2s ease-in-out infinite;
}

.cross-horizontal,
.cross-vertical {
  position: absolute;
  background: linear-gradient(135deg, #3b82f6, #10b981);
  border-radius: 4px;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
}

.cross-horizontal {
  width: 60px;
  height: 16px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.cross-vertical {
  width: 16px;
  height: 60px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

@keyframes crossPulse {
  0%, 100% {
    transform: scale(1);
    filter: brightness(1);
  }
  50% {
    transform: scale(1.05);
    filter: brightness(1.2);
  }
}

/* Heartbeat Line */
.heartbeat-line {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.6;
  z-index: 1;
}

.heartbeat-path {
  fill: none;
  stroke: #3b82f6;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 200;
  stroke-dashoffset: 200;
  animation: drawHeartbeat 2.5s ease-in-out infinite;
}

@keyframes drawHeartbeat {
  0% {
    stroke-dashoffset: 200;
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  50% {
    stroke-dashoffset: 0;
    opacity: 1;
  }
  100% {
    stroke-dashoffset: -200;
    opacity: 0;
  }
}

/* Rotating Circle */
.rotating-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  border: 3px solid transparent;
  border-top-color: #10b981;
  border-right-color: #3b82f6;
  border-radius: 50%;
  z-index: 2;
  animation: rotate 5.2s linear infinite;
}

@keyframes rotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

/* Loader Title */
.loader-title {
  font-size: 2.25rem;
  font-weight: 700;
  background: linear-gradient(135deg, #3b82f6, #10b981);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 0.5rem;
  animation: fadeInText 0.8s ease-out 0.3s both;
  letter-spacing: -0.5px;
}

.loader-subtitle {
  font-size: 1rem;
  color: #64748b;
  font-weight: 500;
  animation: fadeInText 0.8s ease-out 0.5s both;
  margin-bottom: 1.5rem;
}

@keyframes fadeInText {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Progress Dots */
.progress-dots {
  display: flex;
  gap: 8px;
  justify-content: center;
  animation: fadeInText 0.8s ease-out 0.7s both;
}

.dot {
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, #3b82f6, #10b981);
  border-radius: 50%;
  animation: dotPulse 3.4s ease-in-out infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dotPulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .loader-icon {
    width: 140px;
    height: 140px;
  }
  
  .medical-cross {
    width: 48px;
    height: 48px;
  }
  
  .cross-horizontal {
    width: 48px;
    height: 14px;
  }
  
  .cross-vertical {
    width: 14px;
    height: 48px;
  }
  
  .rotating-circle {
    width: 100px;
    height: 100px;
  }
  
  .heartbeat-line {
    width: 160px;
    height: 48px;
  }
  
  .loader-title {
    font-size: 1.75rem;
    padding: 0 1rem;
  }
  
  .loader-subtitle {
    font-size: 0.875rem;
    padding: 0 1rem;
  }
}
`;

// Inject styles
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);