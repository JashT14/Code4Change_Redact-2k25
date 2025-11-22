import React, { useState } from 'react';
import { Activity, Heart, Droplet, TrendingUp, User, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';


const MediGuardInputForm = () => {
  const [activeSection, setActiveSection] = useState('patient');
  const [formData, setFormData] = useState({
    age: '', bmi: '', gender: '',
    troponin: '', ckMb: '', ldh: '',
    glucose: '', cholesterol: '', triglycerides: '', hdl: '', ldl: '',
    alt: '', ast: '', bilirubin: '',
    creatinine: '', bun: '', uricAcid: '',
    hemoglobin: '', wbc: '', platelets: '',
    bloodPressureSys: '', bloodPressureDia: '', heartRate: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const sections = [
    { id: 'patient', label: 'Patient Info', icon: User, color: '#0066cc' },
    { id: 'cardiac', label: 'Cardiac', icon: Heart, color: '#dc3545' },
    { id: 'metabolic', label: 'Metabolic', icon: Droplet, color: '#17a2b8' },
    { id: 'liver', label: 'Liver', icon: TrendingUp, color: '#fd7e14' },
    { id: 'kidney', label: 'Kidney', icon: Droplet, color: '#6610f2' },
    { id: 'blood', label: 'Blood Count', icon: Activity, color: '#e83e8c' },
    { id: 'vitals', label: 'Vitals', icon: Zap, color: '#20c997' },
  ];

  const getSectionFields = (sectionId) => {
    const fields = {
      patient: [
        { name: 'age', label: 'Age', unit: 'years', range: '18-100' },
        { name: 'bmi', label: 'BMI', unit: 'kg/m²', range: '15-40' },
        { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] }
      ],
      cardiac: [
        { name: 'troponin', label: 'Troponin', unit: 'ng/mL', range: '0-0.04' },
        { name: 'ckMb', label: 'CK-MB', unit: 'U/L', range: '0-25' },
        { name: 'ldh', label: 'LDH', unit: 'U/L', range: '140-280' }
      ],
      metabolic: [
        { name: 'glucose', label: 'Glucose', unit: 'mg/dL', range: '70-100' },
        { name: 'cholesterol', label: 'Cholesterol', unit: 'mg/dL', range: '125-200' },
        { name: 'triglycerides', label: 'Triglycerides', unit: 'mg/dL', range: '0-150' },
        { name: 'hdl', label: 'HDL', unit: 'mg/dL', range: '40-60' },
        { name: 'ldl', label: 'LDL', unit: 'mg/dL', range: '0-100' }
      ],
      liver: [
        { name: 'alt', label: 'ALT', unit: 'U/L', range: '7-56' },
        { name: 'ast', label: 'AST', unit: 'U/L', range: '10-40' },
        { name: 'bilirubin', label: 'Bilirubin', unit: 'mg/dL', range: '0.1-1.2' }
      ],
      kidney: [
        { name: 'creatinine', label: 'Creatinine', unit: 'mg/dL', range: '0.6-1.2' },
        { name: 'bun', label: 'BUN', unit: 'mg/dL', range: '7-20' },
        { name: 'uricAcid', label: 'Uric Acid', unit: 'mg/dL', range: '3.5-7.2' }
      ],
      blood: [
        { name: 'hemoglobin', label: 'Hemoglobin', unit: 'g/dL', range: '12-17' },
        { name: 'wbc', label: 'WBC', unit: '×10³/μL', range: '4-11' },
        { name: 'platelets', label: 'Platelets', unit: '×10³/μL', range: '150-400' }
      ],
      vitals: [
        { name: 'bloodPressureSys', label: 'BP Systolic', unit: 'mmHg', range: '90-120' },
        { name: 'bloodPressureDia', label: 'BP Diastolic', unit: 'mmHg', range: '60-80' },
        { name: 'heartRate', label: 'Heart Rate', unit: 'bpm', range: '60-100' }
      ]
    };
    return fields[sectionId] || [];
  };

  const isSectionComplete = (sectionId) => {
    const fields = getSectionFields(sectionId);
    return fields.every(field => formData[field.name]?.trim());
  };

  const getCompletionPercentage = () => {
    const total = Object.keys(formData).length;
    const filled = Object.values(formData).filter(v => v?.trim()).length;
    return Math.round((filled / total) * 100);
  };

  const handleSubmit = () => {
    const completion = getCompletionPercentage();
    if (completion < 100) {
      alert(`Please complete all fields (${completion}% done)`);
    } else {
      alert('Analyzing patient data...');
      console.log('Form data:', formData);
    }
  };

  return (
    <div style={styles.container}>
      {/* Compact Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logoSection}>
            <Activity size={24} strokeWidth={2.5} />
            <span style={styles.logoText}>MediGuard AI</span>
          </div>
          <div style={styles.headerRight}>
            <span style={styles.completionBadge}>
              {getCompletionPercentage()}% Complete
            </span>
          </div>
        </div>
      </header>

      {/* Main Layout - Two Columns */}
      <div style={styles.mainLayout}>
        {/* LEFT COLUMN - Input Form */}
        <div style={styles.leftColumn}>
          {/* Section Tabs */}
          <div style={styles.sectionTabs}>
            {sections.map(section => {
              const Icon = section.icon;
              const isComplete = isSectionComplete(section.id);
              const isActive = activeSection === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  style={{
                    ...styles.sectionTab,
                    ...(isActive ? { ...styles.sectionTabActive, borderColor: section.color } : {}),
                    ...(isComplete && !isActive ? styles.sectionTabComplete : {})
                  }}
                >
                  <Icon size={18} color={isActive ? section.color : '#666'} />
                  <span>{section.label}</span>
                  {isComplete && <CheckCircle2 size={16} color="#28a745" />}
                </button>
              );
            })}
          </div>

          {/* Active Section Form */}
          <div style={styles.formArea}>
            {sections.map(section => {
              if (section.id !== activeSection) return null;
              
              const Icon = section.icon;
              const fields = getSectionFields(section.id);
              
              return (
                <div key={section.id} style={styles.sectionContent}>
                  <div style={styles.sectionHeader}>
                    <Icon size={24} color={section.color} />
                    <h2 style={{...styles.sectionTitle, color: section.color}}>
                      {section.label}
                    </h2>
                  </div>

                  <div style={styles.fieldsGrid}>
                    {fields.map(field => (
                      <div key={field.name} style={styles.fieldGroup}>
                        <label style={styles.fieldLabel}>
                          {field.label}
                          {field.unit && <span style={styles.fieldUnit}> ({field.unit})</span>}
                        </label>
                        
                        {field.type === 'select' ? (
                          <select
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleChange}
                            style={styles.fieldInput}
                          >
                            <option value="">Select...</option>
                            {field.options.map(opt => (
                              <option key={opt} value={opt.toLowerCase()}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="number"
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleChange}
                            placeholder={`Normal: ${field.range}`}
                            style={styles.fieldInput}
                            step="0.01"
                          />
                        )}
                        
                        {field.range && (
                          <span style={styles.fieldHint}>Normal range: {field.range}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Navigation Buttons */}
                  <div style={styles.navButtons}>
                    {sections.findIndex(s => s.id === activeSection) > 0 && (
                      <button
                        onClick={() => {
                          const currentIndex = sections.findIndex(s => s.id === activeSection);
                          setActiveSection(sections[currentIndex - 1].id);
                        }}
                        style={styles.navBtnPrev}
                      >
                        ← Previous
                      </button>
                    )}
                    
                    {sections.findIndex(s => s.id === activeSection) < sections.length - 1 ? (
                      <button
                        onClick={() => {
                          const currentIndex = sections.findIndex(s => s.id === activeSection);
                          setActiveSection(sections[currentIndex + 1].id);
                        }}
                        style={styles.navBtnNext}
                      >
                        Next →
                      </button>
                    ) : (
                      <button onClick={handleSubmit} style={styles.submitBtn}>
                        <Activity size={18} />
                        Analyze Patient
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN - Progress/Summary */}
        <div style={styles.rightColumn}>
          <div style={styles.summaryCard}>
            <h3 style={styles.summaryTitle}>Data Entry Progress</h3>
            
            {/* Progress Bar */}
            <div style={styles.progressBar}>
              <div style={{...styles.progressFill, width: `${getCompletionPercentage()}%`}} />
            </div>
            <p style={styles.progressText}>{getCompletionPercentage()}% Complete</p>

            {/* Section Checklist */}
            <div style={styles.checklist}>
              <h4 style={styles.checklistTitle}>Sections</h4>
              {sections.map(section => {
                const Icon = section.icon;
                const isComplete = isSectionComplete(section.id);
                
                return (
                  <div
                    key={section.id}
                    style={{
                      ...styles.checklistItem,
                      ...(activeSection === section.id ? styles.checklistItemActive : {})
                    }}
                    onClick={() => setActiveSection(section.id)}
                  >
                    <Icon size={16} color={section.color} />
                    <span style={styles.checklistLabel}>{section.label}</span>
                    {isComplete ? (
                      <CheckCircle2 size={16} color="#28a745" />
                    ) : (
                      <AlertCircle size={16} color="#ccc" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick Tips */}
            <div style={styles.tipsBox}>
              <h4 style={styles.tipsTitle}>💡 Quick Tips</h4>
              <ul style={styles.tipsList}>
                <li>Enter values as they appear on lab reports</li>
                <li>Normal ranges shown below each field</li>
                <li>Use tabs to navigate quickly</li>
                <li>All fields required for analysis</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f8f9fa',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  header: {
    background: 'linear-gradient(135deg, #0066cc 0%, #004d99 100%)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0.75rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    color: 'white',
  },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: 700,
    letterSpacing: '-0.3px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  completionBadge: {
    background: 'rgba(255,255,255,0.2)',
    padding: '0.4rem 1rem',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: 600,
    color: 'white',
  },
  mainLayout: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '2rem',
    padding: '2rem',
    minHeight: 'calc(100vh - 60px)',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  sectionTabs: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    background: 'white',
    padding: '1rem',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  sectionTab: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 1rem',
    border: '2px solid transparent',
    borderRadius: '8px',
    background: '#f8f9fa',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#666',
  },
  sectionTabActive: {
    background: 'white',
    fontWeight: 600,
    color: '#333',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  },
  sectionTabComplete: {
    background: '#f0f9f4',
  },
  formArea: {
    background: 'white',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    flexGrow: 1,
  },
  sectionContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid #f0f0f0',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    margin: 0,
  },
  fieldsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.25rem',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  fieldLabel: {
    fontWeight: 600,
    fontSize: '0.9rem',
    color: '#333',
  },
  fieldUnit: {
    fontWeight: 400,
    color: '#666',
  },
  fieldInput: {
    padding: '0.7rem 1rem',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '1rem',
    transition: 'border 0.2s',
  },
  fieldHint: {
    fontSize: '0.75rem',
    color: '#28a745',
    fontWeight: 500,
  },
  navButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
    paddingTop: '1rem',
  },
  navBtnPrev: {
    padding: '0.75rem 1.5rem',
    background: '#f8f9fa',
    border: '2px solid #dee2e6',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  navBtnNext: {
    padding: '0.75rem 1.5rem',
    background: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginLeft: 'auto',
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 2rem',
    background: 'linear-gradient(135deg, #28a745 0%, #20923b 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginLeft: 'auto',
    boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)',
  },
  rightColumn: {
    position: 'sticky',
    top: '80px',
    height: 'fit-content',
  },
  summaryCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  summaryTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    marginBottom: '1rem',
    color: '#333',
  },
  progressBar: {
    height: '8px',
    background: '#e0e0e0',
    borderRadius: '10px',
    overflow: 'hidden',
    marginBottom: '0.5rem',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #0066cc, #28a745)',
    transition: 'width 0.3s ease',
  },
  progressText: {
    fontSize: '0.85rem',
    color: '#666',
    marginBottom: '1.5rem',
  },
  checklist: {
    marginBottom: '1.5rem',
  },
  checklistTitle: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#666',
    marginBottom: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  checklistItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.6rem 0.75rem',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background 0.2s',
    marginBottom: '0.25rem',
  },
  checklistItemActive: {
    background: '#f0f7ff',
  },
  checklistLabel: {
    fontSize: '0.9rem',
    flex: 1,
    fontWeight: 500,
  },
  tipsBox: {
    background: '#f8f9fa',
    padding: '1rem',
    borderRadius: '8px',
    borderLeft: '3px solid #0066cc',
  },
  tipsTitle: {
    fontSize: '0.9rem',
    fontWeight: 700,
    marginBottom: '0.5rem',
  },
  tipsList: {
    margin: 0,
    paddingLeft: '1.25rem',
    fontSize: '0.85rem',
    color: '#666',
    lineHeight: 1.6,
  },
};

export default MediGuardInputForm;