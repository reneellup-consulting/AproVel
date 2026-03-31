export const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
export const apiUrl = process.env.EXPO_PUBLIC_APRVEL_API_BASE_URL;

// DEMO DATE: Set "Today" to Jan 24, 2026
// export const now = new Date('2026-02-10');
export const now = new Date();

export const STATUS_STYLES: Record<string, { text: string }> = {
  pending: { text: '#535862' },
  approved: { text: '#17B26A' },
  rejected: { text: '#F04438' },
  partial: { text: '#F79009' },
  received: { text: '#2E90FA' },
  default: { text: '#6b7280' },
};
