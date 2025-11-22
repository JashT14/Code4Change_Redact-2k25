// routes/featureRoutes.js
const express = require('express');
const router = express.Router();

// GET /api/features/info - Get ML model feature information
router.get('/info', (req, res) => {
  res.json({
    success: true,
    data: {
      features: [
        'glucose',
        'cholesterol',
        'hemoglobin',
        'platelets',
        'white_blood_cells',
        'red_blood_cells',
        'hematocrit',
        'mean_corpuscular_volume',
        'mean_corpuscular_hemoglobin',
        'mean_corpuscular_hemoglobin_concentration',
        'insulin',
        'bmi',
        'systolic_blood_pressure',
        'diastolic_blood_pressure',
        'triglycerides',
        'hba1c',
        'ldl_cholesterol',
        'hdl_cholesterol',
        'alt',
        'ast',
        'heart_rate',
        'creatinine',
        'troponin',
        'c_reactive_protein'
      ],
      count: 24,
      description: 'Medical parameters used for disease prediction'
    }
  });
});

module.exports = router;
