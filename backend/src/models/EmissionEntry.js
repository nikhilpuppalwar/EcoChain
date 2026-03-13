const mongoose = require('mongoose');

const emissionEntrySchema = new mongoose.Schema({
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    periodMonth: { type: Number, required: true, min: 1, max: 12 },
    periodYear: { type: Number, required: true },
    quantityTonnes: { type: Number, required: true },
    emissionSource: { type: String, required: true }, // General summary source
    location: { type: String }, // New location field adding context
    notes: { type: String, required: true }, // Combined description + dynamic fields fallback

    // --- STEP 1 NEW DATA CATEGORIES ---
    wasteGeneration: [{
        wasteType: { type: String, enum: ['Solid', 'Liquid', 'Hazardous', 'e_waste', 'organic'] },
        quantity: Number,
        unit: { type: String, enum: ['kg', 'tonne', 'Tons', 'Kg'] },
        disposalMethod: { type: String }, // 'landfill', 'incineration', 'recycling', 'composting'
        recyclingPercentage: { type: Number, min: 0, max: 100, default: 0 },
        calculatedCO2e: { type: Number, default: 0 }
    }],

    logisticsTransport: [{
        transportMode: { type: String }, // 'Truck', 'Ship', 'Train', 'Air', 'van'
        distanceKm: Number,
        cargoWeightTons: Number,
        providerName: String,
        invoiceNumber: String,
        calculatedCO2e: { type: Number, default: 0 }
    }],

    vehicleEmissions: [{
        vehicleType: { type: String }, // 'car', 'truck', 'van', 'motorcycle', 'bus'
        fuelType: String,
        distanceTraveled: Number,
        fuelQuantity: Number,
        calculatedCO2e: { type: Number, default: 0 }
    }],

    productionOutput: {
        productType: String,
        quantity: Number,
        unit: String,
        operatingHours: Number,
        productionCapacity: Number
    },

    // --- STRUCTURED DOCUMENTS ---
    supportingDocs: {
        fuelInvoices: { type: [String], default: [] },
        electricityBills: { type: [String], default: [] },
        transportBills: { type: [String], default: [] },
        wasteCerts: { type: [String], default: [] },
        productionReports: { type: [String], default: [] },
        others: { type: [String], default: [] }
    },

    // Keeping original evidence field for backwards compatibility during migration
    evidenceFileName: String,
    evidenceUrl: { type: String }, 

    // --- AUDITOR ASSIGNMENT (STEP 4) ---
    assignedAuditors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // References auditors
    auditType: { type: String, enum: ['single', 'dual'], default: 'single' },
    
    // Govt tracking
    assignedByGovtId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // References Govt User
    assignedByGovtAt: { type: Date, default: null },

    status: { 
        type: String, 
        enum: [
            'draft',
            'submitted', // Same as pending previously
            'pending', // Old fallback
            'ai_checking',
            'ai_flagged',
            'pending_govt_assignment',
            'pending_audit',
            'awaiting_second_auditor',
            'under_review',
            'approved',
            'rejected',
            'correction_requested'
        ], 
        default: 'submitted' 
    },
    
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Old field, kept for backwards compatibility temporarily
    reviewedAt: Date,
    rejectionReason: String,

    txHash: String, // Blockchain transaction hash after on-chain verification
    createdAt: { type: Date, default: Date.now }
});

// Backward compatibility with legacy queries
emissionEntrySchema.index({ company: 1, status: 1 });

module.exports = mongoose.model('EmissionEntry', emissionEntrySchema);
