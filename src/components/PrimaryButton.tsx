import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle
} from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING } from '../theme/theme';

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
    const getBackgroundColor = () => {
        if (disabled) return COLORS.border;
        if (variant === 'secondary') return COLORS.secondary;
        if (variant === 'outline') return 'transparent';
        return COLORS.primary;
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                {
                    backgroundColor: getBackgroundColor(),
                    borderWidth: variant === 'outline' ? 1 : 0,
                    borderColor: variant === 'outline' ? COLORS.primary : 'transparent'
                },
                style
            ]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? COLORS.primary : COLORS.white} />
            ) : (
                <Text style={[
                    styles.text,
                    { color: variant === 'outline' ? COLORS.primary : COLORS.white },
                    textStyle
                ]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56,
    },
    text: {
        fontSize: 16,
        fontWeight: '700',
    },
});
