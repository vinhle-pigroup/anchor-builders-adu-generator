# Test Examples & Validation Files

This folder contains test data, examples, and validation files for the Anchor Builders ADU Proposal Generator.

## Folder Structure

### 📁 `excel-files/`
Store Excel files here for testing and comparison:
- Original Excel budget engines
- Customer proposal examples
- Different ADU configurations
- Regional pricing variations

### 📁 `pdf-outputs/`
Generated PDF proposals and reference examples:
- React app generated PDFs
- Excel generated PDF examples
- Comparison PDFs
- Final proposal outputs

### 📁 `screenshots/`
Testing screenshots and UI captures:
- Form filling screenshots
- Pricing breakdown captures
- Error states
- User journey documentation

### 📁 `comparison-reports/`
Detailed analysis and comparison documents:
- Excel vs React app comparisons
- Pricing discrepancy reports
- Test result summaries
- Validation reports

### 📁 `reference-data/`
Supporting data and reference materials:
- Extracted pricing data
- Configuration files
- Test data sets
- Validation criteria

## Usage

1. **Drop files** into the appropriate folder based on type
2. **Reference files** using `@folder-name/filename`
3. **Claude will auto-sort** and organize files as you add them
4. **Generate reports** by referencing multiple files for comparison

## File Naming Convention

- **Excel files**: `[client-name]-[sqft]-[type]-[date].xlsx`
- **PDFs**: `[client-name]-[app-source]-[date].pdf`
- **Screenshots**: `[test-name]-[step]-[timestamp].png`
- **Reports**: `comparison-[date]-[summary].md`

Example: `nikki-vu-800sqft-detached-20250720.xlsx`