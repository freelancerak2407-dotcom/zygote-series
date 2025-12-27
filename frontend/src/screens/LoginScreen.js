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

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        setLoading(true);
        try {
            const response = await AuthService.login(email, password);

            if (response.success) {
                // Navigate to main app
                navigation.replace('Main');
            }
        } catch (error) {
            if (error.data?.code === 'EMAIL_NOT_VERIFIED') {
                // Navigate to OTP verification
                navigation.navigate('VerifyOTP', { email });
            } else {
                Alert.alert('Login Failed', error.message || 'Invalid credentials');
            }
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
                    <Text style={styles.title}>ZYGOTE</Text>
                    <Text style={styles.subtitle}>Medical Learning Platform</Text>
                </LinearGradient>

                <View style={styles.formContainer}>
                    <Text style={styles.welcomeText}>Welcome Back</Text>
                    <Text style={styles.welcomeSubtext}>
                        Sign in to continue your medical journey
                    </Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="your.email@example.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!loading}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                            editable={!loading}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.buttonText}>Sign In</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity
                        style={styles.googleButton}
                        disabled={loading}
                    >
                        <Text style={styles.googleButtonText}>Continue with Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.registerLink}
                        onPress={() => navigation.navigate('Register')}
                        disabled={loading}
                    >
                        <Text style={styles.registerLinkText}>
                            Don't have an account?{' '}
                            <Text style={styles.registerLinkTextBold}>Sign Up</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

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
    },
    formContainer: {
        flex: 1,
        padding: spacing.lg,
    },
    welcomeText: {
        fontSize: fontSize.xxl,
        fontWeight: '700',
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    welcomeSubtext: {
        fontSize: fontSize.base,
        color: colors.text.secondary,
        marginBottom: spacing.xl,
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
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border.light,
    },
    dividerText: {
        marginHorizontal: spacing.md,
        color: colors.text.secondary,
        fontSize: fontSize.sm,
    },
    googleButton: {
        borderWidth: 1,
        borderColor: colors.border.medium,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    googleButtonText: {
        color: colors.text.primary,
        fontSize: fontSize.base,
        fontWeight: '600',
    },
    registerLink: {
        marginTop: spacing.xl,
        alignItems: 'center',
    },
    registerLinkText: {
        fontSize: fontSize.base,
        color: colors.text.secondary,
    },
    registerLinkTextBold: {
        color: colors.primary[500],
        fontWeight: '600',
    },
});
