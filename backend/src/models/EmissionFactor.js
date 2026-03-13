const mongoose = require('mongoose');

const emissionFactorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, enum: ['fuel', 'transport', 'waste', 'electricity', 'process'], required: true },
    fuelType: { type: String }, // Optional, mostly for 'fuel'
    factorValue: { type: Number, required: true },
    unit: { type: String, required: true },
    scope: { type: String, enum: ['scope1', 'scope2', 'scope3'], required: true },
    sourceReference: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EmissionFactor', emissionFactorSchema);
