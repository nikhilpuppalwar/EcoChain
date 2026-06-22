const mongoose = require('mongoose');

const esgReportSchema = new mongoose.Schema({
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    jobId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['ESG', 'Carbon'], default: 'ESG' },
    size: { type: String, default: 'Pending' },
    url: { type: String }, // Cloudinary URL
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ESGReport', esgReportSchema);
