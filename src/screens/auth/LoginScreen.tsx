import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppTextInput } from '../../components/AppTextInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { AuthScreenProps } from '../../types';
import { COLORS, SPACING, FONTS } from '../../theme/theme';
import { errorHandler } from '../../utils/errorHandler';
import { useTranslation } from 'react-i18next';

const LANGS = [
    { code: 'en', label: 'EN' },
    { code: 'hi', label: 'HI' },
    { code: 'mr', label: 'MR' },
];

const LoginScreen: React.FC<AuthScreenProps<'Login'>> = ({ navigation }) => {
    const { t, i18n } = useTranslation();
    const [name, setName] = useState('');
    const { login, isProcessing } = useAuth();

    const handleContinue = async () => {
        if (!name.trim()) {
            errorHandler.handleValidationError('Name', 'Please enter your name to continue');
            return;
        }
        try {
            const isRegistered = await login(name.trim());
            if (!isRegistered) navigation.navigate('RoleSelection');
        } catch (err: any) {
            errorHandler.handleAuthError(err);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Language selector */}
            <View style={styles.langRow}>
                {LANGS.map((lang) => (
                    <TouchableOpacity
                        key={lang.code}
                        onPress={() => i18n.changeLanguage(lang.code)}
                        style={[styles.langBtn, i18n.language === lang.code && styles.langBtnActive]}
                    >
                        <Text style={[styles.langText, i18n.language === lang.code && styles.langTextActive]}>
                            {lang.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.inner}>
                {/* Wordmark */}
                <View style={styles.wordmark}>
                    <Text style={styles.wordmarkText}>Hinjewadi</Text>
                    <Text style={styles.wordmarkSub}>Connect</Text>
                </View>

                <Text style={styles.title}>{t('welcome')}</Text>
                <Text style={styles.subtitle}>{t('login_subtitle')}</Text>

                <AppTextInput
                    label={t('name')}
                    placeholder={t('name_placeholder')}
                    value={name}
                    onChangeText={setName}
                />

                <PrimaryButton
                    title={t('continue')}
                    onPress={handleContinue}
                    loading={isProcessing}
                    style={styles.button}
                />

                <Text style={styles.hint}>Your name is your identity on this platform</Text>
            </View>
        </SafeAreaView>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    langRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.sm,
        gap: 6,
    },
    langBtn: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    langBtnActive: { backgroundColor: COLORS.text, borderColor: COLORS.text },
    langText: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary },
    langTextActive: { color: '#FFFFFF' },

    inner: { flex: 1, paddingHorizontal: SPACING.xl, justifyContent: 'center' },

    wordmark: { marginBottom: SPACING.xl },
    wordmarkText: { fontSize: 32, fontWeight: '900', color: COLORS.text, letterSpacing: -1.5 },
    wordmarkSub: { fontSize: 14, fontWeight: '500', color: COLORS.textSecondary, marginTop: -4 },

    title: {
        fontSize: 22,
        fontFamily: FONTS.heading,
        color: COLORS.text,
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 15,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xl,
        lineHeight: 22,
    },
    button: { marginTop: SPACING.lg },
    hint: {
        fontSize: 12,
        color: COLORS.textMuted,
        textAlign: 'center',
        marginTop: SPACING.md,
    },
});
