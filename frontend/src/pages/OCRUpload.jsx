import React, { useState } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
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
      // Map OCR field names (with spaces) to prediction form field names (with underscores)
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

      // Filter out null/undefined values
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
    <div className="ocr-container">
      <div className="ocr-card">
        <div className="ocr-header">
          <Upload size={32} className="header-icon" />
          <h1>Upload Medical Report</h1>
          <p>Extract medical data from reports using AI-powered OCR</p>
        </div>

        <div className="ocr-body">
          {!file ? (
            <div
              className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload size={48} className="upload-icon" />
              <h3>Drag & drop your medical report</h3>
              <p>or</p>
              <label className="file-input-label">
                <input
                  type="file"
                  onChange={handleFileInput}
                  accept=".pdf,.jpg,.jpeg,.png"
                  hidden
                />
                Browse Files
              </label>
              <p className="file-info">Supported formats: PDF, JPG, PNG (Max 10MB)</p>
            </div>
          ) : (
            <div className="file-preview">
              <div className="file-info-card">
                <FileText size={40} className="file-icon" />
                <div className="file-details">
                  <h3>{file.name}</h3>
                  <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button className="remove-file-btn" onClick={removeFile}>
                  <X size={20} />
                </button>
              </div>

              {!extractedData && (
                <button 
                  className="process-btn" 
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <span className="spinner"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload size={20} />
                      Extract Data
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {error && (
            <div className="error-alert">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {extractedData && (
            <div className="extraction-result">
              <div className="result-header">
                <CheckCircle size={24} className="success-icon" />
                <h3>Data Extracted Successfully</h3>
              </div>

              <div className="extracted-data">
                <h4>Extracted Medical Parameters:</h4>
                <div className="data-grid">
                  {Object.entries(extractedData).map(([key, value]) => (
                    <div key={key} className="data-item">
                      <span className="data-label">{key.replace(/_/g, ' ')}:</span>
                      <span className="data-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="result-actions">
                <button className="secondary-action-btn" onClick={removeFile}>
                  <X size={18} />
                  Upload Another
                </button>
                <button className="primary-action-btn" onClick={handleUsePrediction}>
                  <CheckCircle size={18} />
                  Use for Prediction
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OCRUpload;
