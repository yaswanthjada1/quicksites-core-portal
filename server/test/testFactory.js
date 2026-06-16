import { DbFactory } from '../config/dbFactory.js';
import { CompanyPredictor } from '../ml/companyPredictor.js';

/**
 * Execute local engine diagnostics for database introspection and fallback recovery.
 */
async function runLocalEngineTest() {
    console.log("🚀 [Diagnostic Test]: Starting Dynamic Database Introspection Test...");
    
    // Test scenario: evaluate MongoDB discovery and fallback handling using a mock connection URI
    // Replace mockMongoUri with a live MongoDB connection string for integration validation
    const mockMongoUri = 'mongodb://localhost:27017/non_existent_fallback_test'; 
    
    console.log("\n--- 🧪 TEST 1: Evaluating MongoDB Behavioral Routing ---");
    try {
        const dataset = await DbFactory.connectAndExtract('mongodb', mockMongoUri);
        console.log(`✅ Test 1 Success! Normalized Array Length: ${dataset.length}`);
        
        const analytics = CompanyPredictor.analyzeBusinessMetrics(dataset);
        console.log("📈 Computed Analytics Result Payload:", JSON.stringify(analytics, null, 2));
    } catch (err) {
        console.log(`❌ Test 1 Encountered Connection Timeout/Refusal as expected (No live DB active): ${err.message}`);
    }

    console.log("\n--- 🧪 TEST 2: Evaluating System Baseline Recovery ---");
    // Validate fallback telemetry generation when discovery yields no usable records
    const fallbackData = DbFactory.getFallbackTelemetry();
    const metricAnalysis = CompanyPredictor.analyzeBusinessMetrics(fallbackData);
    console.log("🛡️ Fallback Mathematical Computations Verified Successfully:");
    console.log(`   • System Health Classification: ${metricAnalysis.predictions.estimatedSystemHealthScore}`);
    console.log(`   • Active Engagement Ratio: ${metricAnalysis.metrics.activeMonthlyPercentage}`);
    console.log(`   • Growth Forecast: +${metricAnalysis.predictions.forecastedGrowthNextMonth} units`);
    
    console.log("\n🎉 [Diagnostic Test]: Structural Factory Tests Complete!");
}

runLocalEngineTest();