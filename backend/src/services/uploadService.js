const AWS = require('aws-sdk');
const config = require('../config');

class UploadService {
    constructor() {
        // Configure AWS S3
        this.s3 = new AWS.S3({
            accessKeyId: config.AWS_ACCESS_KEY_ID,
            secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
            region: config.AWS_REGION,
        });

        this.bucket = config.AWS_S3_BUCKET;
    }

    /**
     * Upload file to S3
     */
    async uploadFile(file, folder = 'uploads') {
        const fileName = `${folder}/${Date.now()}-${file.originalname}`;

        const params = {
            Bucket: this.bucket,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read', // Make file publicly accessible
        };

        try {
            const result = await this.s3.upload(params).promise();
            return {
                success: true,
                url: result.Location,
                key: result.Key,
                bucket: result.Bucket,
            };
        } catch (error) {
            console.error('S3 upload error:', error);
            throw new Error('Failed to upload file to S3');
        }
    }

    /**
     * Upload PDF
     */
    async uploadPDF(file) {
        // Validate PDF
        if (file.mimetype !== 'application/pdf') {
            throw new Error('File must be a PDF');
        }

        // Max size 50MB
        if (file.size > 50 * 1024 * 1024) {
            throw new Error('PDF file size must be less than 50MB');
        }

        return await this.uploadFile(file, 'pdfs');
    }

    /**
     * Upload Image
     */
    async uploadImage(file) {
        // Validate image
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            throw new Error('File must be an image (JPEG, PNG, or WebP)');
        }

        // Max size 10MB
        if (file.size > 10 * 1024 * 1024) {
            throw new Error('Image file size must be less than 10MB');
        }

        return await this.uploadFile(file, 'images');
    }

    /**
     * Upload Mind Map
     */
    async uploadMindMap(file) {
        return await this.uploadImage(file);
    }

    /**
     * Upload Profile Picture
     */
    async uploadProfilePicture(file) {
        // Validate image
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            throw new Error('File must be an image (JPEG, PNG, or WebP)');
        }

        // Max size 5MB
        if (file.size > 5 * 1024 * 1024) {
            throw new Error('Profile picture must be less than 5MB');
        }

        return await this.uploadFile(file, 'profiles');
    }

    /**
     * Delete file from S3
     */
    async deleteFile(fileKey) {
        const params = {
            Bucket: this.bucket,
            Key: fileKey,
        };

        try {
            await this.s3.deleteObject(params).promise();
            return { success: true };
        } catch (error) {
            console.error('S3 delete error:', error);
            throw new Error('Failed to delete file from S3');
        }
    }

    /**
     * Get signed URL for private files
     */
    async getSignedUrl(fileKey, expiresIn = 3600) {
        const params = {
            Bucket: this.bucket,
            Key: fileKey,
            Expires: expiresIn, // URL expires in seconds
        };

        try {
            const url = await this.s3.getSignedUrlPromise('getObject', params);
            return { success: true, url };
        } catch (error) {
            console.error('S3 signed URL error:', error);
            throw new Error('Failed to generate signed URL');
        }
    }

    /**
     * Validate file type and size
     */
    validateFile(file, allowedTypes, maxSizeMB) {
        if (!allowedTypes.includes(file.mimetype)) {
            throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
        }

        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            throw new Error(`File size must be less than ${maxSizeMB}MB`);
        }

        return true;
    }
}

module.exports = new UploadService();
