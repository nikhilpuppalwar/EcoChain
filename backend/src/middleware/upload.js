const multer = require('multer');

// Configure multer to use memory storage since we send files to IPFS (Pinata)
const storage = multer.memoryStorage();

// File filter for documents (PDF) and images (JPG/PNG)
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, JPG, and PNG are allowed.'), false);
    }
};

// 5MB limit
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
    },
    fileFilter: fileFilter,
});

module.exports = upload;
