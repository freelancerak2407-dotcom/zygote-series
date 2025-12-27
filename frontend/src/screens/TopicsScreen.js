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
import UserService from '../services/userService';
import { colors, spacing, fontSize, borderRadius, shadows } from '../config/theme';

export default function TopicsScreen({ route, navigation }) {
    const { subjectId, subjectName, subjectColor } = route.params;
    const [topics, setTopics] = useState([]);
    const [bookmarks, setBookmarks] = useState(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        navigation.setOptions({ title: subjectName });
        loadTopics();
    }, []);

    const loadTopics = async () => {
        try {
            const [topicsRes, bookmarksRes] = await Promise.all([
                ContentService.getTopicsBySubject(subjectId),
                UserService.getBookmarks(),
            ]);

            setTopics(topicsRes.data);

            const bookmarkIds = new Set(bookmarksRes.data.map(b => b.topic_id));
            setBookmarks(bookmarkIds);
        } catch (error) {
            Alert.alert('Error', 'Failed to load topics');
        } finally {
            setLoading(false);
        }
    };

    const toggleBookmark = async (topicId) => {
        try {
            if (bookmarks.has(topicId)) {
                await UserService.removeBookmark(topicId);
                setBookmarks(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(topicId);
                    return newSet;
                });
            } else {
                await UserService.addBookmark(topicId);
                setBookmarks(prev => new Set(prev).add(topicId));
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update bookmark');
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
            <View style={[styles.header, { backgroundColor: subjectColor || colors.primary[500] }]}>
                <Text style={styles.headerTitle}>{subjectName}</Text>
                <Text style={styles.topicCount}>{topics.length} Topics</Text>
            </View>

            <View style={styles.content}>
                {topics.map((topic, index) => (
                    <TouchableOpacity
                        key={topic.id}
                        style={styles.topicCard}
                        onPress={() => navigation.navigate('TopicDetail', {
                            topicId: topic.id,
                            topicTitle: topic.title
                        })}
                    >
                        <View style={styles.topicNumber}>
                            <Text style={styles.topicNumberText}>{index + 1}</Text>
                        </View>

                        <View style={styles.topicContent}>
                            <Text style={styles.topicTitle}>{topic.title}</Text>
                            {topic.description && (
                                <Text style={styles.topicDescription} numberOfLines={2}>
                                    {topic.description}
                                </Text>
                            )}

                            <View style={styles.topicMeta}>
                                {topic.is_free_sample && (
                                    <View style={styles.freeBadge}>
                                        <Text style={styles.freeBadgeText}>FREE</Text>
                                    </View>
                                )}
                                {topic.completion_percentage > 0 && (
                                    <View style={styles.completionBadge}>
                                        <Text style={styles.completionText}>
                                            {topic.completion_percentage}% Complete
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.bookmarkButton}
                            onPress={() => toggleBookmark(topic.id)}
                        >
                            <Text style={styles.bookmarkIcon}>
                                {bookmarks.has(topic.id) ? '🔖' : '📑'}
                            </Text>
                        </TouchableOpacity>
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
        padding: spacing.xl,
    },
    headerTitle: {
        fontSize: fontSize.xxl,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: spacing.xs,
    },
    topicCount: {
        fontSize: fontSize.base,
        color: '#FFFFFF',
        opacity: 0.9,
    },
    content: {
        padding: spacing.lg,
    },
    topicCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        flexDirection: 'row',
        alignItems: 'flex-start',
        ...shadows.md,
    },
    topicNumber: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary[50],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    topicNumberText: {
        fontSize: fontSize.base,
        fontWeight: '700',
        color: colors.primary[500],
    },
    topicContent: {
        flex: 1,
    },
    topicTitle: {
        fontSize: fontSize.base,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    topicDescription: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
        marginBottom: spacing.sm,
        lineHeight: 20,
    },
    topicMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
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
    completionBadge: {
        backgroundColor: colors.primary[50],
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    completionText: {
        fontSize: fontSize.xs,
        fontWeight: '600',
        color: colors.primary[500],
    },
    bookmarkButton: {
        padding: spacing.xs,
        marginLeft: spacing.sm,
    },
    bookmarkIcon: {
        fontSize: 24,
    },
});
