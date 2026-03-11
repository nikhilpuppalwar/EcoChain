const multer = require('multer');

// Configure multer to use memory storage since we send files to IPFS (Pinata)
const storage = multer.memoryStorage();

// File filter for documents (PDF, Excel) and images (JPG/PNG)
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, JPG, and PNG are allowed.'), false);
    }
};

// 10MB limit (frontend copy mentions 10MB)
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
    },
    fileFilter: fileFilter,
});

module.exports = upload;
