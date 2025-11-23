from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import numpy as np

app = Flask(__name__)

# Configure CORS to allow requests from frontend and backend
CORS(app, resources={
    r"/*": {
        "origins": [
            "http://localhost:5173",  # Frontend Vite dev server
            "http://localhost:5001",  # Backend Express server
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5001",
            "http://127.0.0.1:5000"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# --- 1. Load Models & Data on Startup ---
try:
    # Load the Prediction Pipeline (Scaler + Model)
    model_packet = joblib.load('disease_prediction_pipeline_unscaled.joblib')
    pipeline = model_packet['pipeline']
    label_encoder = model_packet['label_encoder']
    feature_names = model_packet['feature_names']

    # Load the Explainer Data (Baselines + Context)
    explainer_packet = joblib.load('medical_explainer_data.joblib')
    healthy_stats = explainer_packet['healthy_stats']
    medical_context = explainer_packet['medical_context']
    
    print("System: Models loaded successfully.")

except FileNotFoundError as e:
    print(f"CRITICAL ERROR: Missing joblib file - {e}")
    print("Please run the setup scripts to generate the .joblib files first.")

# --- 2. Helper Function for Explanation ---
def generate_explanation(input_data, prediction_label):
    if prediction_label == "Healthy":
        return {
            "summary": "Great news. The analysis indicates you are Healthy.",
            "details": "Your vital signs and blood work fall within standard healthy ranges."
        }
    
    # Calculate Deviations
    abnormalities = []
    for feature, value in input_data.items():
        if feature in healthy_stats.index:
            mean = healthy_stats.loc[feature, 'mean']
            std = healthy_stats.loc[feature, 'std']
            
            # Avoid division by zero
            if std == 0: std = 1 
            
            z_score = (value - mean) / std
            
            # Threshold: > 1.5 standard deviations is considered significant
            if abs(z_score) > 1.5:
                status = "High" if z_score > 0 else "Low"
                friendly_name = medical_context.get(feature, feature)
                
                abnormalities.append({
                    "feature": feature,
                    "friendly_name": friendly_name,
                    "value": round(value, 2),
                    "healthy_average": round(mean, 2),
                    "deviation_score": round(abs(z_score), 2),
                    "status": status,
                    "analysis": f"This {friendly_name} is significantly {status.lower()}."
                })
    
    # Sort by impact (highest deviation first) and take top 3
    abnormalities.sort(key=lambda x: x['deviation_score'], reverse=True)
    top_factors = abnormalities[:3]
    
    return {
        "summary": f"The model has detected signs of {prediction_label}.",
        "details": "This conclusion is based on key deviations from healthy norms.",
        "top_contributing_factors": top_factors
    }

# --- 3. The API Endpoint ---
@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get JSON data
        data = request.get_json()
        
        # Validation: Check if input is a dict
        if not isinstance(data, dict):
            return jsonify({"error": "Input must be a JSON object"}), 400

        # Convert to DataFrame
        # We wrap [data] to make it a single-row DataFrame
        input_df = pd.DataFrame([data])
        
        # Validation: Ensure required columns exist
        missing_cols = set(feature_names) - set(input_df.columns)
        if missing_cols:
            return jsonify({"error": f"Missing required fields: {list(missing_cols)}"}), 400
        
        # Reorder columns to match training data exactly
        input_df = input_df[feature_names]

        # A. PREDICT
        # The pipeline handles the scaling automatically using the internal StandardScaler
        pred_idx = pipeline.predict(input_df)
        prediction_label = label_encoder.inverse_transform(pred_idx)[0]

        # B. EXPLAIN
        # We pass the raw input data (dict) to the explainer
        explanation = generate_explanation(data, prediction_label)

        # C. RETURN RESPONSE
        response = {
            "prediction": prediction_label,
            "explanation": explanation
        }
        
        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # usage_reloader=False prevents the conflict in Jupyter
    app.run(debug=True, use_reloader=False, port=5000)