const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Configuration
const OCR_TIMEOUT_MS = 60000; // 60 seconds timeout for large camera images
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB limit

// ============================================
// CORE PYTHON INTEGRATION LOGIC
// ============================================

/**
 * Spawns the Python script to perform OCR and extraction with timeout protection.
 * @param {string} filePath - Path to the file (image or PDF)
 * @returns {Promise<Object>} - JSON result from Python script
 */
function runPythonOCR(filePath) {
  return new Promise((resolve, reject) => {
    // 1. Verify Python Script Exists
    const pythonScriptPath = path.join(__dirname, 'ocr_engine.py');
    if (!fs.existsSync(pythonScriptPath)) {
      return reject(new Error(`CRITICAL: Python backend not found at ${pythonScriptPath}`));
    }

    // 2. Determine Python Interpreter
    // Use 'python3' for Mac/Linux, 'python' for Windows
    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
    
    // 3. Spawn Process
    const pythonProcess = spawn(pythonCommand, [pythonScriptPath, filePath]);

    let dataString = '';
    let errorString = '';

    // 4. Set Timeout (Robustness for large images)
    const timeoutTimer = setTimeout(() => {
      pythonProcess.kill();
      reject(new Error(`OCR process timed out after ${OCR_TIMEOUT_MS / 1000} seconds`));
    }, OCR_TIMEOUT_MS);

    // 5. Collect Output
    pythonProcess.stdout.on('data', (data) => {
      dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorString += data.toString();
    });

    // 6. Handle Completion
    pythonProcess.on('close', (code) => {
      clearTimeout(timeoutTimer); // Clear timeout

      if (code !== 0) {
        // If process was killed by us (timeout), errorString might be empty, 
        // but the promise is likely already rejected by the timeout logic.
        // If it wasn't a timeout, it's a crash.
        return reject(new Error(`Python script exited with code ${code}. Details: ${errorString}`));
      }

      try {
        if (!dataString.trim()) {
          return reject(new Error('Python script returned empty output. Check python stderr for details.'));
        }

        const jsonResult = JSON.parse(dataString);

        if (jsonResult.success) {
          resolve(jsonResult);
        } else {
          // Pass specific python error back to Node
          reject(new Error(jsonResult.error || 'Unknown error in Python processing'));
        }
      } catch (e) {
        console.error("--- RAW PYTHON OUTPUT START ---");
        console.error(dataString);
        console.error("--- RAW PYTHON OUTPUT END ---");
        reject(new Error(`Failed to parse JSON: ${e.message}`));
      }
    });

    pythonProcess.on('error', (err) => {
      clearTimeout(timeoutTimer);
      reject(new Error(`Failed to spawn Python process: ${err.message}`));
    });
  });
}

/**
 * Main Wrapper: Prepares file and calls OCR
 */
async function processFile(filePath, originalName) {
  console.log(`[Node] Handing off ${originalName} to Python engine...`);
  return await runPythonOCR(filePath);
}

// ============================================
// EXPRESS ROUTE & MIDDLEWARE
// ============================================

// Configure Multer for robust file handling
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Unique filename to prevent collisions
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'ocr-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES }, 
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.png', '.jpg', '.jpeg', '.tiff', '.bmp', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: PDF, JPG, PNG, TIFF, BMP, WEBP'));
    }
  }
});

/**
 * Express Route Handler Factory
 * usage: app.post('/ocr', upload.single('file'), createOCRRoute());
 */
function createOCRRoute() {
  return async (req, res) => {
    let filePath = null;

    try {
      // 1. Validation
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded. Ensure you are sending form-data with key "file".'
        });
      }

      filePath = req.file.path;
      const originalName = req.file.originalname;

      console.log(`[API] Received file: ${originalName} (${req.file.size} bytes)`);

      // 2. Process
      const result = await processFile(filePath, originalName);

      // 3. Cleanup (Important for server disk space)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // 4. Response
      res.json(result);

    } catch (error) {
      console.error('[API] Error:', error.message);

      // Cleanup on error
      if (filePath && fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch(e) {}
      }

      // Determine status code
      const status = error.message.includes('timeout') ? 504 : 500;
      
      res.status(status).json({
        success: false,
        error: error.message || 'OCR processing failed'
      });
    }
  };
}

// ============================================
// CLI MODE
// ============================================

/**
 * Robust CLI for testing camera images locally
 */
async function runCLI() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
==================================================
   OCR Clinical Extractor - CLI
==================================================
Usage: node ocr.js <path_to_image_or_pdf>

Examples:
  node ocr.js ./camera_photo.jpg
  node ocr.js /users/docs/report.pdf

Features:
  - Supports Camera Images (auto-contrast/preprocess)
  - Supports PDFs (multi-page)
  - Returns formatted JSON
==================================================
    `);
    process.exit(0);
  }

  // Resolve absolute path to ensure Python finds it even if running from different CWD
  const inputPath = args[0];
  const absolutePath = path.resolve(process.cwd(), inputPath);

  // Validate file existence
  if (!fs.existsSync(absolutePath)) {
    console.error(`❌ Error: File not found at path: ${absolutePath}`);
    process.exit(1);
  }

  const originalName = path.basename(absolutePath);

  try {
    console.log(`\n🔍 Reading file: ${originalName}`);
    const startTime = Date.now();

    const result = await processFile(absolutePath, originalName);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`✅ OCR Completed in ${duration}s\n`);
    console.log('--- Extracted JSON Data ---');
    console.log(JSON.stringify(result.extracted, null, 2));
    console.log('---------------------------');

    // Optional: Save to file for debugging
    const outputPath = absolutePath + '.result.json';
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`\n💾 Full output saved to: ${outputPath}\n`);

    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Processing Failed: ${error.message}\n`);
    process.exit(1);
  }
}

// ============================================
// EXPORTS & EXECUTION
// ============================================

// Detect if running directly (CLI) or required (Module)
if (require.main === module) {
  runCLI();
} else {
  module.exports = {
    upload,
    createOCRRoute,
    processFile
  };
}