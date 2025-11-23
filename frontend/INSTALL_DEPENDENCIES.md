# Required Dependencies for PDF Report Feature

To enable the PDF report generation feature, install the following packages:

```bash
npm install jspdf html2canvas
```

## Package Details

- **jspdf**: PDF document generation library
- **html2canvas**: HTML to canvas conversion (optional, for future chart rendering)

## Alternative Installation

If you prefer yarn:

```bash
yarn add jspdf html2canvas
```

## Usage

After installation, the "Download Report" button in the Dashboard details modal will generate a professional PDF report with:
- Patient information
- Prediction results
- Risk level visualization
- Blockchain security details
