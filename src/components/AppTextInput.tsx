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
}

export const AppTextInput: React.FC<AppTextInputProps> = ({
    label,
    error,
    containerStyle,
    ...props
}) => {
    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={[
                styles.inputContainer,
                error ? styles.inputError : null
            ]}>
                <TextInput
                    style={styles.input}
                    placeholderTextColor={COLORS.textSecondary}
                    selectionColor={COLORS.primary}
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
        backgroundColor: COLORS.input,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        paddingHorizontal: SPACING.md,
        height: 64,
        justifyContent: 'center',
    },
    input: {
        fontSize: 18,
        fontFamily: FONTS.regular,
        color: COLORS.text,
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
