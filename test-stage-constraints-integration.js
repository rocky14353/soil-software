/**
 * Integration Tests for Stage Constraint Enforcement
 * These tests verify that stage restrictions are properly enforced in the actual recommendation system
 */

// Test framework setup (using simple assertion pattern - can be adapted to Jest/Vitest)
function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}

function testTilleringKMustBeZero() {
    console.log('Test: Tillering K must be 0');
    
    // Test payload that previously caused K to be added to Tillering
    const testPayload = {
        crop: "Paddy lowland",
        organicCarbon: 0.6,
        nitrogen: 150,
        phosphorus: 9,
        potassium: 50,
        season: "Rabi",
        fieldType: "Irrigated",
        location: "SOUTH TELENGANA",
        soilType: "Medium",
        sulfur: 9,
        ph: 7.5,
        ec: 0.6,
        calcium: 20,
        magnesium: 50,
        zinc: 5,
        boron: 0.5,
        manganese: 20,
        iron: 50,
        copper: 20,
        molybdenum: 0.5,
        chlorine: 9.8,
        gromorCombination: "Auto-select based on Location",
        preferences: {
            "28-28-0": "Optional",
            "14-35-14": "Optional",
            "20-20-0": "Optional",
            "10-26-26": "Optional",
            "16-20-0": "Optional",
            "Urea": "Optional",
            "MOP": "Optional",
            "SOP": "Optional",
            "SSP": "Optional"
        }
    };
    
    try {
        const results = calculateRecommendations(testPayload);
        
        // Find Tillering stage (index 1)
        const tilleringStage = results.recommendations.find(s => 
            s.stage && (s.stage.toLowerCase().includes('tillering') || s.stage.toLowerCase().includes('top'))
        ) || results.recommendations[1];
        
        if (!tilleringStage) {
            throw new Error('Tillering stage not found in recommendations');
        }
        
        // Calculate total K in Tillering
        const tilleringK = tilleringStage.fertilizers.reduce((sum, f) => sum + (f.kContributed || 0), 0);
        
        // Assert: Tillering K must be exactly 0
        assert(tilleringK === 0, `Tillering K must be 0, got ${tilleringK.toFixed(2)} kg`);
        
        // Assert: No K-containing fertilizers in Tillering
        const kFertilizers = tilleringStage.fertilizers.filter(f => {
            const hasK = (f.kContributed || 0) > 0.01;
            const isKFertilizer = f.name === 'SOP' || f.name === 'MOP' || f.name.toLowerCase().includes('mop') || f.name.toLowerCase().includes('sop');
            return hasK || isKFertilizer;
        });
        
        assert(kFertilizers.length === 0, 
            `No K fertilizers allowed in Tillering. Found: ${kFertilizers.map(f => `${f.name} (K=${(f.kContributed || 0).toFixed(2)})`).join(', ')}`);
        
        console.log('✓ PASSED: Tillering K=0 enforcement');
        return true;
    } catch (error) {
        console.error('✗ FAILED:', error.message);
        throw error;
    }
}

function testPaniclePMustBeZero() {
    console.log('Test: Panicle P must be 0');
    
    const testPayload = {
        crop: "Paddy lowland",
        organicCarbon: 0.6,
        nitrogen: 150,
        phosphorus: 9,
        potassium: 50,
        season: "Rabi",
        fieldType: "Irrigated",
        location: "SOUTH TELENGANA",
        // ... other fields
    };
    
    try {
        const results = calculateRecommendations(testPayload);
        
        // Find Panicle stage (index 2 or last stage)
        const panicleStage = results.recommendations.find(s => 
            s.stage && s.stage.toLowerCase().includes('panicle')
        ) || results.recommendations[results.recommendations.length - 1];
        
        if (!panicleStage) {
            throw new Error('Panicle stage not found in recommendations');
        }
        
        // Calculate total P in Panicle
        const panicleP = panicleStage.fertilizers.reduce((sum, f) => sum + (f.pContributed || 0), 0);
        
        // Assert: Panicle P must be exactly 0
        assert(panicleP === 0, `Panicle P must be 0, got ${panicleP.toFixed(2)} kg`);
        
        // Assert: No P-containing fertilizers in Panicle
        const pFertilizers = panicleStage.fertilizers.filter(f => {
            const hasP = (f.pContributed || 0) > 0.01;
            const isPFertilizer = f.name === 'SSP' || f.name.includes('28-28-0') || f.name.includes('20-20-0') || f.name.includes('14-35-14');
            return hasP || isPFertilizer;
        });
        
        assert(pFertilizers.length === 0, 
            `No P fertilizers allowed in Panicle. Found: ${pFertilizers.map(f => `${f.name} (P=${(f.pContributed || 0).toFixed(2)})`).join(', ')}`);
        
        console.log('✓ PASSED: Panicle P=0 enforcement');
        return true;
    } catch (error) {
        console.error('✗ FAILED:', error.message);
        throw error;
    }
}

function testNoKFertilizerInTillering() {
    console.log('Test: No K fertilizer names in Tillering');
    
    const testPayload = {
        crop: "Paddy lowland",
        organicCarbon: 0.6,
        nitrogen: 150,
        phosphorus: 9,
        potassium: 50,
        season: "Rabi",
        fieldType: "Irrigated",
        location: "SOUTH TELENGANA",
        // ... other fields
    };
    
    try {
        const results = calculateRecommendations(testPayload);
        
        const tilleringStage = results.recommendations.find(s => 
            s.stage && (s.stage.toLowerCase().includes('tillering') || s.stage.toLowerCase().includes('top'))
        ) || results.recommendations[1];
        
        // Check fertilizer names
        const forbiddenNames = ['SOP', 'MOP', 'Potash', 'Potassium'];
        const foundForbidden = tilleringStage.fertilizers.filter(f => 
            forbiddenNames.some(name => f.name.toUpperCase().includes(name.toUpperCase()))
        );
        
        assert(foundForbidden.length === 0, 
            `Found forbidden K fertilizers in Tillering: ${foundForbidden.map(f => f.name).join(', ')}`);
        
        console.log('✓ PASSED: No K fertilizer names in Tillering');
        return true;
    } catch (error) {
        console.error('✗ FAILED:', error.message);
        throw error;
    }
}

function testNoPFertilizerInPanicle() {
    console.log('Test: No P fertilizer names in Panicle');
    
    const testPayload = {
        crop: "Paddy lowland",
        organicCarbon: 0.6,
        nitrogen: 150,
        phosphorus: 9,
        potassium: 50,
        season: "Rabi",
        fieldType: "Irrigated",
        location: "SOUTH TELENGANA",
        // ... other fields
    };
    
    try {
        const results = calculateRecommendations(testPayload);
        
        const panicleStage = results.recommendations.find(s => 
            s.stage && s.stage.toLowerCase().includes('panicle')
        ) || results.recommendations[results.recommendations.length - 1];
        
        // Check fertilizer names
        const forbiddenNames = ['SSP', '28-28-0', '20-20-0', '14-35-14', 'DAP'];
        const foundForbidden = panicleStage.fertilizers.filter(f => 
            forbiddenNames.some(name => f.name.includes(name))
        );
        
        assert(foundForbidden.length === 0, 
            `Found forbidden P fertilizers in Panicle: ${foundForbidden.map(f => f.name).join(', ')}`);
        
        console.log('✓ PASSED: No P fertilizer names in Panicle');
        return true;
    } catch (error) {
        console.error('✗ FAILED:', error.message);
        throw error;
    }
}

function testPostRoundCorrectionSafety() {
    console.log('Test: Post-rounding/correction passes cannot introduce disallowed nutrients');
    
    // This test verifies that even after rounding, no disallowed nutrients are added
    const testPayload = {
        crop: "Paddy lowland",
        organicCarbon: 0.6,
        nitrogen: 150,
        phosphorus: 9,
        potassium: 50,
        season: "Rabi",
        fieldType: "Irrigated",
        location: "SOUTH TELENGANA",
        // ... other fields
    };
    
    try {
        const results = calculateRecommendations(testPayload);
        
        // Check all stages
        results.recommendations.forEach((stage, index) => {
            const stageK = stage.fertilizers.reduce((sum, f) => sum + (f.kContributed || 0), 0);
            const stageP = stage.fertilizers.reduce((sum, f) => sum + (f.pContributed || 0), 0);
            
            // Tillering (index 1) must have K=0
            if (index === 1 || (stage.stage && stage.stage.toLowerCase().includes('tillering'))) {
                assert(stageK === 0, `Tillering stage has K=${stageK.toFixed(2)}, must be 0`);
            }
            
            // Panicle (index 2 or last) must have P=0
            if (index === 2 || (stage.stage && stage.stage.toLowerCase().includes('panicle'))) {
                assert(stageP === 0, `Panicle stage has P=${stageP.toFixed(2)}, must be 0`);
            }
        });
        
        console.log('✓ PASSED: Post-rounding safety check');
        return true;
    } catch (error) {
        console.error('✗ FAILED:', error.message);
        throw error;
    }
}

// Run all tests
function runAllTests() {
    console.log('Running stage constraint integration tests...\n');
    
    const tests = [
        testTilleringKMustBeZero,
        testPaniclePMustBeZero,
        testNoKFertilizerInTillering,
        testNoPFertilizerInPanicle,
        testPostRoundCorrectionSafety
    ];
    
    let passed = 0;
    let failed = 0;
    
    tests.forEach(test => {
        try {
            if (test()) {
                passed++;
            }
        } catch (error) {
            failed++;
            console.error(`Test ${test.name} failed:`, error.message);
        }
    });
    
    console.log(`\n=== Test Results ===`);
    console.log(`Passed: ${passed}/${tests.length}`);
    console.log(`Failed: ${failed}/${tests.length}`);
    
    if (failed > 0) {
        throw new Error(`${failed} test(s) failed`);
    }
    
    return { passed, failed, total: tests.length };
}

// Export for use in test runners
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        testTilleringKMustBeZero,
        testPaniclePMustBeZero,
        testNoKFertilizerInTillering,
        testNoPFertilizerInPanicle,
        testPostRoundCorrectionSafety,
        runAllTests
    };
}

// Auto-run if executed directly
if (typeof window === 'undefined' && typeof require !== 'undefined') {
    // Node.js environment
    runAllTests();
}






