/**
 * Secure Image Viewer Component
 * Views images in-app without allowing downloads or screenshots
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Image,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Dimensions,
    Text,
} from 'react-native';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import SecureStorage from '../utils/secureStorage';
import { colors, spacing, fontSize } from '../config/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SecureImageViewer = ({ imageUrl, fileName, userId }) => {
    const [loading, setLoading] = useState(true);
    const [localUri, setLocalUri] = useState(null);
    const [error, setError] = useState(null);

    const scale = useSharedValue(1);
    const focalX = useSharedValue(0);
    const focalY = useSharedValue(0);

    useEffect(() => {
        loadImageSecurely();
    }, [imageUrl]);

    /**
     * Load image securely to in-app storage
     */
    const loadImageSecurely = async () => {
        try {
            setLoading(true);
            setError(null);

            // Download to secure in-app storage
            const uri = await SecureStorage.saveFileSecurely(imageUrl, fileName, userId);
            setLocalUri(uri);
        } catch (err) {
            console.error('Error loading image:', err);
            setError('Failed to load image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handle pinch gesture for zoom
     */
    const pinchHandler = useAnimatedGestureHandler({
        onActive: (event) => {
            scale.value = event.scale;
            focalX.value = event.focalX;
            focalY.value = event.focalY;
        },
        onEnd: () => {
            scale.value = withTiming(1);
        },
    });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: focalX.value },
                { translateY: focalY.value },
                { scale: scale.value },
                { translateX: -focalX.value },
                { translateY: -focalY.value },
            ],
        };
    });

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
                <Text style={styles.loadingText}>Loading image securely...</Text>
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
            <PinchGestureHandler onGestureEvent={pinchHandler}>
                <Animated.View style={[styles.imageContainer, animatedStyle]}>
                    <Image
                        source={{ uri: localUri }}
                        style={styles.image}
                        resizeMode="contain"
                        // Prevent long press save on iOS
                        onLongPress={() => {
                            Alert.alert(
                                'Action Not Allowed',
                                'Downloading images is not permitted for security reasons.'
                            );
                        }}
                    />

                    {/* Watermark overlay */}
                    <View style={styles.watermarkContainer}>
                        <Text style={styles.watermark}>
                            ZYGOTE - {userId}
                        </Text>
                    </View>
                </Animated.View>
            </PinchGestureHandler>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: SCREEN_WIDTH,
        height: '100%',
    },
    watermarkContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
    },
    watermark: {
        fontSize: 32,
        color: 'rgba(255, 255, 255, 0.2)',
        fontWeight: 'bold',
        transform: [{ rotate: '-45deg' }],
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000',
    },
    loadingText: {
        marginTop: spacing.md,
        fontSize: fontSize.base,
        color: '#ffffff',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
        backgroundColor: '#000000',
    },
    errorText: {
        fontSize: fontSize.base,
        color: colors.error,
        textAlign: 'center',
    },
});

export default SecureImageViewer;
