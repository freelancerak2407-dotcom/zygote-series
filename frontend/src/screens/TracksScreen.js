import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import ContentService from '../services/contentService';
import { colors, spacing, fontSize, borderRadius, shadows } from '../config/theme';

export default function TracksScreen({ navigation }) {
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTracks();
    }, []);

    const loadTracks = async () => {
        try {
            const response = await ContentService.getTracks();
            setTracks(response.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load tracks');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>MBBS Tracks</Text>
                <Text style={styles.headerSubtitle}>Select your year to begin</Text>
            </View>

            <View style={styles.content}>
                {tracks.map((track, index) => (
                    <TouchableOpacity
                        key={track.id}
                        style={styles.trackCard}
                        onPress={() => navigation.navigate('Subjects', { trackId: track.id, trackName: track.name })}
                    >
                        <View style={styles.trackNumber}>
                            <Text style={styles.trackNumberText}>Year {track.year_number}</Text>
                        </View>
                        <View style={styles.trackContent}>
                            <Text style={styles.trackName}>{track.name}</Text>
                            <Text style={styles.trackDescription}>{track.description}</Text>
                        </View>
                        <View style={styles.trackArrow}>
                            <Text style={styles.arrowText}>›</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.lightGray,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: colors.primary[500],
        padding: spacing.xl,
        paddingTop: 60,
    },
    headerTitle: {
        fontSize: fontSize.xxl,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: spacing.xs,
    },
    headerSubtitle: {
        fontSize: fontSize.base,
        color: '#FFFFFF',
        opacity: 0.9,
    },
    content: {
        padding: spacing.lg,
    },
    trackCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        ...shadows.md,
    },
    trackNumber: {
        width: 60,
        height: 60,
        borderRadius: borderRadius.md,
        backgroundColor: colors.primary[50],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    trackNumberText: {
        fontSize: fontSize.sm,
        fontWeight: '700',
        color: colors.primary[500],
    },
    trackContent: {
        flex: 1,
    },
    trackName: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    trackDescription: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
    },
    trackArrow: {
        marginLeft: spacing.md,
    },
    arrowText: {
        fontSize: 28,
        color: colors.text.tertiary,
    },
});
