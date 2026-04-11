// Refined design system — clean white, single teal accent, Image 1 style
export const COLORS = {
    primary: '#0891B2',       // Teal — single accent (Image 1 reference)
    secondary: '#0E7490',     // Deeper teal
    accent: '#6B7280',        // Mid grey
    background: '#FFFFFF',
    surface: '#F9FAFB',
    surfaceAlt: '#F3F4F6',
    text: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    error: '#EF4444',
    success: '#059669',
    white: '#FFFFFF',
    black: '#000000',
    phase1: '#0891B2',
    phase2: '#0E7490',
    phase3: '#164E63',
    card: '#FFFFFF',
    input: '#F9FAFB',
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
    lg: 16,
    xl: 24,
    full: 9999,
};

export const SHADOWS = {
    none: { elevation: 0, shadowOpacity: 0 },
    light: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    premium: {
        shadowColor: '#0891B2',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 6,
    },
    soft: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 1,
    }
};
