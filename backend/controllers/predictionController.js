// controllers/predictionController.js
const Prediction = require('../models/Prediction');
const Blockchain = require('../utils/blockchain');
const axios = require('axios');

// Initialize blockchain
const blockchain = new Blockchain();

// Flask ML API endpoint
const ML_API_URL = 'http://127.0.0.1:5000/predict';

// @desc    Make a prediction
// @route   POST /api/predict
// @access  Private
exports.makePrediction = async (req, res) => {
  try {
    const {
      patient_id,
      glucose,
      cholesterol,
      hemoglobin,
      platelets,
      white_blood_cells,
      red_blood_cells,
      hematocrit,
      mean_corpuscular_volume,
      mean_corpuscular_hemoglobin,
      mean_corpuscular_hemoglobin_concentration,
      insulin,
      bmi,
      systolic_blood_pressure,
      diastolic_blood_pressure,
      triglycerides,
      hba1c,
      ldl_cholesterol,
      hdl_cholesterol,
      alt,
      ast,
      heart_rate,
      creatinine,
      troponin,
      c_reactive_protein
    } = req.body;

    // Validation
    if (!patient_id) {
      return res.status(400).json({
        success: false,
        error: 'patient_id is required'
      });
    }

    // Prepare input data with all 24 parameters
    const inputData = {
      patient_id,
      glucose: parseFloat(glucose) || 0,
      cholesterol: parseFloat(cholesterol) || 0,
      hemoglobin: parseFloat(hemoglobin) || 0,
      platelets: parseFloat(platelets) || 0,
      white_blood_cells: parseFloat(white_blood_cells) || 0,
      red_blood_cells: parseFloat(red_blood_cells) || 0,
      hematocrit: parseFloat(hematocrit) || 0,
      mean_corpuscular_volume: parseFloat(mean_corpuscular_volume) || 0,
      mean_corpuscular_hemoglobin: parseFloat(mean_corpuscular_hemoglobin) || 0,
      mean_corpuscular_hemoglobin_concentration: parseFloat(mean_corpuscular_hemoglobin_concentration) || 0,
      insulin: parseFloat(insulin) || 0,
      bmi: parseFloat(bmi) || 0,
      systolic_blood_pressure: parseFloat(systolic_blood_pressure) || 0,
      diastolic_blood_pressure: parseFloat(diastolic_blood_pressure) || 0,
      triglycerides: parseFloat(triglycerides) || 0,
      hba1c: parseFloat(hba1c) || 0,
      ldl_cholesterol: parseFloat(ldl_cholesterol) || 0,
      hdl_cholesterol: parseFloat(hdl_cholesterol) || 0,
      alt: parseFloat(alt) || 0,
      ast: parseFloat(ast) || 0,
      heart_rate: parseFloat(heart_rate) || 0,
      creatinine: parseFloat(creatinine) || 0,
      troponin: parseFloat(troponin) || 0,
      c_reactive_protein: parseFloat(c_reactive_protein) || 0
    };

    // Call Flask ML API for prediction
    let mlResponse;
    try {
      mlResponse = await axios.post(ML_API_URL, {
        'Glucose': inputData.glucose,
        'Cholesterol': inputData.cholesterol,
        'Hemoglobin': inputData.hemoglobin,
        'Platelets': inputData.platelets,
        'White Blood Cells': inputData.white_blood_cells,
        'Red Blood Cells': inputData.red_blood_cells,
        'Hematocrit': inputData.hematocrit,
        'Mean Corpuscular Volume': inputData.mean_corpuscular_volume,
        'Mean Corpuscular Hemoglobin': inputData.mean_corpuscular_hemoglobin,
        'Mean Corpuscular Hemoglobin Concentration': inputData.mean_corpuscular_hemoglobin_concentration,
        'Insulin': inputData.insulin,
        'BMI': inputData.bmi,
        'Systolic Blood Pressure': inputData.systolic_blood_pressure,
        'Diastolic Blood Pressure': inputData.diastolic_blood_pressure,
        'Triglycerides': inputData.triglycerides,
        'HbA1c': inputData.hba1c,
        'LDL Cholesterol': inputData.ldl_cholesterol,
        'HDL Cholesterol': inputData.hdl_cholesterol,
        'ALT': inputData.alt,
        'AST': inputData.ast,
        'Heart Rate': inputData.heart_rate,
        'Creatinine': inputData.creatinine,
        'Troponin': inputData.troponin,
        'C-reactive Protein': inputData.c_reactive_protein
      }, {
        timeout: 10000
      });
    } catch (mlError) {
      console.error('ML API error:', mlError.message);
      return res.status(503).json({
        success: false,
        error: 'ML prediction service unavailable',
        message: 'Please ensure the Flask ML API is running on http://127.0.0.1:5000'
      });
    }

    const prediction = {
      disease: mlResponse.data.prediction,
      confidence: mlResponse.data.confidence || 0.5,
      important_features: mlResponse.data.explanation?.top_contributing_factors?.map(f => f.friendly_name) || [],
      explanation: mlResponse.data.explanation,
      all_scores: {}
    };

    // Calculate risk level based on disease type
    let riskLevel = 'Low';
    if (prediction.disease !== 'Healthy') {
      const topFactors = mlResponse.data.explanation?.top_contributing_factors || [];
      const avgDeviation = topFactors.length > 0
        ? topFactors.reduce((sum, f) => sum + f.deviation_score, 0) / topFactors.length
        : 0;
      
      if (avgDeviation >= 3.0) riskLevel = 'Critical';
      else if (avgDeviation >= 2.0) riskLevel = 'High';
      else if (avgDeviation >= 1.5) riskLevel = 'Medium';
    }

    // Add to blockchain
    const block = blockchain.addBlock(
      patient_id,
      prediction.disease,
      prediction.important_features
    );

    // Get client info
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');
    const predictionTimestamp = Date.now();

    // Generate hashes manually using crypto
    const crypto = require('crypto');
    
    // Hash patient ID
    const patientIdHash = crypto
      .createHash('sha256')
      .update(patient_id)
      .digest('hex');

    // Hash prediction data
    const predictionData = JSON.stringify({
      disease: prediction.disease,
      confidence: prediction.confidence,
      patientId: patient_id
    });
    const predictionHash = crypto
      .createHash('sha256')
      .update(predictionData)
      .digest('hex');

    // Hash timestamp
    const timestampHash = crypto
      .createHash('sha256')
      .update(predictionTimestamp.toString())
      .digest('hex');

    // Save to database
    const predictionRecord = await Prediction.create({
      patientId: patient_id,
      patientIdHash: patientIdHash,
      predictionHash: predictionHash,
      timestampHash: timestampHash,
      userId: req.user._id,
      inputData: {
        glucose: inputData.glucose,
        cholesterol: inputData.cholesterol,
        hemoglobin: inputData.hemoglobin,
        platelets: inputData.platelets,
        white_blood_cells: inputData.white_blood_cells,
        red_blood_cells: inputData.red_blood_cells,
        hematocrit: inputData.hematocrit,
        mean_corpuscular_volume: inputData.mean_corpuscular_volume,
        mean_corpuscular_hemoglobin: inputData.mean_corpuscular_hemoglobin,
        mean_corpuscular_hemoglobin_concentration: inputData.mean_corpuscular_hemoglobin_concentration,
        insulin: inputData.insulin,
        bmi: inputData.bmi,
        systolic_blood_pressure: inputData.systolic_blood_pressure,
        diastolic_blood_pressure: inputData.diastolic_blood_pressure,
        triglycerides: inputData.triglycerides,
        hba1c: inputData.hba1c,
        ldl_cholesterol: inputData.ldl_cholesterol,
        hdl_cholesterol: inputData.hdl_cholesterol,
        alt: inputData.alt,
        ast: inputData.ast,
        heart_rate: inputData.heart_rate,
        creatinine: inputData.creatinine,
        troponin: inputData.troponin,
        c_reactive_protein: inputData.c_reactive_protein
      },
      prediction: {
        disease: prediction.disease,
        confidence: prediction.confidence,
        importantFeatures: prediction.important_features,
        allDiseaseScores: prediction.all_scores,
        riskLevel: riskLevel
      },
      blockchain: {
        blockHash: block.hash,
        timestamp: block.timestamp,
        prevHash: block.prev_hash,
        blockIndex: blockchain.chain.length - 1
      },
      metadata: {
        predictionTime: new Date(predictionTimestamp),
        predictionTimestamp: predictionTimestamp,
        modelVersion: '1.0.0',
        ipAddress: ipAddress,
        userAgent: userAgent
      }
    });

    // Return response
    res.json({
      success: true,
      data: {
        prediction_uuid: predictionRecord.predictionUuid,
        patient_id,
        patient_id_hash: predictionRecord.patientIdHash,
        prediction: {
          disease: prediction.disease,
          risk_level: riskLevel,
          important_features: prediction.important_features,
          all_disease_scores: prediction.all_scores
          // Note: confidence is stored in DB for hash verification but not exposed to frontend
        },
        hashes: {
          prediction_hash: predictionRecord.predictionHash,
          timestamp_hash: predictionRecord.timestampHash,
          patient_id_hash: predictionRecord.patientIdHash
        },
        blockchain: {
          block_hash: block.hash,
          block_index: blockchain.chain.length - 1,
          timestamp: block.timestamp,
          prev_hash: block.prev_hash
        },
        metadata: {
          prediction_id: predictionRecord._id,
          prediction_time: predictionRecord.createdAt,
          prediction_timestamp: predictionRecord.metadata.predictionTimestamp,
          model_version: '1.0.0'
        }
      }
    });

  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({
      success: false,
      error: 'Prediction failed',
      message: error.message
    });
  }
};

// @desc    Get user's prediction history
// @route   GET /api/predict/history
// @access  Private
exports.getUserHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const predictions = await Prediction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-inputData'); // Exclude detailed input data for list view

    const total = await Prediction.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      count: predictions.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      predictions: predictions.map(pred => ({
        id: pred._id,
        uuid: pred.predictionUuid,
        patient_id: pred.patientId,
        disease: pred.prediction.disease,
        risk_level: pred.prediction.riskLevel,
        timestamp: pred.createdAt,
        blockchain_hash: pred.blockchain.blockHash
      }))
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve history',
      message: error.message
    });
  }
};

// @desc    Get predictions for a specific patient
// @route   GET /api/predict/patient/:patientId
// @access  Private
exports.getPatientPredictions = async (req, res) => {
  try {
    const { patientId } = req.params;

    const predictions = await Prediction.find({
      patientId,
      userId: req.user._id
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      patient_id: patientId,
      total_predictions: predictions.length,
      predictions: predictions.map(pred => ({
        id: pred._id,
        uuid: pred.predictionUuid,
        disease: pred.prediction.disease,
        risk_level: pred.prediction.riskLevel,
        important_features: pred.prediction.importantFeatures,
        timestamp: pred.createdAt,
        hashes: {
          prediction_hash: pred.predictionHash,
          timestamp_hash: pred.timestampHash,
          blockchain_hash: pred.blockchain.blockHash
        }
      }))
    });
  } catch (error) {
    console.error('Get patient predictions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve patient predictions',
      message: error.message
    });
  }
};

// @desc    Get specific prediction by ID or UUID
// @route   GET /api/predict/:id
// @access  Private
exports.getPredictionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to find by MongoDB ID or UUID
    const prediction = await Prediction.findOne({
      $or: [
        { _id: id },
        { predictionUuid: id }
      ],
      userId: req.user._id
    });

    if (!prediction) {
      return res.status(404).json({
        success: false,
        error: 'Prediction not found'
      });
    }

    // Verify integrity
    const integrity = prediction.verifyIntegrity();

    res.json({
      success: true,
      prediction: {
        id: prediction._id,
        uuid: prediction.predictionUuid,
        patient_id: prediction.patientId,
        input_data: prediction.inputData,
        prediction: prediction.prediction,
        hashes: {
          patient_id_hash: prediction.patientIdHash,
          prediction_hash: prediction.predictionHash,
          timestamp_hash: prediction.timestampHash
        },
        blockchain: prediction.blockchain,
        metadata: prediction.metadata,
        integrity_check: integrity,
        created_at: prediction.createdAt
      }
    });
  } catch (error) {
    console.error('Get prediction error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve prediction',
      message: error.message
    });
  }
};

// @desc    Verify prediction integrity
// @route   POST /api/predict/verify/:id
// @access  Private
exports.verifyPrediction = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Verifying prediction:', id);
    
    const prediction = await Prediction.findOne({
      $or: [
        { _id: id },
        { predictionUuid: id }
      ],
      userId: req.user._id
    });

    if (!prediction) {
      console.log('Prediction not found for id:', id);
      return res.status(404).json({
        success: false,
        error: 'Prediction not found'
      });
    }

    console.log('Found prediction:', {
      uuid: prediction.predictionUuid,
      patientId: prediction.patientId,
      disease: prediction.prediction.disease,
      createdAt: prediction.createdAt,
      hasHashes: {
        patientIdHash: !!prediction.patientIdHash,
        predictionHash: !!prediction.predictionHash,
        timestampHash: !!prediction.timestampHash
      }
    });

    const integrity = prediction.verifyIntegrity();
    
    console.log('Verification result:', integrity);

    // Add helpful message for old predictions
    let errorMessage = integrity.error;
    if (!integrity.valid && errorMessage) {
      errorMessage += '. Note: Predictions created before schema updates may not verify. Try creating a new prediction to test current verification.';
    }

    res.json({
      success: true,
      prediction_uuid: prediction.predictionUuid,
      patient_id: prediction.patientId,
      integrity_check: {
        valid: integrity.valid,
        error: errorMessage
      },
      hashes: {
        patient_id_hash: prediction.patientIdHash,
        prediction_hash: prediction.predictionHash,
        timestamp_hash: prediction.timestampHash,
        blockchain_hash: prediction.blockchain.blockHash
      },
      verified_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Verify prediction error:', error);
    res.status(500).json({
      success: false,
      error: 'Verification failed',
      message: error.message
    });
  }
};