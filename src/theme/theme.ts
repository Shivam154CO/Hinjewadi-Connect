export const COLORS = {
    primary: '#6366f1', // Indigo for a premium modern feel
    secondary: '#8b5cf6', // Violet
    accent: '#f43f5e', // Rose for actions
    background: '#ffffff',
    surface: '#f9fafb',
    text: '#111827',
    textSecondary: '#4b5563',
    border: '#e5e7eb',
    error: '#ef4444',
    success: '#10b981',
    white: '#ffffff',
    black: '#000000',
    phase1: '#6366f1',
    phase2: '#8b5cf6',
    phase3: '#f43f5e',
    card: '#ffffff',
    input: '#f3f4f6',
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
    md: 12,
    lg: 20,
    xl: 28,
    full: 9999,
};

export const SHADOWS = {
    none: { elevation: 0, shadowOpacity: 0 },
    light: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 8,
    },
    premium: {
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 30,
        elevation: 10,
    }
};
