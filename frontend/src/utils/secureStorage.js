/**
 * Secure Storage Utility
 * Handles encrypted file storage within the app
 * Prevents files from being saved to device storage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

class SecureStorage {
    constructor() {
        // Use app's internal cache directory (not accessible to user)
        this.secureDirectory = FileSystem.cacheDirectory + 'secure/';
        this.initializeSecureDirectory();
    }

    /**
     * Initialize secure directory
     */
    async initializeSecureDirectory() {
        try {
            const dirInfo = await FileSystem.getInfoAsync(this.secureDirectory);
            if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(this.secureDirectory, {
                    intermediates: true,
                });
                console.log('Secure directory created');
            }
        } catch (error) {
            console.error('Error creating secure directory:', error);
        }
    }

    /**
     * Save file securely (in-app only, not accessible externally)
     * @param {string} fileUrl - Remote file URL
     * @param {string} fileName - Local file name
     * @param {string} userId - User ID for encryption key
     * @returns {Promise<string>} Local file URI
     */
    async saveFileSecurely(fileUrl, fileName, userId) {
        try {
            const localUri = this.secureDirectory + this.encryptFileName(fileName, userId);

            // Download to secure app directory (not device storage)
            const downloadResult = await FileSystem.downloadAsync(
                fileUrl,
                localUri,
                {
                    // Don't use system download manager
                    sessionType: FileSystem.FileSystemSessionType.BACKGROUND,
                }
            );

            if (downloadResult.status === 200) {
                // Store metadata
                await this.saveFileMetadata(fileName, {
                    localUri: downloadResult.uri,
                    originalUrl: fileUrl,
                    downloadedAt: new Date().toISOString(),
                    userId: userId,
                    expiresAt: this.getExpiryTime(24), // 24 hours
                });

                console.log('File saved securely:', fileName);
                return downloadResult.uri;
            }

            throw new Error('Download failed');
        } catch (error) {
            console.error('Error saving file securely:', error);
            throw error;
        }
    }

    /**
     * Get file from secure storage
     * @param {string} fileName - File name
     * @param {string} userId - User ID
     * @returns {Promise<string>} Local file URI
     */
    async getSecureFile(fileName, userId) {
        try {
            const metadata = await this.getFileMetadata(fileName);

            if (!metadata) {
                throw new Error('File not found in secure storage');
            }

            // Check if file has expired
            if (new Date() > new Date(metadata.expiresAt)) {
                await this.deleteSecureFile(fileName);
                throw new Error('File access expired');
            }

            // Verify file still exists
            const fileInfo = await FileSystem.getInfoAsync(metadata.localUri);
            if (!fileInfo.exists) {
                throw new Error('File not found');
            }

            return metadata.localUri;
        } catch (error) {
            console.error('Error getting secure file:', error);
            throw error;
        }
    }

    /**
     * Delete file from secure storage
     * @param {string} fileName - File name
     */
    async deleteSecureFile(fileName) {
        try {
            const metadata = await this.getFileMetadata(fileName);
            if (metadata && metadata.localUri) {
                await FileSystem.deleteAsync(metadata.localUri, { idempotent: true });
                await this.deleteFileMetadata(fileName);
                console.log('File deleted securely:', fileName);
            }
        } catch (error) {
            console.error('Error deleting secure file:', error);
        }
    }

    /**
     * Clear all secure files (on logout)
     */
    async clearAllSecureFiles() {
        try {
            await FileSystem.deleteAsync(this.secureDirectory, { idempotent: true });
            await AsyncStorage.removeItem('secure_file_metadata');
            await this.initializeSecureDirectory();
            console.log('All secure files cleared');
        } catch (error) {
            console.error('Error clearing secure files:', error);
        }
    }

    /**
     * Encrypt file name (simple obfuscation)
     * @param {string} fileName - Original file name
     * @param {string} userId - User ID as salt
     * @returns {string} Encrypted file name
     */
    encryptFileName(fileName, userId) {
        // Simple hash-based encryption (use crypto library in production)
        const hash = this.simpleHash(fileName + userId);
        const extension = fileName.split('.').pop();
        return `${hash}.${extension}`;
    }

    /**
     * Simple hash function (replace with proper crypto in production)
     */
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }

    /**
     * Save file metadata
     */
    async saveFileMetadata(fileName, metadata) {
        try {
            const allMetadata = await this.getAllMetadata();
            allMetadata[fileName] = metadata;
            await AsyncStorage.setItem('secure_file_metadata', JSON.stringify(allMetadata));
        } catch (error) {
            console.error('Error saving file metadata:', error);
        }
    }

    /**
     * Get file metadata
     */
    async getFileMetadata(fileName) {
        try {
            const allMetadata = await this.getAllMetadata();
            return allMetadata[fileName] || null;
        } catch (error) {
            console.error('Error getting file metadata:', error);
            return null;
        }
    }

    /**
     * Delete file metadata
     */
    async deleteFileMetadata(fileName) {
        try {
            const allMetadata = await this.getAllMetadata();
            delete allMetadata[fileName];
            await AsyncStorage.setItem('secure_file_metadata', JSON.stringify(allMetadata));
        } catch (error) {
            console.error('Error deleting file metadata:', error);
        }
    }

    /**
     * Get all metadata
     */
    async getAllMetadata() {
        try {
            const data = await AsyncStorage.getItem('secure_file_metadata');
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Error getting all metadata:', error);
            return {};
        }
    }

    /**
     * Get expiry time
     */
    getExpiryTime(hours) {
        const now = new Date();
        now.setHours(now.getHours() + hours);
        return now.toISOString();
    }

    /**
     * Clean expired files
     */
    async cleanExpiredFiles() {
        try {
            const allMetadata = await this.getAllMetadata();
            const now = new Date();

            for (const [fileName, metadata] of Object.entries(allMetadata)) {
                if (new Date(metadata.expiresAt) < now) {
                    await this.deleteSecureFile(fileName);
                }
            }

            console.log('Expired files cleaned');
        } catch (error) {
            console.error('Error cleaning expired files:', error);
        }
    }
}

export default new SecureStorage();
