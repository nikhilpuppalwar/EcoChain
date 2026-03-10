const axios = require('axios');
const AiForecast = require('../models/AiForecast');
const Company = require('../models/Company');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5000';

/* ===========================
 * GET / GENERATE FORECAST
 * =========================== */
exports.getForecast = async (req, res, next) => {
    try {
        const company = await Company.findById(req.user.company);
        if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

        // In a real scenario, we would pass historical data to the AI model
        const payload = {
            companyName: company.name,
            sector: company.sector,
            annualBudget: company.annualCarbonBudget
        };

        // Proxy the request to the Flask AI Service
        let aiResponse;
        try {
            aiResponse = await axios.post(`${AI_SERVICE_URL}/forecast`, payload);
        } catch (aiError) {
            console.error('AI Service Error:', aiError.message);
            return res.status(503).json({
                success: false,
                message: 'AI Forecasting service is currently unavailable. Please try again later.'
            });
        }

        // Save forecast to DB
        const forecast = await AiForecast.create({
            company: req.user.company,
            forecastPeriod: aiResponse.data.period || 'Next Quarter',
            predictedEmissions: aiResponse.data.predicted_emissions || 0,
            predictedCreditsNeeded: aiResponse.data.predicted_credits_needed || 0,
            riskLevel: aiResponse.data.risk_level || 'Low',
            modelConfidence: aiResponse.data.confidence || 85,
        });

        res.status(200).json({ success: true, data: forecast });
    } catch (error) {
        next(error);
    }
};

/* ===========================
 * GET FORECAST HISTORY
 * =========================== */
exports.getForecastHistory = async (req, res, next) => {
    try {
        const forecasts = await AiForecast.find({ company: req.user.company })
            .sort({ generatedAt: -1 })
            .limit(10);

        res.status(200).json({ success: true, data: forecasts });
    } catch (error) {
        next(error);
    }
};
