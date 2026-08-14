'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Edit2,
  Copy,
  Trash2,
  Plus,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { PriorityBadge } from '../ui/priority-icon';
import { cn } from '../../lib/utils';

interface ListViewProps {
  tasks: any[];
  columns: any[];
  visibleFields: Record<string, boolean>;
  onEditTask: (task: any) => void;
  onDeleteTask: (taskId: string) => void;
  onDuplicateTask: (taskId: string) => void;
  onAddTaskClick?: (columnId: string) => void;
}

export function ListView({
  tasks,
  columns,
  visibleFields,
  onEditTask,
  onDeleteTask,
  onDuplicateTask,
  onAddTaskClick,
}: ListViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [collapsedGroups, setCollapsedGroups] = React.useState<Set<string>>(new Set());

  const toggleGroup = (colId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(colId)) next.delete(colId);
      else next.add(colId);
      return next;
    });
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleRowClick = (task: any) => {
    const params = new URLSearchParams(searchParams.toString());
    router.push(`/tasks/${task.id}?${params.toString()}`);
  };

  if (tasks.length === 0 && columns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border border-border rounded-xl bg-panel-muted">
        <p className="text-sm text-muted-foreground italic">No tasks found matching your filters.</p>
      </div>
    );
  }

  const sortedColumns = [...columns].sort((a, b) => a.order - b.order);

  const colCount =
    2 +
    (visibleFields.priority ? 1 : 0) +
    (visibleFields.members ? 1 : 0) +
    (visibleFields.dueDate ? 1 : 0);

  return (
    <div className="space-y-5 pb-6">
      {sortedColumns.map((col) => {
        const colTasks = tasks
          .filter((t) => t.columnId === col.id)
          .sort((a, b) => a.order - b.order);
        const isCollapsed = collapsedGroups.has(col.id);

        return (
          <div key={col.id} className="space-y-2">
            <button
              type="button"
              onClick={() => toggleGroup(col.id)}
              className="flex items-center gap-1.5 py-1 px-0.5 text-[13px] font-semibold text-foreground hover:opacity-80 transition-colors cursor-pointer select-none"
            >
              {isCollapsed ? (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span>{col.name}</span>
            </button>

            {!isCollapsed && (
              <div className="border border-border rounded-xl bg-card overflow-hidden">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr className="border-b border-border bg-panel-muted text-muted-foreground font-medium">
                      <th className="py-2.5 px-4 w-[38%] font-medium">Task</th>
                      {visibleFields.priority && (
                        <th className="py-2.5 px-4 font-medium">Priority</th>
                      )}
                      {visibleFields.members && (
                        <th className="py-2.5 px-4 font-medium">Members</th>
                      )}
                      {visibleFields.dueDate && (
                        <th className="py-2.5 px-4 font-medium">Due Date</th>
                      )}
                      <th className="py-2.5 px-4 w-14 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {colTasks.length === 0 ? (
                      <tr>
                        <td
                          colSpan={colCount}
                          className="p-4 text-center text-muted-foreground text-xs italic"
                        >
                          No tasks in this column
                        </td>
                      </tr>
                    ) : (
                      colTasks.map((task, idx) => (
                        <tr
                          key={task.id}
                          onClick={() => handleRowClick(task)}
                          className={cn(
                            'group cursor-pointer text-foreground hover:bg-row-hover transition-colors',
                            idx !== colTasks.length - 1 && 'border-b border-border/60'
                          )}
                        >
                          <td className="py-3 px-4">
                            <span className="font-medium text-foreground">{task.title}</span>
                          </td>

                          {visibleFields.priority && (
                            <td className="py-3 px-4">
                              <PriorityBadge priority={task.priority} />
                            </td>
                          )}

                          {visibleFields.members && (
                            <td className="py-3 px-4">
                              {task.assignees && task.assignees.length > 0 ? (
                                <div className="flex -space-x-1.5">
                                  {task.assignees.slice(0, 3).map((a: any) => (
                                    <Avatar
                                      key={a.id}
                                      className="h-6 w-6 border-2 border-white"
                                    >
                                      <AvatarImage src={a.avatarUrl || ''} />
                                      <AvatarFallback className="text-[9px] bg-muted font-semibold text-muted-foreground">
                                        {a.name.substring(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditTask(task);
                                  }}
                                  className="h-6 w-6 rounded-full border border-dashed border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors"
                                  title="Add member"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              )}
                            </td>
                          )}

                          {visibleFields.dueDate && (
                            <td className="py-3 px-4 text-foreground/80">
                              {task.dueDate ? (
                                formatDate(task.dueDate)
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                          )}

                          <td
                            className="py-3 px-4 text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded-md transition-colors cursor-pointer">
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="bg-popover border border-border w-36 text-popover-foreground shadow-md rounded-lg"
                              >
                                <DropdownMenuItem
                                  onClick={() => onEditTask(task)}
                                  className="flex items-center space-x-2 cursor-pointer text-xs"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                  <span>Edit task</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => onDuplicateTask(task.id)}
                                  className="flex items-center space-x-2 cursor-pointer text-xs"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                  <span>Duplicate</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-border" />
                                <DropdownMenuItem
                                  onClick={() => {
                                    window.setTimeout(() => onDeleteTask(task.id), 50);
                                  }}
                                  className="flex items-center space-x-2 text-red-500 hover:text-red-600 hover:bg-danger-soft focus:text-red-500 cursor-pointer text-xs"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {onAddTaskClick && (
                  <button
                    type="button"
                    onClick={() => onAddTaskClick(col.id)}
                    className="w-full flex items-center gap-1.5 px-4 py-2.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors font-medium cursor-pointer border-t border-border"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Task</span>
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
