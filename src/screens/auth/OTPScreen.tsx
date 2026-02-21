import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS } from '../../theme/theme';
import { AppTextInput } from '../../components/AppTextInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { AuthScreenProps } from '../../types';

export const OTPScreen: React.FC<AuthScreenProps<'OTP'>> = ({ route, navigation }) => {
    const { phone } = route.params;
    const [otp, setOtp] = useState('');
    const { verifyOtp, isLoading } = useAuth();

    const handleVerify = async () => {
        // Accept any OTP for development purposes
        if (otp.length > 0) {
            await verifyOtp(otp);
            navigation.navigate('RoleSelection');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Enter Verification Code</Text>
                    <Text style={styles.subtitle}>We've sent a 6-digit code to +91 {phone}</Text>
                    <Text style={[styles.subtitle, { color: COLORS.primary, marginTop: 10, fontWeight: '700' }]}>
                        Dev Hint: Enter '123456' or anything to login
                    </Text>
                </View>

                <View style={styles.form}>
                    <AppTextInput
                        label="OTP Code"
                        placeholder="123456"
                        keyboardType="number-pad"
                        value={otp}
                        onChangeText={setOtp}
                        maxLength={6}
                    />

                    <PrimaryButton
                        title="Verify & Continue"
                        onPress={handleVerify}
                        loading={isLoading}
                        style={styles.button}
                    />

                    <Text style={styles.resendText}>
                        Didn't receive code? <Text style={styles.resendLink}>Resend OTP</Text>
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        flexGrow: 1,
        padding: SPACING.xl,
    },
    header: {
        marginTop: SPACING.xxl,
        marginBottom: SPACING.xxl,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        lineHeight: 24,
    },
    form: {
        width: '100%',
    },
    button: {
        marginTop: SPACING.lg,
    },
    resendText: {
        textAlign: 'center',
        marginTop: SPACING.xl,
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    resendLink: {
        color: COLORS.primary,
        fontWeight: '700',
    },
});
