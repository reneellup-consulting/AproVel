import { apiFetch } from '@/utils/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface NotificationItem {
  $id: string; // Appwrite uses $id
  title: string;
  message: string;
  type: 'info' | 'alert' | 'success';
  created_at: string;
  is_read: boolean;
  related_order_id?: string;
}

const fetchNotifications = async (): Promise<NotificationItem[]> => {
  const response = await apiFetch('/api/notifications');
  const data = await response.json();
  return data.notifications;
};

const markAllAsReadApi = async (_variables?: void): Promise<void> => {
  await apiFetch('/api/notifications/read-all', { method: 'POST' });
};

const markAsReadApi = async (id: string): Promise<void> => {
  await apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
};

export const useNotifications = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchInterval: 60000, // Optional: Poll every 60s for new notifications
  });

  const markAsReadMutation = useMutation({
    mutationFn: markAsReadApi,
    onSuccess: (_, variables) => {
      queryClient.setQueryData(
        ['notifications'],
        (old: NotificationItem[] | undefined) =>
          old
            ? old.map((n) =>
                n.$id === variables ? { ...n, is_read: true } : n,
              )
            : [],
      );
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllAsReadApi,
    onSuccess: () => {
      queryClient.setQueryData(
        ['notifications'],
        (old: NotificationItem[] | undefined) =>
          old ? old.map((n) => ({ ...n, is_read: true })) : [],
      );
    },
  });

  const unreadCount = query.data?.filter((n) => !n.is_read).length || 0;

  return {
    notifications: query.data || [],
    unreadCount,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    markAsRead: markAsReadMutation.mutate,
    markAsReadAsync: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutate,
    markAllAsReadAsync: markAllAsReadMutation.mutateAsync,
  };
};
