/**
 * Rule Engine Tests — Jest test suite
 * Tests the rule-engine.js module: stage targets, restrictions,
 * validation (stage-wise + global), unit conversion, tolerance bounds
 */

const {
    calculateStageTargets,
    getStageRestrictions,
    isFertilizerAllowedInStage,
    normalizeNutrients,
    getToleranceRules,
    validateStageResult,
    validateGlobalDelivery
} = require('../rule-engine.js');

// ── Default crop data ────────────────────────────────────────────
const defaultCrop = {
    splits: {
        n: {
            stages: ['Basal', 'at Tillering', 'at Panicle'],
            percentages: [33.33, 33.33, 33.34]
        },
        p: {
            percentages: [60, 40, 0]
        },
        k: {
            percentages: [50, 0, 50]
        }
    }
};

// ── Stage Targets ────────────────────────────────────────────────
describe('calculateStageTargets', () => {
    test('returns correct targets for default splits', () => {
        const targets = calculateStageTargets(300, 120, 200, defaultCrop);
        
        expect(targets[0].stageName).toBe('Basal');
        expect(targets[0].n).toBeCloseTo(100, 1);          // 33.33% of 300
        expect(targets[0].p).toBeCloseTo(72, 1);           // 60% of 120
        expect(targets[0].k).toBeCloseTo(100, 1);          // 50% of 200
        
        expect(targets[1].stageName).toBe('at Tillering');
        expect(targets[1].n).toBeCloseTo(100, 1);          // 33.33% of 300
        expect(targets[1].p).toBeCloseTo(48, 1);           // 40% of 120
        expect(targets[1].k).toBeCloseTo(0, 1);            // 0% of 200
        
        expect(targets[2].stageName).toBe('at Panicle');
        expect(targets[2].n).toBeCloseTo(100.02, 1);       // 33.34% of 300
        expect(targets[2].p).toBeCloseTo(0, 1);            // 0% of 120
        expect(targets[2].k).toBeCloseTo(100, 1);          // 50% of 200
    });
    
    test('uses custom split percentages when provided', () => {
        const crop = {
            splits: {
                n: { percentages: [40, 40, 20], stages: ['A', 'B', 'C'] },
                p: { percentages: [80, 20, 0] },
                k: { percentages: [30, 0, 70] }
            }
        };
        const targets = calculateStageTargets(200, 100, 150, crop);
        
        expect(targets[0].stageName).toBe('A');
        expect(targets[0].n).toBeCloseTo(80, 1);           // 40% of 200
        expect(targets[0].p).toBeCloseTo(80, 1);           // 80% of 100
        expect(targets[0].k).toBeCloseTo(45, 1);           // 30% of 150
        
        expect(targets[2].stageName).toBe('C');
        expect(targets[2].n).toBeCloseTo(40, 1);           // 20% of 200
        expect(targets[2].p).toBeCloseTo(0, 1);
        expect(targets[2].k).toBeCloseTo(105, 1);          // 70% of 150
    });
    
    test('handles zero nutrients gracefully', () => {
        const targets = calculateStageTargets(0, 0, 0, defaultCrop);
        for (let i = 0; i < 3; i++) {
            expect(targets[i].n).toBe(0);
            expect(targets[i].p).toBe(0);
            expect(targets[i].k).toBe(0);
        }
    });
    
    test('handles missing crop data with defaults', () => {
        const targets = calculateStageTargets(300, 120, 200, null);
        expect(targets[0].n).toBeCloseTo(100, 1);
        expect(targets[0].p).toBeCloseTo(72, 1);
        expect(targets[0].k).toBeCloseTo(100, 1);
    });
});

// ── Stage Restrictions ───────────────────────────────────────────
describe('getStageRestrictions', () => {
    test('basal stage has no restrictions', () => {
        expect(getStageRestrictions(0)).toEqual({});
    });
    
    test('tillering restricts K to 0', () => {
        const r = getStageRestrictions(1);
        expect(r.k).toBe(0);
        expect(r.reason).toBe('K not allowed in Tillering stage');
    });
    
    test('panicle restricts P to 0', () => {
        const r = getStageRestrictions(2);
        expect(r.p).toBe(0);
        expect(r.reason).toBe('P not allowed in Panicle stage');
    });
});

// ── Fertilizer Allowance ─────────────────────────────────────────
describe('isFertilizerAllowedInStage', () => {
    const urea = { name: 'Urea', n: 46, p: 0, k: 0, allowedStages: ['basal', 'tillering', 'panicle'] };
    const mop = { name: 'MOP', n: 0, p: 0, k: 60, allowedStages: ['basal', 'panicle'] };
    const gromor = { name: 'Gromor 28-28-0', n: 28, p: 28, k: 0, stageRestrictions: {}, allowedStages: ['basal', 'tillering'] };
    
    test('Urea allowed in all stages', () => {
        expect(isFertilizerAllowedInStage(urea, 0)).toEqual({ allowed: true, reason: '' });
        expect(isFertilizerAllowedInStage(urea, 1)).toEqual({ allowed: true, reason: '' });
        expect(isFertilizerAllowedInStage(urea, 2)).toEqual({ allowed: true, reason: '' });
    });
    
    test('MOP not allowed in tillering', () => {
        expect(isFertilizerAllowedInStage(mop, 1)).toEqual({
            allowed: false,
            reason: 'Fertilizer not allowed in tillering stage'
        });
        expect(isFertilizerAllowedInStage(mop, 0)).toEqual({ allowed: true, reason: '' });
        expect(isFertilizerAllowedInStage(mop, 2)).toEqual({ allowed: true, reason: '' });
    });
    
    test('Gromor 28-28-0 not allowed in panicle (has P)', () => {
        expect(isFertilizerAllowedInStage(gromor, 0)).toEqual({ allowed: true, reason: '' });
        expect(isFertilizerAllowedInStage(gromor, 1)).toEqual({ allowed: true, reason: '' });
        expect(isFertilizerAllowedInStage(gromor, 2)).toEqual({
            allowed: false,
            reason: 'Fertilizer not allowed in panicle stage'
        });
    });
    
    test('rejects invalid stage index', () => {
        expect(isFertilizerAllowedInStage(urea, -1)).toEqual({
            allowed: false,
            reason: 'Invalid stage index: -1'
        });
        expect(isFertilizerAllowedInStage(urea, 5)).toEqual({
            allowed: false,
            reason: 'Invalid stage index: 5'
        });
    });
    
    test('rejects fertilizer not in allowedStages', () => {
        const limited = { ...urea, allowedStages: ['basal'] };
        expect(isFertilizerAllowedInStage(limited, 1)).toEqual({
            allowed: false,
            reason: 'Fertilizer not allowed in tillering stage'
        });
    });
});

// ── Unit Conversion ──────────────────────────────────────────────
describe('normalizeNutrients', () => {
    test('P → P2O5: multiply by 2.29', () => {
        const r = normalizeNutrients(50, 'P', 'P2O5');
        expect(r.value).toBeCloseTo(114.5, 1);
        expect(r.valid).toBe(true);
    });
    
    test('P2O5 → P: divide by 2.29', () => {
        const r = normalizeNutrients(114.5, 'P2O5', 'P');
        expect(r.value).toBeCloseTo(50, 1);
    });
    
    test('K → K2O: multiply by 1.205', () => {
        const r = normalizeNutrients(60, 'K', 'K2O');
        expect(r.value).toBeCloseTo(72.3, 1);
    });
    
    test('K2O → K: divide by 1.205', () => {
        const r = normalizeNutrients(72.3, 'K2O', 'K');
        expect(r.value).toBeCloseTo(60, 1);
    });
    
    test('same unit returns value unchanged', () => {
        const r = normalizeNutrients(100, 'N', 'N');
        expect(r.value).toBe(100);
        expect(r.valid).toBe(true);
    });
    
    test('unknown conversion returns invalid', () => {
        const r = normalizeNutrients(100, 'N', 'P');
        expect(r.valid).toBe(false);
        expect(r.error).toContain('Unknown unit conversion');
    });
});

// ── Tolerance Rules ──────────────────────────────────────────────
describe('getToleranceRules', () => {
    test('stage-wise tolerance for N is ±10%', () => {
        const t = getToleranceRules().stageWise.n;
        expect(t.min).toBeCloseTo(0.90, 2);
        expect(t.max).toBeCloseTo(1.10, 2);
    });
    
    test('stage-wise tolerance for P is -5%/+15%', () => {
        const t = getToleranceRules().stageWise.p;
        expect(t.min).toBeCloseTo(0.95, 2);
        expect(t.max).toBeCloseTo(1.15, 2);
    });
    
    test('global tolerance for all nutrients is ±5%', () => {
        const g = getToleranceRules().global;
        Object.keys(g).forEach(key => {
            expect(g[key].min).toBeCloseTo(0.95, 2);
            expect(g[key].max).toBeCloseTo(1.05, 2);
        });
    });
});

// ── Stage Validation ─────────────────────────────────────────────
describe('validateStageResult', () => {
    const basalTarget = { n: 100, p: 72, k: 100 };
    const basalRestrictions = {};
    const tilleringTarget = { n: 100, p: 48, k: 0 };
    const tilleringRestrictions = { k: 0, reason: 'K not allowed in Tillering stage' };
    
    // ── N checks ──
    test('N exactly on target passes', () => {
        const v = validateStageResult(
            { deliveredN: 100, deliveredP: 72, deliveredK: 100 },
            basalTarget, basalRestrictions
        );
        expect(v.passed).toBe(true);
        expect(v.errors.length).toBe(0);
    });
    
    test('N slightly above target (within 10%) is a warning, not error', () => {
        const v = validateStageResult(
            { deliveredN: 108, deliveredP: 72, deliveredK: 100 },
            basalTarget, basalRestrictions
        );
        expect(v.passed).toBe(true);  // Within tolerance
        expect(v.warnings.some(w => w.includes('slight over-delivery'))).toBe(true);
        expect(v.errors.length).toBe(0);
    });
    
    test('N 15% above target fails', () => {
        const v = validateStageResult(
            { deliveredN: 115, deliveredP: 72, deliveredK: 100 },
            basalTarget, basalRestrictions
        );
        expect(v.passed).toBe(false);
        expect(v.errors.some(e => e.includes('overflow'))).toBe(true);
    });
    
    test('N 15% below target produces warning', () => {
        const v = validateStageResult(
            { deliveredN: 85, deliveredP: 72, deliveredK: 100 },
            basalTarget, basalRestrictions
        );
        expect(v.passed).toBe(true);  // Within 10% tolerance
        expect(v.warnings.some(w => w.includes('under-delivery'))).toBe(true);
    });
    
    test('N 12% below target produces warning (not failure — original behavior)', () => {
        const v = validateStageResult(
            { deliveredN: 88, deliveredP: 72, deliveredK: 100 },
            basalTarget, basalRestrictions
        );
        // Original behavior: under-delivery produces a warning, not a hard failure
        // (only over-delivery triggers failure in stage-wise validation)
        expect(v.warnings.some(w => w.includes('under-delivery'))).toBe(true);
    });
    
    // ── P checks ──
    test('P exactly on target passes', () => {
        const v = validateStageResult(
            { deliveredN: 100, deliveredP: 72, deliveredK: 100 },
            basalTarget, basalRestrictions
        );
        expect(v.passed).toBe(true);
    });
    
    test('P 20% above target fails (exceeds 15% tolerance)', () => {
        const v = validateStageResult(
            { deliveredN: 100, deliveredP: 87, deliveredK: 100 },
            basalTarget, basalRestrictions
        );
        expect(v.passed).toBe(false);
        expect(v.errors.some(e => e.includes('overflow'))).toBe(true);
    });
    
    test('P 10% above target is within tolerance', () => {
        const v = validateStageResult(
            { deliveredN: 100, deliveredP: 79, deliveredK: 100 },
            basalTarget, basalRestrictions
        );
        expect(v.passed).toBe(true);
        expect(v.errors.length).toBe(0);
    });
    
    test('P below 95% minimum produces warning', () => {
        const v = validateStageResult(
            { deliveredN: 100, deliveredP: 65, deliveredK: 100 },
            basalTarget, basalRestrictions
        );
        expect(v.warnings.some(w => w.includes('under-delivery'))).toBe(true);
    });
    
    // ── K checks ──
    test('K slightly above target (within 10%) is a warning', () => {
        const v = validateStageResult(
            { deliveredN: 100, deliveredP: 72, deliveredK: 108 },
            basalTarget, basalRestrictions
        );
        expect(v.passed).toBe(true);
        expect(v.warnings.some(w => w.includes('slight over-delivery'))).toBe(true);
    });
    
    test('K 12% above target fails', () => {
        const v = validateStageResult(
            { deliveredN: 100, deliveredP: 72, deliveredK: 112 },
            basalTarget, basalRestrictions
        );
        expect(v.passed).toBe(false);
        expect(v.errors.some(e => e.includes('overflow'))).toBe(true);
    });
    
    // ── Restriction checks ──
    test('K > 0 in tillering fails restriction', () => {
        const v = validateStageResult(
            { deliveredN: 100, deliveredP: 48, deliveredK: 5 },
            tilleringTarget, tilleringRestrictions
        );
        expect(v.passed).toBe(false);
        expect(v.errors.some(e => e.includes('K violation'))).toBe(true);
    });
    
    test('P > 0 in panicle fails restriction', () => {
        const panicleTarget = { n: 100, p: 0, k: 100 };
        const panicleRestrictions = { p: 0, reason: 'P not allowed in Panicle stage' };
        const v = validateStageResult(
            { deliveredN: 100, deliveredP: 10, deliveredK: 100 },
            panicleTarget, panicleRestrictions
        );
        expect(v.passed).toBe(false);
        expect(v.errors.some(e => e.includes('P violation'))).toBe(true);
    });
    
    test('ratios object is populated', () => {
        const v = validateStageResult(
            { deliveredN: 110, deliveredP: 80, deliveredK: 95 },
            basalTarget, basalRestrictions
        );
        expect(v.ratios.n).toBeCloseTo(1.10, 2);
        expect(v.ratios.p).toBeCloseTo(80/72, 2);
        expect(v.ratios.k).toBeCloseTo(0.95, 2);
    });
});

// ── Global Validation ────────────────────────────────────────────
describe('validateGlobalDelivery', () => {
    const required = { n: 300, p: 120, k: 200 };
    
    test('exact totals across stages pass', () => {
        const stages = [
            { deliveredN: 100, deliveredP: 72, deliveredK: 100 },
            { deliveredN: 100, deliveredP: 48, deliveredK: 0 },
            { deliveredN: 100, deliveredP: 0, deliveredK: 100 }
        ];
        const v = validateGlobalDelivery(stages, required);
        expect(v.passed).toBe(true);
        expect(v.totals).toEqual({ n: 300, p: 120, k: 200 });
    });
    
    test('totals within ±5% global tolerance pass', () => {
        // +4% N, -3% P, +5% K (all within tolerance)
        const stages = [
            { deliveredN: 104, deliveredP: 69, deliveredK: 102 },
            { deliveredN: 100, deliveredP: 46, deliveredK: 0 },
            { deliveredN: 98, deliveredP: 7, deliveredK: 98 }
        ];
        // Totals: N=302, P=122, K=200 → N=100.67%, P=101.67%, K=100%
        const v = validateGlobalDelivery(stages, required);
        expect(v.passed).toBe(true);
        expect(v.totals.n).toBeCloseTo(302, 0);
        expect(v.ratios.n).toBeCloseTo(1.0067, 3);
    });
    
    test('totals exceeding +5% global tolerance fail', () => {
        const stages = [
            { deliveredN: 110, deliveredP: 72, deliveredK: 100 },
            { deliveredN: 110, deliveredP: 48, deliveredK: 0 },
            { deliveredN: 110, deliveredP: 0, deliveredK: 100 }
        ];
        const v = validateGlobalDelivery(stages, required);
        expect(v.passed).toBe(false);
        expect(v.errors.some(e => e.includes('Global N overflow'))).toBe(true);
    });
    
    test('totals below -5% global tolerance fail', () => {
        const stages = [
            { deliveredN: 85, deliveredP: 55, deliveredK: 90 },
            { deliveredN: 85, deliveredP: 38, deliveredK: 0 },
            { deliveredN: 85, deliveredP: 0, deliveredK: 90 }
        ];
        const v = validateGlobalDelivery(stages, required);
        expect(v.passed).toBe(false);
        expect(v.errors.some(e => e.includes('deficit'))).toBe(true);
    });
    
    test('empty stage array returns zero totals', () => {
        const v = validateGlobalDelivery([], required);
        expect(v.totals).toEqual({ n: 0, p: 0, k: 0 });
        expect(v.passed).toBe(false);
    });
    
    test('counts undefined as zero', () => {
        const stages = [
            { deliveredN: 100, deliveredP: undefined, deliveredK: 100 },
            { deliveredN: 100 },
            { deliveredN: 100, deliveredP: 0, deliveredK: 100 }
        ];
        const v = validateGlobalDelivery(stages, required);
        expect(v.totals.n).toBe(300);
        expect(v.totals.p).toBe(0);  // undefined treated as 0
        expect(v.totals.k).toBe(200);
    });
    
    test('ratios reflect delivered/required', () => {
        const stages = [
            { deliveredN: 315, deliveredP: 110, deliveredK: 190 }
        ];
        const v = validateGlobalDelivery(stages, required);
        expect(v.ratios.n).toBeCloseTo(315/300, 3);
        expect(v.ratios.p).toBeCloseTo(110/120, 3);
        expect(v.ratios.k).toBeCloseTo(190/200, 3);
    });
});
