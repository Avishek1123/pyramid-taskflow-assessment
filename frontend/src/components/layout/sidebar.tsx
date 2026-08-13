'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { WorkspaceSwitcher } from './workspace-switcher';
import { LayoutGrid, Briefcase, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  className?: string;
  onCloseMobile?: () => void;
  collapsed?: boolean;
}

export function Sidebar({ className, onCloseMobile, collapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get('workspace') || '';

  const isTasksActive = pathname.startsWith('/tasks');
  const isProjectsActive = pathname.startsWith('/projects');

  return (
    <div
      className={cn(
        'flex h-full flex-col border-r border-border bg-sidebar text-foreground transition-[width] duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-[240px]',
        className
      )}
    >
      <div className={cn('pt-3 pb-2', collapsed ? 'px-2' : 'px-3')}>
        <WorkspaceSwitcher collapsed={collapsed} />
      </div>

      <div className={cn('flex-1 overflow-y-auto pt-2 pb-4', collapsed ? 'px-2' : 'px-3')}>
        {!collapsed && (
          <button
            type="button"
            className="mb-1 flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-[13px] font-normal text-muted-foreground hover:bg-sidebar-hover transition-colors"
          >
            <span>Workspace</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}

        <nav className="space-y-0.5">
          <Link
            href={`/tasks?workspace=${workspaceId}`}
            onClick={onCloseMobile}
            title="Tasks"
            className={cn(
              'relative flex items-center rounded-lg text-[13px] font-normal transition-colors',
              collapsed ? 'justify-center h-10 w-full px-0' : 'gap-2.5 px-2.5 py-2',
              isTasksActive
                ? 'bg-sidebar-active font-medium text-foreground'
                : 'text-muted-foreground hover:bg-sidebar-hover hover:text-foreground'
            )}
          >
            <LayoutGrid className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            {!collapsed && <span>Tasks</span>}
          </Link>

          <Link
            href={`/projects?workspace=${workspaceId}`}
            onClick={onCloseMobile}
            title="Projects"
            className={cn(
              'relative flex items-center rounded-lg text-[13px] font-normal transition-colors',
              collapsed ? 'justify-center h-10 w-full px-0' : 'gap-2.5 px-2.5 py-2',
              isProjectsActive
                ? 'bg-sidebar-active text-foreground'
                : 'text-muted-foreground hover:bg-sidebar-hover hover:text-foreground'
            )}
          >
            <Briefcase className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            {!collapsed && <span>Projects</span>}
          </Link>
        </nav>
      </div>
    </div>
  );
}
