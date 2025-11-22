# 🏥 MediGuard AI

**Secure Healthcare Disease Prediction System with Blockchain Verification**

[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-18.x-blue?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)](https://nodejs.org/)
[![Flask](https://img.shields.io/badge/Flask-Python-black?logo=flask)](https://flask.palletsprojects.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 Overview

MediGuard AI is an advanced healthcare prediction system that combines machine learning with blockchain technology to provide secure, verifiable disease predictions. The system analyzes 24 medical parameters to predict potential health conditions while ensuring data integrity through cryptographic hashing and blockchain verification.

## ✨ Key Features

### 🤖 AI-Powered Predictions
- **Multi-Disease Detection**: Predicts Diabetes, Heart Disease, and other conditions
- **24 Medical Parameters**: Comprehensive analysis including glucose, cholesterol, blood pressure, and more
- **Risk Level Assessment**: Automatic categorization (Low, Medium, High, Critical)
- **Important Features Identification**: Highlights key contributing factors

### 🔐 Blockchain Security
- **Immutable Records**: All predictions stored on a custom blockchain
- **Cryptographic Verification**: SHA-256 hashing for data integrity
- **Tamper Detection**: Verify any prediction hasn't been altered
- **Patient ID Protection**: Hashed patient identifiers

### 👤 User Management
- **JWT Authentication**: Secure user sessions
- **Profile Management**: Edit personal information and change passwords
- **Prediction History**: View all past predictions with verification status
- **Dashboard Analytics**: Track health predictions over time

### 🎨 Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Interactive Forms**: Intuitive input validation and error handling
- **Real-time Feedback**: Instant prediction results with detailed explanations
- **Professional Theme**: Clean, medical-grade interface

## 🏗️ System Architecture

```
┌─────────────────┐
│  React Frontend │  (Port 5173)
│   Vite + CSS    │
└────────┬────────┘
         │
         │ REST API
         ↓
┌─────────────────┐      ┌──────────────┐
│  Express.js API │ ←──→ │  MongoDB     │
│   (Port 5001)   │      │   Atlas      │
└────────┬────────┘      └──────────────┘
         │
         │ ML Prediction
         ↓
┌─────────────────┐
│   Flask ML API  │
│   (Port 5000)   │
│  Python + Joblib│
└─────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **React 18.x** - UI framework
- **React Router** - Navigation
- **Axios** - HTTP client
- **Lucide React** - Icons
- **Vite** - Build tool

### Backend (Node.js)
- **Express.js** - Web framework
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Custom Blockchain** - Data integrity

### ML Engine (Python)
- **Flask** - API framework
- **Scikit-learn** - ML models
- **Joblib** - Model serialization
- **NumPy/Pandas** - Data processing

### Database
- **MongoDB Atlas** - Cloud database
- **Mongoose Schemas** - Data modeling

## 📦 Installation

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- MongoDB Atlas account
- npm or yarn

### 1. Clone Repository
```bash
git clone https://github.com/JashT14/Code4Change_Redact-2k25.git
cd Code4Change_Redact-2k25
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
echo "MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5001" > .env
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

### 4. ML API Setup
```bash
cd ..
pip install flask flask-cors numpy pandas scikit-learn joblib

# Ensure your trained models are in place:
# - model.pkl
# - preprocessing.pkl
# - diabetes_model.pkl
# - heart_disease_model.pkl
```

## 🚀 Running the Application

### Start All Services

**Terminal 1 - ML API:**
```bash
python app.py
# Runs on http://localhost:5000
```

**Terminal 2 - Backend:**
```bash
cd backend
node server.js
# Runs on http://localhost:5001
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

### Access the Application
Open your browser and navigate to: **http://localhost:5173**

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepass123"
}
```

### Prediction Endpoints

#### Create Prediction
```http
POST /api/predict
Authorization: Bearer <token>
Content-Type: application/json

{
  "patient_id": "P001",
  "glucose": 120,
  "cholesterol": 200,
  "hemoglobin": 14.5,
  "platelets": 250000,
  "white_blood_cells": 7000,
  "red_blood_cells": 5.0,
  "hematocrit": 42,
  "mean_corpuscular_volume": 85,
  "mean_corpuscular_hemoglobin": 29,
  "mean_corpuscular_hemoglobin_concentration": 34,
  "insulin": 90,
  "bmi": 28,
  "systolic_blood_pressure": 120,
  "diastolic_blood_pressure": 80,
  "triglycerides": 150,
  "hba1c": 5.7,
  "ldl_cholesterol": 100,
  "hdl_cholesterol": 50,
  "alt": 25,
  "ast": 30,
  "heart_rate": 72,
  "creatinine": 1.0,
  "troponin": 0.01,
  "c_reactive_protein": 1.5
}
```

#### Verify Prediction
```http
POST /api/predict/verify/:id
Authorization: Bearer <token>
```

#### Get Prediction History
```http
GET /api/predict/history
Authorization: Bearer <token>
```

## 🔒 Security Features

### Data Protection
- **JWT Token Authentication** - Secure API access
- **Password Hashing** - Bcrypt with salt rounds
- **Environment Variables** - Sensitive data protected
- **CORS Configuration** - Controlled cross-origin access

### Blockchain Integrity
- **SHA-256 Hashing** - Three-layer hash verification
  - Patient ID Hash
  - Prediction Data Hash (includes disease + confidence)
  - Timestamp Hash
- **Immutable Chain** - Previous block hash linking
- **Verification System** - Detect any data tampering

## 📊 Medical Parameters

The system analyzes 24 comprehensive health metrics:

| Category | Parameters |
|----------|------------|
| **Blood Sugar** | Glucose, HbA1c, Insulin |
| **Lipid Profile** | Total Cholesterol, LDL, HDL, Triglycerides |
| **Blood Count** | Hemoglobin, Platelets, WBC, RBC, Hematocrit |
| **Blood Indices** | MCV, MCH, MCHC |
| **Cardiovascular** | Heart Rate, Systolic BP, Diastolic BP, Troponin |
| **Liver Function** | ALT, AST |
| **Kidney Function** | Creatinine |
| **Inflammation** | C-Reactive Protein |
| **Body Metrics** | BMI |

## 🎯 Use Cases

1. **Preventive Healthcare**: Early disease detection
2. **Patient Monitoring**: Track health metrics over time
3. **Medical Research**: Secure data collection and verification
4. **Healthcare Analytics**: Population health insights
5. **Telemedicine**: Remote health assessment

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

Developed by Code4Change - SPIT's REDACT Hackathon 2025

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Email: support@mediguardai.com

## 🙏 Acknowledgments

- Flask ML model architecture
- MongoDB Atlas cloud database
- React community for UI components
- Open source contributors

---

**Built with ❤️ for better healthcare**