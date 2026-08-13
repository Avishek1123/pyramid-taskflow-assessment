'use client';

import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuItem,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import {
  Filter,
  Check,
  X,
  CircleDot,
  Signal,
  Users,
  Calendar,
  Tags,
  UserRound,
  LayoutList,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { PriorityIcon, priorityLabel, priorityTextClass } from '../ui/priority-icon';
import { cn } from '../../lib/utils';

interface FiltersDropdownProps {
  members: any[];
  labels: any[];
  columns?: any[];
  filters: {
    priorities: string[];
    assigneeIds: string[];
    labelIds: string[];
    statusColumnIds: string[];
    reporterIds: string[];
  };
  onFiltersChange: (filters: {
    priorities: string[];
    assigneeIds: string[];
    labelIds: string[];
    statusColumnIds: string[];
    reporterIds: string[];
  }) => void;
}

export function FiltersDropdown({
  members,
  labels,
  columns = [],
  filters,
  onFiltersChange,
}: FiltersDropdownProps) {
  const priorities = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'];

  const togglePriority = (p: string) => {
    const activePriorities = filters.priorities || [];
    const isSelected = activePriorities.includes(p);
    const updated = isSelected
      ? activePriorities.filter((item) => item !== p)
      : [...activePriorities, p];
    onFiltersChange({ ...filters, priorities: updated });
  };

  const toggleAssignee = (id: string) => {
    const activeAssignees = filters.assigneeIds || [];
    const isSelected = activeAssignees.includes(id);
    const updated = isSelected
      ? activeAssignees.filter((item) => item !== id)
      : [...activeAssignees, id];
    onFiltersChange({ ...filters, assigneeIds: updated });
  };

  const toggleLabel = (id: string) => {
    const activeLabels = filters.labelIds || [];
    const isSelected = activeLabels.includes(id);
    const updated = isSelected
      ? activeLabels.filter((item) => item !== id)
      : [...activeLabels, id];
    onFiltersChange({ ...filters, labelIds: updated });
  };

  const toggleStatus = (id: string) => {
    const activeStatus = filters.statusColumnIds || [];
    const isSelected = activeStatus.includes(id);
    const updated = isSelected
      ? activeStatus.filter((item) => item !== id)
      : [...activeStatus, id];
    onFiltersChange({ ...filters, statusColumnIds: updated });
  };

  const toggleReporter = (id: string) => {
    const activeReporters = filters.reporterIds || [];
    const isSelected = activeReporters.includes(id);
    const updated = isSelected
      ? activeReporters.filter((item) => item !== id)
      : [...activeReporters, id];
    onFiltersChange({ ...filters, reporterIds: updated });
  };

  const clearFilters = () => {
    onFiltersChange({
      priorities: [],
      assigneeIds: [],
      labelIds: [],
      statusColumnIds: [],
      reporterIds: [],
    });
  };

  const hasActiveFilters =
    (filters.priorities?.length || 0) > 0 ||
    (filters.assigneeIds?.length || 0) > 0 ||
    (filters.labelIds?.length || 0) > 0 ||
    (filters.statusColumnIds?.length || 0) > 0 ||
    (filters.reporterIds?.length || 0) > 0;

  const activeCount =
    (filters.priorities?.length || 0) +
    (filters.assigneeIds?.length || 0) +
    (filters.labelIds?.length || 0) +
    (filters.statusColumnIds?.length || 0) +
    (filters.reporterIds?.length || 0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            'h-8 w-8 border-border bg-panel hover:bg-muted relative cursor-pointer rounded-lg',
            hasActiveFilters ? 'bg-muted border-border text-foreground' : 'text-muted-foreground'
          )}
        >
          <Filter className="h-4 w-4" strokeWidth={1.75} />
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-zinc-900 px-1 text-[9px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[220px] bg-popover border border-border text-popover-foreground shadow-lg rounded-xl p-1.5"
      >
        <div className="flex items-center justify-between px-2 py-1.5 select-none">
          <span className="text-[13px] font-semibold text-foreground">Filters</span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors cursor-pointer font-medium"
            >
              <X className="h-3 w-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        <DropdownMenuSeparator className="bg-zinc-100 my-1" />

        {/* Status */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2.5 cursor-pointer py-2 px-2.5 text-[13px] text-foreground/80 rounded-lg">
            <CircleDot className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
            <span>Status</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-popover border border-border text-popover-foreground shadow-lg rounded-xl min-w-[160px] p-1.5">
            {columns.length === 0 ? (
              <div className="text-[11px] text-muted-foreground italic p-2 text-center">No columns</div>
            ) : (
              columns.map((col) => {
                const isSelected = (filters.statusColumnIds || []).includes(col.id);
                return (
                  <DropdownMenuItem
                    key={col.id}
                    onClick={() => toggleStatus(col.id)}
                    className="flex items-center justify-between cursor-pointer py-2 px-2.5 text-[13px] rounded-lg"
                  >
                    <span>{col.name}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-foreground stroke-[2.5]" />}
                  </DropdownMenuItem>
                );
              })
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Priority — with signal icons matching design */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2.5 cursor-pointer py-2 px-2.5 text-[13px] text-foreground/80 rounded-lg data-[state=open]:bg-muted">
            <Signal className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
            <span>Priority</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent
            className="bg-popover border border-border text-popover-foreground shadow-lg rounded-xl min-w-[160px] p-1.5"
          >
            <div className="px-2 py-1.5 text-[11px] font-medium text-muted-foreground">Priority</div>
            <DropdownMenuItem
              onClick={() => onFiltersChange({ ...filters, priorities: [] })}
              className="flex items-center justify-between cursor-pointer py-2 px-2.5 text-[13px] rounded-lg"
            >
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <PriorityIcon priority="NONE" />
                <span>No Priority</span>
              </div>
            </DropdownMenuItem>
            {priorities.map((p) => {
              const isSelected = (filters.priorities || []).includes(p);
              return (
                <DropdownMenuItem
                  key={p}
                  onClick={() => togglePriority(p)}
                  className="flex items-center justify-between cursor-pointer py-2 px-2.5 text-[13px] rounded-lg"
                >
                  <div className={cn('flex items-center gap-2.5', priorityTextClass(p))}>
                    <PriorityIcon priority={p} />
                    <span>{priorityLabel(p)}</span>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-foreground stroke-[2.5]" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Members */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2.5 cursor-pointer py-2 px-2.5 text-[13px] text-foreground/80 rounded-lg">
            <Users className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
            <span>Members</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-popover border border-border text-popover-foreground shadow-lg rounded-xl min-w-[180px] p-1.5">
            {members.length === 0 ? (
              <div className="text-[11px] text-muted-foreground italic p-2 text-center">No members</div>
            ) : (
              members.map((m) => {
                const isSelected = (filters.assigneeIds || []).includes(m.id);
                return (
                  <DropdownMenuItem
                    key={m.id}
                    onClick={() => toggleAssignee(m.id)}
                    className="flex items-center justify-between cursor-pointer py-2 px-2.5 text-[13px] rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={m.avatarUrl || ''} />
                        <AvatarFallback className="text-[8px] bg-muted font-semibold text-muted-foreground">
                          {m.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{m.name}</span>
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 text-foreground stroke-[2.5]" />}
                  </DropdownMenuItem>
                );
              })
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Due Date */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2.5 cursor-pointer py-2 px-2.5 text-[13px] text-foreground/80 rounded-lg">
            <Calendar className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
            <span>Due Date</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-popover border border-border text-popover-foreground shadow-lg rounded-xl min-w-[140px] p-1.5">
            {['Today', 'This Week', 'This Month', 'Overdue'].map((range) => (
              <DropdownMenuItem
                key={range}
                className="cursor-pointer py-2 px-2.5 text-[13px] rounded-lg"
              >
                {range}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Teams */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2.5 cursor-pointer py-2 px-2.5 text-[13px] text-foreground/80 rounded-lg">
            <LayoutList className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
            <span>Teams</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-popover border border-border text-popover-foreground shadow-lg rounded-xl min-w-[140px] p-1.5">
            <div className="text-[11px] text-muted-foreground italic p-2 text-center">No teams created</div>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Labels */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2.5 cursor-pointer py-2 px-2.5 text-[13px] text-foreground/80 rounded-lg">
            <Tags className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
            <span>Labels</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-popover border border-border text-popover-foreground shadow-lg rounded-xl min-w-[160px] p-1.5">
            {labels.length === 0 ? (
              <div className="text-[11px] text-muted-foreground italic p-2 text-center">No labels</div>
            ) : (
              labels.map((l) => {
                const isSelected = (filters.labelIds || []).includes(l.id);
                return (
                  <DropdownMenuItem
                    key={l.id}
                    onClick={() => toggleLabel(l.id)}
                    className="flex items-center justify-between cursor-pointer py-2 px-2.5 text-[13px] rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: l.color }}
                      />
                      <span>{l.name}</span>
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 text-foreground stroke-[2.5]" />}
                  </DropdownMenuItem>
                );
              })
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Reporter */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2.5 cursor-pointer py-2 px-2.5 text-[13px] text-foreground/80 rounded-lg">
            <UserRound className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
            <span>Reporter</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-popover border border-border text-popover-foreground shadow-lg rounded-xl min-w-[180px] p-1.5">
            {members.map((m) => {
              const isSelected = (filters.reporterIds || []).includes(m.id);
              return (
                <DropdownMenuItem
                  key={m.id}
                  onClick={() => toggleReporter(m.id)}
                  className="flex items-center justify-between cursor-pointer py-2 px-2.5 text-[13px] rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={m.avatarUrl || ''} />
                      <AvatarFallback className="text-[8px] bg-muted font-semibold text-muted-foreground">
                        {m.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{m.name}</span>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-foreground stroke-[2.5]" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
