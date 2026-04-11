import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { AuthScreenProps } from '../../types';
import { errorHandler } from '../../utils/errorHandler';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const LANGS = [
    { code: 'en', label: 'EN' },
    { code: 'hi', label: 'HI' },
    { code: 'mr', label: 'MR' },
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

    return (
        <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            {/* Dark top half — brand area */}
            <View style={s.topHalf}>
                <SafeAreaView edges={['top']}>
                    <View style={s.langRow}>
                        {LANGS.map(lang => (
                            <TouchableOpacity
                                key={lang.code}
                                style={[s.langBtn, i18n.language === lang.code && s.langBtnOn]}
                                onPress={() => i18n.changeLanguage(lang.code)}
                            >
                                <Text style={[s.langText, i18n.language === lang.code && s.langTextOn]}>
                                    {lang.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </SafeAreaView>

                {/* Brand */}
                <View style={s.brand}>
                    <View style={s.brandDot}>
                        <MaterialCommunityIcons name="home-city" size={32} color="#000000" />
                    </View>
                    <Text style={s.brandName}>Hinjewadi</Text>
                    <Text style={s.brandTagline}>Find Rooms · Jobs · Services</Text>
                </View>

                {/* Decorative circles */}
                <View style={s.decCircle1} />
                <View style={s.decCircle2} />
            </View>

            {/* Light bottom card */}
            <View style={s.bottomCard}>
                <Text style={s.cardHeading}>Welcome back 👋</Text>
                <Text style={s.cardSub}>Enter your name to continue</Text>

                <View style={[s.inputWrap, focused && s.inputWrapFocused]}>
                    <MaterialCommunityIcons name="account-outline" size={20} color={focused ? '#00C896' : '#636366'} />
                    <TextInput
                        style={s.input}
                        placeholder="Your full name"
                        placeholderTextColor="#636366"
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
                    activeOpacity={0.85}
                >
                    <Text style={s.continueBtnText}>{isProcessing ? 'Looking you up…' : 'Continue'}</Text>
                    {!isProcessing && <MaterialCommunityIcons name="arrow-right" size={20} color="#000000" />}
                </TouchableOpacity>

                <Text style={s.disclaimer}>
                    By continuing, you agree to our{' '}
                    <Text style={s.link}>Terms of Service</Text>
                </Text>
            </View>
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#0F0F0F' },

    // Top dark half
    topHalf: {
        flex: 1, backgroundColor: '#0F0F0F',
        justifyContent: 'center', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
    },
    langRow: {
        flexDirection: 'row', gap: 6, alignSelf: 'flex-end',
        paddingHorizontal: 20, paddingTop: 8,
    },
    langBtn: {
        paddingHorizontal: 12, paddingVertical: 5,
        borderRadius: 8, backgroundColor: '#1C1C1E',
    },
    langBtnOn: { backgroundColor: '#00C896' },
    langText: { fontSize: 11, fontWeight: '700', color: '#636366' },
    langTextOn: { color: '#000000' },
    brand: { alignItems: 'center' },
    brandDot: {
        width: 72, height: 72, borderRadius: 24,
        backgroundColor: '#00C896', alignItems: 'center',
        justifyContent: 'center', marginBottom: 16,
        shadowColor: '#00C896', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4, shadowRadius: 20, elevation: 12,
    },
    brandName: { fontSize: 36, fontWeight: '900', color: '#FFFFFF', letterSpacing: -1.5 },
    brandTagline: { fontSize: 14, color: '#636366', marginTop: 6, fontWeight: '500' },
    decCircle1: {
        position: 'absolute', width: 300, height: 300, borderRadius: 150,
        backgroundColor: '#00C89606', top: -80, right: -80,
    },
    decCircle2: {
        position: 'absolute', width: 200, height: 200, borderRadius: 100,
        backgroundColor: '#00C89606', bottom: 20, left: -60,
    },

    // Bottom white card
    bottomCard: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 32, borderTopRightRadius: 32,
        paddingHorizontal: 28, paddingTop: 32, paddingBottom: 48,
    },
    cardHeading: { fontSize: 24, fontWeight: '800', color: '#000000', letterSpacing: -0.5 },
    cardSub: { fontSize: 15, color: '#636366', marginTop: 4, marginBottom: 24 },
    inputWrap: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: '#F2F2F7', borderRadius: 16, paddingHorizontal: 16,
        height: 54, borderWidth: 2, borderColor: 'transparent', marginBottom: 16,
    },
    inputWrapFocused: { borderColor: '#00C896', backgroundColor: '#FFFFFF' },
    input: { flex: 1, fontSize: 16, color: '#000000', fontWeight: '500' },
    continueBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#00C896', borderRadius: 16, height: 56, gap: 8,
        shadowColor: '#00C896', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35, shadowRadius: 14, elevation: 8,
    },
    continueBtnDisabled: { opacity: 0.6 },
    continueBtnText: { fontSize: 17, fontWeight: '700', color: '#000000' },
    disclaimer: { fontSize: 12, color: '#AEAEB2', textAlign: 'center', marginTop: 20 },
    link: { color: '#00C896' },
});
