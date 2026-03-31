const lightColors = {
  // Base colors
  background: '#f1f5f9',
  foreground: '#0f172b',

  // Card colors
  card: '#ffffff',
  cardForeground: '#0f172b',

  // Popover colors
  popover: '#ffffff',
  popoverForeground: '#0f172b',

  // Primary colors
  primary: '#ff6900', // The Brand Color
  primaryForeground: '#ffffff',

  // Secondary colors
  secondary: '#62748e13',
  secondaryForeground: '#0f172b',

  // Muted colors
  muted: '#e2e8f0',
  mutedForeground: '#0f172bb2',

  // Accent colors
  accent: '#f8fafc',
  accentForeground: '#0f172b',

  // Destructive colors
  destructive: '#ffa2a2',
  destructiveForeground: '#e7000b',

  // Border and input
  border: '#90a1b94c',
  input: '#0f172b26',
  ring: '#ff6900',

  // Text colors
  text: '#0F172A',
  textMuted: '#64748B',

  // Legacy support for existing components
  tint: '#18181b',
  icon: '#71717a',
  tabIconDefault: '#71717a',
  tabIconSelected: '#18181b',

  // Default buttons, links, Send button, selected tabs
  blue: '#007AFF',

  // Success states, FaceTime buttons, completed tasks
  green: '#34C759',

  // Delete buttons, error states, critical alerts
  red: '#FF3B30',

  // VoiceOver highlights, warning states
  orange: '#FF9500',

  // Notes app accent, Reminders highlights
  yellow: '#FFCC00',

  // Pink accent color for various UI elements
  pink: '#FF2D92',

  // Purple accent for creative apps and features
  purple: '#AF52DE',

  // Teal accent for communication features
  teal: '#5AC8FA',

  // Indigo accent for system features
  indigo: '#5856D6',

  success: '#10B981', // Green
  danger: '#EF4444', // Red
};

const darkColors = {
  // Base colors
  background: '#0f172b',
  foreground: '#FFFFFF',

  // Card colors
  card: '#45556c99',
  cardForeground: '#FFFFFF',

  // Popover colors
  popover: '#45556c',
  popoverForeground: '#FFFFFF',

  // Primary colors
  primary: '#ff6900',
  primaryForeground: '#ffffff',

  // Secondary colors
  secondary: '#ffffff1a',
  secondaryForeground: '#FFFFFF',

  // Muted colors
  muted: '#62748e',
  mutedForeground: '#f1f5f9b2',

  // Accent colors
  accent: '#1d2c3c',
  accentForeground: '#ffffff',

  // Destructive colors
  destructive: '#e7000b',
  destructiveForeground: '#ff6467',

  // Border and input - using alpha values for better blending
  border: '#ffffff4c',
  input: '#ffffff33',
  ring: '#ff6900',

  // Text colors
  text: '#FFFFFF',
  textMuted: '#a1a1aa',

  // Legacy support for existing components
  tint: '#FFFFFF',
  icon: '#a1a1aa',
  tabIconDefault: '#a1a1aa',
  tabIconSelected: '#FFFFFF',

  // Default buttons, links, Send button, selected tabs
  blue: '#0A84FF',

  // Success states, FaceTime buttons, completed tasks
  green: '#30D158',

  // Delete buttons, error states, critical alerts
  red: '#FF453A',

  // VoiceOver highlights, warning states
  orange: '#FF9F0A',

  // Notes app accent, Reminders highlights
  yellow: '#FFD60A',

  // Pink accent color for various UI elements
  pink: '#FF375F',

  // Purple accent for creative apps and features
  purple: '#BF5AF2',

  // Teal accent for communication features
  teal: '#64D2FF',

  // Indigo accent for system features
  indigo: '#5E5CE6',

  success: '#10B981', // Green
  danger: '#EF4444', // Red
};

export const Colors = {
  light: lightColors,
  dark: darkColors,
};

// Export individual color schemes for easier access
export { darkColors, lightColors };

// Utility type for color keys
export type ColorKeys = keyof typeof lightColors;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};
