import { AppColors } from '@/interfaces/color';
import { useMemo } from 'react';

export const useAvatarColor = (
  displayText: string | undefined | null,
  colors: AppColors,
) => {
  return useMemo(() => {
    const keys = [
      'blue',
      'green',
      'red',
      'orange',
      'yellow',
      'pink',
      'teal',
      'indigo',
    ] as const;
    const str = displayText || 'FA';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % keys.length;
    const key = keys[index];
    const isDarkText = ['yellow', 'teal', 'orange'].includes(key);
    return { bg: colors[key], fg: isDarkText ? '#0F172A' : '#FFFFFF' };
  }, [displayText, colors]);
};
