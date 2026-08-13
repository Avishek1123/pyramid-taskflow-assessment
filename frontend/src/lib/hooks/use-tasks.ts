import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

// Auth hooks
export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const meQuery = useQuery({
    queryKey: ['auth-me'],
    queryFn: () => apiClient.get('/auth/me'),
    retry: false,
    enabled: !!Cookies.get('jwt'),
  });

  const guestLoginMutation = useMutation({
    mutationFn: () => apiClient.post('/auth/guest'),
    onSuccess: (data) => {
      // Set cookie on client (backend also sets it, but setting it here is safe)
      Cookies.set('jwt', data.token, {
        expires: 7,
        path: '/',
        sameSite: 'lax',
        secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
      });
      queryClient.setQueryData(['auth-me'], data.user);
      router.push(`/tasks?workspace=${data.workspaceId}&project=${data.projectId}`);
    },
  });

  const logout = () => {
    Cookies.remove('jwt', { path: '/' });
    queryClient.clear();
    router.push('/login');
  };

  return {
    user: meQuery.data,
    isLoading: meQuery.isLoading,
    guestLogin: guestLoginMutation.mutate,
    isLoggingIn: guestLoginMutation.isPending,
    logout,
  };
}

// Workspaces hooks
export function useWorkspaces() {
  const queryClient = useQueryClient();

  const workspacesQuery = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => apiClient.get('/workspaces'),
  });

  const createWorkspaceMutation = useMutation({
    mutationFn: (name: string) => apiClient.post('/workspaces', { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });

  const deleteWorkspaceMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/workspaces/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });

  return {
    workspaces: workspacesQuery.data || [],
    isLoading: workspacesQuery.isLoading,
    createWorkspace: createWorkspaceMutation.mutateAsync,
    deleteWorkspace: deleteWorkspaceMutation.mutateAsync,
    isDeletingWorkspace: deleteWorkspaceMutation.isPending,
  };
}

export function useWorkspaceMembers(workspaceId?: string) {
  return useQuery({
    queryKey: ['workspace-members', workspaceId],
    queryFn: () => apiClient.get(`/workspaces/${workspaceId}/members`),
    enabled: !!workspaceId,
  });
}

// Projects hooks
export function useProjects(workspaceId?: string) {
  const queryClient = useQueryClient();

  const projectsQuery = useQuery({
    queryKey: ['projects', workspaceId],
    queryFn: () => apiClient.get(`/workspaces/${workspaceId}/projects`),
    enabled: !!workspaceId,
  });

  const createProjectMutation = useMutation({
    mutationFn: (name: string) => apiClient.post(`/workspaces/${workspaceId}/projects`, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
    },
  });

  return {
    projects: projectsQuery.data || [],
    isLoading: projectsQuery.isLoading,
    createProject: createProjectMutation.mutateAsync,
  };
}

export function useProject(projectId?: string) {
  const queryClient = useQueryClient();

  const projectQuery = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => apiClient.get(`/projects/${projectId}`),
    enabled: !!projectId,
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      apiClient.patch(`/projects/${id}`, { name }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['project', vars.id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return {
    project: projectQuery.data,
    isLoading: projectQuery.isLoading,
    updateProject: updateProjectMutation.mutateAsync,
    deleteProject: deleteProjectMutation.mutateAsync,
  };
}

// Columns hooks
export function useColumns(projectId?: string) {
  const queryClient = useQueryClient();

  const columnsQuery = useQuery({
    queryKey: ['columns', projectId],
    queryFn: () => apiClient.get(`/projects/${projectId}/columns`),
    enabled: !!projectId,
  });

  const createColumnMutation = useMutation({
    mutationFn: (name: string) => apiClient.post(`/projects/${projectId}/columns`, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns', projectId] });
    },
  });

  const updateColumnMutation = useMutation({
    mutationFn: ({ columnId, name, order }: { columnId: string; name: string; order?: number }) =>
      apiClient.patch(`/columns/${columnId}`, { name, order }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns', projectId] });
    },
  });

  const deleteColumnMutation = useMutation({
    mutationFn: (columnId: string) => apiClient.delete(`/columns/${columnId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns', projectId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });

  return {
    columns: columnsQuery.data || [],
    isLoading: columnsQuery.isLoading,
    createColumn: createColumnMutation.mutateAsync,
    updateColumn: updateColumnMutation.mutateAsync,
    deleteColumn: deleteColumnMutation.mutateAsync,
  };
}

// Tasks hooks
export interface TaskInput {
  title: string;
  columnId: string;
  description?: string;
  priority?: string;
  dueDate?: string | null;
  labelIds?: string[];
  assigneeIds?: string[];
  reporterId?: string;
}

export function useTasks(projectId?: string) {
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => apiClient.get(`/projects/${projectId}/tasks`),
    enabled: !!projectId,
  });

  const createTaskMutation = useMutation({
    mutationFn: (task: TaskInput) => apiClient.post(`/projects/${projectId}/tasks`, task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: Partial<TaskInput> }) =>
      apiClient.patch(`/tasks/${taskId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => apiClient.delete(`/tasks/${taskId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });

  const duplicateTaskMutation = useMutation({
    mutationFn: (taskId: string) => apiClient.post(`/tasks/${taskId}/duplicate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });

  const moveTaskMutation = useMutation({
    mutationFn: ({ taskId, columnId, order }: { taskId: string; columnId: string; order: number }) =>
      apiClient.patch(`/tasks/${taskId}/move`, { columnId, order }),
    
    // Optimistic Updates
    onMutate: async ({ taskId, columnId, order }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId] });
      const previousTasks = queryClient.getQueryData(['tasks', projectId]);

      if (previousTasks) {
        // Compute optimistic state
        const tasksCopy = JSON.parse(JSON.stringify(previousTasks)) as any[];
        const taskIdx = tasksCopy.findIndex(t => t.id === taskId);
        
        if (taskIdx !== -1) {
          const task = tasksCopy[taskIdx];
          const oldColumnId = task.columnId;
          const oldOrder = task.order;

          task.columnId = columnId;
          task.order = order;

          if (oldColumnId === columnId) {
            // Reordering in same column
            const colTasks = tasksCopy.filter(t => t.columnId === columnId).sort((a, b) => a.order - b.order);
            const targetTask = colTasks.find(t => t.id === taskId);
            
            // Remove target task
            const remaining = colTasks.filter(t => t.id !== taskId);
            // Insert target task at new order
            remaining.splice(order, 0, targetTask!);
            // Re-assign orders
            remaining.forEach((t, index) => {
              const original = tasksCopy.find(tc => tc.id === t.id);
              if (original) original.order = index;
            });
          } else {
            // Moving to other column
            // 1. Decrement subsequent in source
            tasksCopy.forEach(t => {
              if (t.columnId === oldColumnId && t.order > oldOrder) {
                t.order -= 1;
              }
            });
            // 2. Increment target column subsequent
            tasksCopy.forEach(t => {
              if (t.columnId === columnId && t.id !== taskId && t.order >= order) {
                t.order += 1;
              }
            });
          }
          
          queryClient.setQueryData(['tasks', projectId], tasksCopy);
        }
      }

      return { previousTasks };
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', projectId], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });

  return {
    tasks: tasksQuery.data || [],
    isLoading: tasksQuery.isLoading,
    createTask: createTaskMutation.mutateAsync,
    updateTask: updateTaskMutation.mutateAsync,
    deleteTask: deleteTaskMutation.mutateAsync,
    duplicateTask: duplicateTaskMutation.mutateAsync,
    moveTask: moveTaskMutation.mutateAsync,
  };
}

// Labels hooks
export function useLabels() {
  const queryClient = useQueryClient();

  const labelsQuery = useQuery({
    queryKey: ['labels'],
    queryFn: () => apiClient.get('/labels'),
  });

  const createLabelMutation = useMutation({
    mutationFn: (label: { name: string; color: string }) => apiClient.post('/labels', label),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
    },
  });

  return {
    labels: labelsQuery.data || [],
    isLoading: labelsQuery.isLoading,
    createLabel: createLabelMutation.mutateAsync,
  };
}
