import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import ContentService from '../services/contentService';
import EmptyState from './EmptyState';
import { colors, spacing, fontSize, borderRadius } from '../config/theme';

export default function MCQsTab({ topicId }) {
    const [mcqs, setMcqs] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMCQs();
    }, []);

    const loadMCQs = async () => {
        try {
            const response = await ContentService.getMCQs(topicId);
            setMcqs(response.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load MCQs');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedAnswer) return;

        try {
            const mcq = mcqs[currentIndex];
            const response = await ContentService.submitMCQAnswer(
                topicId,
                mcq.id,
                selectedAnswer
            );

            if (response.data.isCorrect) {
                setScore(score + 1);
            }

            setShowExplanation(true);
        } catch (error) {
            Alert.alert('Error', 'Failed to submit answer');
        }
    };

    const handleNext = () => {
        if (currentIndex < mcqs.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setSelectedAnswer(null);
            setShowExplanation(false);
        } else {
            Alert.alert(
                'Quiz Complete!',
                `Your score: ${score}/${mcqs.length} (${Math.round((score / mcqs.length) * 100)}%)`,
                [
                    {
                        text: 'Restart',
                        onPress: () => {
                            setCurrentIndex(0);
                            setScore(0);
                            setSelectedAnswer(null);
                            setShowExplanation(false);
                        },
                    },
                ]
            );
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading MCQs...</Text>
            </View>
        );
    }

    if (mcqs.length === 0) {
        return <EmptyState message="No MCQs available" icon="❓" />;
    }

    const mcq = mcqs[currentIndex];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.questionNumber}>
                    Question {currentIndex + 1} of {mcqs.length}
                </Text>
                <Text style={styles.score}>Score: {score}/{mcqs.length}</Text>
            </View>

            <Text style={styles.question}>{mcq.question}</Text>

            <View style={styles.options}>
                {['A', 'B', 'C', 'D'].map((option) => (
                    <TouchableOpacity
                        key={option}
                        style={[
                            styles.optionButton,
                            selectedAnswer === option && styles.selectedOption,
                            showExplanation && option === mcq.correct_answer && styles.correctOption,
                            showExplanation &&
                            selectedAnswer === option &&
                            option !== mcq.correct_answer &&
                            styles.wrongOption,
                        ]}
                        onPress={() => !showExplanation && setSelectedAnswer(option)}
                        disabled={showExplanation}
                    >
                        <Text style={styles.optionLabel}>{option}</Text>
                        <Text style={styles.optionText}>
                            {mcq[`option_${option.toLowerCase()}`]}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {showExplanation && (
                <View style={styles.explanation}>
                    <Text style={styles.explanationTitle}>Explanation:</Text>
                    <Text style={styles.explanationText}>{mcq.explanation}</Text>
                </View>
            )}

            <TouchableOpacity
                style={[styles.submitButton, !selectedAnswer && styles.disabledButton]}
                onPress={showExplanation ? handleNext : handleSubmit}
                disabled={!selectedAnswer}
            >
                <Text style={styles.submitButtonText}>
                    {showExplanation ? 'Next Question' : 'Submit Answer'}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: spacing.lg,
        backgroundColor: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
    },
    questionNumber: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
    },
    score: {
        fontSize: fontSize.sm,
        fontWeight: '600',
        color: colors.primary[500],
    },
    question: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacing.xl,
        lineHeight: 28,
    },
    options: {
        marginBottom: spacing.xl,
    },
    optionButton: {
        flexDirection: 'row',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 2,
        borderColor: colors.border.light,
        marginBottom: spacing.md,
        backgroundColor: '#FFFFFF',
    },
    selectedOption: {
        borderColor: colors.primary[500],
        backgroundColor: colors.primary[50],
    },
    correctOption: {
        borderColor: colors.success,
        backgroundColor: '#ECFDF5',
    },
    wrongOption: {
        borderColor: colors.error,
        backgroundColor: '#FEF2F2',
    },
    optionLabel: {
        fontSize: fontSize.base,
        fontWeight: '700',
        color: colors.text.primary,
        marginRight: spacing.md,
        minWidth: 24,
    },
    optionText: {
        flex: 1,
        fontSize: fontSize.base,
        color: colors.text.primary,
    },
    explanation: {
        backgroundColor: colors.background.lightGray,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.lg,
    },
    explanationTitle: {
        fontSize: fontSize.sm,
        fontWeight: '700',
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    explanationText: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
        lineHeight: 20,
    },
    submitButton: {
        backgroundColor: colors.primary[500],
        padding: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    disabledButton: {
        opacity: 0.5,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: fontSize.base,
        fontWeight: '600',
    },
});
