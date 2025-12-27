// ZYGOTE Medical Theme
// Medical Blue + White + Teal color palette
// Calm, intelligent, premium, clinically accurate

export const colors = {
    // Primary - Medical Blue
    primary: {
        50: '#EFF6FF',
        100: '#DBEAFE',
        200: '#BFDBFE',
        300: '#93C5FD',
        400: '#60A5FA',
        500: '#2563EB',  // Main primary
        600: '#1D4ED8',
        700: '#1E40AF',
        800: '#1E3A8A',
        900: '#1E3A70',
    },

    // Secondary - Teal
    secondary: {
        50: '#F0FDFA',
        100: '#CCFBF1',
        200: '#99F6E4',
        300: '#5EEAD4',
        400: '#2DD4BF',
        500: '#14B8A6',  // Main secondary
        600: '#0D9488',
        700: '#0F766E',
        800: '#115E59',
        900: '#134E4A',
    },

    // Neutral - Grays
    gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
    },

    // Semantic colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Background
    background: {
        light: '#FFFFFF',
        dark: '#0F172A',
        lightGray: '#F9FAFB',
        darkGray: '#1E293B',
    },

    // Text
    text: {
        primary: '#111827',
        secondary: '#6B7280',
        tertiary: '#9CA3AF',
        inverse: '#FFFFFF',
        dark: {
            primary: '#F9FAFB',
            secondary: '#D1D5DB',
            tertiary: '#9CA3AF',
        },
    },

    // Border
    border: {
        light: '#E5E7EB',
        medium: '#D1D5DB',
        dark: '#9CA3AF',
    },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
};

export const fontSize = {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    huge: 36,
};

export const fontWeight = {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
};

export const theme = {
    light: {
        colors: {
            primary: colors.primary[500],
            secondary: colors.secondary[500],
            background: colors.background.light,
            card: colors.background.light,
            text: colors.text.primary,
            textSecondary: colors.text.secondary,
            border: colors.border.light,
            success: colors.success,
            error: colors.error,
            warning: colors.warning,
        },
    },
    dark: {
        colors: {
            primary: colors.primary[400],
            secondary: colors.secondary[400],
            background: colors.background.dark,
            card: colors.background.darkGray,
            text: colors.text.dark.primary,
            textSecondary: colors.text.dark.secondary,
            border: colors.gray[700],
            success: colors.success,
            error: colors.error,
            warning: colors.warning,
        },
    },
};

export default {
    colors,
    spacing,
    borderRadius,
    fontSize,
    fontWeight,
    shadows,
    theme,
};
