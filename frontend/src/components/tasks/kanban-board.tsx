'use client';

import * as React from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { KanbanColumn } from './kanban-column';
import { TaskCard } from './task-card';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';

interface KanbanBoardProps {
  columns: any[];
  tasks: any[];
  visibleFields: Record<string, boolean>;
  onMoveTask: (taskId: string, columnId: string, order: number) => void;
  onAddTaskClick: (columnId: string) => void;
  onEditTask: (task: any) => void;
  onDeleteTask: (taskId: string) => void;
  onDuplicateTask: (taskId: string) => void;
  onRenameColumn: (columnId: string, newName: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onCreateColumn: (name: string) => void;
}

export function KanbanBoard({
  columns,
  tasks,
  visibleFields,
  onMoveTask,
  onAddTaskClick,
  onEditTask,
  onDeleteTask,
  onDuplicateTask,
  onRenameColumn,
  onDeleteColumn,
  onCreateColumn,
}: KanbanBoardProps) {
  const [activeTaskId, setActiveTaskId] = React.useState<string | null>(null);
  const [isAddColOpen, setIsAddColOpen] = React.useState(false);
  const [newColName, setNewColName] = React.useState('');
  const [isCreatingCol, setIsCreatingCol] = React.useState(false);

  // Configure sensors to support clicking and scrolling while dragging
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Requires moving 5px before drag starts, letting clicks pass through normally
      },
    })
  );

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTaskId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTaskId(null);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Find the task
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    let targetColumnId = '';
    let targetOrder = 0;

    const isOverColumn = columns.some((col) => col.id === overId);

    if (isOverColumn) {
      targetColumnId = overId;
      const colTasks = tasks.filter((t) => t.columnId === overId && t.id !== taskId).sort((a, b) => a.order - b.order);
      targetOrder = colTasks.length;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (!overTask) return;

      targetColumnId = overTask.columnId;
      const colTasks = tasks.filter((t) => t.columnId === targetColumnId && t.id !== taskId).sort((a, b) => a.order - b.order);
      const overIdx = colTasks.findIndex((t) => t.id === overId);
      targetOrder = overIdx !== -1 ? overIdx : colTasks.length;
    }

    // Trigger API and optimistic updates
    onMoveTask(taskId, targetColumnId, targetOrder);
  };

  const handleCreateColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    setIsCreatingCol(true);
    try {
      await onCreateColumn(newColName);
      setNewColName('');
      setIsAddColOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreatingCol(false);
    }
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-full items-start space-x-4 overflow-x-auto pb-4 pr-10 min-h-[calc(100vh-12rem)] scroll-smooth snap-x">
        {columns.map((col, colIndex) => {
          const colTasks = tasks
            .filter((t) => t.columnId === col.id)
            .sort((a, b) => a.order - b.order);

          return (
            <div
              key={col.id}
              className="snap-center board-col-enter"
              style={{ animationDelay: `${Math.min(colIndex * 40, 160)}ms` }}
            >
              <KanbanColumn
                column={col}
                tasks={colTasks}
                visibleFields={visibleFields}
                onAddTaskClick={onAddTaskClick}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
                onDuplicateTask={onDuplicateTask}
                onRenameColumn={onRenameColumn}
                onDeleteColumn={onDeleteColumn}
              />
            </div>
          );
        })}

        {/* Add Column button */}
        <button
          onClick={() => setIsAddColOpen(true)}
          className="flex h-[53px] w-72 shrink-0 items-center justify-center space-x-1.5 rounded-xl border border-dashed border-border hover:border-muted-foreground bg-transparent text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all font-semibold cursor-pointer snap-center"
        >
          <Plus className="h-4 w-4" />
          <span>Add Column</span>
        </button>
      </div>

      {/* Drag overlay to show a copy of the card floating */}
      <DragOverlay
        dropAnimation={{
          duration: 240,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {activeTaskId && activeTask ? (
          <div className="w-[280px] cursor-grabbing rotate-[2deg] scale-[1.03] shadow-xl opacity-95 transition-transform">
            <TaskCard
              task={activeTask}
              visibleFields={visibleFields}
              onEdit={() => {}}
              onDelete={() => {}}
              onDuplicate={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>

      {/* Add Column Dialog */}
      <Dialog open={isAddColOpen} onOpenChange={setIsAddColOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-sm">
          <form onSubmit={handleCreateColumn}>
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">New Column</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <label className="text-xs text-muted-foreground font-medium mb-1 block">
                Column Name
              </label>
              <input
                type="text"
                placeholder="e.g. In Testing"
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                className="w-full bg-input-fill border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                required
                autoFocus
              />
            </div>
            <DialogFooter className="flex items-center space-x-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsAddColOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreatingCol} className="text-xs bg-foreground text-background hover:opacity-90">
                {isCreatingCol ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DndContext>
  );
}
