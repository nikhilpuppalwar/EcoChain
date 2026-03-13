const EmissionFactor = require('../models/EmissionFactor');

/**
 * Calculates CO2e emissions across Scope 1, 2, and 3 based on provided data.
 * @param {Object} data - Input data containing various emission sources.
 * @returns {Object} CO2e breakdown
 */
exports.calculateCO2e = async (data) => {
    let breakdown = {
        scope1: { fuelCombustion: 0, vehicleEmissions: 0, processEmissions: 0, total: 0 },
        scope2: { electricity: 0, total: 0 },
        scope3: { logistics: 0, waste: 0, businessTravel: 0, total: 0 },
        totalCO2e: 0
    };

    try {
        // We will fetch all factors at once to minimize DB calls
        const factors = await EmissionFactor.find();
        const factorMap = {};
        factors.forEach(f => {
            // Key by category and name for easy lookup
            const key = `${f.category}_${f.name}`.toLowerCase();
            factorMap[key] = f.factorValue;
        });

        // Helper function
        const getFactor = (category, name, fallback) => {
            const key = `${category}_${name}`.toLowerCase();
            return factorMap[key] || fallback;
        };

        // SCOPE 1: Vehicle Emissions
        if (data.vehicleEmissions && Array.isArray(data.vehicleEmissions)) {
            data.vehicleEmissions.forEach(v => {
                const factor = getFactor('transport', v.vehicleType || v.fuelType, 2.3); // kg per unit fallback
                const emission = (v.distanceTraveled || v.fuelQuantity || 0) * factor / 1000; // converted to Tonnes
                breakdown.scope1.vehicleEmissions += emission;
            });
        }
        breakdown.scope1.total = breakdown.scope1.fuelCombustion + breakdown.scope1.vehicleEmissions + breakdown.scope1.processEmissions;

        // SCOPE 2: Electricity
        if (data.electricityUsage) {
            const factor = getFactor('electricity', 'grid', 0.82); // 0.82 kg/kWh default India grid
            breakdown.scope2.electricity = (data.electricityUsage * factor) / 1000;
        }
        breakdown.scope2.total = breakdown.scope2.electricity;

        // SCOPE 3: Logistics & Transport
        if (data.logisticsTransport && Array.isArray(data.logisticsTransport)) {
            data.logisticsTransport.forEach(l => {
                const factor = getFactor('transport', l.transportMode, 0.1); // kg per tonne-km
                const emission = ((l.distanceKm || 0) * (l.cargoWeightTons || 0) * factor) / 1000;
                breakdown.scope3.logistics += emission;
            });
        }

        // SCOPE 3: Waste Generation
        if (data.wasteGeneration && Array.isArray(data.wasteGeneration)) {
            data.wasteGeneration.forEach(w => {
                const factor = getFactor('waste', w.wasteType, 0.5); // kg per kg waste
                let emission = ((w.quantity || 0) * factor) / 1000;
                // Subtract 10% per recycling percentage roughly for approximation
                if (w.recyclingPercentage) {
                    emission = emission * (1 - (w.recyclingPercentage / 100));
                }
                breakdown.scope3.waste += Math.max(0, emission);
            });
        }

        breakdown.scope3.total = breakdown.scope3.logistics + breakdown.scope3.waste + breakdown.scope3.businessTravel;

        // Grand Total
        breakdown.totalCO2e = breakdown.scope1.total + breakdown.scope2.total + breakdown.scope3.total;

    } catch (error) {
        console.error("Error calculating CO2e:", error);
        // Fallback or bubble up
        throw new Error("CO2e calculation failed internally");
    }

    return breakdown;
};
