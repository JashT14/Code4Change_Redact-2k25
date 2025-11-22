import React, { useState, useEffect, useRef } from 'react';

export default function MedicalLogin() {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [followerPos, setFollowerPos] = useState({ x: 0, y: 0 });
  const [buttonText, setButtonText] = useState('Sign In');
  const [buttonBg, setButtonBg] = useState('rgba(255, 255, 255, 0.35)');
  const cursorRef = useRef({ x: 0, y: 0 });
  const followerRef = useRef({ x: 0, y: 0 });
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      
      if (Math.random() > 0.7) {
        createParticle(e.clientX, e.clientY);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      cursorRef.current.x += (mouseRef.current.x - cursorRef.current.x) * 0.3;
      cursorRef.current.y += (mouseRef.current.y - cursorRef.current.y) * 0.3;
      followerRef.current.x += (mouseRef.current.x - followerRef.current.x) * 0.1;
      followerRef.current.y += (mouseRef.current.y - followerRef.current.y) * 0.1;

      setCursorPos({ x: cursorRef.current.x, y: cursorRef.current.y });
      setFollowerPos({ x: followerRef.current.x, y: followerRef.current.y });

      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const createParticle = (x, y) => {
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.width = '4px';
    particle.style.height = '4px';
    particle.style.background = 'white';
    particle.style.borderRadius = '50%';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '9997';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 50;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    
    particle.animate([
      { opacity: 1, transform: 'translate(0, 0) scale(1)' },
      { opacity: 0, transform: `translate(${tx}px, ${ty}px) scale(0)` }
    ], {
      duration: 600,
      easing: 'ease-out'
    });
    
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 600);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setButtonText('Signing In...');
    setButtonBg('rgba(255, 255, 255, 0.5)');
    
    setTimeout(() => {
      setButtonText('Success! ✓');
      setButtonBg('rgba(125, 211, 192, 0.6)');
    }, 1500);
  };

  return (
    <div style={{ cursor: 'none' }}>
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          overflow: hidden;
        }
      `}</style>

      {/* Background */}
      <div style={{
        position: 'fixed',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #0077be 0%, #00a8cc 50%, #7dd3c0 100%)'
      }} />

      {/* Floating Elements */}
      <div style={{
        position: 'fixed',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none'
      }}>
        {[
          { left: '10%', top: '20%' },
          { left: '80%', top: '30%' },
          { left: '15%', top: '70%' },
          { left: '85%', top: '75%' },
          { left: '50%', top: '10%' },
          { left: '30%', top: '85%' }
        ].map((pos, i) => (
          <div key={i} style={{
            position: 'absolute',
            color: 'rgba(255, 255, 255, 0.08)',
            fontSize: '60px',
            left: pos.left,
            top: pos.top
          }}>✚</div>
        ))}
      </div>

      {/* Container */}
      <div style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        zIndex: 1
      }}>
        {/* Login Box */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: '2px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 8px 32px 0 rgba(0, 119, 190, 0.2)',
          padding: '50px 40px',
          width: '420px',
          animation: 'slideIn 0.8s ease-out'
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(10px)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 15px',
              fontSize: '40px',
              color: '#0077be',
              boxShadow: '0 4px 20px rgba(255, 255, 255, 0.3)',
              border: '2px solid rgba(255, 255, 255, 0.5)'
            }}>✚</div>
            <h2 style={{
              color: 'white',
              fontSize: '28px',
              fontWeight: 600,
              letterSpacing: '0.5px',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              marginBottom: '5px'
            }}>MediCare Portal</h2>
            <p style={{
              color: 'rgba(255, 255, 255, 0.95)',
              fontSize: '14px'
            }}>Secure Healthcare Access</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{
                display: 'block',
                color: 'white',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 500
              }}>Email Address</label>
              <input
                type="email"
                placeholder="doctor@medicare.com"
                required
                style={{
                  width: '100%',
                  padding: '15px 20px',
                  background: 'rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.35)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                  e.target.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.2)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.transform = 'translateY(0)';
                }}
              />
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{
                display: 'block',
                color: 'white',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 500
              }}>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                required
                style={{
                  width: '100%',
                  padding: '15px 20px',
                  background: 'rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.35)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                  e.target.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.2)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.transform = 'translateY(0)';
                }}
              />
            </div>

            {/* Forgot Password */}
            <div style={{ textAlign: 'right', marginBottom: '25px' }}>
              <a href="#" style={{
                color: 'rgba(255, 255, 255, 0.95)',
                textDecoration: 'none',
                fontSize: '13px',
                transition: 'all 0.3s ease'
              }}>Forgot Password?</a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '16px',
                background: buttonBg,
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.5)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'none',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.45)';
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = buttonBg;
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
              }}
            >{buttonText}</button>

            {/* Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              margin: '25px 0',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '13px'
            }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.4)' }} />
              <span style={{ padding: '0 15px' }}>New to MediCare?</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.4)' }} />
            </div>

            {/* Signup Link */}
            <div style={{
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.95)',
              fontSize: '14px'
            }}>
              <a href="#" style={{
                color: 'white',
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'all 0.3s ease'
              }}>Create an Account</a>
            </div>
          </form>
        </div>
      </div>

      {/* Custom Cursor */}
      <div style={{
        position: 'fixed',
        width: '20px',
        height: '20px',
        border: '2px solid white',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 9999,
        left: cursorPos.x + 'px',
        top: cursorPos.y + 'px',
        transform: 'translate(-50%, -50%)',
        mixBlendMode: 'difference'
      }} />

      {/* Cursor Follower */}
      <div style={{
        position: 'fixed',
        width: '40px',
        height: '40px',
        border: '2px solid rgba(255, 255, 255, 0.5)',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 9998,
        left: followerPos.x + 'px',
        top: followerPos.y + 'px',
        transform: 'translate(-50%, -50%)',
        mixBlendMode: 'difference'
      }} />
    </div>
  );
}