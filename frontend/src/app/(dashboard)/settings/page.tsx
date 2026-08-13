'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/hooks/use-tasks';
import { useColorMode, ColorMode } from '../../../components/providers';
import { useTheme } from 'next-themes';
import {
  ArrowLeft,
  Search,
  User,
  Sun,
  Moon,
  Check,
  Pencil,
  Loader2,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { cn } from '../../../lib/utils';

type SettingsTab = 'profile' | 'theme' | 'color';

const colorModes: { name: ColorMode; hex: string }[] = [
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Blue', hex: '#7c3aed' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Black', hex: '#09090b' },
];

const fieldInput =
  'w-56 rounded-lg border border-transparent bg-[#f3f4f6] px-3 py-2 text-[13px] text-foreground shadow-none outline-none dark:bg-input-fill';

function SettingsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get('workspace') || '';
  const { user, isLoading, logout } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const activeTheme = mounted ? resolvedTheme || theme : 'light';
  const { colorMode, setColorMode } = useColorMode();

  const [tab, setTab] = React.useState<SettingsTab>('profile');
  const [search, setSearch] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [title, setTitle] = React.useState('Designer');
  const [username, setUsername] = React.useState('Dexuser');
  const [leaveOpen, setLeaveOpen] = React.useState(false);

  React.useEffect(() => {
    if (user?.name) {
      setFullName(user.name);
      setUsername(user.name.replace(/\s+/g, '').slice(0, 12) || 'Dexuser');
    }
  }, [user?.name]);

  const navItems: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" strokeWidth={1.75} /> },
    { id: 'theme', label: 'Theme', icon: <Sun className="h-4 w-4" strokeWidth={1.75} /> },
    {
      id: 'color',
      label: 'Color',
      icon: (
        <span
          className="h-3.5 w-3.5 rounded-[3px] border border-border"
          style={{
            backgroundColor: colorModes.find((c) => c.name === colorMode)?.hex || '#09090b',
          }}
        />
      ),
    },
  ];

  const filteredNav = navItems.filter((n) =>
    n.label.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center bg-white">
        <Loader2 className="h-7 w-7 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 overflow-hidden bg-[#f7f7f8] dark:bg-background">
      <aside className="flex w-[240px] shrink-0 flex-col border-r border-border bg-white dark:bg-sidebar">
        <div className="px-4 pb-3 pt-4">
          <Link
            href={`/tasks?workspace=${workspaceId}`}
            className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to app
          </Link>
        </div>

        <div className="px-3 pb-3">
          <div className="focus-shell flex h-9 items-center gap-2 rounded-lg border border-transparent bg-[#f3f4f6] px-2.5 dark:bg-input-fill">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border-0 bg-transparent text-[13px] text-foreground shadow-none outline-none ring-0 placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <nav className="space-y-0.5 px-2">
          {filteredNav.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                'flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-colors',
                tab === item.id
                  ? 'bg-[#f3f4f6] text-foreground dark:bg-sidebar-active'
                  : 'text-muted-foreground hover:bg-[#f7f7f8] dark:hover:bg-sidebar-hover'
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex flex-1 items-center justify-center overflow-y-auto bg-[#f7f7f8] dark:bg-panel">
        <div className="mx-auto w-full max-w-[640px] px-8 py-10">
          {tab === 'profile' && (
            <>
              <h1 className="mb-6 text-[22px] font-bold text-foreground">Profile</h1>

              <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-white dark:bg-card">
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-[13px] font-medium text-foreground">Profile picture</span>
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarImage src={user?.avatarUrl || ''} />
                    <AvatarFallback className="bg-linear-to-br from-violet-400 to-pink-400 text-xs font-bold text-white">
                      {(user?.name || 'DX').substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-[13px] font-medium text-foreground">Email</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-muted-foreground">
                      {(user?.email || 'dexter@gmail.com').toLowerCase()}
                    </span>
                    <button
                      type="button"
                      className="rounded p-1 text-foreground transition-colors hover:bg-muted"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-6 px-5 py-4">
                  <span className="shrink-0 text-[13px] font-medium text-foreground">Full name</span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={fieldInput}
                  />
                </div>

                <div className="flex items-start justify-between gap-6 px-5 py-4">
                  <div>
                    <div className="text-[13px] font-medium text-foreground">Title</div>
                    <div className="mt-0.5 text-[12px] text-muted-foreground">Your job title or role</div>
                  </div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={fieldInput}
                  />
                </div>

                <div className="flex items-start justify-between gap-6 px-5 py-4">
                  <div>
                    <div className="text-[13px] font-medium text-foreground">Username</div>
                    <div className="mt-0.5 text-[12px] text-muted-foreground">
                      One word, like a nickname or first name
                    </div>
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={fieldInput}
                  />
                </div>
              </div>

              <h2 className="mb-3 mt-8 text-[15px] font-semibold text-foreground">Workspace access</h2>
              <div className="flex items-center justify-between rounded-xl border border-border bg-white px-5 py-4 dark:bg-card">
                <span className="text-[13px] text-muted-foreground">Remove yourself from the workspace</span>
                <button
                  type="button"
                  onClick={() => setLeaveOpen(true)}
                  className="cursor-pointer rounded-lg bg-[#fee2e2] px-3.5 py-1.5 text-[13px] font-semibold text-[#ef4444] transition-opacity hover:opacity-90"
                >
                  Leave Workspace
                </button>
              </div>

              {leaveOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
                  <div className="w-full max-w-sm rounded-xl border border-border bg-white p-5 dark:bg-card">
                    <h3 className="text-[15px] font-semibold text-foreground">Are you sure?</h3>
                    <p className="mt-2 text-[13px] text-muted-foreground">
                      Are you sure you want to leave this workspace? You will be signed out.
                    </p>
                    <div className="mt-5 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setLeaveOpen(false)}
                        className="rounded-lg px-3 py-1.5 text-[13px] text-muted-foreground hover:bg-muted"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLeaveOpen(false);
                          logout();
                        }}
                        className="rounded-lg bg-[#ef4444] px-3 py-1.5 text-[13px] font-medium text-white"
                      >
                        Yes, leave
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {tab === 'theme' && (
            <>
              <h1 className="mb-6 text-[22px] font-bold text-foreground">Theme</h1>
              <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-white dark:bg-card">
                {[
                  { id: 'light', label: 'Light', icon: Sun },
                  { id: 'dark', label: 'Dark', icon: Moon },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTheme(opt.id)}
                    className="flex w-full cursor-pointer items-center justify-between px-5 py-4 transition-colors hover:bg-row-hover"
                  >
                    <div className="flex items-center gap-3">
                      <opt.icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                      <span className="text-[13px] font-medium text-foreground">{opt.label}</span>
                    </div>
                    {activeTheme === opt.id && <Check className="h-4 w-4 stroke-[2.5] text-foreground" />}
                  </button>
                ))}
              </div>
            </>
          )}

          {tab === 'color' && (
            <>
              <h1 className="mb-6 text-[22px] font-bold text-foreground">Color Mode</h1>
              <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-white dark:bg-card">
                {colorModes.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setColorMode(c.name)}
                    className="flex w-full cursor-pointer items-center justify-between px-5 py-4 transition-colors hover:bg-row-hover"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-4 w-4 rounded-[3px] border border-border"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-[13px] font-medium text-foreground">{c.name}</span>
                    </div>
                    {colorMode === c.name && <Check className="h-4 w-4 stroke-[2.5] text-foreground" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen flex-1 items-center justify-center bg-white">
          <Loader2 className="h-7 w-7 animate-spin text-zinc-400" />
        </div>
      }
    >
      <SettingsPageContent />
    </React.Suspense>
  );
}
