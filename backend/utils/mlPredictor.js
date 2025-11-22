// utils/mlPredictor.js
class MLPredictor {
  constructor() {
    // Feature scaling parameters (min-max normalization)
    this.featureRanges = {
      // Blood Sugar & Metabolic
      glucose: { min: 0, max: 300 },
      insulin: { min: 0, max: 900 },
      hba1c: { min: 4, max: 14 },
      bmi: { min: 10, max: 60 },
      
      // Lipid Panel
      cholesterol: { min: 100, max: 400 },
      triglycerides: { min: 30, max: 500 },
      ldl_cholesterol: { min: 50, max: 300 },
      hdl_cholesterol: { min: 20, max: 100 },
      
      // Complete Blood Count (CBC)
      hemoglobin: { min: 5, max: 20 },
      platelets: { min: 50, max: 500 },
      white_blood_cells: { min: 2, max: 20 },
      red_blood_cells: { min: 3, max: 7 },
      hematocrit: { min: 20, max: 60 },
      mean_corpuscular_volume: { min: 60, max: 110 },
      mean_corpuscular_hemoglobin: { min: 20, max: 40 },
      mean_corpuscular_hemoglobin_concentration: { min: 28, max: 38 },
      
      // Cardiovascular
      systolic_blood_pressure: { min: 70, max: 220 },
      diastolic_blood_pressure: { min: 40, max: 140 },
      heart_rate: { min: 40, max: 200 },
      troponin: { min: 0, max: 50 },
      
      // Liver Function
      alt: { min: 0, max: 200 },
      ast: { min: 0, max: 200 },
      
      // Kidney Function
      creatinine: { min: 0.5, max: 10 },
      
      // Inflammation
      c_reactive_protein: { min: 0, max: 50 }
    };

    // Enhanced disease models with more features
    this.diseaseModels = {
      'Diabetes Type 2': {
        weights: {
          glucose: 0.25,
          hba1c: 0.25,
          insulin: 0.15,
          bmi: 0.15,
          triglycerides: 0.1,
          hdl_cholesterol: 0.05,
          systolic_blood_pressure: 0.05
        },
        threshold: 0.6
      },
      'Heart Disease': {
        weights: {
          troponin: 0.25,
          cholesterol: 0.15,
          ldl_cholesterol: 0.15,
          systolic_blood_pressure: 0.15,
          diastolic_blood_pressure: 0.1,
          heart_rate: 0.1,
          c_reactive_protein: 0.1
        },
        threshold: 0.65
      },
      'Hypertension': {
        weights: {
          systolic_blood_pressure: 0.35,
          diastolic_blood_pressure: 0.25,
          bmi: 0.15,
          cholesterol: 0.1,
          heart_rate: 0.1,
          creatinine: 0.05
        },
        threshold: 0.55
      },
      'Metabolic Syndrome': {
        weights: {
          glucose: 0.2,
          bmi: 0.2,
          triglycerides: 0.15,
          hdl_cholesterol: 0.15,
          systolic_blood_pressure: 0.15,
          hba1c: 0.1,
          insulin: 0.05
        },
        threshold: 0.6
      },
      'Anemia': {
        weights: {
          hemoglobin: 0.35,
          red_blood_cells: 0.2,
          hematocrit: 0.2,
          mean_corpuscular_volume: 0.1,
          mean_corpuscular_hemoglobin: 0.1,
          mean_corpuscular_hemoglobin_concentration: 0.05
        },
        threshold: 0.55
      },
      'Liver Disease': {
        weights: {
          alt: 0.3,
          ast: 0.3,
          cholesterol: 0.15,
          triglycerides: 0.15,
          platelets: 0.1
        },
        threshold: 0.6
      },
      'Kidney Disease': {
        weights: {
          creatinine: 0.4,
          systolic_blood_pressure: 0.2,
          diastolic_blood_pressure: 0.15,
          hemoglobin: 0.15,
          glucose: 0.1
        },
        threshold: 0.6
      },
      'Thrombocytopenia': {
        weights: {
          platelets: 0.5,
          white_blood_cells: 0.2,
          hemoglobin: 0.15,
          hematocrit: 0.15
        },
        threshold: 0.6
      },
      'Inflammation/Infection': {
        weights: {
          c_reactive_protein: 0.3,
          white_blood_cells: 0.3,
          heart_rate: 0.15,
          platelets: 0.15,
          hemoglobin: 0.1
        },
        threshold: 0.6
      }
    };
  }

  scaleFeature(value, featureName) {
    const range = this.featureRanges[featureName];
    if (!range) return value / 100; // Default scaling
    
    // Clamp value between min and max
    const clampedValue = Math.max(range.min, Math.min(range.max, value));
    return (clampedValue - range.min) / (range.max - range.min);
  }

  predict(inputData) {
    // Scale all input features
    const scaledData = {};
    Object.keys(inputData).forEach(key => {
      if (key !== 'patient_id') {
        scaledData[key] = this.scaleFeature(inputData[key], key);
      }
    });

    // Calculate scores for each disease
    const scores = {};
    const featureImportance = {};

    Object.entries(this.diseaseModels).forEach(([disease, model]) => {
      let score = 0;
      const importance = {};

      Object.entries(model.weights).forEach(([feature, weight]) => {
        const featureValue = scaledData[feature] || 0;
        const contribution = featureValue * weight;
        score += contribution;
        importance[feature] = contribution;
      });

      scores[disease] = Math.min(score, 1); // Cap at 1.0
      featureImportance[disease] = importance;
    });

    // Find the disease with highest score
    let predictedDisease = 'Healthy';
    let maxScore = 0;

    Object.entries(scores).forEach(([disease, score]) => {
      if (score > maxScore && score > this.diseaseModels[disease].threshold) {
        maxScore = score;
        predictedDisease = disease;
      }
    });

    // Get top 5 important features for the predicted disease
    let importantFeatures = [];
    if (predictedDisease !== 'Healthy') {
      const importance = featureImportance[predictedDisease];
      importantFeatures = Object.entries(importance)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([feature]) => {
          // Convert snake_case to Title Case
          return feature
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        });
    }

    return {
      disease: predictedDisease,
      confidence: parseFloat((maxScore * 100).toFixed(2)),
      important_features: importantFeatures,
      all_scores: Object.fromEntries(
        Object.entries(scores).map(([k, v]) => [k, parseFloat((v * 100).toFixed(2))])
      )
    };
  }

  // Get feature information
  getFeatureInfo() {
    return {
      total_features: Object.keys(this.featureRanges).length,
      features: Object.keys(this.featureRanges),
      feature_ranges: this.featureRanges,
      supported_diseases: Object.keys(this.diseaseModels)
    };
  }
}

module.exports = MLPredictor;