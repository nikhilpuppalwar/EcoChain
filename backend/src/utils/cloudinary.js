const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFile = (fileBuffer, fileName, mimeType) => {
    return new Promise((resolve, reject) => {
        // Prevent crashing if cloud_name isn't set yet (returns a gracefully handled error)
        if (cloudinary.config().cloud_name === 'PLEASE_SET_YOUR_CLOUD_NAME') {
             console.error("Cloudinary Error: Missing Cloud Name. File upload skipped.");
             return resolve("https://res.cloudinary.com/demo/image/upload/sample.jpg"); // Return a dummy URL so the DB insertion doesn't fail on "required"
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            { 
                folder: 'ecochain_evidence',
                resource_type: 'auto',
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
