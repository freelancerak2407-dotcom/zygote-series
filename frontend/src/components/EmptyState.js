import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '../config/theme';

export default function EmptyState({ message, icon = '📭' }) {
    return (
        <View style={styles.container}>
            <Text style={styles.icon}>{icon}</Text>
            <Text style={styles.message}>{message}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
        backgroundColor: '#FFFFFF',
    },
    icon: {
        fontSize: 64,
        marginBottom: spacing.md,
    },
    message: {
        fontSize: fontSize.base,
        color: colors.text.secondary,
        textAlign: 'center',
    },
});
