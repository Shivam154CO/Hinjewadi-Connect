// Apple iOS design system
export const COLORS = {
    primary: '#007AFF',        // iOS system blue
    secondary: '#5856D6',      // iOS indigo
    accent: '#34C759',         // iOS green
    background: '#F2F2F7',     // iOS system grey background
    surface: '#FFFFFF',
    surfaceAlt: '#F2F2F7',
    text: '#000000',
    textSecondary: '#8E8E93',   // iOS secondary label
    textMuted: '#C7C7CC',       // iOS tertiary label
    border: '#C6C6C8',          // iOS separator
    borderLight: '#E5E5EA',     // iOS opaque separator
    error: '#FF3B30',           // iOS red
    success: '#34C759',         // iOS green
    warning: '#FF9500',         // iOS orange
    white: '#FFFFFF',
    black: '#000000',
    phase1: '#007AFF',
    phase2: '#5856D6',
    phase3: '#AF52DE',
    card: '#FFFFFF',
    input: '#FFFFFF',
    destructive: '#FF3B30',
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
    lg: 18,
    xl: 24,
    full: 9999,
};

export const SHADOWS = {
    none: { elevation: 0, shadowOpacity: 0 },
    light: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    premium: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
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
