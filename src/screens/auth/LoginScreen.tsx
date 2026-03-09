import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS } from '../../theme/theme';
import { AppTextInput } from '../../components/AppTextInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { AuthScreenProps } from '../../types';

export const LoginScreen: React.FC<AuthScreenProps<'Login'>> = ({ navigation }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [useEmail, setUseEmail] = useState(false);

    // Destructure everything at the top level of the component
    const { login, loginWithEmail, isLoading, bypassAuth } = useAuth();

    const handleLogin = async () => {
        try {
            if (useEmail) {
                if (!email.includes('@')) {
                    Alert.alert('Error', 'Please enter a valid email');
                    return;
                }
                await loginWithEmail(email);
                // After email login, if user is new, fetchUserProfile will return null 
                // and navigators will handle it or we navigate to RoleSelection
                // But for now, let's assume if it works, they are in
                navigation.navigate('RoleSelection');
            } else {
                if (phoneNumber.length === 10) {
                    await login(phoneNumber);
                    navigation.navigate('OTP', { phone: phoneNumber });
                } else {
                    Alert.alert('Error', 'Please enter a 10-digit phone number');
                }
            }
        } catch (error: any) {
            console.error('Login error:', error);
            if (error.message?.includes('provider') || error.message?.includes('Sms')) {
                // For provider issues, we let them proceed to the OTP screen to use the dev bypass
                navigation.navigate('OTP', { phone: phoneNumber });
            } else {
                Alert.alert('Error', error.message || 'Login failed');
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <View style={styles.logoPlaceholder}>
                            <Text style={styles.logoText}>HC</Text>
                        </View>
                        <Text style={styles.title}>Hinjewadi Connect</Text>
                        <Text style={styles.subtitle}>Hyperlocal networking for Pune's IT hub</Text>
                    </View>

                    <View style={styles.form}>
                        <Text style={styles.sectionTitle}>
                            {useEmail ? 'Login with Email' : 'Login with Phone Number'}
                        </Text>

                        {!useEmail ? (
                            <AppTextInput
                                label="Phone Number"
                                placeholder="Enter 10 digit number"
                                keyboardType="phone-pad"
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                maxLength={10}
                            />
                        ) : (
                            <AppTextInput
                                label="Email Address"
                                placeholder="example@email.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />
                        )}

                        <PrimaryButton
                            title={useEmail ? "Continue" : "Send OTP"}
                            onPress={handleLogin}
                            loading={isLoading}
                            style={styles.button}
                        />

                        <TouchableOpacity
                            onPress={() => setUseEmail(!useEmail)}
                            style={styles.toggleContainer}
                        >
                            <Text style={styles.toggleText}>
                                {useEmail ? 'Use Phone Number instead' : 'Use Email instead'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                console.log('Bypass trigger');
                                bypassAuth();
                            }}
                            style={styles.skipContainer}
                        >
                            <Text style={styles.skipText}>Skip for now (Dev Only)</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            By continuing, you agree to our Terms and Privacy Policy
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xxl,
    },
    logoPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: BORDER_RADIUS.xl,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
    },
    logoText: {
        color: COLORS.white,
        fontSize: 32,
        fontWeight: '800',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING.lg,
    },
    button: {
        marginTop: SPACING.md,
    },
    toggleContainer: {
        marginTop: SPACING.lg,
        alignItems: 'center',
    },
    toggleText: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    skipContainer: {
        marginTop: SPACING.md,
        alignItems: 'center',
    },
    skipText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    footer: {
        marginTop: 'auto',
        paddingTop: SPACING.xxl,
    },
    footerText: {
        textAlign: 'center',
        fontSize: 12,
        color: COLORS.textSecondary,
        lineHeight: 18,
    },
});
