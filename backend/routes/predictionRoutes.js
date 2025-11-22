// routes/predictionRoutes.js
const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');
const authMiddleware = require('../middleware/authMiddleware');

// All prediction routes require authentication
router.use(authMiddleware);

// POST /api/predict - Make a prediction
router.post('/', predictionController.makePrediction);

// GET /api/predict/history - Get user's prediction history
router.get('/history', predictionController.getUserHistory);

// GET /api/predict/patient/:patientId - Get specific patient predictions
router.get('/patient/:patientId', predictionController.getPatientPredictions);

// POST /api/predict/verify/:id - Verify prediction integrity
router.post('/verify/:id', predictionController.verifyPrediction);

// GET /api/predict/:id - Get specific prediction by ID or UUID
router.get('/:id', predictionController.getPredictionById);

module.exports = router;