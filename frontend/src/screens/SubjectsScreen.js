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

export default function SubjectsScreen({ route, navigation }) {
    const { trackId, trackName } = route.params;
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        navigation.setOptions({ title: trackName });
        loadSubjects();
    }, []);

    const loadSubjects = async () => {
        try {
            const response = await ContentService.getSubjectsByTrack(trackId);
            setSubjects(response.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load subjects');
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
            <View style={styles.content}>
                {subjects.map((subject) => (
                    <TouchableOpacity
                        key={subject.id}
                        style={[
                            styles.subjectCard,
                            { borderLeftColor: subject.color_code || colors.primary[500] }
                        ]}
                        onPress={() => navigation.navigate('Topics', {
                            subjectId: subject.id,
                            subjectName: subject.name,
                            subjectColor: subject.color_code
                        })}
                    >
                        <View style={styles.subjectHeader}>
                            <Text style={styles.subjectName}>{subject.name}</Text>
                            {subject.is_free_trial && (
                                <View style={styles.freeBadge}>
                                    <Text style={styles.freeBadgeText}>FREE</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.subjectDescription}>{subject.description}</Text>
                        <View style={styles.subjectFooter}>
                            <Text style={styles.viewTopicsText}>View Topics →</Text>
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
    content: {
        padding: spacing.lg,
    },
    subjectCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderLeftWidth: 4,
        ...shadows.md,
    },
    subjectHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    subjectName: {
        fontSize: fontSize.lg,
        fontWeight: '700',
        color: colors.text.primary,
        flex: 1,
    },
    freeBadge: {
        backgroundColor: colors.secondary[500],
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    freeBadgeText: {
        fontSize: fontSize.xs,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    subjectDescription: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
        marginBottom: spacing.md,
        lineHeight: 20,
    },
    subjectFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    viewTopicsText: {
        fontSize: fontSize.sm,
        fontWeight: '600',
        color: colors.primary[500],
    },
});
