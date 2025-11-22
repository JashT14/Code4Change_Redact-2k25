import React, { useState, useEffect } from 'react';
import { History, Shield, User, LogOut, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { predictionAPI, authAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPredictions();
  }, [page]);

  const fetchPredictions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await predictionAPI.getHistory(page, 10);
      if (response.success) {
        setPredictions(response.predictions || []);
        setTotalPages(response.pages || 1);
      } else {
        setError('Failed to fetch predictions');
      }
    } catch (err) {
      setError('Error loading predictions');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (predictionId) => {
    if (!predictionId) {
      setError('Invalid prediction ID');
      return;
    }
    try {
      console.log('Verifying prediction ID:', predictionId);
      const response = await predictionAPI.verifyPrediction(predictionId);
      console.log('Verification response:', response);
      
      if (response.success) {
        const isValid = response.integrity_check?.valid === true;
        setVerificationResult({
          verified: isValid,
          message: isValid 
            ? 'Blockchain integrity verified successfully' 
            : (response.integrity_check?.error || 'Verification failed'),
          error: response.integrity_check?.error
        });
      } else {
        setError(response.error || 'Verification failed');
      }
    } catch (err) {
      setError('Error during verification');
      console.error('Verify error:', err);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
  };

  const handleNewPrediction = () => {
    navigate('/predict');
  };

  const getRiskColor = (riskLevel) => {
    const level = riskLevel?.toLowerCase();
    if (level === 'low') return 'risk-low';
    if (level === 'medium') return 'risk-medium';
    if (level === 'high') return 'risk-high';
    return '';
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <nav className="sidebar-nav">
          <button className="nav-item active">
            <History size={20} />
            <span>Prediction History</span>
          </button>
          <button className="nav-item" onClick={handleNewPrediction}>
            <FileText size={20} />
            <span>New Prediction</span>
          </button>
          <button className="nav-item" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      <div className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Prediction History</h1>
            <p>View and verify your medical predictions</p>
          </div>
          <button className="new-prediction-btn" onClick={handleNewPrediction}>
            <FileText size={20} />
            New Prediction
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-state">
            <div className="spinner-large"></div>
            <p>Loading predictions...</p>
          </div>
        ) : predictions.length === 0 ? (
          <div className="empty-state">
            <History size={64} className="empty-icon" />
            <h3>No predictions yet</h3>
            <p>Start by creating your first medical prediction</p>
            <button className="empty-state-btn" onClick={handleNewPrediction}>
              <FileText size={20} />
              Create Prediction
            </button>
          </div>
        ) : (
          <>
            <div className="predictions-grid">
              {predictions.map((pred) => (
                <div key={pred.id || pred._id || pred.uuid} className="prediction-card">
                  <div className="card-header">
                    <div className="card-title">
                      <User size={18} />
                      <span>Patient: {pred.patient_id}</span>
                    </div>
                    <span className={`risk-badge ${getRiskColor(pred.risk_level)}`}>
                      {pred.risk_level || 'N/A'}
                    </span>
                  </div>

                  <div className="card-body">
                    <div className="prediction-info">
                      <h3>{pred.disease || 'Unknown'}</h3>
                    </div>

                    <div className="card-meta">
                      <p>
                        <strong>Created:</strong> {new Date(pred.timestamp).toLocaleDateString()}
                      </p>
                      <p className="hash-display">
                        <strong>Hash:</strong> {pred.blockchain_hash?.substring(0, 12)}...
                      </p>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button 
                      className="btn-secondary"
                      onClick={() => setSelectedPrediction(pred)}
                    >
                      <FileText size={16} />
                      Details
                    </button>
                    <button 
                      className="btn-primary"
                      onClick={() => handleVerify(pred.id || pred._id)}
                    >
                      <Shield size={16} />
                      Verify
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="pagination-btn"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft size={20} />
                  Previous
                </button>
                <span className="pagination-info">
                  Page {page} of {totalPages}
                </span>
                <button 
                  className="pagination-btn"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}

        {/* Verification Modal */}
        {verificationResult && (
          <div className="modal-overlay" onClick={() => setVerificationResult(null)}>
            <div className="modal-content verification-modal" onClick={(e) => e.stopPropagation()}>
              <h2>🔐 Blockchain Verification</h2>
              <div className={`verification-result ${verificationResult.verified ? 'verified' : 'failed'}`}>
                <div className="verification-icon">
                  <Shield size={64} />
                </div>
                <h3>{verificationResult.verified ? '✓ Verification Successful' : '✗ Verification Failed'}</h3>
                <p className="verification-message">{verificationResult.message}</p>
                
                {verificationResult.verified && (
                  <div className="verification-details">
                    <div className="verification-check">
                      <span className="check-icon">✓</span>
                      <span>Patient ID hash validated</span>
                    </div>
                    <div className="verification-check">
                      <span className="check-icon">✓</span>
                      <span>Prediction data hash validated</span>
                    </div>
                    <div className="verification-check">
                      <span className="check-icon">✓</span>
                      <span>Timestamp hash validated</span>
                    </div>
                    <div className="verification-check">
                      <span className="check-icon">✓</span>
                      <span>Blockchain integrity confirmed</span>
                    </div>
                  </div>
                )}
                
                {!verificationResult.verified && verificationResult.error && (
                  <div className="verification-error">
                    <p><strong>Error:</strong> {verificationResult.error}</p>
                  </div>
                )}
              </div>
              <button className="modal-close-btn" onClick={() => setVerificationResult(null)}>
                Close
              </button>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {selectedPrediction && (
          <div className="modal-overlay" onClick={() => setSelectedPrediction(null)}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
              <h2>Prediction Details</h2>
              <div className="details-grid">
                <div className="detail-section">
                  <h3>Patient Information</h3>
                  <p><strong>Patient ID:</strong> {selectedPrediction.patient_id}</p>
                  <p><strong>Prediction ID:</strong> {selectedPrediction.uuid}</p>
                  <p><strong>Timestamp:</strong> {new Date(selectedPrediction.timestamp).toLocaleString()}</p>
                </div>

                <div className="detail-section">
                  <h3>Prediction Results</h3>
                  <p><strong>Disease:</strong> {selectedPrediction.disease}</p>
                  <p><strong>Risk Level:</strong> <span className={getRiskColor(selectedPrediction.risk_level)}>{selectedPrediction.risk_level}</span></p>
                </div>

                <div className="detail-section">
                  <h3>Blockchain Data</h3>
                  <p className="hash-full"><strong>Block Hash:</strong> {selectedPrediction.blockchain_hash}</p>
                  <p><strong>Timestamp:</strong> {new Date(selectedPrediction.timestamp).toLocaleString()}</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedPrediction(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
