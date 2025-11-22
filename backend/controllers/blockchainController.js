// controllers/blockchainController.js
const Blockchain = require('../utils/blockchain');

// Initialize blockchain (singleton)
const blockchain = new Blockchain();

// @desc    Get latest block
// @route   GET /api/blockchain/latest
// @access  Private
exports.getLatestBlock = async (req, res) => {
  try {
    const latestBlock = blockchain.getLatestBlock();
    
    res.json({
      success: true,
      latest_block: {
        hash: latestBlock.hash,
        timestamp: latestBlock.timestamp,
        patient_id: latestBlock.patient_id,
        prediction: latestBlock.prediction,
        confidence: latestBlock.confidence,
        important_features: latestBlock.important_features,
        prev_hash: latestBlock.prev_hash,
        nonce: latestBlock.nonce
      }
    });
  } catch (error) {
    console.error('Get latest block error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve latest block',
      message: error.message
    });
  }
};

// @desc    Get entire blockchain
// @route   GET /api/blockchain/full
// @access  Private
exports.getFullChain = async (req, res) => {
  try {
    const validation = blockchain.validateChain();
    
    res.json({
      success: true,
      chain_length: blockchain.chain.length,
      is_valid: validation.valid,
      validation_message: validation.error || 'Blockchain is valid',
      chain: blockchain.chain.map((block, index) => ({
        index,
        timestamp: block.timestamp,
        patient_id: block.patient_id,
        prediction: block.prediction,
        confidence: block.confidence,
        important_features: block.important_features,
        prev_hash: block.prev_hash,
        hash: block.hash,
        nonce: block.nonce
      }))
    });
  } catch (error) {
    console.error('Get full chain error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve blockchain',
      message: error.message
    });
  }
};

// @desc    Get patient blockchain history
// @route   GET /api/blockchain/patient/:id
// @access  Private
exports.getPatientChain = async (req, res) => {
  try {
    const patientId = req.params.id;
    const patientBlocks = blockchain.getBlocksByPatientId(patientId);

    res.json({
      success: true,
      patient_id: patientId,
      total_predictions: patientBlocks.length,
      history: patientBlocks.map(block => ({
        timestamp: block.timestamp,
        prediction: block.prediction,
        confidence: block.confidence,
        important_features: block.important_features,
        hash: block.hash,
        prev_hash: block.prev_hash
      }))
    });
  } catch (error) {
    console.error('Get patient chain error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve patient history',
      message: error.message
    });
  }
};

// @desc    Validate blockchain integrity
// @route   POST /api/blockchain/validate
// @access  Private
exports.validateChain = async (req, res) => {
  try {
    const validation = blockchain.validateChain();
    
    res.json({
      success: true,
      is_valid: validation.valid,
      chain_length: blockchain.chain.length,
      message: validation.valid ? 'Blockchain is valid' : validation.error,
      error_block_index: validation.blockIndex || null,
      validated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Validate chain error:', error);
    res.status(500).json({
      success: false,
      error: 'Validation failed',
      message: error.message
    });
  }
};

// @desc    Get blockchain statistics
// @route   GET /api/blockchain/stats
// @access  Private
exports.getChainStats = async (req, res) => {
  try {
    const stats = blockchain.getChainStats();
    
    res.json({
      success: true,
      statistics: {
        total_blocks: stats.totalBlocks,
        difficulty: stats.difficulty,
        is_valid: stats.isValid,
        latest_block_hash: stats.latestBlock.hash,
        latest_block_timestamp: stats.latestBlock.timestamp,
        genesis_block_hash: blockchain.chain[0].hash
      }
    });
  } catch (error) {
    console.error('Get chain stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve statistics',
      message: error.message
    });
  }
};

// @desc    Get block by hash
// @route   GET /api/blockchain/block/:hash
// @access  Private
exports.getBlockByHash = async (req, res) => {
  try {
    const { hash } = req.params;
    const block = blockchain.getBlockByHash(hash);

    if (!block) {
      return res.status(404).json({
        success: false,
        error: 'Block not found'
      });
    }

    res.json({
      success: true,
      block: {
        timestamp: block.timestamp,
        patient_id: block.patient_id,
        prediction: block.prediction,
        confidence: block.confidence,
        important_features: block.important_features,
        prev_hash: block.prev_hash,
        hash: block.hash,
        nonce: block.nonce
      }
    });
  } catch (error) {
    console.error('Get block by hash error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve block',
      message: error.message
    });
  }
};