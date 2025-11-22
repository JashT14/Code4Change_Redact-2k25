// controllers/featureController.js
const MLPredictor = require('../utils/mlPredictor');

// Initialize ML predictor
const mlPredictor = new MLPredictor();

// @desc    Get feature information
// @route   GET /api/features/info
// @access  Private
exports.getFeatureInfo = async (req, res) => {
  try {
    const featureInfo = mlPredictor.getFeatureInfo();
    
    res.json({
      success: true,
      model_info: {
        version: '1.0.0',
        type: 'Multi-disease classifier',
        algorithm: 'Weighted Feature Scoring'
      },
      features: featureInfo
    });
  } catch (error) {
    console.error('Get feature info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve feature information',
      message: error.message
    });
  }
};

// @desc    Get feature ranges for validation
// @route   GET /api/features/ranges
// @access  Private
exports.getFeatureRanges = async (req, res) => {
  try {
    const featureRanges = mlPredictor.featureRanges;
    
    // Organize by category
    const categorizedRanges = {
      'Blood Sugar & Metabolic': {
        glucose: featureRanges.glucose,
        insulin: featureRanges.insulin,
        hba1c: featureRanges.hba1c,
        bmi: featureRanges.bmi
      },
      'Lipid Panel': {
        cholesterol: featureRanges.cholesterol,
        triglycerides: featureRanges.triglycerides,
        ldl_cholesterol: featureRanges.ldl_cholesterol,
        hdl_cholesterol: featureRanges.hdl_cholesterol
      },
      'Complete Blood Count': {
        hemoglobin: featureRanges.hemoglobin,
        platelets: featureRanges.platelets,
        white_blood_cells: featureRanges.white_blood_cells,
        red_blood_cells: featureRanges.red_blood_cells,
        hematocrit: featureRanges.hematocrit,
        mean_corpuscular_volume: featureRanges.mean_corpuscular_volume,
        mean_corpuscular_hemoglobin: featureRanges.mean_corpuscular_hemoglobin,
        mean_corpuscular_hemoglobin_concentration: featureRanges.mean_corpuscular_hemoglobin_concentration
      },
      'Cardiovascular': {
        systolic_blood_pressure: featureRanges.systolic_blood_pressure,
        diastolic_blood_pressure: featureRanges.diastolic_blood_pressure,
        heart_rate: featureRanges.heart_rate,
        troponin: featureRanges.troponin
      },
      'Liver Function': {
        alt: featureRanges.alt,
        ast: featureRanges.ast
      },
      'Kidney Function': {
        creatinine: featureRanges.creatinine
      },
      'Inflammation': {
        c_reactive_protein: featureRanges.c_reactive_protein
      }
    };
    
    res.json({
      success: true,
      total_features: Object.keys(featureRanges).length,
      feature_ranges: categorizedRanges,
      raw_ranges: featureRanges
    });
  } catch (error) {
    console.error('Get feature ranges error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve feature ranges',
      message: error.message
    });
  }
};

// @desc    Get supported diseases
// @route   GET /api/features/diseases
// @access  Private
exports.getSupportedDiseases = async (req, res) => {
  try {
    const diseases = Object.keys(mlPredictor.diseaseModels);
    
    const diseaseDetails = diseases.map(disease => {
      const model = mlPredictor.diseaseModels[disease];
      return {
        name: disease,
        threshold: model.threshold,
        key_features: Object.keys(model.weights),
        feature_count: Object.keys(model.weights).length
      };
    });
    
    res.json({
      success: true,
      total_diseases: diseases.length,
      diseases: diseaseDetails
    });
  } catch (error) {
    console.error('Get supported diseases error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve supported diseases',
      message: error.message
    });
  }
};