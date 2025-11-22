// api.js - Standalone Node.js API Client for MediGuard AI
// Run directly with: node api.js

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

// Create simple axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

// --------------------------------------------
// API SERVICE METHODS
// --------------------------------------------
const MediGuardAPI = {
  // Health Check
  healthCheck: async () => {
    try {
      const response = await apiClient.get('/health');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  // Predict Disease (All 24 parameters)
  predictDisease: async (patientData) => {
    try {
      const response = await apiClient.post('/predict', {
        patient_id: patientData.patientId,
        glucose: parseFloat(patientData.glucose) || 0,
        cholesterol: parseFloat(patientData.cholesterol) || 0,
        hemoglobin: parseFloat(patientData.hemoglobin) || 0,
        platelets: parseFloat(patientData.platelets) || 0,
        white_blood_cells: parseFloat(patientData.whiteBloodCells) || 0,
        red_blood_cells: parseFloat(patientData.redBloodCells) || 0,
        hematocrit: parseFloat(patientData.hematocrit) || 0,
        mean_corpuscular_volume: parseFloat(patientData.meanCorpuscularVolume) || 0,
        mean_corpuscular_hemoglobin: parseFloat(patientData.meanCorpuscularHemoglobin) || 0,
        mean_corpuscular_hemoglobin_concentration: parseFloat(patientData.meanCorpuscularHemoglobinConcentration) || 0,
        insulin: parseFloat(patientData.insulin) || 0,
        bmi: parseFloat(patientData.bmi) || 0,
        systolic_blood_pressure: parseFloat(patientData.systolicBloodPressure) || 0,
        diastolic_blood_pressure: parseFloat(patientData.diastolicBloodPressure) || 0,
        triglycerides: parseFloat(patientData.triglycerides) || 0,
        hba1c: parseFloat(patientData.hba1c) || 0,
        ldl_cholesterol: parseFloat(patientData.ldlCholesterol) || 0,
        hdl_cholesterol: parseFloat(patientData.hdlCholesterol) || 0,
        alt: parseFloat(patientData.alt) || 0,
        ast: parseFloat(patientData.ast) || 0,
        heart_rate: parseFloat(patientData.heartRate) || 0,
        creatinine: parseFloat(patientData.creatinine) || 0,
        troponin: parseFloat(patientData.troponin) || 0,
        c_reactive_protein: parseFloat(patientData.cReactiveProtein) || 0
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  // Get Latest Block
  getLatestBlock: async () => {
    try {
      const response = await apiClient.get('/blockchain/latest');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  // Full Blockchain
  getFullBlockchain: async () => {
    try {
      const response = await apiClient.get('/blockchain/full');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  // Patient History
  getPatientHistory: async (patientId) => {
    try {
      const response = await apiClient.get(`/blockchain/patient/${patientId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  // Validate Blockchain
  validateBlockchain: async () => {
    try {
      const response = await apiClient.post('/blockchain/validate');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  // ML Feature Info
  getFeaturesInfo: async () => {
    try {
      const response = await apiClient.get('/features/info');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }
};

// --------------------------------------------------
// TEST RUNNER (Executes when you run: node api.js)
// --------------------------------------------------
const runDemo = async () => {
  console.log("\n=== MediGuard AI API Client ===\n");

  console.log("→ Checking API Health...");
  console.log(await MediGuardAPI.healthCheck());

  console.log("\n→ Predicting Disease (Sample Data with all 24 parameters)...");
  console.log(await MediGuardAPI.predictDisease({
    patientId: "P001",
    glucose: 120,
    cholesterol: 200,
    hemoglobin: 14.5,
    platelets: 250000,
    whiteBloodCells: 7000,
    redBloodCells: 5.0,
    hematocrit: 42,
    meanCorpuscularVolume: 85,
    meanCorpuscularHemoglobin: 29,
    meanCorpuscularHemoglobinConcentration: 34,
    insulin: 90,
    bmi: 28,
    systolicBloodPressure: 120,
    diastolicBloodPressure: 80,
    triglycerides: 150,
    hba1c: 5.7,
    ldlCholesterol: 100,
    hdlCholesterol: 50,
    alt: 25,
    ast: 30,
    heartRate: 72,
    creatinine: 1.0,
    troponin: 0.01,
    cReactiveProtein: 1.5
  }));

  console.log("\n→ Fetching Latest Block...");
  console.log(await MediGuardAPI.getLatestBlock());

  console.log("\n→ Fetching Full Blockchain...");
  console.log(await MediGuardAPI.getFullBlockchain());

  console.log("\n→ Fetching Patient History P001...");
  console.log(await MediGuardAPI.getPatientHistory("P001"));

  console.log("\n→ Validating Blockchain...");
  console.log(await MediGuardAPI.validateBlockchain());

  console.log("\n→ Getting ML Feature Info...");
  console.log(await MediGuardAPI.getFeaturesInfo());

  console.log("\n=== Done ===\n");
};

// Run demo when executed directly
if (process.argv[1].includes("api.js")) {
  runDemo();
}

export default MediGuardAPI;
