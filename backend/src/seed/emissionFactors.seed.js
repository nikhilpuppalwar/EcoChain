require('dotenv').config();
const mongoose = require('mongoose');
const EmissionFactor = require('../models/EmissionFactor');

const factors = [
    // Transport factors (Scope 3) - GHG Protocol 2023
    { name: 'Truck Freight', category: 'transport', factorValue: 0.062, unit: 'per_tonne_km', scope: 'scope3', sourceReference: 'GHG Protocol 2023' },
    { name: 'Ship Freight', category: 'transport', factorValue: 0.008, unit: 'per_tonne_km', scope: 'scope3', sourceReference: 'GHG Protocol 2023' },
    { name: 'Train Freight', category: 'transport', factorValue: 0.022, unit: 'per_tonne_km', scope: 'scope3', sourceReference: 'GHG Protocol 2023' },
    { name: 'Air Freight', category: 'transport', factorValue: 0.602, unit: 'per_tonne_km', scope: 'scope3', sourceReference: 'GHG Protocol 2023' },

    // Waste factors (Scope 3) - IPCC AR6 2021
    { name: 'Solid Waste - Landfill', category: 'waste', factorValue: 0.467, unit: 'per_tonne', scope: 'scope3', sourceReference: 'IPCC AR6 2021' },
    { name: 'Liquid Waste - Incineration', category: 'waste', factorValue: 0.338, unit: 'per_tonne', scope: 'scope3', sourceReference: 'IPCC AR6 2021' },
    { name: 'Hazardous Waste', category: 'waste', factorValue: 0.980, unit: 'per_tonne', scope: 'scope3', sourceReference: 'IPCC AR6 2021' },

    // Vehicle fuel factors (Scope 1)
    { name: 'Petrol - Vehicle', category: 'fuel', fuelType: 'petrol', factorValue: 2.31, unit: 'per_litre', scope: 'scope1', sourceReference: 'IPCC AR6 2021' },
    { name: 'Diesel - Vehicle', category: 'fuel', fuelType: 'diesel', factorValue: 2.68, unit: 'per_litre', scope: 'scope1', sourceReference: 'IPCC AR6 2021' },
    { name: 'CNG - Vehicle', category: 'fuel', fuelType: 'cng', factorValue: 2.06, unit: 'per_kg', scope: 'scope1', sourceReference: 'IPCC AR6 2021' },
];

const seedEmissionFactors = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to DB');

        await EmissionFactor.deleteMany({});
        console.log('Cleared existing factors');

        await EmissionFactor.insertMany(factors);
        console.log('Successfully seeded Emission Factors');

        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedEmissionFactors();
