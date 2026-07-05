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
    secondary: '#007AFF',
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
    xs: 4,
    sm: 8,
    md: 10,
    lg: 12,
    xl: 16,
    full: 9999,
};

export const SHADOWS = {
    none: { elevation: 0, shadowOpacity: 0 },
    light: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 3,
    },
    premium: {
        shadowColor: '#00C896',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    soft: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    teal: {
        shadowColor: '#00C896',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    }
};
