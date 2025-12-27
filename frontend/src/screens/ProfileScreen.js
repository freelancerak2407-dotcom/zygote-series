import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import AuthService from '../services/authService';
import UserService from '../services/userService';
import { colors, spacing, fontSize, borderRadius } from '../config/theme';

export default function ProfileScreen({ navigation }) {
    const [user, setUser] = useState(null);
    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [userRes, analyticsRes] = await Promise.all([
                AuthService.getCurrentUser(),
                UserService.getAnalytics(),
            ]);
            setUser(userRes.data.user);
            setAnalytics(analyticsRes.data);
        } catch (error) {
            console.error('Failed to load profile:', error);
        }
    };

    const handleLogout = async () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await AuthService.logout();
                        navigation.replace('Login');
                    } catch (error) {
                        console.error('Logout failed:', error);
                    }
                },
            },
        ]);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {user?.fullName?.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <Text style={styles.name}>{user?.fullName}</Text>
                <Text style={styles.email}>{user?.email}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Statistics</Text>
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{analytics?.topics_opened || 0}</Text>
                        <Text style={styles.statLabel}>Topics</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{analytics?.quizzes_attempted || 0}</Text>
                        <Text style={styles.statLabel}>Quizzes</Text>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <TouchableOpacity
                    style={[styles.menuItem, styles.logoutItem]}
                    onPress={handleLogout}
                >
                    <Text style={styles.logoutText}>🚪 Logout</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.lightGray,
    },
    header: {
        backgroundColor: colors.primary[500],
        padding: spacing.xl,
        alignItems: 'center',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    avatarText: {
        fontSize: fontSize.xxxl,
        fontWeight: '700',
        color: colors.primary[500],
    },
    name: {
        fontSize: fontSize.xl,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: spacing.xs,
    },
    email: {
        fontSize: fontSize.base,
        color: '#FFFFFF',
        opacity: 0.9,
    },
    section: {
        padding: spacing.lg,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: '700',
        color: colors.text.primary,
        marginBottom: spacing.md,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: spacing.lg,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    statValue: {
        fontSize: fontSize.xxl,
        fontWeight: '700',
        color: colors.primary[500],
        marginBottom: spacing.xs,
    },
    statLabel: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
    },
    menuItem: {
        backgroundColor: '#FFFFFF',
        padding: spacing.lg,
        borderRadius: borderRadius.md,
        marginBottom: spacing.sm,
    },
    logoutItem: {
        marginTop: spacing.md,
    },
    logoutText: {
        fontSize: fontSize.base,
        color: colors.error,
        fontWeight: '600',
    },
});
