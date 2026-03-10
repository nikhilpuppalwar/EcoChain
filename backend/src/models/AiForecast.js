const mongoose = require('mongoose');

const aiForecastSchema = new mongoose.Schema({
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },

    forecastPeriod: { type: String, required: true }, // e.g. "Q4 2024" or "2025"
    predictedEmissions: { type: Number, required: true },
    predictedCreditsNeeded: { type: Number, required: true },

    riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
    modelConfidence: { type: Number, min: 0, max: 100 }, // Percentage

    // Historical context used
    historicalDataPoints: [{
        period: String,
        emissions: Number
    }],

    generatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AiForecast', aiForecastSchema);
