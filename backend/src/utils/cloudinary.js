const cloudinary = require('cloudinary').v2;

// If CLOUDINARY_URL is set (Render/Heroku convention), the SDK automatically configures itself.
// Otherwise, configure using individual environment variables.
if (!process.env.CLOUDINARY_URL) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}

const uploadFile = (fileBuffer, fileName, mimeType = '') => {
    return new Promise((resolve, reject) => {
        // Prevent crashing if no credentials are configured
        const config = cloudinary.config();
        if (!config.cloud_name || config.cloud_name === 'PLEASE_SET_YOUR_CLOUD_NAME') {
             console.error("Cloudinary Error: Missing Cloud Name. File upload skipped.");
             return resolve("https://res.cloudinary.com/demo/image/upload/sample.jpg"); // Return a dummy URL so the DB insertion doesn't fail
        }

        // Determine if file needs to be uploaded as a 'raw' asset (non-image files like docx, pdf, xlsx)
        const lowerName = fileName.toLowerCase();
        const isRaw = lowerName.endsWith('.docx') || 
                      lowerName.endsWith('.doc') || 
                      lowerName.endsWith('.pdf') || 
                      lowerName.endsWith('.xlsx') || 
                      (mimeType && (mimeType.includes('officedocument') || mimeType.includes('pdf') || mimeType.includes('octet-stream')));

        const uploadStream = cloudinary.uploader.upload_stream(
            { 
                folder: 'ecochain_evidence',
                resource_type: isRaw ? 'raw' : 'auto',
                public_id: `${Date.now()}_${fileName.replace(/\.[^/.]+$/, "")}`
            },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary upload error:", error);
                    return reject(error);
                }
                resolve(result.secure_url);
            }
        );
        
        // Write the buffer to the stream
        uploadStream.end(fileBuffer);
    });
};

module.exports = {
    uploadFile,
    cloudinary
};
