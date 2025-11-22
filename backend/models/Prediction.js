// models/Prediction.js
const mongoose = require('mongoose');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const predictionSchema = new mongoose.Schema({
  predictionUuid: {
    type: String,
    unique: true,
    required: true,
    default: () => uuidv4()
  },
  patientId: {
    type: String,
    required: true,
    index: true
  },
  patientIdHash: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  inputData: {
    // Blood Sugar & Metabolic
    glucose: { type: Number, default: 0 },
    insulin: { type: Number, default: 0 },
    hba1c: { type: Number, default: 0 },
    bmi: { type: Number, default: 0 },
    
    // Lipid Panel
    cholesterol: { type: Number, default: 0 },
    triglycerides: { type: Number, default: 0 },
    ldl_cholesterol: { type: Number, default: 0 },
    hdl_cholesterol: { type: Number, default: 0 },
    
    // Complete Blood Count (CBC)
    hemoglobin: { type: Number, default: 0 },
    platelets: { type: Number, default: 0 },
    white_blood_cells: { type: Number, default: 0 },
    red_blood_cells: { type: Number, default: 0 },
    hematocrit: { type: Number, default: 0 },
    mean_corpuscular_volume: { type: Number, default: 0 },
    mean_corpuscular_hemoglobin: { type: Number, default: 0 },
    mean_corpuscular_hemoglobin_concentration: { type: Number, default: 0 },
    
    // Cardiovascular
    systolic_blood_pressure: { type: Number, default: 0 },
    diastolic_blood_pressure: { type: Number, default: 0 },
    heart_rate: { type: Number, default: 0 },
    troponin: { type: Number, default: 0 },
    
    // Liver Function
    alt: { type: Number, default: 0 },
    ast: { type: Number, default: 0 },
    
    // Kidney Function
    creatinine: { type: Number, default: 0 },
    
    // Inflammation
    c_reactive_protein: { type: Number, default: 0 }
  },
  prediction: {
    disease: {
      type: String,
      required: true
    },
    confidence: {
      type: Number,
      required: true
    },
    importantFeatures: [String],
    allDiseaseScores: {
      type: Map,
      of: Number
    },
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    }
  },
  predictionHash: {
    type: String,
    required: true
  },
  timestampHash: {
    type: String,
    required: true
  },
  blockchain: {
    blockHash: String,
    timestamp: Number,
    prevHash: String,
    blockIndex: Number
  },
  metadata: {
    predictionTime: {
      type: Date,
      default: Date.now
    },
    predictionTimestamp: {
      type: Number,
      default: () => Date.now()
    },
    modelVersion: {
      type: String,
      default: '1.0.0'
    },
    ipAddress: String,
    userAgent: String
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'verified', 'archived'],
    default: 'completed'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to generate hashes (only if not already provided)
predictionSchema.pre('save', async function() {
  if (this.isNew) {
    // Hash patient ID only if not already set
    if (!this.patientIdHash) {
      this.patientIdHash = crypto
        .createHash('sha256')
        .update(this.patientId)
        .digest('hex');
    }

    // Hash prediction data only if not already set
    if (!this.predictionHash) {
      const predictionData = JSON.stringify({
        disease: this.prediction.disease,
        confidence: this.prediction.confidence,
        patientId: this.patientId
      });
      this.predictionHash = crypto
        .createHash('sha256')
        .update(predictionData)
        .digest('hex');
    }

    // Hash timestamp only if not already set
    if (!this.timestampHash && this.metadata.predictionTimestamp) {
      this.timestampHash = crypto
        .createHash('sha256')
        .update(this.metadata.predictionTimestamp.toString())
        .digest('hex');
    }
  }
  
  this.updatedAt = Date.now();
});

// Index for faster queries
predictionSchema.index({ patientId: 1, createdAt: -1 });
predictionSchema.index({ userId: 1, createdAt: -1 });
predictionSchema.index({ predictionUuid: 1 });
predictionSchema.index({ patientIdHash: 1 });

// Method to verify prediction integrity
predictionSchema.methods.verifyIntegrity = function() {
  try {
    // Verify patient ID hash
    const patientHash = crypto
      .createHash('sha256')
      .update(this.patientId)
      .digest('hex');
    
    if (patientHash !== this.patientIdHash) {
      console.log('Patient ID hash mismatch:', {
        expected: this.patientIdHash,
        calculated: patientHash,
        patientId: this.patientId
      });
      return { valid: false, error: 'Patient ID hash mismatch' };
    }

    // Verify prediction hash
    const predictionData = JSON.stringify({
      disease: this.prediction.disease,
      confidence: this.prediction.confidence,
      patientId: this.patientId
    });
    const predictionHash = crypto
      .createHash('sha256')
      .update(predictionData)
      .digest('hex');
    
    if (predictionHash !== this.predictionHash) {
      console.log('Prediction hash mismatch:', {
        expected: this.predictionHash,
        calculated: predictionHash,
        data: predictionData,
        predictionObject: this.prediction,
        patientId: this.patientId
      });
      return { valid: false, error: 'Prediction data has been tampered with' };
    }

    // Verify timestamp hash
    const timestampHash = crypto
      .createHash('sha256')
      .update(this.metadata.predictionTimestamp.toString())
      .digest('hex');
    
    if (timestampHash !== this.timestampHash) {
      console.log('Timestamp hash mismatch:', {
        expected: this.timestampHash,
        calculated: timestampHash,
        timestamp: this.metadata.predictionTimestamp
      });
      return { valid: false, error: 'Timestamp hash mismatch' };
    }

    console.log('All hashes verified successfully');
    return { valid: true };
  } catch (error) {
    console.error('Error during integrity verification:', error);
    return { valid: false, error: `Verification error: ${error.message}` };
  }
};

module.exports = mongoose.model('Prediction', predictionSchema);