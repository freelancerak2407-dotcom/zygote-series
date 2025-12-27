import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import ContentService from '../services/contentService';
import NotesTab from '../components/NotesTab';
import SummaryTab from '../components/SummaryTab';
import MindMapTab from '../components/MindMapTab';
import MCQsTab from '../components/MCQsTab';
import { colors, spacing, fontSize, borderRadius } from '../config/theme';

export default function TopicDetailScreen({ route, navigation }) {
    const { topicId, topicTitle } = route.params;
    const [activeTab, setActiveTab] = useState('notes');
    const [topic, setTopic] = useState(null);
    const [notes, setNotes] = useState(null);
    const [summary, setSummary] = useState(null);
    const [mindMap, setMindMap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [contentLoading, setContentLoading] = useState(false);

    const tabs = [
        { key: 'notes', label: 'Notes', icon: '📝' },
        { key: 'summary', label: 'Summary', icon: '📋' },
        { key: 'mindmap', label: 'Mind Map', icon: '🗺️' },
        { key: 'mcqs', label: 'MCQs', icon: '❓' },
    ];

    useEffect(() => {
        navigation.setOptions({ title: topicTitle });
        loadTopic();
    }, []);

    useEffect(() => {
        loadTabContent();
    }, [activeTab]);

    const loadTopic = async () => {
        try {
            const response = await ContentService.getTopic(topicId);
            setTopic(response.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load topic');
        } finally {
            setLoading(false);
        }
    };

    const loadTabContent = async () => {
        setContentLoading(true);
        try {
            switch (activeTab) {
                case 'notes':
                    if (!notes) {
                        const response = await ContentService.getNotes(topicId);
                        setNotes(response.data);
                    }
                    break;
                case 'summary':
                    if (!summary) {
                        const response = await ContentService.getSummary(topicId);
                        setSummary(response.data);
                    }
                    break;
                case 'mindmap':
                    if (!mindMap) {
                        const response = await ContentService.getMindMap(topicId);
                        setMindMap(response.data);
                    }
                    break;
                case 'mcqs':
                    // MCQs are loaded within the MCQsTab component
                    break;
            }
        } catch (error) {
            console.error('Failed to load content:', error);
        } finally {
            setContentLoading(false);
        }
    };

    const renderTabContent = () => {
        if (contentLoading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary[500]} />
                </View>
            );
        }

        switch (activeTab) {
            case 'notes':
                return <NotesTab content={notes} />;
            case 'summary':
                return <SummaryTab content={summary} />;
            case 'mindmap':
                return <MindMapTab image={mindMap} />;
            case 'mcqs':
                return <MCQsTab topicId={topicId} />;
            default:
                return null;
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
        <View style={styles.container}>
            {/* Tab Bar */}
            <View style={styles.tabBar}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tab, activeTab === tab.key && styles.activeTab]}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        <Text style={styles.tabIcon}>{tab.icon}</Text>
                        <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Tab Content */}
            <View style={styles.tabContent}>
                {renderTabContent()}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
        backgroundColor: '#FFFFFF',
    },
    tab: {
        flex: 1,
        paddingVertical: spacing.md,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: colors.primary[500],
    },
    tabIcon: {
        fontSize: 20,
        marginBottom: spacing.xs,
    },
    tabText: {
        fontSize: fontSize.xs,
        color: colors.text.secondary,
        fontWeight: '500',
    },
    activeTabText: {
        color: colors.primary[500],
        fontWeight: '600',
    },
    tabContent: {
        flex: 1,
    },
});
