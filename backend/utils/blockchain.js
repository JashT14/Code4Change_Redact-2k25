// utils/blockchain.js
const crypto = require('crypto');

class Block {
  constructor(timestamp, patientId, prediction, importantFeatures, prevHash = '') {
    this.timestamp = timestamp;
    this.patient_id = patientId;
    this.prediction = prediction;
    this.important_features = importantFeatures;
    this.prev_hash = prevHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    const data = JSON.stringify({
      timestamp: this.timestamp,
      patient_id: this.patient_id,
      prediction: this.prediction,
      important_features: this.important_features,
      prev_hash: this.prev_hash,
      nonce: this.nonce
    });
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  mineBlock(difficulty) {
    const target = Array(difficulty + 1).join('0');
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2; // Mining difficulty
  }

  createGenesisBlock() {
    return new Block(
      Date.now(),
      'GENESIS',
      'NONE',
      [],
      '0'
    );
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(patientId, prediction, importantFeatures) {
    const prevBlock = this.getLatestBlock();
    const newBlock = new Block(
      Date.now(),
      patientId,
      prediction,
      importantFeatures,
      prevBlock.hash
    );
    
    // Mine the block
    newBlock.mineBlock(this.difficulty);
    
    this.chain.push(newBlock);
    return newBlock;
  }

  validateChain() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const prevBlock = this.chain[i - 1];

      // Recalculate hash to verify integrity
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return {
          valid: false,
          error: `Block ${i} has been tampered with`,
          blockIndex: i
        };
      }

      // Verify chain linkage
      if (currentBlock.prev_hash !== prevBlock.hash) {
        return {
          valid: false,
          error: `Block ${i} is not properly linked to previous block`,
          blockIndex: i
        };
      }
    }
    return { valid: true };
  }

  getBlockByHash(hash) {
    return this.chain.find(block => block.hash === hash);
  }

  getBlocksByPatientId(patientId) {
    return this.chain.filter(block => block.patient_id === patientId);
  }

  getChainStats() {
    return {
      totalBlocks: this.chain.length,
      difficulty: this.difficulty,
      latestBlock: this.getLatestBlock(),
      isValid: this.validateChain().valid
    };
  }
}

module.exports = Blockchain;