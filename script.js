// Master Data - Load from JSON files (in production, use fetch API)
let cropsData = {};
let fertilizerConversion = {};
let locationsData = {};
let soilTestClassification = {};
let locationCropRecommendations = {};

// Load data files
async function loadData() {
    try {
        const cropsResponse = await fetch('data/crops.json');
        cropsData = await cropsResponse.json();
        
        const conversionResponse = await fetch('data/fertilizer-conversion.json');
        fertilizerConversion = await conversionResponse.json();
        
        const locationsResponse = await fetch('data/locations.json');
        locationsData = await locationsResponse.json();
        
        const soilTestResponse = await fetch('data/soil-test-classification.json');
        soilTestClassification = await soilTestResponse.json();
        
        const locationCropResponse = await fetch('data/location-crop-recommendations.json');
        locationCropRecommendations = await locationCropResponse.json();
    } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to inline data if fetch fails
        loadFallbackData();
    }
}

// Fallback data (simplified version)
function loadFallbackData() {
    // This would be populated from the JSON files if fetch fails
    console.log('Using fallback data');
}

// Initialize data on page load
loadData();
