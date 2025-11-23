import React, { useState } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, FileCheck, Sparkles } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './OCRUpload.css';

const OCRUpload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF, JPG, or PNG file');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError('');
    setExtractedData(null);
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5001/api/ocr', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setExtractedData(response.data.extracted);
        setError('');
      } else {
        setError(response.data.error || 'OCR extraction failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleUsePrediction = () => {
    if (extractedData) {
      const mappedData = {
        glucose: extractedData['Glucose'],
        cholesterol: extractedData['Cholesterol'],
        hemoglobin: extractedData['Hemoglobin'],
        platelets: extractedData['Platelets'],
        white_blood_cells: extractedData['White Blood Cells'],
        red_blood_cells: extractedData['Red Blood Cells'],
        hematocrit: extractedData['Hematocrit'],
        mean_corpuscular_volume: extractedData['Mean Corpuscular Volume'],
        mean_corpuscular_hemoglobin: extractedData['Mean Corpuscular Hemoglobin'],
        mean_corpuscular_hemoglobin_concentration: extractedData['Mean Corpuscular Hemoglobin Concentration'],
        insulin: extractedData['Insulin'],
        bmi: extractedData['BMI'],
        systolic_blood_pressure: extractedData['Systolic Blood Pressure'],
        diastolic_blood_pressure: extractedData['Diastolic Blood Pressure'],
        triglycerides: extractedData['Triglycerides'],
        hba1c: extractedData['HbA1c'],
        ldl_cholesterol: extractedData['LDL Cholesterol'],
        hdl_cholesterol: extractedData['HDL Cholesterol'],
        alt: extractedData['ALT'],
        ast: extractedData['AST'],
        heart_rate: extractedData['Heart Rate'],
        creatinine: extractedData['Creatinine'],
        troponin: extractedData['Troponin'],
        c_reactive_protein: extractedData['C-reactive Protein']
      };

      const cleanedData = Object.fromEntries(
        Object.entries(mappedData).filter(([_, value]) => value != null)
      );

      navigate('/predict', { state: { medicalData: cleanedData } });
    }
  };

  const removeFile = () => {
    setFile(null);
    setExtractedData(null);
    setError('');
  };

  return (
    <div className="ocr-page">
      {/* Hero Section */}
      {/* <section className="ocr-hero">
        <div className="hero-content">
          <div className="hero-icon-wrapper">
            <Sparkles className="hero-icon-accent" size={28} />
            <FileCheck className="hero-icon-main" size={48} />
          </div>
          <h1 className="hero-title">Medical Report Analysis</h1>
          <p className="hero-description">
            Upload your medical reports and let our AI-powered OCR technology extract all health parameters instantly
          </p>
          <div className="hero-features">
            <div className="feature-badge">
              <CheckCircle size={16} />
              <span>99% Accuracy</span>
            </div>
            <div className="feature-badge">
              <CheckCircle size={16} />
              <span>Instant Processing</span>
            </div>
            <div className="feature-badge">
              <CheckCircle size={16} />
              <span>Secure & Private</span>
            </div>
          </div>
        </div>
      </section> */}

      {/* Main Content */}
      <section className="ocr-content">
        <div className="content-wrapper">
          {!file ? (
            <div className="upload-section">
              <div
                className={`upload-area ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="upload-icon-container">
                  <Upload className="upload-icon" size={64} />
                  <div className="upload-icon-bg"></div>
                </div>
                <h2 className="upload-title">Drop your medical report here</h2>
                <p className="upload-subtitle">or click to browse from your device</p>
                
                <label className="upload-button">
                  <input
                    type="file"
                    onChange={handleFileInput}
                    accept=".pdf,.jpg,.jpeg,.png"
                    hidden
                  />
                  <Upload size={20} />
                  <span>Choose File</span>
                </label>

                <div className="upload-info">
                  <div className="info-item">
                    <FileText size={16} />
                    <span>PDF, JPG, PNG supported</span>
                  </div>
                  <div className="info-divider">•</div>
                  <div className="info-item">
                    <span>Maximum size 10MB</span>
                  </div>
                </div>
              </div>

              <div className="info-cards">
                <div className="info-card">
                  <div className="info-card-icon">
                    <Upload size={24} />
                  </div>
                  <h3>Upload Report</h3>
                  <p>Drag and drop or select your medical report file</p>
                </div>
                <div className="info-card">
                  <div className="info-card-icon">
                    <Sparkles size={24} />
                  </div>
                  <h3>AI Processing</h3>
                  <p>Our AI extracts all medical parameters automatically</p>
                </div>
                <div className="info-card">
                  <div className="info-card-icon">
                    <CheckCircle size={24} />
                  </div>
                  <h3>Get Results</h3>
                  <p>Review extracted data and use for health predictions</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="file-section">
              <div className="file-card">
                <div className="file-card-header">
                  <div className="file-icon-wrapper">
                    <FileText className="file-icon" size={32} />
                  </div>
                  <div className="file-info">
                    <h3 className="file-name">{file.name}</h3>
                    <div className="file-meta">
                      <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      <span className="file-type">{file.type.split('/')[1].toUpperCase()}</span>
                    </div>
                  </div>
                  <button className="file-remove-btn" onClick={removeFile} title="Remove file">
                    <X size={20} />
                  </button>
                </div>

                {!extractedData && (
                  <button 
                    className="extract-button" 
                    onClick={handleUpload}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <span className="spinner"></span>
                        <span>Analyzing Document...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        <span>Extract Medical Data</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {error && (
                <div className="error-message">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              {extractedData && (
                <div className="results-section">
                  <div className="results-header">
                    <div className="results-icon">
                      <CheckCircle size={32} />
                    </div>
                    <div>
                      <h2 className="results-title">Extraction Complete</h2>
                      <p className="results-subtitle">Successfully extracted {Object.keys(extractedData).length} medical parameters</p>
                    </div>
                  </div>

                  <div className="parameters-grid">
                    {Object.entries(extractedData).map(([key, value]) => (
                      <div key={key} className="parameter-card">
                        <span className="parameter-label">{key}</span>
                        <span className="parameter-value">{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="results-actions">
                    <button className="action-button-ocr action-secondary" onClick={removeFile}>
                      <X size={20} />
                      <span>Upload New Report</span>
                    </button>
                    <button className="action-button-ocr action-primary" onClick={handleUsePrediction}>
                      <CheckCircle size={20} />
                      <span>Continue to Prediction</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default OCRUpload;