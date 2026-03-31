import { useColor } from '@/hooks/useColor';

export const useAppColors = () => {
  return {
    // Base colors
    background: useColor('background'),
    foreground: useColor('foreground'),

    // Card colors
    card: useColor('card'),
    cardForeground: useColor('cardForeground'),

    // Popover colors
    popover: useColor('popover'),
    popoverForeground: useColor('popoverForeground'),

    // Primary colors
    primary: useColor('primary'),
    primaryForeground: useColor('primaryForeground'),

    // Secondary colors
    secondary: useColor('secondary'),
    secondaryForeground: useColor('secondaryForeground'),

    // Muted colors
    muted: useColor('muted'),
    mutedForeground: useColor('mutedForeground'),

    // Accent colors
    accent: useColor('accent'),
    accentForeground: useColor('accentForeground'),

    // Destructive colors
    destructive: useColor('destructive'),
    destructiveForeground: useColor('destructiveForeground'),

    // Border and input
    border: useColor('border'),
    input: useColor('input'),
    ring: useColor('ring'),

    // Text colors
    text: useColor('text'),
    textMuted: useColor('textMuted'),

    // Legacy support for existing components
    tint: useColor('tint'),
    icon: useColor('icon'),
    tabIconDefault: useColor('tabIconDefault'),
    tabIconSelected: useColor('tabIconSelected'),

    // Default buttons, links, Send button, selected tabs
    blue: useColor('blue'),

    // Success states, FaceTime buttons, completed tasks
    green: useColor('green'),

    // Delete buttons, error states, critical alerts
    red: useColor('red'),

    // VoiceOver highlights, warning states
    orange: useColor('orange'),

    // Notes app accent, Reminders highlights
    yellow: useColor('yellow'),

    // Pink accent color for various UI elements
    pink: useColor('pink'),

    // Purple accent for creative apps and features
    purple: useColor('purple'),

    // Teal accent for communication features
    teal: useColor('teal'),

    // Indigo accent for system features
    indigo: useColor('indigo'),

    success: useColor('success'), // Green
    danger: useColor('danger'), // Red
  };
};
