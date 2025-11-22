import React, { useState, useEffect } from 'react';
import { Activity, FileText, Upload, Send } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { predictionAPI } from '../services/api';
import './PredictionForm.css';

const PredictionForm = () => {
  const location = useLocation();
  const [patientId, setPatientId] = useState('');
  const [medicalData, setMedicalData] = useState({
    // Blood Glucose & Metabolic
    glucose: '',
    hba1c: '',
    insulin: '',
    bmi: '',
    
    // Lipid Profile
    cholesterol: '',
    triglycerides: '',
    ldl_cholesterol: '',
    hdl_cholesterol: '',
    
    // Complete Blood Count (CBC)
    hemoglobin: '',
    platelets: '',
    white_blood_cells: '',
    red_blood_cells: '',
    hematocrit: '',
    mean_corpuscular_volume: '',
    mean_corpuscular_hemoglobin: '',
    mean_corpuscular_hemoglobin_concentration: '',
    
    // Cardiovascular
    systolic_blood_pressure: '',
    diastolic_blood_pressure: '',
    heart_rate: '',
    troponin: '',
    
    // Liver Function
    alt: '',
    ast: '',
    
    // Kidney Function
    creatinine: '',
    
    // Inflammation
    c_reactive_protein: ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Physiological ranges for all parameters
  const physiologicalRanges = {
    glucose: { min: 50, max: 400, unit: 'mg/dL', normalRange: '70-100 mg/dL (fasting)' },
    hba1c: { min: 3, max: 20, unit: '%', normalRange: '4-5.6%' },
    insulin: { min: 0, max: 300, unit: 'µU/mL', normalRange: '2.6-24.9 µU/mL' },
    bmi: { min: 10, max: 60, unit: '', normalRange: '18.5-24.9' },
    cholesterol: { min: 100, max: 400, unit: 'mg/dL', normalRange: '<200 mg/dL' },
    triglycerides: { min: 20, max: 1000, unit: 'mg/dL', normalRange: '<150 mg/dL' },
    ldl_cholesterol: { min: 20, max: 400, unit: 'mg/dL', normalRange: '<100 mg/dL' },
    hdl_cholesterol: { min: 20, max: 150, unit: 'mg/dL', normalRange: '>40 mg/dL (M), >50 mg/dL (F)' },
    hemoglobin: { min: 5, max: 25, unit: 'g/dL', normalRange: '13.5-17.5 g/dL (M), 12-15.5 g/dL (F)' },
    platelets: { min: 20, max: 1000, unit: 'K/µL', normalRange: '150-400 K/µL' },
    white_blood_cells: { min: 1, max: 50, unit: 'K/µL', normalRange: '4-11 K/µL' },
    red_blood_cells: { min: 2, max: 8, unit: 'M/µL', normalRange: '4.5-5.9 M/µL (M), 4.1-5.1 M/µL (F)' },
    hematocrit: { min: 20, max: 70, unit: '%', normalRange: '38.8-50% (M), 34.9-44.5% (F)' },
    mean_corpuscular_volume: { min: 50, max: 120, unit: 'fL', normalRange: '80-100 fL' },
    mean_corpuscular_hemoglobin: { min: 20, max: 40, unit: 'pg', normalRange: '27-33 pg' },
    mean_corpuscular_hemoglobin_concentration: { min: 25, max: 40, unit: 'g/dL', normalRange: '32-36 g/dL' },
    systolic_blood_pressure: { min: 60, max: 250, unit: 'mmHg', normalRange: '90-120 mmHg' },
    diastolic_blood_pressure: { min: 40, max: 180, unit: 'mmHg', normalRange: '60-80 mmHg' },
    heart_rate: { min: 30, max: 220, unit: 'bpm', normalRange: '60-100 bpm' },
    troponin: { min: 0, max: 100, unit: 'ng/mL', normalRange: '<0.04 ng/mL' },
    alt: { min: 0, max: 500, unit: 'U/L', normalRange: '7-56 U/L' },
    ast: { min: 0, max: 500, unit: 'U/L', normalRange: '10-40 U/L' },
    creatinine: { min: 0.1, max: 15, unit: 'mg/dL', normalRange: '0.6-1.2 mg/dL' },
    c_reactive_protein: { min: 0, max: 500, unit: 'mg/L', normalRange: '<3 mg/L' }
  };

  // Load OCR data if passed from OCRUpload component
  useEffect(() => {
    if (location.state?.medicalData) {
      const ocrData = location.state.medicalData;
      setMedicalData(prev => ({ ...prev, ...ocrData }));
      if (ocrData.patient_id) {
        setPatientId(ocrData.patient_id);
      }
    }
  }, [location.state]);

  const validateField = (name, value) => {
    if (!value || value === '') return null;
    
    const numValue = parseFloat(value);
    const range = physiologicalRanges[name];
    
    if (!range) return null;
    
    if (isNaN(numValue)) {
      return 'Invalid number';
    }
    
    if (numValue < range.min || numValue > range.max) {
      return `Value must be between ${range.min} and ${range.max} ${range.unit}`;
    }
    
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMedicalData(prev => ({ ...prev, [name]: value }));
    
    // Validate on change
    const error = validateField(name, value);
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!patientId.trim()) {
      setError('Patient ID is required');
      return;
    }

    // Validate all fields before submission
    const errors = {};
    Object.keys(medicalData).forEach(key => {
      if (medicalData[key]) {
        const error = validateField(key, medicalData[key]);
        if (error) {
          errors[key] = error;
        }
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError('Please correct the highlighted fields with physiological range errors');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setResult(null);

    try {
      const response = await predictionAPI.makePrediction({
        patient_id: patientId,
        ...medicalData
      });

      if (response.success) {
        setResult(response.data);
        setError('');
      } else {
        setError(response.error || 'Prediction failed');
      }
    } catch (err) {
      setError('An error occurred during prediction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadSample = () => {
    setPatientId('PAT001');
    setMedicalData({
      glucose: '105',
      cholesterol: '185',
      hemoglobin: '14.2',
      platelets: '250',
      white_blood_cells: '7.2',
      red_blood_cells: '4.8',
      hematocrit: '42.5',
      mean_corpuscular_volume: '88',
      mean_corpuscular_hemoglobin: '29.5',
      mean_corpuscular_hemoglobin_concentration: '33.2',
      insulin: '12.5',
      bmi: '24.3',
      systolic_blood_pressure: '120',
      diastolic_blood_pressure: '80',
      triglycerides: '140',
      hba1c: '5.8',
      ldl_cholesterol: '110',
      hdl_cholesterol: '55',
      alt: '28',
      ast: '32',
      heart_rate: '72',
      creatinine: '0.9',
      troponin: '0.02',
      c_reactive_protein: '1.5'
    });
    setValidationErrors({});
  };

  const renderFieldWithValidation = (label, name, step = "0.1") => {
    const hasError = validationErrors[name];
    const range = physiologicalRanges[name];
    
    return (
      <div className="form-field">
        <label>
          {label}
          {range && <span style={{ fontSize: '0.75em', color: '#888', marginLeft: '4px' }}>({range.normalRange})</span>}
        </label>
        <input 
          type="number" 
          step={step} 
          name={name} 
          value={medicalData[name]} 
          onChange={handleChange} 
          placeholder="0"
          style={{
            borderColor: hasError ? '#ef4444' : undefined,
            backgroundColor: hasError ? '#fef2f2' : undefined
          }}
        />
        {hasError && (
          <div style={{ 
            color: '#ef4444', 
            fontSize: '0.75rem', 
            marginTop: '4px',
            fontWeight: '500'
          }}>
            {hasError}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="prediction-container">
      <div className="prediction-card">
        <div className="prediction-header">
          <Activity size={32} className="header-icon" />
          <h1>Medical Prediction</h1>
          <p>Enter medical report data for AI-powered health analysis</p>
        </div>

        <form onSubmit={handleSubmit} className="prediction-form">
          {/* Patient ID */}
          <div className="form-section">
            <div className="section-header">
              <FileText size={20} />
              <h3>Patient Information</h3>
            </div>
            <div className="form-row">
              <div className="form-field full-width">
                <label>Patient ID *</label>
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="Enter Patient ID"
                  required
                />
              </div>
            </div>
            <button type="button" className="sample-btn" onClick={handleLoadSample}>
              <Upload size={16} />
              Load Sample Data
            </button>
          </div>

          {/* Blood Glucose & Metabolic */}
          <div className="form-section">
            <div className="section-header">
              <h3>Blood Glucose & Metabolic Panel</h3>
            </div>
            <div className="form-row">
              {renderFieldWithValidation('Glucose (mg/dL)', 'glucose')}
              {renderFieldWithValidation('HbA1c (%)', 'hba1c')}
              {renderFieldWithValidation('Insulin (µU/mL)', 'insulin')}
              {renderFieldWithValidation('BMI', 'bmi')}
            </div>
          </div>

          {/* Lipid Profile */}
          <div className="form-section">
            <div className="section-header">
              <h3>Lipid Profile</h3>
            </div>
            <div className="form-row">
              {renderFieldWithValidation('Cholesterol (mg/dL)', 'cholesterol')}
              {renderFieldWithValidation('Triglycerides (mg/dL)', 'triglycerides')}
              {renderFieldWithValidation('LDL Cholesterol (mg/dL)', 'ldl_cholesterol')}
              {renderFieldWithValidation('HDL Cholesterol (mg/dL)', 'hdl_cholesterol')}
            </div>
          </div>

          {/* Complete Blood Count */}
          <div className="form-section">
            <div className="section-header">
              <h3>Complete Blood Count (CBC)</h3>
            </div>
            <div className="form-row">
              {renderFieldWithValidation('Hemoglobin (g/dL)', 'hemoglobin')}
              {renderFieldWithValidation('Platelets (K/µL)', 'platelets')}
              {renderFieldWithValidation('White Blood Cells (K/µL)', 'white_blood_cells')}
              {renderFieldWithValidation('Red Blood Cells (M/µL)', 'red_blood_cells')}
            </div>
            <div className="form-row">
              {renderFieldWithValidation('Hematocrit (%)', 'hematocrit')}
              {renderFieldWithValidation('MCV (fL)', 'mean_corpuscular_volume')}
              {renderFieldWithValidation('MCH (pg)', 'mean_corpuscular_hemoglobin')}
              {renderFieldWithValidation('MCHC (g/dL)', 'mean_corpuscular_hemoglobin_concentration')}
            </div>
          </div>

          {/* Cardiovascular Markers */}
          <div className="form-section">
            <div className="section-header">
              <h3>Cardiovascular Markers</h3>
            </div>
            <div className="form-row">
              {renderFieldWithValidation('Systolic BP (mmHg)', 'systolic_blood_pressure', '1')}
              {renderFieldWithValidation('Diastolic BP (mmHg)', 'diastolic_blood_pressure', '1')}
              {renderFieldWithValidation('Heart Rate (bpm)', 'heart_rate', '1')}
              {renderFieldWithValidation('Troponin (ng/mL)', 'troponin', '0.01')}
            </div>
          </div>

          {/* Liver & Kidney Function */}
          <div className="form-section">
            <div className="section-header">
              <h3>Liver & Kidney Function</h3>
            </div>
            <div className="form-row">
              {renderFieldWithValidation('ALT (U/L)', 'alt', '1')}
              {renderFieldWithValidation('AST (U/L)', 'ast', '1')}
              {renderFieldWithValidation('Creatinine (mg/dL)', 'creatinine')}
              {renderFieldWithValidation('C-Reactive Protein (mg/L)', 'c_reactive_protein')}
            </div>
          </div>

          {error && <div className="error-alert">{error}</div>}

          <button type="submit" className="submit-prediction-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Analyzing...
              </>
            ) : (
              <>
                <Send size={20} />
                Get Prediction
              </>
            )}
          </button>
        </form>

        {/* Result Display */}
        {result && (
          <div className="result-container">
            <div className="result-header">
              <Activity size={24} />
              <h2>AI Analysis Complete</h2>
              <span className="result-timestamp">
                {new Date(result.metadata?.prediction_time || Date.now()).toLocaleString()}
              </span>
            </div>

            {/* Main Prediction Card */}
            <div className={`result-card risk-${result.data.prediction.risk_level.toLowerCase()}`}>
              <div className="result-status-bar">
                <span className={`status-badge status-${result.data.prediction.risk_level.toLowerCase()}`}>
                  {result.data.prediction.risk_level} Risk
                </span>
              </div>

              <div className="result-main">
                <div className="diagnosis-section">
                  <h3 className="diagnosis-label">Diagnosis</h3>
                  <h2 className="diagnosis-value">{result.data.prediction.disease}</h2>
                </div>

                {/* Summary Section */}
                <div className="summary-section">
                  <h4>Summary</h4>
                  <p className="summary-text">
                    {result.data.prediction.disease === 'Healthy' 
                      ? 'Analysis indicates normal health parameters. All vital signs and blood work fall within standard healthy ranges. Continue maintaining current lifestyle and regular health checkups.'
                      : `The analysis has detected indicators consistent with ${result.data.prediction.disease}. This assessment is based on deviations from healthy norms in key biomarkers. Immediate medical consultation is recommended for proper diagnosis and treatment planning.`
                    }
                  </p>
                </div>

                {/* Risk Assessment Visual */}
                <div className="risk-assessment">
                  <h4>Risk Assessment</h4>
                  <div className="risk-meter">
                    <div className="risk-bar">
                      <div 
                        className={`risk-fill risk-fill-${result.data.prediction.risk_level.toLowerCase()}`}
                        style={{
                          width: result.data.prediction.risk_level === 'Critical' ? '100%' :
                                 result.data.prediction.risk_level === 'High' ? '75%' :
                                 result.data.prediction.risk_level === 'Moderate' ? '50%' : '25%'
                        }}
                      ></div>
                    </div>
                    <div className="risk-labels">
                      <span className={result.data.prediction.risk_level === 'Low' ? 'active' : ''}>Low</span>
                      <span className={result.data.prediction.risk_level === 'Moderate' ? 'active' : ''}>Moderate</span>
                      <span className={result.data.prediction.risk_level === 'High' ? 'active' : ''}>High</span>
                      <span className={result.data.prediction.risk_level === 'Critical' ? 'active' : ''}>Critical</span>
                    </div>
                  </div>
                </div>

                {/* Key Contributing Factors */}
                {result.data.prediction.important_features && result.data.prediction.important_features.length > 0 && (
                  <div className="factors-section">
                    <h4>Key Contributing Factors</h4>
                    <p className="factors-subtitle">The following biomarkers show significant deviations:</p>
                    <div className="factors-list">
                      {result.data.prediction.important_features.map((feature, idx) => (
                        <div key={idx} className="factor-item">
                          <div className="factor-icon">
                            <div className="warning-dot"></div>
                          </div>
                          <div className="factor-content">
                            <span className="factor-name">{feature}</span>
                            <span className="factor-status">Abnormal Range Detected</span>
                          </div>
                          <div className="factor-badge">
                            <span className="priority-badge">Priority {idx + 1}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div className="recommendations-section">
                  <h4>Recommendations</h4>
                  <ul className="recommendations-list">
                    {result.data.prediction.disease === 'Healthy' ? (
                      <>
                        <li>✓ Continue regular health screenings</li>
                        <li>✓ Maintain balanced diet and exercise routine</li>
                        <li>✓ Monitor key vitals periodically</li>
                      </>
                    ) : (
                      <>
                        <li>⚠ Consult with a healthcare professional immediately</li>
                        <li>⚠ Undergo comprehensive diagnostic tests</li>
                        <li>⚠ Follow prescribed treatment plan strictly</li>
                        <li>⚠ Schedule regular follow-up appointments</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              {/* Blockchain & Metadata */}
              <div className="result-meta">
                <div className="meta-grid">
                  <div className="meta-item">
                    <span className="meta-label">Prediction ID</span>
                    <span className="meta-value">{result.data.prediction_uuid}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Patient ID</span>
                    <span className="meta-value">{result.data.patient_id}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Blockchain Hash</span>
                    <span className="meta-value mono">{result.data.blockchain.block_hash.substring(0, 20)}...</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Block Index</span>
                    <span className="meta-value">#{result.data.blockchain.block_index}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Verification Status</span>
                    <span className="meta-value verified">✓ Blockchain Secured</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Model Version</span>
                    <span className="meta-value">{result.metadata?.model_version || '1.0.0'}</span>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="disclaimer">
                <strong>Medical Disclaimer:</strong> This AI analysis is for informational purposes only and should not replace professional medical advice. 
                Always consult qualified healthcare providers for diagnosis and treatment.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionForm;