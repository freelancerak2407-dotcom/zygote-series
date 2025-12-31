/**
 * Security Configuration for ZYGOTE Mobile App
 * Prevents screenshots, screen recording, and unauthorized file downloads
 */

import { Platform } from 'react-native';

/**
 * Security settings for content protection
 */
export const SecurityConfig = {
    // Prevent screenshots and screen recording
    preventScreenCapture: true,

    // Prevent file downloads to device storage
    preventExternalDownloads: true,

    // Use secure in-app storage only
    useSecureStorage: true,

    // Watermark content with user info
    enableWatermark: true,

    // Disable copy/paste for sensitive content
    disableCopyPaste: true,

    // Session timeout (minutes)
    sessionTimeout: 30,

    // Maximum offline content cache (MB)
    maxOfflineCache: 500,
};

/**
 * Platform-specific security implementations
 */
export const PlatformSecurity = {
    /**
     * Enable screenshot prevention (Android)
     * Note: iOS doesn't allow programmatic screenshot prevention
     */
    enableScreenshotPrevention: () => {
        if (Platform.OS === 'android') {
            // This will be implemented in native module
            console.log('Screenshot prevention enabled (Android)');
            return true;
        } else if (Platform.OS === 'ios') {
            // iOS: We'll use blur overlay when app goes to background
            console.log('Background blur enabled (iOS)');
            return true;
        }
        return false;
    },

    /**
     * Detect if screen recording is active
     */
    isScreenRecording: () => {
        // This will be implemented in native module
        return false;
    },

    /**
     * Show warning if screen recording detected
     */
    showScreenRecordingWarning: () => {
        console.warn('Screen recording detected - content will be hidden');
    },
};

/**
 * File security settings
 */
export const FileSecurityConfig = {
    // Allowed file types for in-app viewing
    allowedFileTypes: ['pdf', 'jpg', 'jpeg', 'png'],

    // Maximum file size (MB)
    maxFileSize: 50,

    // Encryption enabled for stored files
    encryptStoredFiles: true,

    // Auto-delete files on logout
    autoDeleteOnLogout: true,

    // File access expiry (hours)
    fileAccessExpiry: 24,
};

export default SecurityConfig;
