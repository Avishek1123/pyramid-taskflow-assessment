'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  useProjects,
  useColumns,
  useTasks,
  useWorkspaceMembers,
  useLabels,
} from '../../../lib/hooks/use-tasks';
import { Topbar } from '../../../components/layout/topbar';
import { KanbanBoard } from '../../../components/tasks/kanban-board';
import { ListView } from '../../../components/tasks/list-view';
import { TaskModal } from '../../../components/tasks/task-modal';
import { SidebarContext } from '../layout';
import { Loader2, Plus, FolderKanban } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { ConfirmDialog } from '../../../components/ui/confirm-dialog';

interface TasksPageProps {
  // Empty, no longer injected via cloneElement
}

function TasksPageContent(props: TasksPageProps) {
  const { toggleSidebar } = React.useContext(SidebarContext);
  const onMenuClick = () => toggleSidebar();

  const router = useRouter();
  const searchParams = useSearchParams();

  const workspaceId = searchParams.get('workspace') || '';
  const projectId = searchParams.get('project') || '';

  // 1. Fetch backend queries
  const { projects, isLoading: isProjectsLoading, createProject } = useProjects(workspaceId);
  
  // Default to first project if none is active in the URL
  const activeProjectId = projectId || projects[0]?.id || '';
  const activeProject = projects.find((p: any) => p.id === activeProjectId) || projects[0];

  const { columns, isLoading: isColumnsLoading, createColumn, updateColumn, deleteColumn } = useColumns(activeProjectId);
  const { tasks, isLoading: isTasksLoading, createTask, updateTask, deleteTask, duplicateTask, moveTask } = useTasks(activeProjectId);
  const { data: members = [], isLoading: isMembersLoading } = useWorkspaceMembers(workspaceId);
  const { labels = [], isLoading: isLabelsLoading } = useLabels();

  // 2. Local preferences state
  const [view, setView] = React.useState<'board' | 'list'>('board');
  const [visibleFields, setVisibleFields] = React.useState<Record<string, boolean>>({
    priority: true,
    members: true,
    dueDate: true,
    labels: true,
    status: true,
    reporter: false,
  });

  // 3. Search and filter states
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filters, setFilters] = React.useState({
    priorities: [] as string[],
    assigneeIds: [] as string[],
    labelIds: [] as string[],
    statusColumnIds: [] as string[],
    reporterIds: [] as string[],
  });

  // 4. Modal and Dialog states
  const [isTaskModalOpen, setIsTaskModalOpen] = React.useState(false);
  const [modalTask, setModalTask] = React.useState<any | null>(null);
  const [modalDefaultColId, setModalDefaultColId] = React.useState<string | undefined>(undefined);
  const [isAddProjOpen, setIsAddProjOpen] = React.useState(false);
  const [newProjName, setNewProjName] = React.useState('');
  const [isCreatingProj, setIsCreatingProj] = React.useState(false);
  const [deleteColumnTarget, setDeleteColumnTarget] = React.useState<{ id: string; name: string } | null>(null);
  const [deleteTaskTarget, setDeleteTaskTarget] = React.useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Load preferences from localStorage on mount
  React.useEffect(() => {
    const savedView = localStorage.getItem('taskflow_view');
    if (savedView === 'board' || savedView === 'list') {
      setView(savedView);
    }
    const savedFields = localStorage.getItem('taskflow_fields');
    if (savedFields) {
      try {
        setVisibleFields(JSON.parse(savedFields));
      } catch (_) {}
    }
  }, []);

  // Save view state
  const handleViewChange = (v: 'board' | 'list') => {
    setView(v);
    localStorage.setItem('taskflow_view', v);
  };

  // Save fields state
  const handleVisibleFieldsChange = (fields: Record<string, boolean>) => {
    setVisibleFields(fields);
    localStorage.setItem('taskflow_fields', JSON.stringify(fields));
  };

  // 5. Client-side search and filter logic
  const filteredTasks = React.useMemo(() => {
    return tasks.filter((t: any) => {
      // Title search
      if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Priorities filter
      if (filters.priorities.length > 0 && !filters.priorities.includes(t.priority)) {
        return false;
      }
      // Assignees filter
      if (filters.assigneeIds.length > 0) {
        const hasMatchingAssignee = t.assignees?.some((a: any) => filters.assigneeIds.includes(a.id));
        if (!hasMatchingAssignee) return false;
      }
      // Labels filter
      if (filters.labelIds.length > 0) {
        const hasMatchingLabel = t.labels?.some((l: any) => filters.labelIds.includes(l.id));
        if (!hasMatchingLabel) return false;
      }
      // Status filter
      if (filters.statusColumnIds && filters.statusColumnIds.length > 0 && !filters.statusColumnIds.includes(t.columnId)) {
        return false;
      }
      // Reporter filter
      if (filters.reporterIds && filters.reporterIds.length > 0 && !filters.reporterIds.includes(t.reporterId)) {
        return false;
      }
      return true;
    });
  }, [tasks, searchQuery, filters]);

  // 6. Action handlers
  const handleAddTaskClick = (colId?: string) => {
    setModalTask(null);
    setModalDefaultColId(colId);
    setIsTaskModalOpen(true);
  };

  const handleEditTaskClick = (task: any) => {
    setModalTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData: any) => {
    if (modalTask) {
      // Edit mode
      await updateTask({ taskId: modalTask.id, data: taskData });
    } else {
      // Create mode
      await createTask(taskData);
    }
  };

  const handleRenameColumn = async (colId: string, name: string) => {
    await updateColumn({ columnId: colId, name });
  };

  const handleDeleteColumn = (colId: string) => {
    const column = columns.find((c: any) => c.id === colId);
    setDeleteColumnTarget({
      id: colId,
      name: column?.name || 'this column',
    });
  };

  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find((t: any) => t.id === taskId);
    setDeleteTaskTarget({
      id: taskId,
      title: task?.title || 'this task',
    });
  };

  const confirmDeleteColumn = async () => {
    if (!deleteColumnTarget) return;
    setIsDeleting(true);
    try {
      await deleteColumn(deleteColumnTarget.id);
      setDeleteColumnTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDeleteTask = async () => {
    if (!deleteTaskTarget) return;
    setIsDeleting(true);
    try {
      await deleteTask(deleteTaskTarget.id);
      setDeleteTaskTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim() || !workspaceId) return;

    setIsCreatingProj(true);
    try {
      const created = await createProject(newProjName);
      setNewProjName('');
      setIsAddProjOpen(false);
      router.push(`/tasks?workspace=${workspaceId}&project=${created.id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreatingProj(false);
    }
  };

  // 7. Loading/Empty States
  const isPageLoading = isProjectsLoading || isColumnsLoading || isTasksLoading || isMembersLoading || isLabelsLoading;

  if (isProjectsLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  // If no projects in the workspace, show an empty state to build one
  if (projects.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-white p-6">
        <Topbar
          title="Tasks"
          onMenuClick={onMenuClick || (() => {})}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          view={view}
          onViewChange={handleViewChange}
          visibleFields={visibleFields}
          onVisibleFieldsChange={handleVisibleFieldsChange}
          members={members}
          labels={labels}
          filters={filters}
          onFiltersChange={setFilters}
          onAddTaskClick={() => setIsAddProjOpen(true)}
        />
        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm space-y-5">
          <div className="h-12 w-12 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400">
            <FolderKanban className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-zinc-900">No Projects Found</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Every workspace needs at least one project to house tasks. Let's create your first project!
            </p>
          </div>
          <Button onClick={() => setIsAddProjOpen(true)} size="sm" className="bg-zinc-950 text-white">
            <Plus className="h-4 w-4 mr-1.5" />
            <span>Create Project</span>
          </Button>
        </div>

        {/* Add Project Dialog */}
        <Dialog open={isAddProjOpen} onOpenChange={setIsAddProjOpen}>
          <DialogContent className="bg-white border border-zinc-200 text-zinc-900 max-w-sm">
            <form onSubmit={handleCreateProject}>
              <DialogHeader>
                <DialogTitle className="text-base font-semibold">New Project</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <label className="text-xs text-muted-foreground font-medium mb-1 block">
                  Project Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mobile Application"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-ring"
                  required
                  autoFocus
                />
              </div>
              <DialogFooter className="flex items-center space-x-2 justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsAddProjOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreatingProj} className="text-xs bg-zinc-950 hover:bg-zinc-900 text-white">
                  {isCreatingProj ? 'Creating...' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-panel overflow-hidden">
      {/* Topbar navigation panel */}
      <Topbar
        title="Tasks"
        projectName={projectId ? activeProject?.name : undefined}
        workspaceId={workspaceId}
        columns={columns}
        onMenuClick={onMenuClick}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        view={view}
        onViewChange={handleViewChange}
        visibleFields={visibleFields}
        onVisibleFieldsChange={handleVisibleFieldsChange}
        members={members}
        labels={labels}
        filters={filters}
        onFiltersChange={setFilters}
        onAddTaskClick={() => handleAddTaskClick()}
      />

      {/* Main Task List/Board view container */}
      <main className="flex-1 overflow-hidden px-4 md:px-5 pb-4 relative flex flex-col bg-panel">
        {isPageLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-panel/60 backdrop-blur-xs z-30">
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          </div>
        ) : null}

        {view === 'board' ? (
          <KanbanBoard
            columns={columns}
            tasks={filteredTasks}
            visibleFields={visibleFields}
            onMoveTask={(taskId, columnId, order) => moveTask({ taskId, columnId, order })}
            onAddTaskClick={handleAddTaskClick}
            onEditTask={handleEditTaskClick}
            onDeleteTask={handleDeleteTask}
            onDuplicateTask={duplicateTask}
            onRenameColumn={handleRenameColumn}
            onDeleteColumn={handleDeleteColumn}
            onCreateColumn={createColumn}
          />
        ) : (
          <div className="flex-1 overflow-y-auto pr-1">
            <ListView
              tasks={filteredTasks}
              columns={columns}
              visibleFields={visibleFields}
              onEditTask={handleEditTaskClick}
              onDeleteTask={handleDeleteTask}
              onDuplicateTask={duplicateTask}
              onAddTaskClick={handleAddTaskClick}
            />
          </div>
        )}
      </main>

      {/* Shared Task details modal (Create & Edit) */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onOpenChange={setIsTaskModalOpen}
        columns={columns}
        members={members}
        labels={labels}
        task={modalTask}
        defaultColumnId={modalDefaultColId}
        onSave={handleSaveTask}
      />

      <ConfirmDialog
        open={!!deleteColumnTarget}
        onOpenChange={(open) => !open && setDeleteColumnTarget(null)}
        title="Delete column?"
        description={
          <>
            You are about to delete{' '}
            <span className="font-semibold text-foreground">“{deleteColumnTarget?.name}”</span>.
            All tasks currently in this column will be permanently removed. This cannot be undone.
          </>
        }
        confirmLabel="Delete column"
        cancelLabel="Keep column"
        loading={isDeleting}
        onConfirm={confirmDeleteColumn}
      />

      <ConfirmDialog
        open={!!deleteTaskTarget}
        onOpenChange={(open) => !open && setDeleteTaskTarget(null)}
        title="Delete task?"
        description={
          <>
            You are about to permanently delete{' '}
            <span className="font-semibold text-foreground">“{deleteTaskTarget?.title}”</span>.
            Assignees, labels, and comments tied to this task will also be removed.
          </>
        }
        confirmLabel="Delete task"
        cancelLabel="Keep task"
        loading={isDeleting}
        onConfirm={confirmDeleteTask}
      />
    </div>
  );
}

export default function TasksPage(props: TasksPageProps) {
  return (
    <React.Suspense fallback={
      <div className="flex flex-1 items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    }>
      <TasksPageContent {...props} />
    </React.Suspense>
  );
}
