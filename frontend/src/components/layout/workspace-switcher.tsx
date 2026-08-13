'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWorkspaces, useAuth } from '../../lib/hooks/use-tasks';
import { useColorMode, ColorMode } from '../providers';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  ChevronsUpDown,
  Check,
  Settings,
  Sun,
  Moon,
  LogOut,
  Trash2,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import Cookies from 'js-cookie';

export function WorkspaceSwitcher({ collapsed = false }: { collapsed?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { workspaces, createWorkspace, deleteWorkspace, isDeletingWorkspace } = useWorkspaces();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const activeTheme = mounted ? resolvedTheme || theme : 'light';
  const { colorMode, setColorMode } = useColorMode();

  const [isOpen, setIsOpen] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = React.useState('');
  const [isCreating, setIsCreating] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; name: string } | null>(null);
  const [deleteError, setDeleteError] = React.useState('');

  const activeWorkspaceId = searchParams.get('workspace') || workspaces[0]?.id;
  const activeWorkspace = workspaces.find((w: any) => w.id === activeWorkspaceId) || workspaces[0];

  const displayName = user?.name || activeWorkspace?.name || 'Dexter';
  const displayEmail = user?.email || 'Dexter@gmail.com';
  const displayAvatar = user?.avatarUrl || activeWorkspace?.avatarUrl || '';
  const currentWorkspaceName = activeWorkspace?.name || 'Workspace';

  const handleSelectWorkspace = (workspaceId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('workspace', workspaceId);
    params.delete('project');
    router.push(`/tasks?${params.toString()}`);
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    setIsCreating(true);
    try {
      const created = await createWorkspace(newWorkspaceName);
      setIsDialogOpen(false);
      setNewWorkspaceName('');
      handleSelectWorkspace(created.id);
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove('jwt');
    router.push('/login');
  };

  const handleDeleteWorkspace = async () => {
    if (!deleteTarget) return;
    setDeleteError('');
    try {
      const wasActive = deleteTarget.id === activeWorkspace?.id;
      await deleteWorkspace(deleteTarget.id);
      const remaining = workspaces.filter((w: any) => w.id !== deleteTarget.id);
      setDeleteTarget(null);
      if (wasActive && remaining[0]) {
        handleSelectWorkspace(remaining[0].id);
      }
    } catch (error: any) {
      setDeleteError(error?.message || 'Could not delete workspace');
    }
  };

  const colorsList: ColorMode[] = ['Amber', 'Blue', 'Pink', 'Rose', 'Emerald', 'Black'];

  const colorModeHex: Record<ColorMode, string> = {
    Amber: '#f59e0b',
    Blue: '#7c3aed',
    Pink: '#ec4899',
    Rose: '#f43f5e',
    Emerald: '#10b981',
    Black: '#09090b',
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className={
              collapsed
                ? 'flex w-full items-center justify-center rounded-lg p-1.5 text-left hover:bg-sidebar-hover focus:outline-none transition-colors cursor-pointer'
                : 'flex w-full items-center justify-between rounded-lg px-2 py-2 text-left hover:bg-sidebar-hover focus:outline-none transition-colors cursor-pointer'
            }
            title={`${currentWorkspaceName} · ${displayName}`}
          >
            <div className={collapsed ? 'flex items-center' : 'flex items-center gap-2.5 overflow-hidden min-w-0'}>
              <Avatar className="h-7 w-7 rounded-full border border-border shrink-0">
                <AvatarImage src={displayAvatar} alt={displayName} />
                <AvatarFallback className="rounded-full bg-gradient-to-br from-violet-400 to-pink-400 font-bold text-white text-[10px]">
                  {displayName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium leading-tight text-foreground">
                    {currentWorkspaceName}
                  </div>
                  {currentWorkspaceName !== displayName && (
                    <div className="truncate text-[11px] leading-tight text-muted-foreground">
                      {displayName}
                    </div>
                  )}
                </div>
              )}
            </div>
            {!collapsed && (
              <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-1" />
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          sideOffset={8}
          className="w-[260px] bg-popover border border-border text-popover-foreground shadow-lg rounded-xl p-0 overflow-hidden"
        >
          {/* Profile card */}
          <div className="flex w-full flex-col items-center justify-center border-b border-border px-4 pt-5 pb-4 text-center">
            <Avatar className="mb-2.5 h-14 w-14 rounded-full border border-border">
              <AvatarImage src={displayAvatar} alt={displayName} />
              <AvatarFallback className="rounded-full bg-linear-to-br from-violet-400 to-pink-400 text-lg font-bold text-white">
                {displayName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="w-full text-center text-sm font-bold text-foreground">{displayName}</span>
            <span className="mt-0.5 w-full text-center text-[12px] text-muted-foreground">{displayEmail}</span>
          </div>

          <div className="p-1.5">
            {/* Change Theme */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center justify-between cursor-pointer py-2 px-2.5 text-[13px] text-foreground/80 hover:text-foreground rounded-lg">
                <div className="flex items-center gap-2.5">
                  <Sun className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                  <span>Change Theme</span>
                </div>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-popover border border-border text-popover-foreground shadow-lg rounded-xl min-w-[140px] p-1.5">
                <div className="px-2 py-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                  Theme
                </div>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setTheme('light');
                  }}
                  className="flex items-center justify-between cursor-pointer py-2 px-2.5 text-[13px] rounded-lg"
                >
                  <div className="flex items-center gap-2.5">
                    <Sun className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                    <span>Light</span>
                  </div>
                  {activeTheme === 'light' && <Check className="h-4 w-4 text-foreground stroke-[2.5]" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setTheme('dark');
                  }}
                  className="flex items-center justify-between cursor-pointer py-2 px-2.5 text-[13px] rounded-lg"
                >
                  <div className="flex items-center gap-2.5">
                    <Moon className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                    <span>Dark</span>
                  </div>
                  {activeTheme === 'dark' && <Check className="h-4 w-4 text-foreground stroke-[2.5]" />}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            {/* Color Mode */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center justify-between cursor-pointer py-2 px-2.5 text-[13px] text-foreground/80 hover:text-foreground rounded-lg">
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-4 w-4 rounded-[3px] border border-border shrink-0"
                    style={{ backgroundColor: colorModeHex[colorMode] }}
                  />
                  <span>Color Mode</span>
                </div>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-popover border border-border text-popover-foreground shadow-lg rounded-xl min-w-[150px] p-1.5">
                <div className="px-2 py-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                  Color Mode
                </div>
                {colorsList.map((c) => (
                  <DropdownMenuItem
                    key={c}
                    onSelect={(e) => {
                      e.preventDefault();
                      setColorMode(c);
                    }}
                    className="flex items-center justify-between cursor-pointer py-2 px-2.5 text-[13px] rounded-lg"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-4 w-4 rounded-[3px] shrink-0 border border-border/60"
                        style={{ backgroundColor: colorModeHex[c] }}
                      />
                      <span>{c}</span>
                    </div>
                    {colorMode === c && <Check className="h-4 w-4 text-foreground stroke-[2.5]" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            {/* Settings */}
            <DropdownMenuItem
              className="flex items-center gap-2.5 cursor-pointer py-2 px-2.5 text-[13px] text-foreground/80 hover:text-foreground rounded-lg"
              onClick={() => {
                setIsOpen(false);
                const ws = searchParams.get('workspace') || '';
                router.push(`/settings?workspace=${ws}`);
              }}
            >
              <Settings className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
              <span>Settings</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-border my-1" />

            {/* Workspaces */}
            <div className="px-2.5 py-1 text-[11px] font-medium text-muted-foreground">Workspaces</div>
            {workspaces.map((w: any) => {
              const isCurrent = activeWorkspace?.id === w.id;
              return (
                <div
                  key={w.id}
                  className={`group flex items-center rounded-lg ${
                    isCurrent ? 'bg-muted font-medium text-foreground' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectWorkspace(w.id)}
                    className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2 text-left text-[13px]"
                  >
                    <span className="truncate">{w.name}</span>
                    {isCurrent && (
                      <span className="shrink-0 rounded bg-foreground/10 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        Current
                      </span>
                    )}
                    {isCurrent && <Check className="ml-auto h-3.5 w-3.5 shrink-0 text-foreground stroke-[2.5]" />}
                  </button>
                  <button
                    type="button"
                    title="Delete workspace"
                    className="mr-1.5 rounded p-1 text-muted-foreground hover:bg-danger-soft hover:text-[#ef4444]"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsOpen(false);
                      setDeleteError('');
                      const target = { id: w.id, name: w.name };
                      window.setTimeout(() => setDeleteTarget(target), 50);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>
                </div>
              );
            })}
            <DropdownMenuItem
              onClick={() => {
                setIsOpen(false);
                setIsDialogOpen(true);
              }}
              className="cursor-pointer py-2 px-2.5 text-[13px] text-muted-foreground rounded-lg"
            >
              + Create Workspace
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-border my-1" />

            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2.5 cursor-pointer py-2 px-2.5 text-[13px] text-red-500 rounded-lg"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
              <span>Log out</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border border-border text-foreground max-w-sm">
          <form onSubmit={handleCreateWorkspace}>
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">New Workspace</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <label className="text-xs text-muted-foreground font-medium mb-1 block">Workspace Name</label>
              <input
                type="text"
                placeholder="e.g. Acme Corp"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                className="w-full bg-input-fill border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                required
                autoFocus
              />
            </div>
            <DialogFooter className="flex items-center space-x-2 justify-end">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="text-xs bg-foreground text-background hover:opacity-90"
              >
                {isCreating ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm border border-border bg-card text-foreground">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Are you sure?</DialogTitle>
          </DialogHeader>
          <p className="py-2 text-[13px] leading-relaxed text-muted-foreground">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-foreground">{deleteTarget?.name}</span>? All projects and
            tasks in this workspace will be removed. This cannot be undone.
          </p>
          {deleteError && <p className="text-[12px] text-[#ef4444]">{deleteError}</p>}
          <DialogFooter className="flex items-center justify-end space-x-2">
            <Button type="button" variant="ghost" className="text-xs" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isDeletingWorkspace}
              onClick={handleDeleteWorkspace}
              className="bg-[#ef4444] text-xs text-white hover:bg-[#dc2626]"
            >
              {isDeletingWorkspace ? 'Deleting...' : 'Yes, delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
