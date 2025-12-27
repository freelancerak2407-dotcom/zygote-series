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
    loginLink: {
        marginTop: spacing.xl,
        alignItems: 'center',
    },
    loginLinkText: {
        fontSize: fontSize.base,
        color: colors.text.secondary,
    },
    loginLinkTextBold: {
        color: colors.primary[500],
        fontWeight: '600',
    },
});
