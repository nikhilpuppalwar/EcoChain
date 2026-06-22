// utils/reportGenerator.js
// Placeholder for the external BRSR Python microservice integration

const axios = require('axios');

const generateBRSRReport = async (submission, auditReport) => {
    console.log(`[BRSR Generator] Generating report for submission ${submission._id}...`);
    
    try {
        const REPORT_API_URL = process.env.PYTHON_REPORT_API_URL || 'http://localhost:8001/generate-report';
        
        // Map submission data to what the FastAPI payload (ReportData) expects
        const payload = {
            company: submission.company?.name || 'Demo Company',
            industry: submission.company?.sector || 'Manufacturing',
            revenue: 50.5, // Mock revenue
            diesel: 0,
            petrol: 0,
            coal: 0,
            electricity: 0,
            transport_distance: 0,
            cargo_weight: 0,
            waste_generated: 0,
            waste_recycled: 0,
            employees: submission.company?.employeeCount || 100,
            female_employees: 30,
            board_members: 5,
            female_directors: 2
        };

        if (submission.vehicleEmissions && submission.vehicleEmissions.length > 0) {
            submission.vehicleEmissions.forEach(v => {
                if(v.fuelType === 'Diesel') payload.diesel += v.fuelQuantity || 0;
                else payload.petrol += v.fuelQuantity || 0;
            });
        }
        if (submission.logisticsTransport && submission.logisticsTransport.length > 0) {
            submission.logisticsTransport.forEach(l => {
                payload.transport_distance += l.distanceKm || 0;
                payload.cargo_weight += l.cargoWeightTons || 0;
            });
        }

        console.log("Sending payload to Report Generator:", payload);
        const response = await axios.post(REPORT_API_URL, payload, { timeout: 60000 });
        
        const filename = response.data.report;
        // The fastapi server exposes downloads at /download/{filename}
        const downloadUrl = `${REPORT_API_URL.replace('/generate-report', '')}/download/${filename}`;
        console.log("[BRSR Generator] Success:", downloadUrl);
        return downloadUrl;

    } catch (error) {
        console.error('[BRSR Generator] Failed to reach report AI service or generated error:', error.message);
        return `https://mock-brsr-report.com/report_${submission._id}.pdf`;
    }
};

module.exports = {
    generateBRSRReport
};
