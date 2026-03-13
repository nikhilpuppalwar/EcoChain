const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['industry', 'government', 'auditor', 'admin'], required: true },

    // Link to company (industry role)
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },

    // Government-specific fields
    governmentProfile: {
        ministryName: String,
        department: String,
        jurisdiction: String,
        officerName: String,
        designation: String,
        serviceId: String,
        officialWebsite: String,
        officeAddress: String,
        identityDocumentCID: String,
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    },

    // Auditor-specific fields
    auditorProfile: {
        name: String,
        organization: String,
        designation: String,
        licenseNumber: String,
        specialization: [String],
        yearsExperience: Number,
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        currentAssignments: [{
            submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmissionEntry' },
            industryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
            role: { type: String, enum: ['primary', 'secondary'] },
            assignedAt: { type: Date, default: Date.now }
        }]
    },

    // Admin-specific fields
    adminProfile: {
        name: String,
        superAdmin: { type: Boolean, default: false },
    },

    // Password reset
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    isActive: { type: Boolean, default: false },
    refreshToken: String,
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
