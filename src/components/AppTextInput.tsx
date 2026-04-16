import React from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TextInputProps,
    ViewStyle
} from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING, FONTS } from '../theme/theme';

interface AppTextInputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
    icon?: string;
}

import { MaterialCommunityIcons } from '@expo/vector-icons';

export const AppTextInput: React.FC<AppTextInputProps> = ({
    label,
    error,
    containerStyle,
    icon,
    ...props
}) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={[styles.label, isFocused && { color: COLORS.primary }]}>{label}</Text>}
            <View style={[
                styles.inputContainer,
                isFocused && styles.inputFocused,
                error ? styles.inputError : null
            ]}>
                {icon && (
                    <MaterialCommunityIcons 
                        name={icon as any} 
                        size={22} 
                        color={isFocused ? COLORS.primary : COLORS.textMuted} 
                        style={styles.icon}
                    />
                )}
                <TextInput
                    style={styles.input}
                    placeholderTextColor={COLORS.textMuted}
                    selectionColor={COLORS.primary}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.lg,
        width: '100%',
    },
    label: {
        fontSize: 15,
        fontFamily: FONTS.heading,
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    inputContainer: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        paddingHorizontal: SPACING.md,
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputFocused: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.surfaceAlt,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 2,
    },
    icon: {
        marginRight: SPACING.sm,
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontFamily: FONTS.regular,
        color: COLORS.text,
        height: '100%',
    },
    inputError: {
        borderColor: COLORS.error,
    },
    errorText: {
        color: COLORS.error,
        fontSize: 13,
        fontFamily: FONTS.regular,
        marginTop: 6,
    },
});
