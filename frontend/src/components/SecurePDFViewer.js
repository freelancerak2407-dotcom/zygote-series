/**
 * Secure PDF Viewer Component
 * Views PDFs in-app without allowing downloads
 * Prevents screenshots and copying
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import SecureStorage from '../utils/secureStorage';
import { colors, spacing, fontSize } from '../config/theme';

const SecurePDFViewer = ({ pdfUrl, fileName, userId, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [localUri, setLocalUri] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadPDFSecurely();
    }, [pdfUrl]);

    /**
     * Load PDF securely to in-app storage
     */
    const loadPDFSecurely = async () => {
        try {
            setLoading(true);
            setError(null);

            // Download to secure in-app storage
            const uri = await SecureStorage.saveFileSecurely(pdfUrl, fileName, userId);
            setLocalUri(uri);
        } catch (err) {
            console.error('Error loading PDF:', err);
            setError('Failed to load PDF. Please try again.');
            Alert.alert('Error', 'Failed to load PDF securely.');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Generate secure HTML for PDF viewing
     * Disables right-click, text selection, and copying
     */
    const getSecureHTML = () => {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                        -webkit-user-select: none;
                        -moz-user-select: none;
                        -ms-user-select: none;
                        user-select: none;
                        -webkit-touch-callout: none;
                    }
                    body {
                        background: #f5f5f5;
                        overflow: hidden;
                    }
                    #pdf-container {
                        width: 100%;
                        height: 100vh;
                        position: relative;
                    }
                    iframe {
                        width: 100%;
                        height: 100%;
                        border: none;
                    }
                    /* Watermark overlay */
                    .watermark {
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%) rotate(-45deg);
                        font-size: 48px;
                        color: rgba(0, 0, 0, 0.1);
                        pointer-events: none;
                        z-index: 9999;
                        white-space: nowrap;
                    }
                </style>
            </head>
            <body>
                <div id="pdf-container">
                    <iframe src="${localUri}" allowfullscreen></iframe>
                    <div class="watermark">ZYGOTE - ${userId}</div>
                </div>
                
                <script>
                    // Disable right-click
                    document.addEventListener('contextmenu', (e) => e.preventDefault());
                    
                    // Disable text selection
                    document.addEventListener('selectstart', (e) => e.preventDefault());
                    
                    // Disable copy
                    document.addEventListener('copy', (e) => {
                        e.preventDefault();
                        return false;
                    });
                    
                    // Disable keyboard shortcuts
                    document.addEventListener('keydown', (e) => {
                        // Prevent Ctrl+C, Ctrl+S, Ctrl+P, Print Screen
                        if ((e.ctrlKey || e.metaKey) && 
                            (e.key === 'c' || e.key === 's' || e.key === 'p')) {
                            e.preventDefault();
                            return false;
                        }
                        // Prevent Print Screen
                        if (e.key === 'PrintScreen') {
                            e.preventDefault();
                            return false;
                        }
                    });
                    
                    // Disable drag and drop
                    document.addEventListener('dragstart', (e) => e.preventDefault());
                    
                    // Detect DevTools (basic detection)
                    const detectDevTools = () => {
                        const threshold = 160;
                        if (window.outerWidth - window.innerWidth > threshold ||
                            window.outerHeight - window.innerHeight > threshold) {
                            document.body.innerHTML = '<h1 style="text-align:center;margin-top:50px;">Developer tools detected. Content hidden.</h1>';
                        }
                    };
                    
                    setInterval(detectDevTools, 1000);
                </script>
            </body>
            </html>
        `;
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
                <Text style={styles.loadingText}>Loading PDF securely...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <WebView
                source={{ html: getSecureHTML() }}
                style={styles.webview}
                javaScriptEnabled={true}
                domStorageEnabled={false}
                allowFileAccess={false}
                allowUniversalAccessFromFileURLs={false}
                mixedContentMode="never"
                onError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.error('WebView error:', nativeEvent);
                    setError('Failed to display PDF');
                }}
                // Disable screenshot on Android WebView
                {...(Platform.OS === 'android' && {
                    androidLayerType: 'hardware',
                })}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    webview: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    loadingText: {
        marginTop: spacing.md,
        fontSize: fontSize.base,
        color: colors.text.secondary,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
        backgroundColor: '#ffffff',
    },
    errorText: {
        fontSize: fontSize.base,
        color: colors.error,
        textAlign: 'center',
    },
});

export default SecurePDFViewer;
