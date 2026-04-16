import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle
} from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING, FONTS, SHADOWS } from '../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface PrimaryButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    variant?: 'primary' | 'secondary' | 'outline';
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
    title,
    onPress,
    loading,
    disabled,
    style,
    textStyle,
    variant = 'primary'
}) => {
    const getGradientColors = (): [string, string] => {
        if (disabled) return [COLORS.border, COLORS.border];
        if (variant === 'secondary') return [COLORS.secondary, '#5856D6']; // Indigo gradient for secondary
        if (variant === 'outline') return ['transparent', 'transparent'];
        return [COLORS.primary, '#00A87E']; // Teal to darker teal
    };

    const isOutline = variant === 'outline';

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            style={[
                styles.buttonContainer,
                !isOutline && !disabled && (variant === 'primary' ? styles.primaryGlow : styles.secondaryGlow),
                style
            ]}
        >
            <LinearGradient
                colors={getGradientColors()}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                    styles.gradient,
                    isOutline && {
                        borderWidth: 1.5,
                        borderColor: COLORS.primary,
                        backgroundColor: 'transparent'
                    }
                ]}
            >
                {loading ? (
                    <ActivityIndicator color={isOutline ? COLORS.primary : COLORS.white} />
                ) : (
                    <Text style={[
                        styles.text,
                        { color: isOutline ? COLORS.primary : COLORS.white },
                        textStyle
                    ]}>
                        {title}
                    </Text>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'visible', // For shadows to show
    },
    gradient: {
        paddingVertical: 18,
        paddingHorizontal: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 58,
    },
    primaryGlow: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 15,
        elevation: 8,
    },
    secondaryGlow: {
        shadowColor: COLORS.secondary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 15,
        elevation: 8,
    },
    text: {
        fontSize: 17,
        fontFamily: FONTS.heading,
        letterSpacing: 0.8,
        fontWeight: '700',
    },
});
