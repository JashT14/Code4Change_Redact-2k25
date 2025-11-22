import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import './Auth.css';

const Auth = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Rigorous regex patterns
  const patterns = {
    username: {
      regex: /^[a-zA-Z0-9]([._-](?![._-])|[a-zA-Z0-9]){3,18}[a-zA-Z0-9]$/,
      message: 'Username must be 5-20 characters, start and end with alphanumeric, and can contain ._- (not consecutive)'
    },
    password: {
      regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=\-[\]{}|\\:;"'<>,.~`])[A-Za-z\d@$!%*?&#^()_+=\-[\]{}|\\:;"'<>,.~`]{8,32}$/,
      message: 'Password must be 8-32 characters with uppercase, lowercase, number, and special character'
    }
  };

  // Validation function
  const validateField = (name, value) => {
    if (!value.trim()) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }

    if (patterns[name] && !patterns[name].regex.test(value)) {
      return patterns[name].message;
    }

    // Additional username validations
    if (name === 'username') {
      if (value.length < 5) {
        return 'Username must be at least 5 characters';
      }
      if (value.length > 20) {
        return 'Username must not exceed 20 characters';
      }
      if (/^\d/.test(value)) {
        return 'Username cannot start with a number';
      }
      if (/[._-]{2,}/.test(value)) {
        return 'Username cannot have consecutive special characters';
      }
    }

    // Additional password validations
    if (name === 'password') {
      if (value.length < 8) {
        return 'Password must be at least 8 characters';
      }
      if (value.length > 32) {
        return 'Password must not exceed 32 characters';
      }
      if (!/[a-z]/.test(value)) {
        return 'Password must contain at least one lowercase letter';
      }
      if (!/[A-Z]/.test(value)) {
        return 'Password must contain at least one uppercase letter';
      }
      if (!/\d/.test(value)) {
        return 'Password must contain at least one number';
      }
      if (!/[@$!%*?&#^()_+=\-[\]{}|\\:;"'<>,.~`]/.test(value)) {
        return 'Password must contain at least one special character';
      }
      if (/\s/.test(value)) {
        return 'Password cannot contain spaces';
      }
    }

    return '';
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Real-time validation
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  // Handle blur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ username: true, password: true });

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);

    // If no errors, submit
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);

      // Dynamic import to avoid circular dependency
      const { authAPI } = await import('../services/api');
      const result = await authAPI.login(formData.username, formData.password);

      setIsSubmitting(false);

      if (result.success) {
        setSubmitSuccess(true);
        console.log('Login successful:', result.data);

        // Redirect to dashboard after 1.5 seconds
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        // Show error
        setErrors({
          username: ' ',
          password: result.error || 'Login failed. Please check your credentials.'
        });
      }
    }
  };

  // Check if field is valid
  const isFieldValid = (name) => {
    return touched[name] && !errors[name] && formData[name];
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <Lock size={32} />
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to MediGuard AI</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Username Field */}
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <div className="input-wrapper">
              <div className="input-icon">
                <User size={20} />
              </div>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input ${touched.username ? (errors.username ? 'input-error' : 'input-success') : ''}`}
                placeholder="Enter your username"
                autoComplete="username"
              />
              {isFieldValid('username') && (
                <div className="input-status success">
                  <CheckCircle size={20} />
                </div>
              )}
              {touched.username && errors.username && (
                <div className="input-status error">
                  <AlertCircle size={20} />
                </div>
              )}
            </div>
            {touched.username && errors.username && (
              <p className="error-message">{errors.username}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="input-wrapper">
              <div className="input-icon">
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input ${touched.password ? (errors.password ? 'input-error' : 'input-success') : ''}`}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {isFieldValid('password') && (
                <div className="input-status success">
                  <CheckCircle size={20} />
                </div>
              )}
              {touched.password && errors.password && (
                <div className="input-status error">
                  <AlertCircle size={20} />
                </div>
              )}
            </div>
            {touched.password && errors.password && (
              <p className="error-message">{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`submit-button ${isSubmitting ? 'submitting' : ''} ${submitSuccess ? 'success' : ''}`}
            disabled={isSubmitting || submitSuccess}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Submitting...
              </>
            ) : submitSuccess ? (
              <>
                <CheckCircle size={20} />
                Success!
              </>
            ) : (
              'Submit'
            )}
          </button>
        </form>

        {submitSuccess && (
          <div className="success-message">
            Login successful! Welcome to MediGuard AI.
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
