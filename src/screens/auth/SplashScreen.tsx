import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    StatusBar,
    TouchableOpacity
} from 'react-native';
import { AuthScreenProps } from '../../types';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const HERO_VIDEO = require('../../../assets/HinjewadiPune.mp4');

export const SplashScreen: React.FC<AuthScreenProps<'Splash'>> = ({ navigation }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const buttonFadeAnim = useRef(new Animated.Value(0)).current;

    // Modern Video Player Hook for SDK 54+
    const player = useVideoPlayer(HERO_VIDEO, (player) => {
        player.loop = true;
        player.muted = true;
        player.play();
    });

    useEffect(() => {
        // Fade in content
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
        }).start(() => {
            // After initial content fades in, wait a bit and fade in the button
            Animated.timing(buttonFadeAnim, {
                toValue: 1,
                duration: 1000,
                delay: 500,
                useNativeDriver: true,
            }).start();
        });
    }, []);

    const handleGetStarted = () => {
        navigation.replace('Login');
    };

    return (
        <View style={styles.container}>
            <StatusBar hidden />

            {/* Background Video using modern expo-video */}
            <VideoView
                player={player}
                style={styles.bgVideo}
                contentFit="cover"
                nativeControls={false}
            />

            {/* Premium Gradient Overlay */}
            <LinearGradient
                colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.5)', COLORS.background]}
                style={styles.overlay}
            />

            {/* Branding Content */}
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                <Text style={styles.appName}>Hinjewadi</Text>
                <Text style={styles.appTagline}>CONNECT</Text>
            </Animated.View>

            {/* Get Started Button */}
            <Animated.View style={[styles.buttonContainer, {
                opacity: buttonFadeAnim, transform: [{
                    translateY: buttonFadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [40, 0]
                    })
                }]
            }]}>
                <TouchableOpacity
                    onPress={handleGetStarted}
                    activeOpacity={0.8}
                    style={styles.getStartedBtn}
                >
                    <LinearGradient
                        colors={[COLORS.primary, '#00A87E']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.btnGradient}
                    >
                        <Text style={styles.btnText}>GET STARTED</Text>
                        <MaterialCommunityIcons name="arrow-right" size={24} color="#000" />
                    </LinearGradient>
                </TouchableOpacity>
                <View style={s.footerNote}>
                    <MaterialCommunityIcons name="map-marker-radius" size={14} color={COLORS.primary} />
                    <Text style={styles.footerText}>Discover your community in Hinjewadi</Text>
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    bgVideo: {
        position: 'absolute',
        width: width,
        height: height,
    },
    overlay: {
        position: 'absolute',
        width: width,
        height: height,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        paddingTop: 60,
    },
    logoCircle: {
        width: 120,
        height: 120,
        borderRadius: 40,
        padding: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginBottom: 20,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 15,
    },
    gradientLogo: {
        flex: 1,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    appName: {
        fontSize: 52,
        fontFamily: FONTS.title,
        color: COLORS.white,
        letterSpacing: -2,
        fontWeight: '900',
    },
    appTagline: {
        fontSize: 15,
        fontFamily: FONTS.heading,
        color: COLORS.primary,
        letterSpacing: 10,
        marginTop: -8,
        fontWeight: '800',
    },
    buttonContainer: {
        paddingHorizontal: 40,
        paddingBottom: 60,
        alignItems: 'center',
        zIndex: 20,
    },
    getStartedBtn: {
        width: '80%',
        height: 54,
        borderRadius: 22,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        ...SHADOWS.medium,
        shadowColor: COLORS.primary,
    },
    btnGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    btnText: {
        color: '#000',
        fontSize: 18,
        fontWeight: '900',
        fontFamily: FONTS.heading,
        letterSpacing: 1,
    },
    footerText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
        fontFamily: FONTS.regular,
    },
});

const s = StyleSheet.create({
    footerNote: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 20,
    }
});
