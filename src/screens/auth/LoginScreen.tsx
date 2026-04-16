import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Dimensions, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { AuthScreenProps } from '../../types';
import { errorHandler } from '../../utils/errorHandler';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, SPACING, FONTS, SHADOWS } from '../../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const HERO_IMAGE = require('../../../assets/HinjewadiOne.png');

const LANGS = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'mr', label: 'मराठी' },
];

const LoginScreen: React.FC<AuthScreenProps<'Login'>> = ({ navigation }) => {
    const { t, i18n } = useTranslation();
    const [name, setName] = useState('');
    const [focused, setFocused] = useState(false);
    const { login, isProcessing } = useAuth();

    const handleContinue = async () => {
        if (!name.trim()) {
            errorHandler.handleValidationError('Name', 'Please enter your name');
            return;
        }
        try {
            const isRegistered = await login(name.trim());
            if (!isRegistered) navigation.navigate('RoleSelection');
        } catch (err: any) {
            errorHandler.handleAuthError(err);
        }
    };

    const changeLanguage = (code: string) => {
        i18n.changeLanguage(code);
    };

    return (
        <View style={s.root}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Top Image Section - 50% height */}
            <View style={s.topHalf}>
                <Image
                    source={HERO_IMAGE}
                    style={s.headerImage}
                    resizeMode="cover"
                />
                <LinearGradient
                    colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)', COLORS.background]}
                    style={s.headerOverlay}
                />

                <SafeAreaView edges={['top']} style={s.langContainer}>
                    <View style={s.langPill}>
                        {LANGS.map(lang => {
                            const isActive = i18n.language.startsWith(lang.code);
                            return (
                                <TouchableOpacity
                                    key={lang.code}
                                    style={[s.langBtn, isActive && s.langBtnActive]}
                                    onPress={() => changeLanguage(lang.code)}
                                    activeOpacity={0.8}
                                >
                                    {isActive ? (
                                        <LinearGradient
                                            colors={[COLORS.primary, '#00A87E']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={s.langGradient}
                                        >
                                            <Text style={s.langTextActive}>{lang.label}</Text>
                                        </LinearGradient>
                                    ) : (
                                        <Text style={s.langText}>{lang.label}</Text>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </SafeAreaView>

                {/* Optional Branding Overlay on Image */}
                <View style={s.imageBranding}>
                    <Text style={s.welcomeText}>Login to Continue</Text>
                    <Text style={s.subtitle}>Explore Hinjewadi in Detail</Text>
                </View>
            </View>

            <KeyboardAvoidingView
                style={s.content}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Designer Bottom Card */}
                <View style={s.bottomCard}>
                    <View style={s.dragIndicator} />
                    <Text style={s.cardHeading}>Welcome back</Text>
                    <Text style={s.cardSub}>{t('login_subtitle')}</Text>

                    <View style={[s.inputWrap, focused && s.inputWrapFocused]}>
                        <MaterialCommunityIcons
                            name="account-outline"
                            size={22}
                            color={focused ? COLORS.primary : COLORS.textMuted}
                        />
                        <TextInput
                            style={s.input}
                            placeholder={t('name_placeholder')}
                            placeholderTextColor={COLORS.textMuted}
                            value={name}
                            onChangeText={setName}
                            onFocus={() => setFocused(true)}
                            onBlur={() => setFocused(false)}
                            onSubmitEditing={handleContinue}
                            returnKeyType="go"
                            autoCapitalize="words"
                        />
                    </View>

                    <TouchableOpacity
                        style={[s.continueBtn, isProcessing && s.continueBtnDisabled]}
                        onPress={handleContinue}
                        disabled={isProcessing}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={[COLORS.primary, '#00A87E']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={s.continueGradient}
                        >
                            <Text style={s.continueBtnText}>
                                {isProcessing ? 'Verifying...' : t('continue')}
                            </Text>
                            {!isProcessing && <MaterialCommunityIcons name="arrow-right" size={20} color="#000000" />}
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={s.footerContainer}>
                        <Text style={s.disclaimer}>
                            By continuing, you agree to our{' '}
                            <Text style={s.link}>Terms of Service</Text>
                        </Text>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

export default LoginScreen;

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: COLORS.background },
    topHalf: {
        height: '50%',
        width: '100%',
        position: 'relative',
    },
    headerImage: {
        width: '100%',
        height: '100%',
    },
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    content: {
        flex: 1,
        marginTop: -30, // Pull card up slightly over image
    },
    langContainer: {
        width: '100%',
        alignItems: 'center',
        paddingTop: SPACING.lg + 20,
    },
    langPill: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 24,
        padding: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    langBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    langBtnActive: {
        paddingHorizontal: 0,
        paddingVertical: 0,
        overflow: 'hidden',
    },
    langGradient: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    langText: {
        fontSize: 13,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.7)',
    },
    langTextActive: {
        fontSize: 13,
        fontWeight: '800',
        color: '#000000',
    },
    imageBranding: {
        position: 'absolute',
        bottom: 60,
        left: 32,
    },
    welcomeText: {
        fontSize: 36,
        fontFamily: FONTS.title,
        color: COLORS.white,
        fontWeight: '900',
        letterSpacing: -1.5,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: FONTS.regular,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 4,
        letterSpacing: 0.5,
    },
    bottomCard: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        paddingHorizontal: 32,
        paddingTop: 32,
        paddingBottom: Platform.OS === 'ios' ? 40 : 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 20,
    },
    dragIndicator: {
        width: 40,
        height: 5,
        backgroundColor: '#E5E5E7',
        alignSelf: 'center',
        borderRadius: 3,
        marginBottom: 32,
    },
    cardHeading: {
        fontSize: 30,
        fontFamily: FONTS.heading,
        color: '#000000',
        letterSpacing: -1,
        marginBottom: 8,
        fontWeight: '900',
    },
    cardSub: {
        fontSize: 16,
        color: '#666',
        marginBottom: 32,
        fontFamily: FONTS.regular,
        lineHeight: 22,
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        paddingHorizontal: 20,
        height: 64,
        borderWidth: 2,
        borderColor: 'transparent',
        marginBottom: 24,
    },
    inputWrapFocused: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.white,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    input: {
        flex: 1,
        fontSize: 17,
        color: '#000000',
        fontWeight: '600',
        fontFamily: FONTS.regular,
    },
    continueBtn: {
        borderRadius: 20,
        height: 64,
        overflow: 'hidden',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 10,
    },
    continueGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    continueBtnDisabled: { opacity: 0.6 },
    continueBtnText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#000000',
        fontFamily: FONTS.heading,
    },
    footerContainer: {
        marginTop: 30,
        alignItems: 'center',
    },
    disclaimer: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        fontFamily: FONTS.regular,
        lineHeight: 20,
    },
    link: {
        color: COLORS.primary,
        fontWeight: '700',
    },
});
