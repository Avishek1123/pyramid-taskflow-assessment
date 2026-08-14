'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, MoreHorizontal, Edit2, Copy, Trash2, User, Tag } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '../../lib/utils';

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description?: string;
    priority: string;
    dueDate?: string;
    columnId: string;
    reporter?: { id: string; name: string };
    assignees?: any[];
    labels?: any[];
  };
  visibleFields: Record<string, boolean>;
  onEdit: (task: any) => void;
  onDelete: (taskId: string) => void;
  onDuplicate: (taskId: string) => void;
}

export function TaskCard({
  task,
  visibleFields,
  onEdit,
  onDelete,
  onDuplicate,
}: TaskCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  const getDueDateProps = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
    });
    return {
      label: formattedDate,
      className: 'bg-danger-soft text-[#ef4444] border border-[#ef4444]/25 dark:text-[#fca5a5]',
    };
  };

  const dueDateProps = getDueDateProps(task.dueDate);
  const firstAssignee = task.assignees?.[0];

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('[data-radix-dropdown-menu-trigger]') ||
      target.closest('[role="menu"]')
    ) {
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    router.push(`/tasks/${task.id}?${params.toString()}`);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleCardClick}
      className={cn(
        'group flex flex-col gap-2.5 rounded-[10px] border border-border bg-card p-3.5',
        'hover:border-muted-foreground/30 transition-all select-none cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.03)]',
        isDragging && 'z-50 border-ring shadow-md ring-2 ring-ring/10'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[13px] font-semibold text-card-foreground leading-snug flex-1 min-w-0">
          {task.title}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              data-radix-dropdown-menu-trigger=""
              onClick={(e) => e.stopPropagation()}
              className="text-muted-foreground/50 hover:text-foreground hover:bg-muted p-0.5 rounded-md transition-colors shrink-0 cursor-pointer opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-popover border border-border w-36 text-popover-foreground shadow-md rounded-lg"
          >
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              className="flex items-center space-x-2 cursor-pointer text-xs py-1.5"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Edit task</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(task.id);
              }}
              className="flex items-center space-x-2 cursor-pointer text-xs py-1.5"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Duplicate</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                window.setTimeout(() => onDelete(task.id), 50);
              }}
              className="flex items-center space-x-2 text-red-500 hover:text-red-600 hover:bg-red-50 focus:text-red-500 cursor-pointer text-xs py-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div>
          {visibleFields.members && firstAssignee ? (
            <div className="flex items-center gap-1.5 min-w-0">
              <Avatar className="h-5 w-5 border border-zinc-200 shrink-0">
                <AvatarImage src={firstAssignee.avatarUrl || ''} />
                <AvatarFallback className="text-[8px] bg-gradient-to-br from-violet-400 to-pink-400 font-bold text-white">
                  {firstAssignee.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-[12px] text-zinc-500 truncate max-w-[88px]">
                {firstAssignee.name}
              </span>
            </div>
          ) : (
            visibleFields.members && (
              <div className="flex items-center gap-1.5 text-zinc-400 text-[12px]">
                <User className="h-3.5 w-3.5" />
                <span>Unassigned</span>
              </div>
            )
          )}
        </div>

        {visibleFields.dueDate && dueDateProps && (
          <Badge
            className={cn(
              'px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 shadow-none cursor-default shrink-0',
              dueDateProps.className
            )}
          >
            <Calendar className="h-3 w-3 shrink-0" strokeWidth={2} />
            <span>{dueDateProps.label}</span>
          </Badge>
        )}
      </div>

      {visibleFields.labels && task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {task.labels.map((l: any) => (
            <Badge
              key={l.id}
              variant="outline"
              className="px-2 py-0.5 border-border bg-chip text-[10px] text-muted-foreground font-medium flex items-center gap-1 shadow-none hover:bg-muted"
            >
              <Tag className="h-3 w-3 text-muted-foreground shrink-0" strokeWidth={1.75} />
              <span>{l.name}</span>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
