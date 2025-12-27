import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AuthService from '../services/authService';
import ContentService from '../services/contentService';
import UserService from '../services/userService';
import { colors, spacing, fontSize, borderRadius, shadows } from '../config/theme';

export default function HomeScreen({ navigation }) {
    const [user, setUser] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [bookmarks, setBookmarks] = useState([]);
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [userRes, tracksRes, bookmarksRes, subRes] = await Promise.all([
                AuthService.getCurrentUser(),
                ContentService.getTracks(),
                UserService.getBookmarks(),
                UserService.getSubscription(),
            ]);

            setUser(userRes.data.user);
            setTracks(tracksRes.data);
            setBookmarks(bookmarksRes.data);
            setSubscription(subRes.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Header */}
            <LinearGradient
                colors={[colors.primary[500], colors.primary[600]]}
                style={styles.header}
            >
                <Text style={styles.greeting}>Welcome back,</Text>
                <Text style={styles.userName}>{user?.fullName}</Text>

                {/* Subscription Status */}
                {subscription ? (
                    <View style={styles.subscriptionBadge}>
                        <Text style={styles.subscriptionText}>
                            ✓ Active Subscription
                        </Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.subscribeButton}
                        onPress={() => navigation.navigate('Subscription')}
                    >
                        <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
                    </TouchableOpacity>
                )}
            </LinearGradient>

            <View style={styles.content}>
                {/* MBBS Tracks */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>MBBS Tracks</Text>
                    {tracks.map((track) => (
                        <TouchableOpacity
                            key={track.id}
                            style={styles.trackCard}
                            onPress={() => navigation.navigate('Subjects', { trackId: track.id, trackName: track.name })}
                        >
                            <View style={styles.trackIcon}>
                                <Text style={styles.trackIconText}>📚</Text>
                            </View>
                            <View style={styles.trackInfo}>
                                <Text style={styles.trackName}>{track.name}</Text>
                                <Text style={styles.trackDescription}>{track.description}</Text>
                            </View>
                            <Text style={styles.trackArrow}>›</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Recent Bookmarks */}
                {bookmarks.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Recent Bookmarks</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Bookmarks')}>
                                <Text style={styles.seeAllText}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        {bookmarks.slice(0, 3).map((bookmark) => (
                            <TouchableOpacity
                                key={bookmark.id}
                                style={styles.bookmarkCard}
                                onPress={() => navigation.navigate('TopicDetail', { topicId: bookmark.topic_id })}
                            >
                                <View style={[styles.subjectDot, { backgroundColor: bookmark.color_code || colors.primary[500] }]} />
                                <View style={styles.bookmarkInfo}>
                                    <Text style={styles.bookmarkTitle}>{bookmark.title}</Text>
                                    <Text style={styles.bookmarkSubject}>{bookmark.subject_name}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActions}>
                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => navigation.navigate('Bookmarks')}
                        >
                            <Text style={styles.actionIcon}>🔖</Text>
                            <Text style={styles.actionText}>Bookmarks</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => navigation.navigate('Analytics')}
                        >
                            <Text style={styles.actionIcon}>📊</Text>
                            <Text style={styles.actionText}>Analytics</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => navigation.navigate('Settings')}
                        >
                            <Text style={styles.actionIcon}>⚙️</Text>
                            <Text style={styles.actionText}>Settings</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
        backgroundColor: '#FFFFFF',
    },
    loadingText: {
        marginTop: spacing.md,
        fontSize: fontSize.base,
        color: colors.text.secondary,
    },
    header: {
        paddingTop: 60,
        paddingBottom: spacing.xl,
        paddingHorizontal: spacing.lg,
    },
    greeting: {
        fontSize: fontSize.base,
        color: '#FFFFFF',
        opacity: 0.9,
    },
    userName: {
        fontSize: fontSize.xxl,
        fontWeight: '700',
        color: '#FFFFFF',
        marginTop: spacing.xs,
    },
    subscriptionBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        alignSelf: 'flex-start',
        marginTop: spacing.md,
    },
    subscriptionText: {
        color: '#FFFFFF',
        fontSize: fontSize.sm,
        fontWeight: '600',
    },
    subscribeButton: {
        backgroundColor: colors.secondary[500],
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        alignSelf: 'flex-start',
        marginTop: spacing.md,
    },
    subscribeButtonText: {
        color: '#FFFFFF',
        fontSize: fontSize.sm,
        fontWeight: '600',
    },
    content: {
        padding: spacing.lg,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: '700',
        color: colors.text.primary,
        marginBottom: spacing.md,
    },
    seeAllText: {
        fontSize: fontSize.sm,
        color: colors.primary[500],
        fontWeight: '600',
    },
    trackCard: {
        backgroundColor: '#FFFFFF',
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        ...shadows.md,
    },
    trackIcon: {
        width: 50,
        height: 50,
        borderRadius: borderRadius.md,
        backgroundColor: colors.primary[50],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    trackIconText: {
        fontSize: 24,
    },
    trackInfo: {
        flex: 1,
    },
    trackName: {
        fontSize: fontSize.base,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    trackDescription: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
    },
    trackArrow: {
        fontSize: 24,
        color: colors.text.tertiary,
    },
    bookmarkCard: {
        backgroundColor: '#FFFFFF',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        ...shadows.sm,
    },
    subjectDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: spacing.md,
    },
    bookmarkInfo: {
        flex: 1,
    },
    bookmarkTitle: {
        fontSize: fontSize.base,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    bookmarkSubject: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: spacing.lg,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        marginHorizontal: spacing.xs,
        ...shadows.sm,
    },
    actionIcon: {
        fontSize: 32,
        marginBottom: spacing.sm,
    },
    actionText: {
        fontSize: fontSize.sm,
        fontWeight: '600',
        color: colors.text.primary,
    },
});
