import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import UserService from '../services/userService';
import { colors, spacing, fontSize, borderRadius } from '../config/theme';
import EmptyState from '../components/EmptyState';

export default function BookmarksScreen({ navigation }) {
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBookmarks();
    }, []);

    const loadBookmarks = async () => {
        try {
            const response = await UserService.getBookmarks();
            setBookmarks(response.data);
        } catch (error) {
            console.error('Failed to load bookmarks:', error);
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

    if (bookmarks.length === 0) {
        return <EmptyState message="No bookmarks yet" icon="🔖" />;
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                {bookmarks.map((bookmark) => (
                    <TouchableOpacity
                        key={bookmark.id}
                        style={styles.bookmarkCard}
                        onPress={() =>
                            navigation.navigate('TopicDetail', {
                                topicId: bookmark.topic_id,
                                topicTitle: bookmark.title,
                            })
                        }
                    >
                        <View
                            style={[
                                styles.colorDot,
                                { backgroundColor: bookmark.color_code || colors.primary[500] },
                            ]}
                        />
                        <View style={styles.bookmarkInfo}>
                            <Text style={styles.bookmarkTitle}>{bookmark.title}</Text>
                            <Text style={styles.bookmarkSubject}>{bookmark.subject_name}</Text>
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
    bookmarkCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
    },
    colorDot: {
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
});
