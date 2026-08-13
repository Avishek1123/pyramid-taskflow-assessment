import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api-client';

export function useTaskDetail(taskId?: string) {
  const queryClient = useQueryClient();

  const taskQuery = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => apiClient.get(`/tasks/${taskId}`),
    enabled: !!taskId,
  });

  const updateTaskMutation = useMutation({
    mutationFn: (data: Record<string, any>) => apiClient.patch(`/tasks/${taskId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      // Also invalidate the project-level tasks list
      if (taskQuery.data?.projectId) {
        queryClient.invalidateQueries({ queryKey: ['tasks', taskQuery.data.projectId] });
      }
    },
  });

  return {
    task: taskQuery.data,
    isLoading: taskQuery.isLoading,
    error: taskQuery.error,
    updateTask: updateTaskMutation.mutateAsync,
    isUpdating: updateTaskMutation.isPending,
  };
}
