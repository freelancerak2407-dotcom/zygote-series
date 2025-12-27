import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AuthService from '../services/authService';
import { colors, spacing, fontSize, borderRadius } from '../config/theme';

export default function VerifyOTPScreen({ route, navigation }) {
    const { email } = route.params;
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

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
                    '🎉 Welcome to ZYGOTE!',
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
        setResending(true);
        try {
            await AuthService.resendOTP(email);
            Alert.alert('Success', 'OTP sent to your email');
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setResending(false);
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
                    Enter the 6-digit code sent to{'\n'}
                    <Text style={styles.email}>{email}</Text>
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
                    disabled={loading || resending}
                >
                    {resending ? (
                        <ActivityIndicator size="small" color={colors.primary[500]} />
                    ) : (
                        <Text style={styles.resendLinkText}>
                            Didn't receive code? <Text style={styles.resendLinkTextBold}>Resend</Text>
                        </Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.changeEmailLink}
                    onPress={() => navigation.goBack()}
                    disabled={loading}
                >
                    <Text style={styles.changeEmailText}>Change Email</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
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
        lineHeight: 24,
    },
    email: {
        fontWeight: '600',
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
        fontWeight: '600',
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
    resendLink: {
        marginTop: spacing.lg,
        alignItems: 'center',
        padding: spacing.sm,
    },
    resendLinkText: {
        fontSize: fontSize.base,
        color: colors.text.secondary,
    },
    resendLinkTextBold: {
        color: colors.primary[500],
        fontWeight: '600',
    },
    changeEmailLink: {
        marginTop: spacing.md,
        alignItems: 'center',
    },
    changeEmailText: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
        textDecorationLine: 'underline',
    },
});
