import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, Upload, FileText, MoreVertical, LayoutDashboard, LogOut } from 'lucide-react';
import { authAPI } from '../services/api';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    // Check localStorage first, default to light mode
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    // Default to light mode instead of system preference
    return 'light';
  });

  const [isAuthenticated, setIsAuthenticated] = useState(authAPI.isAuthenticated());
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    // Check auth status on mount
    setIsAuthenticated(authAPI.isAuthenticated());
  }, []);

  useEffect(() => {
    // Close profile menu when clicking outside
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleLogout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
    setShowProfileMenu(false);
    navigate('/');
  };

  const handleProfileClick = () => {
    setShowProfileMenu(false);
    navigate('/profile');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          MediGuard AI
        </Link>
        
        <div className="navbar-actions">
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className="nav-link">
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
              <Link to="/upload" className="nav-link">
                <Upload size={18} />
                Upload Report
              </Link>
              <Link to="/predict" className="nav-link">
                <FileText size={18} />
                New Prediction
              </Link>
            </>
          )}
          
          <button 
            className="theme-toggle" 
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          
          {isAuthenticated ? (
            <div className="profile-menu" ref={profileMenuRef}>
              <button 
                className="profile-button" 
                onClick={toggleProfileMenu}
                aria-label="Profile menu"
              >
                <MoreVertical size={20} />
              </button>
              <div className={`profile-dropdown ${showProfileMenu ? 'open' : ''}`}>
                <button className="dropdown-item" onClick={handleProfileClick}>
                  <LayoutDashboard size={18} />
                  Profile
                </button>
                <button className="dropdown-item" onClick={handleLogout}>
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="login-button">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
