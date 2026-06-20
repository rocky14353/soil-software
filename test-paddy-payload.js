// Test script to run paddy payload and check response
// Run with: node test-paddy-payload.js

const http = require('http');
const fs = require('fs');
const path = require('path');

// Paddy payload (saved from form)
const paddyPayload = {
    crop: "Paddy lowland",
    organicCarbon: "0.6",
    nitrogen: "150",
    phosphorus: "9",
    potassium: "50",
    season: "Rabi",
    fieldType: "Irrigated",
    location: "SOUTH TELENGANA",
    soilType: "Medium",
    sulfur: "9",
    ph: "7.5",
    ec: "0.6",
    calcium: "20",
    magnesium: "50",
    zinc: "5",
    boron: "0.5",
    manganese: "20",
    iron: "50",
    copper: "20",
    molybdenum: "0.5",
    chlorine: "9.8",
    gromorCombination: "Auto-select based on Location",
    "28-28-0": "Optional",
    "14-35-14": "Optional",
    "20-20-0": "Optional",
    "10-26-26": "Optional",
    "16-20-0": "Optional",
    "Urea": "Optional",
    "MOP": "Optional",
    "SOP": "Optional",
    "SSP": "Optional"
};

// Create HTML page with embedded script to test
const testHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Paddy Payload Test</title>
    <script src="script.js"></script>
</head>
<body>
    <h1>Testing Paddy Payload</h1>
    <div id="results"></div>
    <script>
        // Wait for data to load
        setTimeout(() => {
            const formData = ${JSON.stringify(paddyPayload, null, 12)};
            console.log('Testing with payload:', formData);
            
            try {
                const results = calculateRecommendations(formData);
                console.log('Results:', results);
                
                // Display results
                const resultsDiv = document.getElementById('results');
                resultsDiv.innerHTML = '<h2>Results:</h2><pre>' + JSON.stringify(results, null, 2) + '</pre>';
                
                // Check totals
                let totalN = 0, totalP = 0, totalK = 0;
                if (results.stages) {
                    results.stages.forEach(stage => {
                        if (stage.fertilizers) {
                            stage.fertilizers.forEach(fert => {
                                totalN += fert.nContributed || 0;
                                totalP += fert.pContributed || 0;
                                totalK += fert.kContributed || 0;
                            });
                        }
                    });
                }
                
                console.log('Totals:', { totalN, totalP, totalK });
                console.log('Required:', { N: 48, P: 32, K: 21 });
                
                if (totalP === 0) {
                    console.error('ERROR: P delivery is 0.00!');
                }
                if (totalN < 42.24) {
                    console.error('ERROR: N delivery is below minimum!');
                }
                
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('results').innerHTML = '<h2>Error:</h2><pre>' + error.message + '</pre>';
            }
        }, 2000);
    </script>
</body>
</html>
`;

// Write test HTML file
fs.writeFileSync('test-paddy.html', testHTML);

console.log('✅ Test HTML file created: test-paddy.html');
console.log('📋 Payload:', JSON.stringify(paddyPayload, null, 2));
console.log('\n🌐 Open in browser: http://localhost:8000/test-paddy.html');
console.log('📊 Check browser console (F12) for detailed logs\n');











