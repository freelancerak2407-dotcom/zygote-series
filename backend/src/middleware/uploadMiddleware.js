const multer = require('multer');

// Use memory storage (files stored in buffer for S3 upload)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (allowedMimeTypes) => {
    return (req, file, cb) => {
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type. Allowed: ${allowedMimeTypes.join(', ')}`), false);
        }
    };
};

// PDF upload middleware
const uploadPDF = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
    },
    fileFilter: fileFilter(['application/pdf']),
}).single('pdf');

// Image upload middleware
const uploadImage = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: fileFilter(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
}).single('image');

// Profile picture upload middleware
const uploadProfilePicture = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: fileFilter(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
}).single('profilePicture');

// Multiple images upload middleware
const uploadMultipleImages = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB per file
        files: 10, // Max 10 files
    },
    fileFilter: fileFilter(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
}).array('images', 10);

// Generic file upload middleware
const uploadFile = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
    },
}).single('file');

// Error handler middleware
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large',
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files',
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }

    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }

    next();
};

module.exports = {
    uploadPDF,
    uploadImage,
    uploadProfilePicture,
    uploadMultipleImages,
    uploadFile,
    handleUploadError,
};
