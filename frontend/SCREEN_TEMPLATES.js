// ZYGOTE Mobile App - Screen Templates
// Copy these templates to create individual screen files

// ============================================
// REGISTER SCREEN
// File: src/screens/RegisterScreen.js
// ============================================

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AuthService from '../services/authService';
import { colors, spacing, fontSize, borderRadius } from '../config/theme';

export default function RegisterScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!email || !password || !fullName) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        setLoading(true);
        try {
            const response = await AuthService.register(email, password, fullName);

            if (response.success) {
                Alert.alert(
                    'Success',
                    'Registration successful! Please check your email for OTP.',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.navigate('VerifyOTP', { email }),
                        },
                    ]
                );
            }
        } catch (error) {
            Alert.alert('Registration Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <LinearGradient
                    colors={[colors.primary[500], colors.primary[700]]}
                    style={styles.header}
                >
                    <Text style={styles.logo}>🧬</Text>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join ZYGOTE Medical Learning</Text>
                </LinearGradient>

                <View style={styles.formContainer}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="John Doe"
                            value={fullName}
                            onChangeText={setFullName}
                            editable={!loading}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="your.email@example.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!loading}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Minimum 8 characters"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                            editable={!loading}
                        />
                        <Text style={styles.hint}>
                            Must contain uppercase, lowercase, number, and special character
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.buttonText}>Create Account</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.loginLink}
                        onPress={() => navigation.navigate('Login')}
                        disabled={loading}
                    >
                        <Text style={styles.loginLinkText}>
                            Already have an account?{' '}
                            <Text style={styles.loginLinkTextBold}>Sign In</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// ============================================
// VERIFY OTP SCREEN
// File: src/screens/VerifyOTPScreen.js
// ============================================

export function VerifyOTPScreen({ route, navigation }) {
    const { email } = route.params;
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerifyOTP = async () => {
        if (!otp || otp.length !== 6) {
            Alert.alert('Error', 'Please enter 6-digit OTP');
            return;
        }

        setLoading(true);
        try {
            const response = await AuthService.verifyOTP(email, otp);

            if (response.success) {
                Alert.alert(
                    'Welcome to ZYGOTE!',
                    'Learn Medicine from Expert Doctors',
                    [
                        {
                            text: 'Get Started',
                            onPress: () => navigation.replace('Main'),
                        },
                    ]
                );
            }
        } catch (error) {
            Alert.alert('Verification Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        try {
            await AuthService.resendOTP(email);
            Alert.alert('Success', 'OTP sent to your email');
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[colors.primary[500], colors.primary[700]]}
                style={styles.header}
            >
                <Text style={styles.logo}>📧</Text>
                <Text style={styles.title}>Verify Email</Text>
                <Text style={styles.subtitle}>
                    Enter the 6-digit code sent to{'\n'}{email}
                </Text>
            </LinearGradient>

            <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>OTP Code</Text>
                    <TextInput
                        style={[styles.input, styles.otpInput]}
                        placeholder="000000"
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                        maxLength={6}
                        editable={!loading}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleVerifyOTP}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.buttonText}>Verify</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.resendLink}
                    onPress={handleResendOTP}
                    disabled={loading}
                >
                    <Text style={styles.resendLinkText}>Didn't receive code? Resend</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ============================================
// HOME SCREEN
// File: src/screens/HomeScreen.js
// ============================================

export function HomeScreen({ navigation }) {
    const [user, setUser] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [userRes, tracksRes, bookmarksRes] = await Promise.all([
                AuthService.getCurrentUser(),
                ContentService.getTracks(),
                UserService.getBookmarks(),
            ]);

            setUser(userRes.data.user);
            setTracks(tracksRes.data);
            setBookmarks(bookmarksRes.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load data');
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
            <LinearGradient
                colors={[colors.primary[500], colors.primary[600]]}
                style={styles.header}
            >
                <Text style={styles.greeting}>Welcome back,</Text>
                <Text style={styles.userName}>{user?.fullName}</Text>
            </LinearGradient>

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>MBBS Tracks</Text>
                {tracks.map((track) => (
                    <TouchableOpacity
                        key={track.id}
                        style={styles.trackCard}
                        onPress={() => navigation.navigate('Subjects', { trackId: track.id })}
                    >
                        <Text style={styles.trackName}>{track.name}</Text>
                        <Text style={styles.trackDescription}>{track.description}</Text>
                    </TouchableOpacity>
                ))}

                {bookmarks.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Recent Bookmarks</Text>
                        {bookmarks.slice(0, 3).map((bookmark) => (
                            <TouchableOpacity
                                key={bookmark.id}
                                style={styles.bookmarkCard}
                                onPress={() => navigation.navigate('TopicDetail', { topicId: bookmark.topic_id })}
                            >
                                <Text style={styles.bookmarkTitle}>{bookmark.title}</Text>
                                <Text style={styles.bookmarkSubject}>{bookmark.subject_name}</Text>
                            </TouchableOpacity>
                        ))}
                    </>
                )}
            </View>
        </ScrollView>
    );
}

// ============================================
// TOPICS SCREEN
// File: src/screens/TopicsScreen.js
// ============================================

export function TopicsScreen({ route, navigation }) {
    const { subjectId } = route.params;
    const [topics, setTopics] = useState([]);
    const [subject, setSubject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTopics();
    }, []);

    const loadTopics = async () => {
        try {
            const [subjectRes, topicsRes] = await Promise.all([
                ContentService.getSubject(subjectId),
                ContentService.getTopicsBySubject(subjectId),
            ]);

            setSubject(subjectRes.data);
            setTopics(topicsRes.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load topics');
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
        <View style={styles.container}>
            <View style={[styles.subjectHeader, { backgroundColor: subject?.color_code || colors.primary[500] }]}>
                <Text style={styles.subjectName}>{subject?.name}</Text>
                <Text style={styles.subjectDescription}>{subject?.description}</Text>
            </View>

            <ScrollView style={styles.topicsList}>
                {topics.map((topic, index) => (
                    <TouchableOpacity
                        key={topic.id}
                        style={styles.topicCard}
                        onPress={() => navigation.navigate('TopicDetail', { topicId: topic.id })}
                    >
                        <View style={styles.topicNumber}>
                            <Text style={styles.topicNumberText}>{index + 1}</Text>
                        </View>
                        <View style={styles.topicInfo}>
                            <Text style={styles.topicTitle}>{topic.title}</Text>
                            <Text style={styles.topicDescription}>{topic.description}</Text>
                            {topic.is_free_sample && (
                                <View style={styles.freeBadge}>
                                    <Text style={styles.freeBadgeText}>FREE</Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

// ============================================
// TOPIC DETAIL SCREEN WITH TABS
// File: src/screens/TopicDetailScreen.js
// ============================================

export function TopicDetailScreen({ route }) {
    const { topicId } = route.params;
    const [activeTab, setActiveTab] = useState('notes');
    const [topic, setTopic] = useState(null);
    const [notes, setNotes] = useState(null);
    const [summary, setSummary] = useState(null);
    const [mindMap, setMindMap] = useState(null);
    const [mcqs, setMcqs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTopicData();
    }, []);

    const loadTopicData = async () => {
        try {
            const topicRes = await ContentService.getTopic(topicId);
            setTopic(topicRes.data);

            // Load content based on active tab
            if (activeTab === 'notes') {
                const notesRes = await ContentService.getNotes(topicId);
                setNotes(notesRes.data);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load topic');
        } finally {
            setLoading(false);
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'notes':
                return <NotesTab content={notes} />;
            case 'summary':
                return <SummaryTab content={summary} />;
            case 'mindmap':
                return <MindMapTab image={mindMap} />;
            case 'mcqs':
                return <MCQsTab mcqs={mcqs} topicId={topicId} />;
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.tabBar}>
                {['notes', 'summary', 'mindmap', 'mcqs'].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.tabContent}>
                {renderTabContent()}
            </View>
        </View>
    );
}

// ============================================
// COMMON STYLES (Use across all screens)
// ============================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
    },
    logo: {
        fontSize: 60,
        marginBottom: spacing.sm,
    },
    title: {
        fontSize: fontSize.xxxl,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: fontSize.base,
        color: '#FFFFFF',
        opacity: 0.9,
        textAlign: 'center',
    },
    formContainer: {
        flex: 1,
        padding: spacing.lg,
    },
    inputContainer: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: fontSize.sm,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border.light,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        fontSize: fontSize.base,
        backgroundColor: '#FFFFFF',
    },
    otpInput: {
        fontSize: fontSize.xxl,
        textAlign: 'center',
        letterSpacing: 10,
    },
    hint: {
        fontSize: fontSize.xs,
        color: colors.text.secondary,
        marginTop: spacing.xs,
    },
    button: {
        backgroundColor: colors.primary[500],
        padding: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        marginTop: spacing.md,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: fontSize.base,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: '700',
        color: colors.text.primary,
        marginTop: spacing.lg,
        marginBottom: spacing.md,
    },
    trackCard: {
        backgroundColor: '#FFFFFF',
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border.light,
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
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: colors.primary[500],
    },
    tabText: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
        fontWeight: '500',
    },
    activeTabText: {
        color: colors.primary[500],
        fontWeight: '600',
    },
});
