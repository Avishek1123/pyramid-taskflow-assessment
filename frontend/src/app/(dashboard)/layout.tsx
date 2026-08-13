'use client';

import * as React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useWorkspaces, useAuth } from '../../lib/hooks/use-tasks';
import { Sidebar } from '../../components/layout/sidebar';
import { Loader2, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export const SidebarContext = React.createContext<{
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  /** @deprecated use toggleSidebar */
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  sidebarOpen: true,
  toggleSidebar: () => {},
  setSidebarOpen: () => {},
  setMobileMenuOpen: () => {},
});

/** Back-compat alias */
export const MobileMenuContext = SidebarContext;

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { isLoading: isAuthLoading } = useAuth();
  const { workspaces, isLoading: isWorkspacesLoading } = useWorkspaces();

  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const workspaceId = searchParams.get('workspace');

  React.useEffect(() => {
    const saved = localStorage.getItem('taskflow_sidebar_open');
    if (saved === 'false') setSidebarOpen(false);
  }, []);

  const persistSidebar = React.useCallback((open: boolean) => {
    setSidebarOpen(open);
    localStorage.setItem('taskflow_sidebar_open', String(open));
  }, []);

  const setSidebarOpenSafe: React.Dispatch<React.SetStateAction<boolean>> = React.useCallback(
    (value) => {
      const next = typeof value === 'function' ? value(sidebarOpen) : value;
      persistSidebar(next);
    },
    [sidebarOpen, persistSidebar]
  );

  const toggleSidebar = React.useCallback(() => {
    // Mobile: open/close drawer
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) {
      setMobileMenuOpen((v) => !v);
      return;
    }
    // Desktop: minimize/expand sidebar (icon rail)
    persistSidebar(!sidebarOpen);
  }, [sidebarOpen, persistSidebar]);

  React.useEffect(() => {
    if (!isWorkspacesLoading && workspaces.length > 0 && !workspaceId) {
      const firstWorkspace = workspaces[0];
      const params = new URLSearchParams(searchParams.toString());
      params.set('workspace', firstWorkspace.id);
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [workspaces, isWorkspacesLoading, workspaceId, pathname, searchParams, router]);

  const isSettingsPage = pathname.startsWith('/settings');

  if (isAuthLoading || (isWorkspacesLoading && workspaces.length === 0)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground font-medium">Entering workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <SidebarContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        setSidebarOpen: setSidebarOpenSafe,
        setMobileMenuOpen,
      }}
    >
      <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground relative">
        {!isSettingsPage && (
          <>
            {/* Desktop Sidebar — minimizes to icon rail */}
            <div
              className={cn(
                'hidden md:flex shrink-0 transition-[width] duration-300 ease-in-out',
                sidebarOpen ? 'w-[240px]' : 'w-16'
              )}
            >
              <Sidebar
                className={cn(
                  'flex h-full',
                  sidebarOpen ? 'w-[240px] min-w-[240px]' : 'w-16 min-w-16'
                )}
                collapsed={!sidebarOpen}
              />
            </div>

            {/* Mobile Drawer Backdrop */}
            {mobileMenuOpen && (
              <div
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
              />
            )}

            {/* Mobile Sidebar Drawer */}
            <div
              className={cn(
                'fixed inset-y-0 left-0 z-50 w-[240px] transform bg-sidebar transition-transform duration-300 md:hidden',
                mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
              )}
            >
              <div className="relative h-full flex flex-col">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="absolute top-4 right-4 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors z-10"
                >
                  <X className="h-5 w-5" />
                </button>
                <Sidebar
                  className="w-full h-full border-r-0"
                  onCloseMobile={() => setMobileMenuOpen(false)}
                />
              </div>
            </div>
          </>
        )}

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">{children}</div>
      </div>
    </SidebarContext.Provider>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-medium">Loading...</span>
          </div>
        </div>
      }
    >
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </React.Suspense>
  );
}
