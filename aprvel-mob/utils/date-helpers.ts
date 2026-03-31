import { now } from '@/constants';

// Move getRelativeDateLabel here
export const getRelativeDateLabel = (dateString: string): string => {
  const date = new Date(dateString);
  // const now = new Date(); // Use local now

  date.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 21) return '2 weeks ago';
  if (diffDays < 30) return '3 weeks ago';
  if (diffDays < 60) return 'Last month';
  return 'Older';
};

// Generic Grouping Function
export const groupOrdersByDate = <T extends { entry_date: string }>(
  data: T[],
) => {
  const groups: { title: string; data: T[] }[] = [];
  data.forEach((item) => {
    const title = getRelativeDateLabel(item.entry_date);
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.title === title) {
      lastGroup.data.push(item);
    } else {
      groups.push({ title, data: [item] });
    }
  });
  return groups;
};
