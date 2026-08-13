'use client';

import * as React from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTaskDetail } from '../../../../lib/hooks/use-task-detail';
import { SidebarContext } from '../../layout';
import {
  Lock,
  Eye,
  Share2,
  MoreHorizontal,
  LayoutGrid,
  Plus,
  Settings,
  Calendar,
  Tag,
  Paperclip,
  Send,
  Loader2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Smile,
  PanelLeft,
  User,
  Check,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../components/ui/avatar';
import { Button } from '../../../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../../components/ui/dropdown-menu';
import { cn } from '../../../../lib/utils';
import {
  PriorityBadge,
  PriorityIcon,
  priorityLabel,
  priorityTextClass,
} from '../../../../components/ui/priority-icon';

const DEFAULT_LABELS = ['Research', 'Design', 'Development', 'Testing', 'Deployment'];

const SUBTASKS = [
  { title: 'Subtask 1', priority: 'HIGH', member: 'avatar' as const, date: '12 Sep 2026' },
  { title: 'Subtask 2', priority: 'LOW', member: 'CN' as const, date: '15 Sep 2026' },
  { title: 'Subtask 3', priority: 'MEDIUM', member: 'plus' as const, date: '18 Sep 2026' },
];

const PRIORITIES = ['NONE', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'] as const;

const STATUSES = [
  { name: 'Backlog', color: '#f59e0b' },
  { name: 'To Do', color: '#94a3b8' },
  { name: 'In Progress', color: '#3b82f6' },
  { name: 'Completed', color: '#10b981' },
  { name: 'On Hold', color: '#8b5cf6' },
];

const statusColor = (name?: string) =>
  STATUSES.find((s) => s.name === name)?.color || '#f59e0b';

const ICON_BTN =
  'flex h-6 items-center justify-center rounded-md border border-border bg-panel text-muted-foreground transition-colors hover:bg-muted hover:text-foreground';

function CalendarPicker({
  selectedDate,
  onSelectDate,
}: {
  selectedDate?: Date | null;
  onSelectDate: (date: Date) => void;
}) {
  const [currentMonth, setCurrentMonth] = React.useState(
    () => (selectedDate ? new Date(selectedDate) : new Date(2026, 0, 1))
  );
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const days = React.useMemo(() => {
    const date = new Date(year, month, 1);
    date.setDate(date.getDate() - date.getDay());
    const result: Date[] = [];
    for (let i = 0; i < 42; i++) {
      result.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return result;
  }, [year, month]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const isSameDay = (d1: Date, d2?: Date | null) =>
    !!d2 &&
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  return (
    <div className="w-[196px] select-none p-2.5">
      <div className="mb-1.5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
          className="rounded-md p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="text-[12px] font-medium text-foreground">
          {monthNames[month]} {year}
        </span>
        <button
          type="button"
          onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
          className="rounded-md p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-7 text-center text-[10px] font-medium text-muted-foreground">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <span key={d} className="py-1">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 text-center text-[11px]">
        {days.map((day, idx) => {
          const isCurrMonth = day.getMonth() === month;
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          return (
            <button
              type="button"
              key={idx}
              onClick={() => onSelectDate(day)}
              className={cn(
                'mx-auto my-1 flex h-6 w-6 items-center justify-center rounded-full',
                !isCurrMonth && 'text-muted-foreground/40',
                isCurrMonth && !isSelected && 'text-foreground hover:bg-muted',
                isToday && !isSelected && 'bg-muted',
                isSelected && 'bg-foreground font-semibold text-background'
              )}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children?: React.ReactNode }) {
  return (
    <div className="flex min-h-8 items-center">
      <span className="w-[92px] shrink-0 text-[12px] text-muted-foreground">{label}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function TaskDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toggleSidebar } = React.useContext(SidebarContext);
  const taskId = params.taskId as string;
  const workspaceId = searchParams.get('workspace') || '';
  const projectId = searchParams.get('project') || '';

  const { task, isLoading, updateTask } = useTaskDetail(taskId);

  const [editingTitle, setEditingTitle] = React.useState(false);
  const [titleValue, setTitleValue] = React.useState('');
  const [editingDescription, setEditingDescription] = React.useState(false);
  const [descValue, setDescValue] = React.useState('');
  const [commentText, setCommentText] = React.useState('');
  const [replyText, setReplyText] = React.useState('');
  const [subtasksOpen, setSubtasksOpen] = React.useState(true);
  const [detailsOpen, setDetailsOpen] = React.useState(true);
  const [updatesOpen, setUpdatesOpen] = React.useState(true);
  const [rightOpen, setRightOpen] = React.useState(true);
  const [startDate, setStartDate] = React.useState<Date | null>(new Date(2026, 0, 10));
  const [endDate, setEndDate] = React.useState<Date | null>(null);
  const [comments, setComments] = React.useState([
    { id: '1', name: 'Ankit Dutta', initials: 'AD', text: 'dsds', time: 'just now' },
  ]);

  React.useEffect(() => {
    if (task) {
      setTitleValue(task.title || '');
      setDescValue(
        task.description ||
          'Create clear and detailed API documentation to guide developers in using the inventory and sales metrics features effectively.'
      );
    }
  }, [task?.id]);

  const goBack = () => {
    const qs = new URLSearchParams();
    if (workspaceId) qs.set('workspace', workspaceId);
    if (projectId) qs.set('project', projectId);
    router.push(`/tasks?${qs.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-panel">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-panel">
        <p className="text-sm text-muted-foreground">Task not found</p>
        <Button variant="outline" size="sm" onClick={goBack}>Back to Tasks</Button>
      </div>
    );
  }

  const labels: string[] =
    task.labels?.length >= 4 ? task.labels.map((l: any) => l.name) : DEFAULT_LABELS;

  const formatPropDate = (value?: string | Date | null) => {
    if (!value) return '31 Jul';
    const d = typeof value === 'string' ? new Date(value) : value;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const formatRangeDate = (value?: Date | null) =>
    value ? value.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

  const saveTitle = async () => {
    if (titleValue.trim() && titleValue !== task.title) await updateTask({ title: titleValue.trim() });
    setEditingTitle(false);
  };
  const saveDesc = async () => {
    if (descValue !== task.description) await updateTask({ description: descValue || null });
    setEditingDescription(false);
  };

  const postComment = () => {
    if (!commentText.trim()) return;
    setComments((prev) => [
      ...prev,
      { id: String(Date.now()), name: 'Dexter', initials: 'DX', text: commentText.trim(), time: 'just now' },
    ]);
    setCommentText('');
  };

  const currentPriority = task.priority || 'HIGH';
  const currentStatus = task.status || 'Backlog';

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-panel">
      {/* Header — sidebar toggle only */}
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-6">
        <button
          type="button"
          onClick={toggleSidebar}
          className={cn(ICON_BTN, 'w-6')}
          title="Toggle Sidebar"
        >
          <PanelLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
        <span className="h-4 w-px bg-border" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-12 pt-6">
        {/* Title row — action icons align to the far right */}
        <div className="flex items-start justify-between gap-6">
          {editingTitle ? (
            <input
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => e.key === 'Enter' && saveTitle()}
              className="min-w-0 flex-1 bg-transparent text-[22px] font-bold tracking-tight text-foreground outline-none"
              autoFocus
            />
          ) : (
            <h1
              onClick={() => setEditingTitle(true)}
              className="min-w-0 flex-1 cursor-text text-[22px] font-bold leading-tight tracking-tight text-foreground"
            >
              {task.title}
            </h1>
          )}

          <div className="flex shrink-0 items-center gap-1.5">
            <button type="button" className={cn(ICON_BTN, 'w-6')} title="Lock">
              <Lock className="h-3 w-3" strokeWidth={1.75} />
            </button>
            <button type="button" className={cn(ICON_BTN, 'gap-1 px-1.5')} title="Views">
              <Eye className="h-3 w-3" strokeWidth={1.75} />
              <span className="text-[10px] font-medium">1</span>
            </button>
            <button type="button" className={cn(ICON_BTN, 'w-6')} title="Share">
              <Share2 className="h-3 w-3" strokeWidth={1.75} />
            </button>
            <button type="button" className={cn(ICON_BTN, 'w-6')} title="More">
              <MoreHorizontal className="h-3 w-3" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => setRightOpen((v) => !v)}
              className={cn(ICON_BTN, 'w-6')}
              title="Toggle details"
            >
              <LayoutGrid className="h-3 w-3" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        <div className="flex gap-5">
          {/* Center column */}
          <div className="min-w-0 flex-1">
            {editingDescription ? (
              <textarea
                value={descValue}
                onChange={(e) => setDescValue(e.target.value)}
                onBlur={saveDesc}
                rows={2}
                className="mt-2.5 w-full max-w-[540px] resize-none bg-transparent text-[13px] leading-[1.55] text-muted-foreground outline-none"
                autoFocus
              />
            ) : (
              <p
                onClick={() => setEditingDescription(true)}
                className="mt-2.5 max-w-[540px] cursor-text text-[13px] leading-[1.55] text-muted-foreground"
              >
                {descValue}
              </p>
            )}

            <div className="mt-6 space-y-2.5">
              <div className="flex items-center">
                <span className="w-[92px] shrink-0 text-[13px] font-normal text-[#8e8e8e]">Properties</span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f3f4f6] text-[10px] font-medium text-[#3f3f46] dark:bg-muted dark:text-foreground">
                      A
                    </span>
                    <span className="text-[13px] font-bold text-foreground">Designer</span>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#fee2e2] px-2 py-[3px] text-[12px] font-normal text-[#ef4444] dark:bg-[#3f1212] dark:text-[#fca5a5]">
                    <Calendar className="h-3 w-3" strokeWidth={1.75} />
                    {formatPropDate(task.dueDate)}
                  </span>
                </div>
              </div>

              <div className="flex items-center">
                <span className="w-[92px] shrink-0 text-[13px] font-normal text-[#8e8e8e]">Labels</span>
                <div className="flex flex-wrap gap-1.5">
                  {labels.map((name: string) => (
                    <span
                      key={name}
                      className="inline-flex items-center gap-1 rounded-full bg-[#f3f4f6] px-2 py-[3px] text-[12px] font-medium text-foreground dark:bg-muted"
                    >
                      <Tag className="h-3 w-3 text-foreground" strokeWidth={1.75} />
                      {name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center">
                <span className="w-[92px] shrink-0 text-[13px] font-normal text-[#8e8e8e]">Resources</span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-[13px] font-normal text-[#8e8e8e] transition-colors hover:text-foreground"
                >
                  <Paperclip className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Add document or link...
                </button>
              </div>
            </div>

            {/* Subtasks */}
            <div className="mt-8">
              <button
                type="button"
                onClick={() => setSubtasksOpen((v) => !v)}
                className="mb-2.5 flex items-center gap-1 text-[14px] font-semibold text-foreground"
              >
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 text-muted-foreground transition-transform',
                    !subtasksOpen && '-rotate-90'
                  )}
                />
                Subtasks
              </button>

              {subtasksOpen && (
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                  <table className="w-full table-fixed border-collapse text-left text-[13px]">
                    <thead>
                      <tr className="border-b border-border text-[12.5px] font-normal text-muted-foreground">
                        <th className="w-[22%] px-4 py-2.5 font-normal">Task</th>
                        <th className="w-[20%] px-4 py-2.5 font-normal">Priority</th>
                        <th className="w-[20%] px-4 py-2.5 font-normal">Members</th>
                        <th className="w-[24%] px-4 py-2.5 font-normal">Due Date</th>
                        <th className="px-4 py-2.5 text-right font-normal">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SUBTASKS.map((st, i) => (
                        <tr
                          key={st.title}
                          className={cn(i !== SUBTASKS.length - 1 && 'border-b border-border')}
                        >
                          <td className="px-4 py-3 font-semibold text-foreground">{st.title}</td>
                          <td className="px-4 py-3">
                            <PriorityBadge priority={st.priority} />
                          </td>
                          <td className="px-4 py-3">
                            {st.member === 'avatar' ? (
                              <Avatar className="h-6 w-6 border-0">
                                <AvatarImage src={task.assignees?.[0]?.avatarUrl || ''} />
                                <AvatarFallback className="bg-muted text-[9px] font-semibold text-foreground">
                                  DX
                                </AvatarFallback>
                              </Avatar>
                            ) : st.member === 'CN' ? (
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-foreground/70">
                                CN
                              </span>
                            ) : (
                              <span className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground">
                                <Plus className="h-3.5 w-3.5" />
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-foreground">{st.date}</td>
                          <td className="px-4 py-3 text-right">
                            <MoreHorizontal className="ml-auto h-4 w-4 text-muted-foreground" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button
                    type="button"
                    className="flex w-full items-center gap-1.5 border-t border-border px-4 py-2.5 text-[13px] text-muted-foreground transition-colors hover:bg-row-hover hover:text-foreground"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Subtasks
                  </button>
                </div>
              )}
            </div>

            {/* Activity — labelled Subtasks in the design */}
            <div className="mt-7">
              <div className="mb-2.5 text-[14px] font-semibold text-foreground">Subtasks</div>

              {comments.map((c) => (
                <div key={c.id} className="mb-4 rounded-xl border border-border bg-card px-3 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 border-0">
                        <AvatarFallback className="bg-linear-to-br from-violet-400 to-pink-400 text-[9px] font-bold text-white">
                          {c.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[13px] font-semibold text-foreground">{c.name}</span>
                      <span className="text-[11.5px] text-muted-foreground">{c.time}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Smile className="h-3.5 w-3.5" />
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  <p className="mt-2.5 text-[13px] text-foreground">{c.text}</p>

                  <div className="focus-shell mt-3.5 flex h-8 items-center gap-2 rounded-lg border border-border bg-panel px-2">
                    <Avatar className="h-5 w-5 shrink-0 border-0">
                      <AvatarImage src={task.assignees?.[0]?.avatarUrl || ''} />
                      <AvatarFallback className="bg-muted text-[8px] font-semibold">DX</AvatarFallback>
                    </Avatar>
                    <input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Leave a reply..."
                      className="min-w-0 flex-1 border-0 bg-transparent text-[12.5px] shadow-none outline-none ring-0 placeholder:text-muted-foreground"
                    />
                    <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                    <Send className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </div>
              ))}

              <div className="focus-shell flex h-[52px] items-center gap-2 rounded-xl border border-border bg-card px-3">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && postComment()}
                  placeholder="Add a comment..."
                  className="min-w-0 flex-1 border-0 bg-transparent text-[13px] shadow-none outline-none ring-0 placeholder:text-muted-foreground"
                />
                <Paperclip className="h-4 w-4 text-muted-foreground" />
                <button
                  type="button"
                  onClick={postComment}
                  className="ml-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right column */}
          {rightOpen && (
            <aside className="hidden w-[300px] shrink-0 pt-[60px] lg:block">
              <div className="rounded-xl border border-border bg-card p-3">
                <div className="mb-1 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setDetailsOpen((v) => !v)}
                    className="flex items-center gap-1 text-[14px] font-semibold text-foreground"
                  >
                    <ChevronDown
                      className={cn(
                        'h-3.5 w-3.5 text-muted-foreground transition-transform',
                        !detailsOpen && '-rotate-90'
                      )}
                    />
                    Details
                  </button>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <button type="button" className="rounded-md p-0.5 hover:bg-muted">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" className="rounded-md p-0.5 hover:bg-muted">
                      <Settings className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {detailsOpen && (
                  <div>
                    <DetailRow label="Status">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground hover:opacity-80"
                          >
                            <span
                              className="h-[7px] w-[7px] rounded-full"
                              style={{ backgroundColor: statusColor(currentStatus) }}
                            />
                            {currentStatus}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="start"
                          className="w-44 rounded-xl border-border bg-popover p-1.5 shadow-lg"
                        >
                          <div className="px-2 py-1 text-[11px] font-medium text-muted-foreground">Status</div>
                          {STATUSES.map((s) => (
                            <DropdownMenuItem
                              key={s.name}
                              onClick={() => updateTask({ status: s.name })}
                              className="cursor-pointer justify-between rounded-lg px-2.5 py-2 text-[13px]"
                            >
                              <span className="flex items-center gap-2.5">
                                <span
                                  className="h-[7px] w-[7px] rounded-full"
                                  style={{ backgroundColor: s.color }}
                                />
                                {s.name}
                              </span>
                              {currentStatus === s.name && (
                                <Check className="h-3.5 w-3.5 stroke-[2.5] text-foreground" />
                              )}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </DetailRow>

                    <DetailRow label="Priority">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className={cn(
                              'group flex items-center gap-1.5 text-[13px] font-semibold hover:opacity-80',
                              priorityTextClass(currentPriority)
                            )}
                          >
                            <PriorityIcon priority={currentPriority} />
                            {priorityLabel(currentPriority)}
                            <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="start"
                          className="w-[176px] rounded-xl border-border bg-popover p-1.5 shadow-lg"
                        >
                          <div className="px-2 py-1 text-[11px] font-medium text-muted-foreground">
                            Priority
                          </div>
                          {PRIORITIES.map((p) => {
                            const selected =
                              (p === 'NONE' &&
                                (!task.priority ||
                                  task.priority === 'NONE' ||
                                  task.priority === 'NO_PRIORITY')) ||
                              task.priority === p;
                            return (
                              <DropdownMenuItem
                                key={p}
                                onClick={() => updateTask({ priority: p === 'NONE' ? 'NONE' : p })}
                                className="cursor-pointer justify-between rounded-lg px-2.5 py-2 text-[13px]"
                              >
                                <span className={cn('flex items-center gap-2.5', priorityTextClass(p))}>
                                  <PriorityIcon priority={p} />
                                  {priorityLabel(p)}
                                </span>
                                {selected && <Check className="h-3.5 w-3.5 stroke-[2.5] text-foreground" />}
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </DetailRow>

                    <DetailRow label="Members">
                      <button
                        type="button"
                        className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground hover:opacity-80"
                      >
                        <User className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
                        Add members
                      </button>
                    </DetailRow>

                    <DetailRow label="Dates">
                      <div className="flex items-center gap-1.5">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 rounded-md border border-border bg-panel px-1.5 py-[3px] text-[11.5px] font-normal text-foreground hover:bg-muted"
                            >
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {startDate ? formatRangeDate(startDate) : 'Start'}
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="center"
                            className="rounded-xl border-border bg-popover p-0 shadow-lg"
                          >
                            <CalendarPicker selectedDate={startDate} onSelectDate={setStartDate} />
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <span className="text-[11px] text-muted-foreground">→</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 rounded-md border border-border bg-panel px-1.5 py-[3px] text-[11.5px] font-normal text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {endDate ? formatRangeDate(endDate) : 'End'}
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="center"
                            className="rounded-xl border-border bg-popover p-0 shadow-lg"
                          >
                            <CalendarPicker
                              selectedDate={endDate}
                              onSelectDate={(d) => {
                                setEndDate(d);
                                updateTask({ dueDate: d.toISOString() });
                              }}
                            />
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </DetailRow>

                    <DetailRow label="Labels" />
                    <DetailRow label="Teams" />
                    <DetailRow label="Reporter" />
                  </div>
                )}
              </div>

              <div className="mt-3 rounded-xl border border-border bg-card p-3">
                <button
                  type="button"
                  onClick={() => setUpdatesOpen((v) => !v)}
                  className="flex items-center gap-1 text-[14px] font-semibold text-foreground"
                >
                  <ChevronDown
                    className={cn(
                      'h-3.5 w-3.5 text-muted-foreground transition-transform',
                      !updatesOpen && '-rotate-90'
                    )}
                  />
                  Updates
                </button>

                {updatesOpen && (
                  <div className="mt-3 space-y-3.5">
                    <div className="flex items-center gap-2">
                      <PriorityIcon priority="URGENT" className="shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[12px] font-semibold text-foreground">You</div>
                        <div className="truncate text-[12px] font-normal text-muted-foreground">
                          changed priority from No priority to Urgent
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-4 w-4 shrink-0 border-0">
                        <AvatarImage src={task.assignees?.[0]?.avatarUrl || ''} />
                        <AvatarFallback className="bg-linear-to-br from-violet-400 to-pink-400 text-[7px] font-bold text-white">
                          DX
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="text-[12px] font-semibold text-foreground">You</div>
                        <div className="truncate text-[12px] font-normal text-muted-foreground">
                          posted an update · Aug 2026
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TaskDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center bg-panel">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <TaskDetailContent />
    </React.Suspense>
  );
}
