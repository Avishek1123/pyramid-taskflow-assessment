'use client';

import * as React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { TaskCard } from './task-card';
import { Plus, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';

interface KanbanColumnProps {
  column: {
    id: string;
    name: string;
    order: number;
  };
  tasks: any[];
  visibleFields: Record<string, boolean>;
  onAddTaskClick: (columnId: string) => void;
  onEditTask: (task: any) => void;
  onDeleteTask: (taskId: string) => void;
  onDuplicateTask: (taskId: string) => void;
  onRenameColumn: (columnId: string, newName: string) => void;
  onDeleteColumn: (columnId: string) => void;
}

export function KanbanColumn({
  column,
  tasks,
  visibleFields,
  onAddTaskClick,
  onEditTask,
  onDeleteTask,
  onDuplicateTask,
  onRenameColumn,
  onDeleteColumn,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });
  const [isRenameOpen, setIsRenameOpen] = React.useState(false);
  const [newName, setNewName] = React.useState(column.name);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsSaving(true);
    try {
      await onRenameColumn(column.id, newName);
      setIsRenameOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex w-[280px] shrink-0 flex-col bg-column rounded-xl max-h-[calc(100vh-11rem)] overflow-hidden">
      {/* Column Header */}
      <div className="flex items-center justify-between px-3 py-2.5 sticky top-0 z-10 bg-column">
        <div className="flex items-center gap-2 min-w-0">
          {/* 2x3 drag handle dots */}
          <span
            className="grid grid-cols-2 gap-[2px] shrink-0 cursor-grab opacity-50"
            aria-hidden
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="h-[2.5px] w-[2.5px] rounded-full bg-muted-foreground" />
            ))}
          </span>
          <span className="text-[13px] font-semibold text-foreground truncate select-none">
            {column.name}
          </span>
        </div>

        <div className="flex items-center space-x-0.5 shrink-0">
          <button
            onClick={() => onAddTaskClick(column.id)}
            className="text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded-md transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded-md transition-colors cursor-pointer">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border border-border text-popover-foreground w-36 shadow-md">
              <DropdownMenuItem
                onClick={() => {
                  setNewName(column.name);
                  setIsRenameOpen(true);
                }}
                className="flex items-center space-x-2 text-xs cursor-pointer py-1.5"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Rename column</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeleteColumn(column.id)}
                className="flex items-center space-x-2 text-red-500 hover:text-red-600 hover:bg-danger-soft focus:text-red-500 text-xs cursor-pointer py-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete column</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Task List container */}
      <div ref={setNodeRef} className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              visibleFields={visibleFields}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onDuplicate={onDuplicateTask}
            />
          ))}
        </SortableContext>

        {/* Add Task link */}
        <button
          onClick={() => onAddTaskClick(column.id)}
          className="w-full flex items-center justify-start space-x-1.5 py-1.5 px-1 rounded-md text-xs text-muted-foreground hover:text-foreground transition-colors font-medium cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Rename Column Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent className="bg-white border border-zinc-200 text-zinc-900 max-w-sm">
          <form onSubmit={handleRename}>
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">Rename Column</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <label className="text-xs text-zinc-500 font-medium mb-1 block">
                Column Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-ring"
                required
                autoFocus
              />
            </div>
            <DialogFooter className="flex items-center space-x-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsRenameOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="text-xs bg-zinc-950 hover:bg-zinc-900 text-white">
                {isSaving ? 'Saving...' : 'Rename'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
