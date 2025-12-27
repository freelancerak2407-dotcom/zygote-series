import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '../config/theme';
import EmptyState from './EmptyState';

export default function SummaryTab({ content }) {
    if (!content || !content.content) {
        return <EmptyState message="No summary available" icon="📋" />;
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.content}>{content.content}</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: spacing.lg,
        backgroundColor: '#FFFFFF',
    },
    content: {
        fontSize: fontSize.base,
        lineHeight: 24,
        color: colors.text.primary,
    },
});
