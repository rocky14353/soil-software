/**
 * Test cases for stage constraint enforcement
 * These tests verify that stage restrictions are properly enforced
 */

// Mock test framework (can be replaced with actual test framework)
function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}

function testTilleringKZero() {
    console.log('Test 1: Tillering K=0 Enforcement');
    
    // Simulate Tillering stage (stageIndex = 1)
    const stageIndex = 1;
    const stageTargets = { n: 16, p: 9.6, k: 0 }; // K target is 0
    const deliveredNutrients = { n: 0, p: 0, k: 0 };
    
    // Try to add SOP (contains K)
    const sopFertilizer = {
        name: 'SOP',
        nContributed: 0,
        pContributed: 0,
        kContributed: 6.25 // K contribution
    };
    
    const check = isFertilizerAllowedInStage(sopFertilizer, stageIndex, stageTargets, deliveredNutrients);
    
    assert(!check.allowed, 'SOP should be rejected in Tillering stage');
    assert(check.reason.includes('K not allowed'), 'Rejection reason should mention K restriction');
    
    console.log('✓ Test 1 PASSED: Tillering K=0 enforcement works');
}

function testPaniclePZero() {
    console.log('Test 2: Panicle P=0 Enforcement');
    
    // Simulate Panicle stage (stageIndex = 2)
    const stageIndex = 2;
    const stageTargets = { n: 16, p: 0, k: 10.5 }; // P target is 0
    const deliveredNutrients = { n: 0, p: 0, k: 0 };
    
    // Try to add 28-28-0 (contains P)
    const gromor28280 = {
        name: 'Gromor 28-28-0',
        nContributed: 22.4,
        pContributed: 22.4, // P contribution
        kContributed: 0
    };
    
    const check = isFertilizerAllowedInStage(gromor28280, stageIndex, stageTargets, deliveredNutrients);
    
    assert(!check.allowed, '28-28-0 should be rejected in Panicle stage');
    assert(check.reason.includes('P not allowed'), 'Rejection reason should mention P restriction');
    
    console.log('✓ Test 2 PASSED: Panicle P=0 enforcement works');
}

function testPanicleNOverflow() {
    console.log('Test 3: Panicle N Overflow Prevention');
    
    // Simulate Panicle stage with N already partially delivered
    const stageIndex = 2;
    const stageTargets = { n: 16, p: 0, k: 10.5 }; // N target is 16
    const deliveredNutrients = { n: 15, p: 0, k: 0 }; // Already delivered 15 kg N
    
    // Try to add fertilizer with N > 1 (would exceed limit)
    const nFertilizer = {
        name: 'Urea',
        nContributed: 2.3, // Would make total 17.3 > 16
        pContributed: 0,
        kContributed: 0
    };
    
    const check = isFertilizerAllowedInStage(nFertilizer, stageIndex, stageTargets, deliveredNutrients, 0.1);
    
    assert(!check.allowed, 'Fertilizer should be rejected if it causes N overflow');
    assert(check.reason.includes('N overflow'), 'Rejection reason should mention N overflow');
    
    console.log('✓ Test 3 PASSED: Panicle N overflow prevention works');
}

function testRebalancingPassSafety() {
    console.log('Test 4: Rebalancing Pass Cannot Break Rules');
    
    // Simulate scenario where Stage 1 under-delivers N
    // Rebalancing pass should NOT add extra N to Panicle beyond its limit
    
    const panicleStageIndex = 2;
    const panicleTargets = { n: 16, p: 0, k: 10.5 }; // Original Panicle N target
    const panicleDelivered = { n: 16, p: 0, k: 10.5 }; // Already at limit
    
    // Rebalancing tries to add N to compensate for Stage 1 deficit
    const compensationN = {
        name: 'Urea',
        nContributed: 5, // Would exceed Panicle limit
        pContributed: 0,
        kContributed: 0
    };
    
    const check = isFertilizerAllowedInStage(compensationN, panicleStageIndex, panicleTargets, panicleDelivered);
    
    assert(!check.allowed, 'Rebalancing should not be able to add N beyond Panicle limit');
    
    console.log('✓ Test 4 PASSED: Rebalancing pass safety works');
}

function testRoundingSafety() {
    console.log('Test 5: Rounding Safety');
    
    // Simulate scenario where continuous solve is valid
    // But rounding causes slight overflow
    const stageIndex = 2;
    const stageTargets = { n: 16, p: 0, k: 10.5 };
    const deliveredNutrients = { n: 15.9, p: 0, k: 10.4 }; // Close to limit
    
    // Rounding causes small overflow
    const roundedFertilizer = {
        name: 'Urea',
        nContributed: 0.2, // Would make 16.1 > 16 (with 10% tolerance = 17.6, so should pass)
        pContributed: 0,
        kContributed: 0
    };
    
    // With 10% tolerance, 16.1 should be allowed (16 * 1.1 = 17.6)
    const checkWithTolerance = isFertilizerAllowedInStage(roundedFertilizer, stageIndex, stageTargets, deliveredNutrients, 0.1);
    assert(checkWithTolerance.allowed, 'Small overflow within tolerance should be allowed');
    
    // Without tolerance, should be rejected
    const checkNoTolerance = isFertilizerAllowedInStage(roundedFertilizer, stageIndex, stageTargets, deliveredNutrients, 0);
    // 16.1 > 16, so should be rejected without tolerance
    // But we need to check if it's exactly 16.1 vs 16.0
    const totalNAfter = deliveredNutrients.n + roundedFertilizer.nContributed;
    if (totalNAfter > stageTargets.n) {
        assert(!checkNoTolerance.allowed, 'Overflow without tolerance should be rejected');
    }
    
    console.log('✓ Test 5 PASSED: Rounding safety works');
}

// Run all tests
function runAllTests() {
    console.log('Running stage constraint tests...\n');
    
    try {
        testTilleringKZero();
        testPaniclePZero();
        testPanicleNOverflow();
        testRebalancingPassSafety();
        testRoundingSafety();
        
        console.log('\n✅ All tests PASSED!');
    } catch (error) {
        console.error('\n❌ Test FAILED:', error.message);
        throw error;
    }
}

// Export for use in other test files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        testTilleringKZero,
        testPaniclePZero,
        testPanicleNOverflow,
        testRebalancingPassSafety,
        testRoundingSafety,
        runAllTests
    };
}






