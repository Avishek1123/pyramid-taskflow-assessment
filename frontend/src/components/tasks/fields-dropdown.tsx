'use client';

import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Columns3, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FieldsDropdownProps {
  view: 'board' | 'list';
  onViewChange: (view: 'board' | 'list') => void;
  visibleFields: Record<string, boolean>;
  onVisibleFieldsChange: (fields: Record<string, boolean>) => void;
  showViewToggle?: boolean;
}

export function FieldsDropdown({
  view,
  onViewChange,
  visibleFields,
  onVisibleFieldsChange,
  showViewToggle = true,
}: FieldsDropdownProps) {
  const fields = [
    { key: 'priority', label: 'Priority' },
    { key: 'members', label: 'Members' },
    { key: 'dueDate', label: 'Due Date' },
    { key: 'labels', label: 'Labels' },
    { key: 'status', label: 'Status' },
    { key: 'reporter', label: 'Reporter' },
  ];

  const handleToggle = (key: string) => {
    onVisibleFieldsChange({
      ...visibleFields,
      [key]: !visibleFields[key],
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-border bg-panel text-[13px] gap-1.5 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer rounded-lg px-2.5 font-medium"
        >
          <Columns3 className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>Fields</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[220px] bg-popover border border-border text-popover-foreground shadow-lg rounded-xl p-0 overflow-hidden"
      >
        {/* Fields tabs — List / Board underline style from design */}
        {showViewToggle && (
          <div className="flex border-b border-border">
            {(['list', 'board'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => onViewChange(v)}
                className={cn(
                  'flex-1 py-2.5 text-[13px] font-medium capitalize transition-colors cursor-pointer relative',
                  view === v ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {v === 'list' ? 'List' : 'Board'}
                {view === v && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-foreground rounded-full" />
                )}
              </button>
            ))}
          </div>
        )}

        <div className="p-1.5 space-y-0.5">
          {fields.map((f) => {
            const isChecked = !!visibleFields[f.key];
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => handleToggle(f.key)}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-muted text-left text-[13px] transition-colors cursor-pointer"
              >
                <span className={isChecked ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                  {f.label}
                </span>
                <div
                  className={cn(
                    'h-4 w-4 rounded-[3px] border flex items-center justify-center transition-all',
                    isChecked
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-panel'
                  )}
                >
                  {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
