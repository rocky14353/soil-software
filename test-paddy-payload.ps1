# PowerShell script to test paddy payload
# Run with: .\test-paddy-payload.ps1

Write-Host "`n🧪 TESTING PADDY PAYLOAD`n" -ForegroundColor Cyan

# Check if server is running
$serverRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000" -TimeoutSec 2 -ErrorAction Stop
    $serverRunning = $true
} catch {
    Write-Host "⚠️  Server not running. Starting server..." -ForegroundColor Yellow
    Start-Process -FilePath "start-server.bat" -WindowStyle Hidden
    Start-Sleep -Seconds 3
    $serverRunning = $true
}

if (-not $serverRunning) {
    Write-Host "❌ Could not start server. Please run start-server.bat manually." -ForegroundColor Red
    exit 1
}

# Create test HTML file
$testHTML = @"
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
        
        setTimeout(() => {
            console.log('🧪 Testing with payload:', paddyPayload);
            
            try {
                const results = calculateRecommendations(paddyPayload);
                console.log('✅ Results received:', results);
                
                // Calculate totals
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
                
                console.log('📊 Totals:', { totalN, totalP, totalK });
                console.log('📋 Required:', { N: 48, P: 32, K: 21 });
                
                // Display results
                const resultsDiv = document.getElementById('results');
                let html = '<h2>Results:</h2>';
                html += '<p><strong>Total N:</strong> ' + totalN.toFixed(2) + ' kg/acre (Required: 48.0)</p>';
                html += '<p><strong>Total P:</strong> ' + totalP.toFixed(2) + ' kg/acre (Required: 32.0)</p>';
                html += '<p><strong>Total K:</strong> ' + totalK.toFixed(2) + ' kg/acre (Required: 21.0)</p>';
                
                if (totalP === 0) {
                    html += '<p style="color:red;"><strong>❌ ERROR: P delivery is 0.00!</strong></p>';
                    console.error('❌ ERROR: P delivery is 0.00!');
                } else {
                    html += '<p style="color:green;"><strong>✅ P delivered: ' + totalP.toFixed(2) + ' kg/acre</strong></p>';
                }
                
                if (totalN < 42.24) {
                    html += '<p style="color:red;"><strong>❌ ERROR: N delivery (' + totalN.toFixed(2) + ') is below minimum (42.24)!</strong></p>';
                    console.error('❌ ERROR: N delivery is below minimum!');
                } else {
                    html += '<p style="color:green;"><strong>✅ N delivered: ' + totalN.toFixed(2) + ' kg/acre</strong></p>';
                }
                
                html += '<h3>Stages:</h3><pre>' + JSON.stringify(results.stages || results, null, 2) + '</pre>';
                resultsDiv.innerHTML = html;
                
            } catch (error) {
                console.error('❌ Error:', error);
                document.getElementById('results').innerHTML = '<h2>Error:</h2><pre>' + error.message + '</pre><pre>' + error.stack + '</pre>';
            }
        }, 2000);
    </script>
</body>
</html>
"@

$testHTML | Out-File -FilePath "test-paddy.html" -Encoding UTF8

Write-Host "✅ Test HTML file created: test-paddy.html" -ForegroundColor Green
Write-Host "`n📋 Payload being tested:" -ForegroundColor Yellow
Write-Host "  Crop: Paddy lowland" -ForegroundColor White
Write-Host '  N: 150 kg/acre (MEDIUM)' -ForegroundColor White
Write-Host '  P: 9 kg/acre (LOW)' -ForegroundColor White
Write-Host '  K: 50 kg/acre (LOW)' -ForegroundColor White
Write-Host "  Location: SOUTH TELENGANA" -ForegroundColor White
Write-Host "  Required: N=48, P=32, K=21 kg/acre`n" -ForegroundColor White

Write-Host "🌐 Opening browser..." -ForegroundColor Cyan
Start-Process "http://localhost:8000/test-paddy.html"

Write-Host "`n📊 Check browser console (F12) for detailed logs!" -ForegroundColor Yellow
Write-Host "   Look for [P-First] logs showing P selection and delivery.`n" -ForegroundColor Yellow

