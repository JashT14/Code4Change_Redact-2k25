import sys
import json
import re
import os
import argparse
import pytesseract
from pdf2image import convert_from_path
from PIL import Image, ImageEnhance, ImageFilter

# ============================================
# REGEX CONFIGURATION (ROBUST & LINGO SUPPORT)
# ============================================

CLINICAL_PATTERNS = {
    'Glucose': [
        r"(?:glucose|blood\s?sugar|fasting\s?glucose|fbs|rbs|ppbs)[:\s]*([0-9.]+)",
        r"(?:glucose|sugar).*?([0-9]+\.?[0-9]*)\s*(?:mg|mmol)"
    ],
    'Cholesterol': [
        r"(?:cholesterol|total\s?cholesterol|t\.?chol)[:\s]*([0-9.]+)",
        r"cholesterol.*?([0-9]+\.?[0-9]*)\s*(?:mg|mmol)"
    ],
    'Hemoglobin': [
        r"(?:hemoglobin|haemoglobin|hb)[:\s]*([0-9.]+)",
        r"h[ae]moglobin.*?([0-9]+\.?[0-9]*)\s*(?:g|mg)"
    ],
    'Platelets': [
        r"(?:platelets|platelet\s?count|plt)[:\s]*([0-9.]+)",
        r"platelets?.*?([0-9]+\.?[0-9]*)\s*(?:k|thousand|\*10)"
    ],
    'White Blood Cells': [
        r"(?:white\s?blood\s?cells?|wbc|leukocytes?|tlc)[:\s]*([0-9.]+)",
        r"wbc.*?([0-9]+\.?[0-9]*)\s*(?:k|thousand|\*10)"
    ],
    'Red Blood Cells': [
        r"(?:red\s?blood\s?cells?|rbc|erythrocytes?)[:\s]*([0-9.]+)",
        r"rbc.*?([0-9]+\.?[0-9]*)\s*(?:m|million|\*10)"
    ],
    'Hematocrit': [
        r"(?:hematocrit|haematocrit|hct|pcv)[:\s]*([0-9.]+)",
        r"h[ae]matocrit.*?([0-9]+\.?[0-9]*)\s*%?"
    ],
    'Mean Corpuscular Volume': [
        r"(?:mean\s?corpuscular\s?volume|mcv)[:\s]*([0-9.]+)",
        r"mcv.*?([0-9]+\.?[0-9]*)\s*(?:fl|femtoliter)"
    ],
    'Mean Corpuscular Hemoglobin': [
        r"(?:mean\s?corpuscular\s?h[ae]moglobin|mch)(?!\s*concentration)[:\s]*([0-9.]+)",
        r"mch(?!\s*c).*?([0-9]+\.?[0-9]*)\s*(?:pg|picogram)"
    ],
    'Mean Corpuscular Hemoglobin Concentration': [
        r"(?:mean\s?corpuscular\s?h[ae]moglobin\s?concentration|mchc)[:\s]*([0-9.]+)",
        r"mchc.*?([0-9]+\.?[0-9]*)\s*(?:g|mg)"
    ],
    'Insulin': [
        r"(?:insulin)[:\s]*([0-9.]+)",
        r"insulin.*?([0-9]+\.?[0-9]*)\s*(?:μu|miu|uu)"
    ],
    'BMI': [
        r"(?:bmi|body\s?mass\s?index)[:\s]*([0-9.]+)",
        r"bmi.*?([0-9]+\.?[0-9]*)"
    ],
    'Systolic Blood Pressure': [
        r"(?:systolic|sbp)[:\s]*([0-9]{2,3})",
        r"(?:bp|b\.?p\.?|blood\s?pressure|nibp)[:\s]*([0-9]{2,3})\s*[\/\\]"
    ],
    'Diastolic Blood Pressure': [
        r"(?:diastolic|dbp)[:\s]*([0-9]{2,3})",
        r"(?:bp|b\.?p\.?|blood\s?pressure|nibp)[:\s]*[0-9]{2,3}\s*[\/\\]\s*([0-9]{2,3})"
    ],
    'Triglycerides': [
        r"(?:triglycerides?|tg|tgl)[:\s]*([0-9.]+)",
        r"triglycerides?.*?([0-9]+\.?[0-9]*)\s*(?:mg|mmol)"
    ],
    'HbA1c': [
        r"(?:hba1c|a1c|glycated\s?hemoglobin)[:\s]*([0-9.]+)",
        r"hba1c.*?([0-9]+\.?[0-9]*)\s*%?"
    ],
    'LDL Cholesterol': [
        r"(?:ldl\s?cholesterol|ldl)[:\s]*([0-9.]+)",
        r"ldl.*?([0-9]+\.?[0-9]*)\s*(?:mg|mmol)"
    ],
    'HDL Cholesterol': [
        r"(?:hdl\s?cholesterol|hdl)[:\s]*([0-9.]+)",
        r"hdl.*?([0-9]+\.?[0-9]*)\s*(?:mg|mmol)"
    ],
    'ALT': [
        r"(?:alt|alanine\s?aminotransferase|sgpt)[:\s]*([0-9.]+)",
        r"alt.*?([0-9]+\.?[0-9]*)\s*(?:u\/l|iu)"
    ],
    'AST': [
        r"(?:ast|aspartate\s?aminotransferase|sgot)[:\s]*([0-9.]+)",
        r"ast.*?([0-9]+\.?[0-9]*)\s*(?:u\/l|iu)"
    ],
    'Heart Rate': [
        r"(?:heart\s?rate|pulse|hr)[:\s]*([0-9.]+)",
        r"heart\s?rate.*?([0-9]+\.?[0-9]*)\s*(?:bpm|beats)"
    ],
    'Creatinine': [
        r"(?:creatinine|creat|sr\.?\s?creat)[:\s]*([0-9.]+)",
        r"creatinine.*?([0-9]+\.?[0-9]*)\s*(?:mg|μmol)"
    ],
    'Troponin': [
        r"(?:troponin|trop)[:\s]*([0-9.]+)",
        r"troponin.*?([0-9]+\.?[0-9]*)\s*(?:ng|μg)"
    ],
    'C-reactive Protein': [
        r"(?:c-reactive\s?protein|crp|c\s?reactive\s?protein)[:\s]*([0-9.]+)",
        r"crp.*?([0-9]+\.?[0-9]*)\s*(?:mg|μg)"
    ]
}

# ============================================
# CORE FUNCTIONS
# ============================================

def preprocess_image(image):
    """
    Preprocesses an image to improve OCR accuracy for mobile camera photos.
    1. Converts to grayscale.
    2. Increases contrast to separate text from background shadows.
    3. Sharpens to define edges.
    """
    try:
        # 1. Convert to Grayscale
        gray_img = image.convert('L')
        
        # 2. Enhance Contrast (Helping to remove shadows/gray backgrounds)
        enhancer = ImageEnhance.Contrast(gray_img)
        contrast_img = enhancer.enhance(2.0) # Increase contrast by factor of 2
        
        # 3. Enhance Sharpness (Helps with slightly blurry mobile photos)
        sharpener = ImageEnhance.Sharpness(contrast_img)
        sharp_img = sharpener.enhance(1.5)
        
        return sharp_img
    except Exception:
        # If preprocessing fails, return original image
        return image

def extract_clinical_values(text):
    extracted = {}
    for param_name, patterns in CLINICAL_PATTERNS.items():
        value = None
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    clean_val = match.group(1).replace(',', '.').strip()
                    value = float(clean_val)
                    break
                except ValueError:
                    continue
        extracted[param_name] = value
    return extracted

def process_text(full_text):
    try:
        extracted_data = extract_clinical_values(full_text)
        return {
            "success": True,
            "ocr_text": full_text,
            "extracted": extracted_data
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

def handle_pdf(file_path):
    """
    Handles PDF files using pdf2image.
    """
    try:
        images = convert_from_path(file_path)
        if not images:
            raise Exception("PDF is empty.")
        
        full_text = ""
        for i, image in enumerate(images):
            # Apply same preprocessing to PDF pages as well
            processed_img = preprocess_image(image)
            page_text = pytesseract.image_to_string(processed_img, lang='eng', config='--psm 6')
            full_text += f"\n--- PAGE {i+1} ---\n" + page_text
            
        return process_text(full_text)
    except Exception as e:
        return {"success": False, "error": f"PDF processing failed: {str(e)}"}

def handle_image(file_path):
    """
    Handles direct Image files (JPG, PNG, etc.) using PIL.
    Does NOT use pdf2image.
    """
    try:
        with Image.open(file_path) as img:
            # Preprocess specifically for mobile/camera quality
            processed_img = preprocess_image(img)
            
            # Use --psm 3 (Auto segmentation) or --psm 6 (Uniform block)
            # For mobile photos, psm 3 is often safer if there's noise, 
            # but psm 6 is better if the user cropped the report.
            # We will try psm 3 first as it is more general.
            text = pytesseract.image_to_string(processed_img, lang='eng', config='--psm 3')
            
            return process_text(text)
    except Exception as e:
        return {"success": False, "error": f"Image processing failed: {str(e)}"}

def main():
    parser = argparse.ArgumentParser(description="Extract clinical values via OCR.")
    parser.add_argument("file_path", help="Path to the file")
    args = parser.parse_args()

    file_path = args.file_path

    if not os.path.exists(file_path):
        print(json.dumps({"success": False, "error": "File not found"}))
        sys.exit(1)

    ext = os.path.splitext(file_path)[1].lower()
    result = {}
    
    try:
        # Explicitly separate Logic based on extension
        if ext == '.pdf':
            result = handle_pdf(file_path)
        elif ext in ['.png', '.jpg', '.jpeg', '.tiff', '.bmp', '.webp']:
            result = handle_image(file_path)
        else:
            result = {"success": False, "error": "Unsupported file format"}
    except Exception as e:
        result = {"success": False, "error": str(e)}

    print(json.dumps(result))

if __name__ == "__main__":
    main()


#tessract above