// routes/blockchainRoutes.js
const express = require('express');
const router = express.Router();
const blockchainController = require('../controllers/blockchainController');
const authMiddleware = require('../middleware/authMiddleware');

// All blockchain routes require authentication
router.use(authMiddleware);

// GET /api/blockchain/latest - Get latest block
router.get('/latest', blockchainController.getLatestBlock);

// GET /api/blockchain/full - Get entire blockchain
router.get('/full', blockchainController.getFullChain);

// GET /api/blockchain/patient/:id - Get patient blockchain history
router.get('/patient/:id', blockchainController.getPatientChain);

// POST /api/blockchain/validate - Validate blockchain integrity
router.post('/validate', blockchainController.validateChain);

// GET /api/blockchain/stats - Get blockchain statistics
router.get('/stats', blockchainController.getChainStats);

// GET /api/blockchain/block/:hash - Get block by hash
router.get('/block/:hash', blockchainController.getBlockByHash);

module.exports = router;