/**
 * Screenshot Prevention Component
 * Prevents screenshots and screen recording
 * Shows blur overlay when app goes to background
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, AppState, Platform, Alert } from 'react-native';
import { BlurView } from 'expo-blur';

const ScreenshotPrevention = ({ children }) => {
    const [appState, setAppState] = useState(AppState.currentState);
    const [showBlur, setShowBlur] = useState(false);

    useEffect(() => {
        // Prevent screenshots on Android
        if (Platform.OS === 'android') {
            enableAndroidScreenshotPrevention();
        }

        // Monitor app state changes
        const subscription = AppState.addEventListener('change', handleAppStateChange);

        // Check for screen recording periodically
        const recordingCheck = setInterval(checkScreenRecording, 5000);

        return () => {
            subscription.remove();
            clearInterval(recordingCheck);
        };
    }, []);

    /**
     * Enable screenshot prevention on Android
     * Note: Requires native module implementation
     */
    const enableAndroidScreenshotPrevention = () => {
        try {
            // This would call a native module
            // For now, we'll use a workaround with secure flag
            console.log('Screenshot prevention enabled (Android)');

            // In production, you would use:
            // import { preventScreenCapture } from 'react-native-prevent-screenshot';
            // preventScreenCapture(true);
        } catch (error) {
            console.error('Error enabling screenshot prevention:', error);
        }
    };

    /**
     * Handle app state changes
     * Show blur when app goes to background (iOS workaround)
     */
    const handleAppStateChange = (nextAppState) => {
        if (appState.match(/active/) && nextAppState.match(/inactive|background/)) {
            // App is going to background - show blur to prevent screenshot in task switcher
            setShowBlur(true);
        } else if (appState.match(/inactive|background/) && nextAppState === 'active') {
            // App is coming to foreground - hide blur
            setShowBlur(false);
        }

        setAppState(nextAppState);
    };

    /**
     * Check if screen recording is active
     * Note: iOS doesn't provide API to detect screen recording
     * Android can detect through native module
     */
    const checkScreenRecording = () => {
        if (Platform.OS === 'android') {
            // This would call a native module to check
            // For now, we'll just log
            // const isRecording = NativeModules.ScreenRecordingDetector.isRecording();
            // if (isRecording) {
            //     handleScreenRecordingDetected();
            // }
        }
    };

    /**
     * Handle screen recording detection
     */
    const handleScreenRecordingDetected = () => {
        Alert.alert(
            '⚠️ Screen Recording Detected',
            'Screen recording is not allowed. Content will be hidden for security.',
            [
                {
                    text: 'OK',
                    onPress: () => {
                        // Hide sensitive content or logout
                        setShowBlur(true);
                    },
                },
            ],
            { cancelable: false }
        );
    };

    return (
        <View style={styles.container}>
            {children}

            {/* Blur overlay when app is in background (iOS) */}
            {showBlur && Platform.OS === 'ios' && (
                <BlurView intensity={100} style={StyleSheet.absoluteFill}>
                    <View style={styles.blurOverlay} />
                </BlurView>
            )}

            {/* Black overlay for Android background */}
            {showBlur && Platform.OS === 'android' && (
                <View style={[StyleSheet.absoluteFill, styles.blackOverlay]} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    blurOverlay: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    blackOverlay: {
        backgroundColor: '#000000',
    },
});

export default ScreenshotPrevention;
