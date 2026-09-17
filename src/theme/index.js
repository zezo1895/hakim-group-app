export const lightColors = {
  primary: '#1B7A3D',
  primaryLight: '#2E9B4E',
  primaryDark: '#0F5A2A',
  secondary: '#1A5276',
  secondaryLight: '#2471A3',
  secondaryDark: '#0E3A55',
  background: '#FAFCFB',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F4F2',
  text: '#1C2822',
  textSecondary: '#62776A',
  textLight: '#94A69D',
  border: '#E8EFEA',
  error: '#DC2626',
  success: '#16A34A',
  overlay: 'rgba(28, 40, 34, 0.6)',
  white: '#FFFFFF',
  black: '#000000',
  cardShadow: 'rgba(27, 122, 61, 0.08)'
};

export const darkColors = {
  primary: '#2E9B4E',
  primaryLight: '#4BBA6C',
  primaryDark: '#1B7A3D',
  secondary: '#2471A3',
  secondaryLight: '#3498DB',
  secondaryDark: '#1A5276',
  background: '#121212',
  surface: '#1E1E1E',
  surfaceAlt: '#2C2C2C',
  text: '#E0E0E0',
  textSecondary: '#A0A0A0',
  textLight: '#707070',
  border: '#333333',
  error: '#FF6B6B',
  success: '#4CD964',
  overlay: 'rgba(0, 0, 0, 0.8)',
  white: '#121212',
  black: '#FFFFFF',
  cardShadow: 'rgba(0, 0, 0, 0.5)'
};

// Fallback for files that still import COLORS directly
export const COLORS = lightColors;

export const SPACING = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
export const RADIUS = { sm: 8, md: 16, lg: 24, xl: 32, full: 9999 };
export const SHADOWS = {
  small: { shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 },
  medium: { shadowColor: '#000', shadowOffset: {width:0, height:6}, shadowOpacity: 0.15, shadowRadius: 16, elevation: 5 },
  large: { shadowColor: '#000', shadowOffset: {width:0, height:12}, shadowOpacity: 0.2, shadowRadius: 24, elevation: 10 },
};
export const FONT_SIZES = { xs: 10, sm: 12, md: 14, lg: 16, xl: 20, xxl: 24, title: 28, hero: 36 };
