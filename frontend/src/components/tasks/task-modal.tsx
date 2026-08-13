'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAuth } from '../../lib/hooks/use-tasks';

interface TaskModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  columns: any[];
  members: any[];
  labels: any[];
  task: any | null; // null means Create Mode
  defaultColumnId?: string;
  onSave: (data: any) => Promise<void>;
}

export function TaskModal({
  isOpen,
  onOpenChange,
  columns,
  members,
  labels,
  task,
  defaultColumnId,
  onSave,
}: TaskModalProps) {
  const { user } = useAuth();
  
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [columnId, setColumnId] = React.useState('');
  const [priority, setPriority] = React.useState('MEDIUM');
  const [dueDate, setDueDate] = React.useState('');
  const [selectedLabelIds, setSelectedLabelIds] = React.useState<string[]>([]);
  const [selectedAssigneeIds, setSelectedAssigneeIds] = React.useState<string[]>([]);
  const [reporterId, setReporterId] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

  // Sync state when task changes (Open for Edit) or defaults change (Open for Create)
  React.useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setColumnId(task.columnId || '');
      setPriority(task.priority || 'MEDIUM');
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
      setSelectedLabelIds(task.labels?.map((l: any) => l.id) || []);
      setSelectedAssigneeIds(task.assignees?.map((a: any) => a.id) || []);
      setReporterId(task.reporterId || '');
    } else {
      setTitle('');
      setDescription('');
      setColumnId(defaultColumnId || columns[0]?.id || '');
      setPriority('MEDIUM');
      setDueDate('');
      setSelectedLabelIds([]);
      setSelectedAssigneeIds(user?.id ? [user.id] : []);
      setReporterId(user?.id || '');
    }
  }, [task, isOpen, defaultColumnId, columns, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !columnId) return;

    setIsSaving(true);
    try {
      await onSave({
        title,
        description: description || null,
        columnId,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        labelIds: selectedLabelIds,
        assigneeIds: selectedAssigneeIds,
        reporterId: reporterId || null,
      });
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLabelToggle = (id: string) => {
    setSelectedLabelIds((prev) =>
      prev.includes(id) ? prev.filter((lid) => lid !== id) : [...prev, id]
    );
  };

  const handleAssigneeToggle = (id: string) => {
    setSelectedAssigneeIds((prev) =>
      prev.includes(id) ? prev.filter((aid) => aid !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-zinc-200 text-zinc-900 max-w-lg w-[94vw] md:w-full max-h-[92vh] overflow-y-auto shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-zinc-900">
              {task ? 'Edit Task' : 'Create Task'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Task Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Implement drag & drop"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-ring"
                required
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Description
              </label>
              <textarea
                placeholder="Describe this task in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-ring resize-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Status Column */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Status *
                </label>
                <Select value={columnId} onValueChange={setColumnId}>
                  <SelectTrigger className="w-full bg-zinc-50 border-zinc-200 text-zinc-900">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-zinc-200 text-zinc-900">
                    {columns.map((col) => (
                      <SelectItem key={col.id} value={col.id} className="cursor-pointer hover:bg-zinc-50">
                        {col.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Priority
                </label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="w-full bg-zinc-50 border-zinc-200 text-zinc-900">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-zinc-200 text-zinc-900">
                    <SelectItem value="LOW" className="cursor-pointer hover:bg-zinc-50">Low</SelectItem>
                    <SelectItem value="MEDIUM" className="cursor-pointer hover:bg-zinc-50">Medium</SelectItem>
                    <SelectItem value="HIGH" className="cursor-pointer hover:bg-zinc-50">High</SelectItem>
                    <SelectItem value="URGENT" className="cursor-pointer hover:bg-zinc-50">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Due Date */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-3 py-1.5 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              {/* Reporter */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Reporter
                </label>
                <Select value={reporterId} onValueChange={setReporterId}>
                  <SelectTrigger className="w-full bg-zinc-50 border-zinc-200 text-zinc-900">
                    <SelectValue placeholder="Select reporter" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-zinc-200 text-zinc-900">
                    {members.map((m) => (
                      <SelectItem key={m.id} value={m.id} className="cursor-pointer hover:bg-zinc-50">
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Assignees (Multi-select) */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Assignees
              </label>
              <div className="flex flex-wrap gap-1.5 p-2.5 bg-zinc-50 border border-zinc-200 rounded-md max-h-[100px] overflow-y-auto">
                {members.map((m) => {
                  const isChecked = selectedAssigneeIds.includes(m.id);
                  return (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => handleAssigneeToggle(m.id)}
                      className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs border transition-colors cursor-pointer ${
                        isChecked
                          ? 'border-zinc-900 bg-zinc-900 text-white font-medium'
                          : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:text-zinc-900'
                      }`}
                    >
                      <span className="truncate max-w-[80px]">{m.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Labels (Multi-select) */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Labels
              </label>
              <div className="flex flex-wrap gap-1.5 p-2.5 bg-zinc-50 border border-zinc-200 rounded-md max-h-[100px] overflow-y-auto">
                {labels.map((l) => {
                  const isChecked = selectedLabelIds.includes(l.id);
                  return (
                    <button
                      type="button"
                      key={l.id}
                      onClick={() => handleLabelToggle(l.id)}
                      className={`flex items-center space-x-2 px-2.5 py-1 rounded-full text-xs border transition-all cursor-pointer ${
                        isChecked
                          ? 'border-zinc-400 bg-zinc-100 text-zinc-900 font-semibold shadow-sm'
                          : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300'
                      }`}
                    >
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: l.color }}
                      />
                      <span>{l.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="flex items-center space-x-2 justify-end pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="text-xs bg-zinc-950 hover:bg-zinc-900 text-white">
              {isSaving ? 'Saving...' : task ? 'Save Changes' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
