import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, Upload, FileText, MoreVertical, LayoutDashboard, LogOut } from 'lucide-react';
import { authAPI } from '../services/api';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    return 'light';
  });

  const [isAuthenticated, setIsAuthenticated] = useState(authAPI.isAuthenticated());
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    setIsAuthenticated(authAPI.isAuthenticated());
  }, []);

  useEffect(() => {
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
                <span>Dashboard</span>
              </Link>
              <Link to="/upload" className="nav-link">
                <Upload size={18} />
                <span>Upload Report</span>
              </Link>
              <Link to="/predict" className="nav-link">
                <FileText size={18} />
                <span>New Prediction</span>
              </Link>
            </>
          )}
          
          <button 
            className="theme-toggle" 
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          
          {isAuthenticated ? (
            <div className="profile-menu" ref={profileMenuRef}>
              <button 
                className="profile-button" 
                onClick={toggleProfileMenu}
                aria-label="Profile menu"
              >
                <MoreVertical size={18} />
              </button>
              <div className={`profile-dropdown ${showProfileMenu ? 'open' : ''}`}>
                <button className="dropdown-item" onClick={handleProfileClick}>
                  <LayoutDashboard size={16} />
                  Profile
                </button>
                <button className="dropdown-item" onClick={handleLogout}>
                  <LogOut size={16} />
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