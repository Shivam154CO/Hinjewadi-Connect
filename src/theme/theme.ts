// Dark mode design system — reference image style
export const COLORS = {
    primary: '#00C896',         // Teal accent (exactly from reference)
    primaryDark: '#00A87E',
    primaryGlow: '#00C89620',
    background: '#0F0F0F',      // Near black
    surface: '#1C1C1E',         // Dark card
    surfaceElevated: '#252527', // Slightly elevated card
    surfaceAlt: '#2C2C2E',
    text: '#FFFFFF',
    textSecondary: '#AEAEB2',
    textMuted: '#636366',
    border: '#2C2C2E',
    borderLight: '#38383A',
    error: '#FF453A',
    success: '#30D158',
    warning: '#FFD60A',
    white: '#FFFFFF',
    black: '#000000',
    phase1: '#00C896',
    phase2: '#007AFF',
    phase3: '#AF52DE',
    card: '#1C1C1E',
    input: '#2C2C2E',
};

export const FONTS = {
    regular: 'Inter_400Regular',
    bold: 'Inter_700Bold',
    black: 'Inter_900Black',
    heading: 'Outfit_700Bold',
    title: 'Outfit_800ExtraBold',
    subHeading: 'Outfit_400Regular',
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
    xxxl: 60,
};

export const BORDER_RADIUS = {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 20,
    xl: 28,
    full: 9999,
};

export const SHADOWS = {
    none: { elevation: 0, shadowOpacity: 0 },
    light: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 4,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 8,
    },
    premium: {
        shadowColor: '#00C896',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
        elevation: 10,
    },
    soft: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 2,
    },
    teal: {
        shadowColor: '#00C896',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    }
};
