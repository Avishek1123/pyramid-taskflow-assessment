'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';

export type ConfirmTone = 'danger' | 'default';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  loading?: boolean;
  error?: string;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  tone = 'danger',
  loading = false,
  error,
  onConfirm,
}: ConfirmDialogProps) {
  const [pending, setPending] = React.useState(false);
  const isBusy = loading || pending;

  const handleConfirm = async () => {
    setPending(true);
    try {
      await onConfirm();
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !isBusy && onOpenChange(next)}>
      <DialogContent className="max-w-sm border border-border bg-card text-foreground">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
          <DialogDescription className="pt-1 text-[13px] leading-relaxed text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
        {error ? <p className="text-[12px] text-[#ef4444]">{error}</p> : null}
        <DialogFooter className="flex items-center justify-end gap-2 sm:space-x-0">
          <Button
            type="button"
            variant="ghost"
            className="text-xs"
            disabled={isBusy}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            disabled={isBusy}
            onClick={handleConfirm}
            className={
              tone === 'danger'
                ? 'bg-[#ef4444] text-xs text-white hover:bg-[#dc2626]'
                : 'bg-foreground text-xs text-background hover:opacity-90'
            }
          >
            {isBusy ? 'Please wait…' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
