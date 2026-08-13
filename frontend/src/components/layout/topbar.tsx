'use client';

import * as React from 'react';
import Link from 'next/link';
import { PanelLeft, Search, Plus, ChevronRight, X } from 'lucide-react';
import { Button } from '../ui/button';
import { FieldsDropdown } from '../tasks/fields-dropdown';
import { FiltersDropdown } from '../tasks/filters-dropdown';
import { cn } from '../../lib/utils';

interface TopbarProps {
  onMenuClick: () => void;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  view: 'board' | 'list';
  onViewChange: (view: 'board' | 'list') => void;
  visibleFields: Record<string, boolean>;
  onVisibleFieldsChange: (fields: Record<string, boolean>) => void;
  members: any[];
  labels: any[];
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
  onAddTaskClick: () => void;
  title: string;
  projectName?: string;
  workspaceId?: string;
  addTaskText?: string;
  columns?: any[];
  showFields?: boolean;
  showViewToggle?: boolean;
  breadcrumb?: { label: string; href?: string }[];
}

export function Topbar({
  onMenuClick,
  searchQuery,
  onSearchQueryChange,
  view,
  onViewChange,
  visibleFields,
  onVisibleFieldsChange,
  members,
  labels,
  filters,
  onFiltersChange,
  onAddTaskClick,
  title,
  projectName,
  workspaceId,
  addTaskText = 'Add Task',
  columns = [],
  showFields = true,
  showViewToggle = true,
  breadcrumb,
}: TopbarProps) {
  const [showSearchInput, setShowSearchInput] = React.useState(!!searchQuery);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setShowSearchInput(true);
      }
      if (e.key === 'Escape' && showSearchInput) {
        setShowSearchInput(false);
        onSearchQueryChange('');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showSearchInput, onSearchQueryChange]);

  return (
    <div className="shrink-0 bg-panel">
      <div className="flex h-11 items-center justify-between border-b border-border px-4 md:px-5">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onMenuClick}
            className="h-8 w-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0 dark:border-border"
            title="Toggle Sidebar"
            aria-label="Toggle Sidebar"
          >
            <PanelLeft className="h-4 w-4" strokeWidth={1.75} />
          </button>

          {breadcrumb && breadcrumb.length > 0 && (
            <div className="flex items-center gap-1 text-[13px] text-muted-foreground font-medium truncate">
              {breadcrumb.map((item, i) => (
                <React.Fragment key={`${item.label}-${i}`}>
                  {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />}
                  {item.href ? (
                    <Link href={item.href} className="hover:text-foreground transition-colors truncate">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-foreground truncate">{item.label}</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {!breadcrumb && projectName && (
            <div className="flex items-center gap-1 text-[13px] text-muted-foreground font-medium truncate">
              <Link
                href={`/projects?workspace=${workspaceId || ''}`}
                className="hover:text-foreground transition-colors"
              >
                Projects
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
              <span className="text-foreground truncate">{projectName}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-4 md:px-5 py-3.5">
        <h1 className="text-[22px] font-bold tracking-tight text-foreground select-none shrink-0">
          {title}
        </h1>

        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            {showSearchInput ? (
              <div className="focus-shell flex h-8 items-center gap-1.5 rounded-lg border border-border bg-panel pl-2.5 pr-1.5">
                <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={1.75} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => onSearchQueryChange(e.target.value)}
                  className="w-36 border-0 bg-transparent text-[13px] text-foreground shadow-none outline-none ring-0 placeholder:text-muted-foreground md:w-44"
                  autoFocus
                />
                <span className="hidden sm:inline text-[10px] text-muted-foreground bg-muted border border-border rounded px-1.5 py-0.5 font-medium select-none">
                  ⌘F
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowSearchInput(false);
                    onSearchQueryChange('');
                  }}
                  className="text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowSearchInput(true)}
                className="h-8 w-8 border-border hover:bg-muted bg-panel rounded-lg cursor-pointer"
              >
                <Search className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
              </Button>
            )}
          </div>

          {showFields && (
            <FieldsDropdown
              view={view}
              onViewChange={onViewChange}
              visibleFields={visibleFields}
              onVisibleFieldsChange={onVisibleFieldsChange}
              showViewToggle={showViewToggle}
            />
          )}

          <FiltersDropdown
            members={members}
            labels={labels}
            columns={columns}
            filters={filters}
            onFiltersChange={onFiltersChange}
          />

          <Button
            onClick={onAddTaskClick}
            size="sm"
            className={cn(
              'h-8 text-[13px] font-medium bg-foreground text-background hover:opacity-90 border-none',
              'transition-all px-3 rounded-lg cursor-pointer shadow-none'
            )}
          >
            <Plus className="h-3.5 w-3.5 mr-1" strokeWidth={2.25} />
            <span>{addTaskText}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
