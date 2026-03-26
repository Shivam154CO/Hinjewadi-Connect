import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppTextInput } from '../../components/AppTextInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { AuthScreenProps } from '../../types';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONTS } from '../../theme/theme';
import { validation } from '../../utils/validation';
import { errorHandler } from '../../utils/errorHandler';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity } from 'react-native';

const LoginScreen: React.FC<AuthScreenProps<'Login'>> = ({ navigation }) => {
    const { t, i18n } = useTranslation();
    const [phone, setPhone] = useState('');
    const { login, isLoading } = useAuth();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const handleLogin = async () => {
        const phoneValidation = validation.phone(phone.trim());
        if (!phoneValidation.isValid) {
            errorHandler.handleValidationError('Phone', phoneValidation.error || 'Invalid phone number');
            return;
        }
        try {
            const isRegistered = await login(phone.trim());
            if (isRegistered) {
                // If user exists, AuthContext handles state and AppNavigator will switch to MainStack
            } else {
                navigation.navigate('RoleSelection');
            }
        } catch (err: any) {
            errorHandler.handleAuthError(err);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.langSelector}>
                {['en', 'hi', 'mr'].map((lang) => (
                    <TouchableOpacity
                        key={lang}
                        onPress={() => changeLanguage(lang)}
                        style={[
                            styles.langBtn,
                            i18n.language === lang && styles.langBtnActive
                        ]}
                    >
                        <Text style={[
                            styles.langText,
                            i18n.language === lang && styles.langTextActive
                        ]}>{lang.toUpperCase()}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.inner}>
                <Text style={styles.title}>{t('welcome')}</Text>
                <Text style={styles.subtitle}>{t('login_subtitle')}</Text>
                <AppTextInput
                    label="Phone"
                    placeholder={t('phone_placeholder')}
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                />
                <PrimaryButton
                    title={t('continue')}
                    onPress={handleLogin}
                    loading={isLoading}
                    style={styles.button}
                />
            </View>
        </SafeAreaView>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: COLORS.background 
    },
    langSelector: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: SPACING.md,
        gap: SPACING.sm,
    },
    langBtn: {
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        backgroundColor: COLORS.white,
    },
    langBtnActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
        ...SHADOWS.soft,
    },
    langText: {
        fontSize: 12,
        fontFamily: FONTS.bold,
        color: COLORS.textSecondary,
    },
    langTextActive: {
        color: COLORS.white,
    },
    inner: { 
        padding: SPACING.xl, 
        flex: 1, 
        justifyContent: 'center' 
    },
    title: {
        fontSize: 36,
        fontFamily: FONTS.title,
        color: COLORS.text,
        marginBottom: SPACING.xs,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 18,
        fontFamily: FONTS.subHeading,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xxxl,
        lineHeight: 28,
    },
    button: { 
        marginTop: SPACING.xl,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
});
