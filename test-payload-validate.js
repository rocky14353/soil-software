// Test Payload Validation Script
// This script tests the current payload and validates the response

// Load the script.js file (Node.js environment)
// Note: This assumes we're in a Node.js environment with proper module loading
// For browser, we'll use a different approach

const fs = require('fs');
const path = require('path');

// Read script.js to get the calculateRecommendations function
const scriptPath = path.join(__dirname, 'script.js');
let scriptContent = fs.readFileSync(scriptPath, 'utf8');

// Test Payload
const testPayload = {
    crop: "Paddy lowland",
    organicCarbon: 0.6,
    nitrogen: 150,
    phosphorus: 9,
    potassium: 50,
    season: "Rabi",
    fieldType: "Irrigated",
    location: "SOUTH TELENGANA",
    sulfur: 9,
    ph: 7.5,
    soilType: "Medium",
    ec: 0.6,
    calcium: 20,
    magnesium: 50,
    zinc: 5,
    boron: 0.5,
    manganese: 20,
    iron: 50,
    copper: 20,
    molybdenum: 0.5,
    chlorine: 10,
    gromorCombination: "Auto-select based on Location",
    pref_28_28_0: "Optional",
    pref_14_35_14: "Optional",
    pref_20_20_0: "Optional",
    pref_10_26_26: "Optional",
    pref_16_20_0: "Optional",
    pref_Urea: "Optional",
    pref_MOP: "Optional",
    pref_SOP: "Optional",
    pref_SSP: "Optional"
};

console.log("=".repeat(80));
console.log("🧪 TESTING PAYLOAD");
console.log("=".repeat(80));
console.log("\n📋 Payload:");
console.log(JSON.stringify(testPayload, null, 2));

console.log("\n" + "=".repeat(80));
console.log("⏳ Running calculateRecommendations...");
console.log("=".repeat(80));

// Note: This script needs to be run in a browser environment or with proper module setup
// For now, we'll create an HTML version that can be run directly











