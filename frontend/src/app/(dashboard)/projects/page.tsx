'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  useProjects,
  useWorkspaceMembers,
  useProject,
} from '../../../lib/hooks/use-tasks';
import { Topbar } from '../../../components/layout/topbar';
import { SidebarContext } from '../layout';
import { Loader2, Plus, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { PriorityBadge } from '../../../components/ui/priority-icon';

const mockPriorities = ['HIGH', 'LOW', 'MEDIUM'];
const mockDates = ['12 Sep 2026', '15 Sep 2026', '18 Sep 2026'];

export default function ProjectsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toggleSidebar } = React.useContext(SidebarContext);

  const workspaceId = searchParams.get('workspace') || '';

  const { projects, isLoading: isProjectsLoading, createProject } = useProjects(workspaceId);
  const { data: members = [], isLoading: isMembersLoading } = useWorkspaceMembers(workspaceId);
  const { updateProject, deleteProject } = useProject('');

  const [searchQuery, setSearchQuery] = React.useState('');
  const [filters, setFilters] = React.useState({
    priorities: [] as string[],
    assigneeIds: [] as string[],
    labelIds: [] as string[],
    statusColumnIds: [] as string[],
    reporterIds: [] as string[],
  });
  const [visibleFields] = React.useState({
    priority: true,
    members: true,
    dueDate: true,
    labels: false,
    status: false,
    reporter: false,
  });

  const [isAddProjOpen, setIsAddProjOpen] = React.useState(false);
  const [newProjName, setNewProjName] = React.useState('');
  const [isCreatingProj, setIsCreatingProj] = React.useState(false);
  const [renameId, setRenameId] = React.useState<string | null>(null);
  const [renameValue, setRenameValue] = React.useState('');
  const [isRenaming, setIsRenaming] = React.useState(false);

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

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameId || !renameValue.trim()) return;
    setIsRenaming(true);
    try {
      await updateProject({ id: renameId, name: renameValue.trim() });
      setRenameId(null);
      setRenameValue('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Delete this project and all its tasks?')) return;
    try {
      await deleteProject(projectId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRowClick = (projectId: string) => {
    router.push(`/tasks?workspace=${workspaceId}&project=${projectId}`);
  };

  const filteredProjects = projects.filter((p: any) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-panel overflow-hidden">
      <Topbar
        title="Projects"
        addTaskText="Add Project"
        onMenuClick={() => toggleSidebar()}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        view="list"
        onViewChange={() => {}}
        visibleFields={visibleFields}
        onVisibleFieldsChange={() => {}}
        members={members}
        labels={[]}
        filters={filters}
        onFiltersChange={setFilters}
        onAddTaskClick={() => setIsAddProjOpen(true)}
        showViewToggle={false}
      />

      <main className="flex-1 overflow-hidden px-4 md:px-5 pb-4 relative flex flex-col bg-panel">
        {isProjectsLoading || isMembersLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-panel/60 z-30">
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          </div>
        ) : null}

        <div className="border border-border rounded-xl bg-card overflow-hidden flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse text-[13px] select-none">
            <thead>
              <tr className="border-b border-border bg-panel-muted text-muted-foreground font-medium">
                <th className="py-2.5 px-5 w-[35%] font-medium">Projects</th>
                <th className="py-2.5 px-4 font-medium">Priority</th>
                <th className="py-2.5 px-4 font-medium">Lead</th>
                <th className="py-2.5 px-4 font-medium">Due Date</th>
                <th className="py-2.5 px-4 w-14 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-muted-foreground italic">
                    No projects found. Create one to get started!
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project: any, idx: number) => {
                  const priority = mockPriorities[idx % mockPriorities.length];
                  const dueDate = mockDates[idx % mockDates.length];
                  const leadMode = idx % 3; // 0 avatar, 1 initials, 2 plus

                  return (
                    <tr
                      key={project.id}
                      onClick={() => handleRowClick(project.id)}
                      className="hover:bg-row-hover transition-colors group cursor-pointer text-foreground border-b border-border/60 last:border-0"
                    >
                      <td className="py-3.5 px-5 font-medium text-foreground">{project.name}</td>
                      <td className="py-3.5 px-4">
                        <PriorityBadge priority={priority} />
                      </td>
                      <td className="py-3.5 px-4">
                        {leadMode === 0 && members[0] ? (
                          <Avatar className="h-6 w-6 border border-zinc-200">
                            <AvatarImage src={members[0].avatarUrl || ''} />
                            <AvatarFallback className="text-[9px] bg-gradient-to-br from-violet-400 to-pink-400 font-bold text-white">
                              {members[0].name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ) : leadMode === 1 ? (
                          <div className="h-6 w-6 rounded-full bg-[#e5e7eb] flex items-center justify-center text-[9px] font-semibold text-zinc-600">
                            CN
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => e.stopPropagation()}
                            className="h-6 w-6 rounded-full border border-dashed border-zinc-300 flex items-center justify-center text-zinc-400 hover:text-zinc-600"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-700">{dueDate}</td>
                      <td
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="text-zinc-300 hover:text-zinc-600 hover:bg-zinc-100 p-1 rounded-md transition-colors cursor-pointer">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-white border border-zinc-200 w-40 text-zinc-900 shadow-md rounded-lg"
                          >
                            <DropdownMenuItem
                              onClick={() => {
                                setRenameId(project.id);
                                setRenameValue(project.name);
                              }}
                              className="flex items-center space-x-2 cursor-pointer text-xs"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                              <span>Rename project</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-zinc-100" />
                            <DropdownMenuItem
                              onClick={() => handleDelete(project.id)}
                              className="flex items-center space-x-2 text-red-500 hover:bg-red-50 focus:text-red-500 cursor-pointer text-xs"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Delete project</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <button
            type="button"
            onClick={() => setIsAddProjOpen(true)}
            className="w-full flex items-center gap-1.5 px-5 py-3 text-[13px] text-zinc-400 hover:text-zinc-700 transition-colors font-medium cursor-pointer border-t border-[#f0f0f2] bg-white"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Projects</span>
          </button>
        </div>
      </main>

      <Dialog open={isAddProjOpen} onOpenChange={setIsAddProjOpen}>
        <DialogContent className="bg-white border border-zinc-200 text-zinc-900 max-w-sm">
          <form onSubmit={handleCreateProject}>
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">New Project</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <label className="text-xs text-zinc-500 font-medium mb-1 block">Project Name</label>
              <input
                type="text"
                placeholder="e.g. Mobile Application"
                value={newProjName}
                onChange={(e) => setNewProjName(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-ring"
                required
                autoFocus
              />
            </div>
            <DialogFooter className="flex items-center space-x-2 justify-end">
              <Button type="button" variant="ghost" onClick={() => setIsAddProjOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreatingProj}
                className="text-xs bg-zinc-950 hover:bg-zinc-900 text-white"
              >
                {isCreatingProj ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!renameId} onOpenChange={(o) => !o && setRenameId(null)}>
        <DialogContent className="bg-white border border-zinc-200 text-zinc-900 max-w-sm">
          <form onSubmit={handleRename}>
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">Rename Project</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setRenameId(null)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" disabled={isRenaming} className="text-xs bg-zinc-950 text-white">
                {isRenaming ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
