// // server.js
// const express = require('express');
// const cors = require('cors');
// const crypto = require('crypto');

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cors());
// app.use(express.json());

// // ========================
// // BLOCKCHAIN IMPLEMENTATION
// // ========================

// class Block {
//   constructor(timestamp, patientId, prediction, confidence, importantFeatures, prevHash = '') {
//     this.timestamp = timestamp;
//     this.patient_id = patientId;
//     this.prediction = prediction;
//     this.confidence = confidence;
//     this.important_features = importantFeatures;
//     this.prev_hash = prevHash;
//     this.hash = this.calculateHash();
//   }

//   calculateHash() {
//     const data = JSON.stringify({
//       timestamp: this.timestamp,
//       patient_id: this.patient_id,
//       prediction: this.prediction,
//       confidence: this.confidence,
//       important_features: this.important_features,
//       prev_hash: this.prev_hash
//     });
//     return crypto.createHash('sha256').update(data).digest('hex');
//   }
// }

// class Blockchain {
//   constructor() {
//     this.chain = [this.createGenesisBlock()];
//   }

//   createGenesisBlock() {
//     return new Block(
//       Date.now(),
//       'GENESIS',
//       'NONE',
//       0,
//       [],
//       '0'
//     );
//   }

//   getLatestBlock() {
//     return this.chain[this.chain.length - 1];
//   }

//   addBlock(patientId, prediction, confidence, importantFeatures) {
//     const prevBlock = this.getLatestBlock();
//     const newBlock = new Block(
//       Date.now(),
//       patientId,
//       prediction,
//       confidence,
//       importantFeatures,
//       prevBlock.hash
//     );
//     this.chain.push(newBlock);
//     return newBlock;
//   }

//   validateChain() {
//     for (let i = 1; i < this.chain.length; i++) {
//       const currentBlock = this.chain[i];
//       const prevBlock = this.chain[i - 1];

//       if (currentBlock.hash !== currentBlock.calculateHash()) {
//         return false;
//       }

//       if (currentBlock.prev_hash !== prevBlock.hash) {
//         return false;
//       }
//     }
//     return true;
//   }
// }

// // Initialize blockchain
// const mediguardChain = new Blockchain();

// // ========================
// // ML MODEL SIMULATION
// // ========================

// class MLPredictor {
//   constructor() {
//     // Feature scaling parameters (min-max normalization)
//     this.featureRanges = {
//       glucose: { min: 0, max: 200 },
//       bmi: { min: 10, max: 60 },
//       blood_pressure: { min: 40, max: 200 },
//       insulin: { min: 0, max: 900 },
//       age: { min: 18, max: 100 },
//       heart_rate: { min: 40, max: 200 },
//       cholesterol: { min: 100, max: 400 },
//       troponin: { min: 0, max: 50 }
//     };

//     // Disease thresholds (simulated ML model)
//     this.diseaseModels = {
//       'Diabetes': {
//         weights: { glucose: 0.4, bmi: 0.25, insulin: 0.2, age: 0.15 },
//         threshold: 0.6
//       },
//       'Heart Disease': {
//         weights: { blood_pressure: 0.3, cholesterol: 0.25, troponin: 0.3, heart_rate: 0.15 },
//         threshold: 0.65
//       },
//       'Hypertension': {
//         weights: { blood_pressure: 0.5, bmi: 0.2, age: 0.2, cholesterol: 0.1 },
//         threshold: 0.55
//       },
//       'Metabolic Syndrome': {
//         weights: { glucose: 0.25, bmi: 0.3, blood_pressure: 0.25, cholesterol: 0.2 },
//         threshold: 0.6
//       }
//     };
//   }

//   scaleFeature(value, featureName) {
//     const range = this.featureRanges[featureName];
//     if (!range) return value / 100; // Default scaling
//     return (value - range.min) / (range.max - range.min);
//   }

//   predict(inputData) {
//     // Scale all input features
//     const scaledData = {};
//     Object.keys(inputData).forEach(key => {
//       if (key !== 'patient_id') {
//         scaledData[key] = this.scaleFeature(inputData[key], key);
//       }
//     });

//     // Calculate scores for each disease
//     const scores = {};
//     const featureImportance = {};

//     Object.entries(this.diseaseModels).forEach(([disease, model]) => {
//       let score = 0;
//       const importance = {};

//       Object.entries(model.weights).forEach(([feature, weight]) => {
//         const featureValue = scaledData[feature] || 0;
//         const contribution = featureValue * weight;
//         score += contribution;
//         importance[feature] = contribution;
//       });

//       scores[disease] = Math.min(score, 1); // Cap at 1.0
//       featureImportance[disease] = importance;
//     });

//     // Find the disease with highest score
//     let predictedDisease = 'Healthy';
//     let maxScore = 0;

//     Object.entries(scores).forEach(([disease, score]) => {
//       if (score > maxScore && score > this.diseaseModels[disease].threshold) {
//         maxScore = score;
//         predictedDisease = disease;
//       }
//     });

//     // Get top 3 important features for the predicted disease
//     let importantFeatures = [];
//     if (predictedDisease !== 'Healthy') {
//       const importance = featureImportance[predictedDisease];
//       importantFeatures = Object.entries(importance)
//         .sort((a, b) => b[1] - a[1])
//         .slice(0, 3)
//         .map(([feature]) => feature.charAt(0).toUpperCase() + feature.slice(1));
//     }

//     return {
//       disease: predictedDisease,
//       confidence: parseFloat((maxScore * 100).toFixed(2)),
//       important_features: importantFeatures,
//       all_scores: Object.fromEntries(
//         Object.entries(scores).map(([k, v]) => [k, parseFloat((v * 100).toFixed(2))])
//       )
//     };
//   }
// }

// const mlPredictor = new MLPredictor();

// // ========================
// // API ROUTES
// // ========================

// // Health check
// app.get('/health', (req, res) => {
//   res.json({
//     status: 'healthy',
//     timestamp: new Date().toISOString(),
//     blockchain_length: mediguardChain.chain.length,
//     blockchain_valid: mediguardChain.validateChain()
//   });
// });

// // POST /predict - Main prediction endpoint
// app.post('/predict', (req, res) => {
//   try {
//     const {
//       patient_id,
//       glucose,
//       bmi,
//       blood_pressure,
//       insulin,
//       age,
//       heart_rate,
//       cholesterol,
//       troponin
//     } = req.body;

//     // Validation
//     if (!patient_id) {
//       return res.status(400).json({
//         error: 'patient_id is required'
//       });
//     }

//     // Prepare input data
//     const inputData = {
//       patient_id,
//       glucose: glucose || 0,
//       bmi: bmi || 0,
//       blood_pressure: blood_pressure || 0,
//       insulin: insulin || 0,
//       age: age || 0,
//       heart_rate: heart_rate || 0,
//       cholesterol: cholesterol || 0,
//       troponin: troponin || 0
//     };

//     // Get ML prediction
//     const prediction = mlPredictor.predict(inputData);

//     // Add to blockchain
//     const block = mediguardChain.addBlock(
//       patient_id,
//       prediction.disease,
//       prediction.confidence,
//       prediction.important_features
//     );

//     // Return response
//     res.json({
//       success: true,
//       patient_id,
//       prediction: {
//         disease: prediction.disease,
//         confidence: prediction.confidence,
//         important_features: prediction.important_features,
//         all_disease_scores: prediction.all_scores
//       },
//       blockchain: {
//         block_hash: block.hash,
//         timestamp: block.timestamp,
//         prev_hash: block.prev_hash
//       },
//       metadata: {
//         prediction_time: new Date().toISOString(),
//         model_version: '1.0.0'
//       }
//     });

//   } catch (error) {
//     console.error('Prediction error:', error);
//     res.status(500).json({
//       error: 'Internal server error',
//       message: error.message
//     });
//   }
// });

// // GET /blockchain/latest - Get latest block
// app.get('/blockchain/latest', (req, res) => {
//   try {
//     const latestBlock = mediguardChain.getLatestBlock();
//     res.json({
//       success: true,
//       latest_block: {
//         hash: latestBlock.hash,
//         timestamp: latestBlock.timestamp,
//         patient_id: latestBlock.patient_id,
//         prediction: latestBlock.prediction,
//         confidence: latestBlock.confidence,
//         important_features: latestBlock.important_features,
//         prev_hash: latestBlock.prev_hash
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       error: 'Failed to retrieve latest block',
//       message: error.message
//     });
//   }
// });

// // GET /blockchain/full - Get entire blockchain
// app.get('/blockchain/full', (req, res) => {
//   try {
//     res.json({
//       success: true,
//       chain_length: mediguardChain.chain.length,
//       is_valid: mediguardChain.validateChain(),
//       chain: mediguardChain.chain.map(block => ({
//         timestamp: block.timestamp,
//         patient_id: block.patient_id,
//         prediction: block.prediction,
//         confidence: block.confidence,
//         important_features: block.important_features,
//         prev_hash: block.prev_hash,
//         hash: block.hash
//       }))
//     });
//   } catch (error) {
//     res.status(500).json({
//       error: 'Failed to retrieve blockchain',
//       message: error.message
//     });
//   }
// });

// // GET /blockchain/patient/:id - Get patient history
// app.get('/blockchain/patient/:id', (req, res) => {
//   try {
//     const patientId = req.params.id;
//     const patientBlocks = mediguardChain.chain.filter(
//       block => block.patient_id === patientId
//     );

//     res.json({
//       success: true,
//       patient_id: patientId,
//       total_predictions: patientBlocks.length,
//       history: patientBlocks.map(block => ({
//         timestamp: block.timestamp,
//         prediction: block.prediction,
//         confidence: block.confidence,
//         important_features: block.important_features,
//         hash: block.hash
//       }))
//     });
//   } catch (error) {
//     res.status(500).json({
//       error: 'Failed to retrieve patient history',
//       message: error.message
//     });
//   }
// });

// // POST /blockchain/validate - Validate blockchain integrity
// app.post('/blockchain/validate', (req, res) => {
//   try {
//     const isValid = mediguardChain.validateChain();
//     res.json({
//       success: true,
//       is_valid: isValid,
//       chain_length: mediguardChain.chain.length,
//       message: isValid ? 'Blockchain is valid' : 'Blockchain integrity compromised'
//     });
//   } catch (error) {
//     res.status(500).json({
//       error: 'Validation failed',
//       message: error.message
//     });
//   }
// });

// // GET /features/info - Get feature scaling info
// app.get('/features/info', (req, res) => {
//   res.json({
//     success: true,
//     feature_ranges: mlPredictor.featureRanges,
//     supported_diseases: Object.keys(mlPredictor.diseaseModels),
//     model_info: {
//       version: '1.0.0',
//       type: 'Multi-disease classifier',
//       features: Object.keys(mlPredictor.featureRanges)
//     }
//   });
// });

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({
//     error: 'Endpoint not found',
//     available_endpoints: [
//       'GET /health',
//       'POST /predict',
//       'GET /blockchain/latest',
//       'GET /blockchain/full',
//       'GET /blockchain/patient/:id',
//       'POST /blockchain/validate',
//       'GET /features/info'
//     ]
//   });
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`🚀 MediGuard AI Server running on port ${PORT}`);
//   console.log(`📊 Health check: http://localhost:${PORT}/health`);
//   console.log(`🔗 Blockchain initialized with genesis block`);
// });

// module.exports = app;



// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();

// Configure CORS to allow frontend and Flask ML API
const corsOptions = {
  origin: [
    'http://localhost:5173',     // Frontend Vite dev server
    'http://127.0.0.1:5173',
    'http://localhost:5000',     // Flask ML API
    'http://127.0.0.1:5000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Import routes
const authRoutes = require('./routes/authRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const blockchainRoutes = require('./routes/blockchainRoutes');
const featureRoutes = require('./routes/featureRoutes');

// Import OCR module
const { upload, createOCRRoute } = require('./ocr');

// Route middlewares
app.use('/api/auth', authRoutes);
app.use('/api/predict', predictionRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/features', featureRoutes);

// OCR route
app.post('/api/ocr', upload.single('file'), createOCRRoute());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    available_endpoints: [
      'GET /health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/profile',
      'POST /api/predict',
      'GET /api/blockchain/latest',
      'GET /api/blockchain/full',
      'GET /api/blockchain/patient/:id',
      'POST /api/blockchain/validate',
      'GET /api/features/info'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('='+ '='.repeat(60));
  console.log(`🚀 MediGuard AI Backend Server running on port ${PORT}`);
  console.log(`📊Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Blockchain initialized`);
  console.log(`🤖 ML API: http://127.0.0.1:5000/predict`);
  console.log(`📡 Frontend: http://localhost:5173`);
  console.log('='+ '='.repeat(60));
});

module.exports = app;