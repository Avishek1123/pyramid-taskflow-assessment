'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export type ColorMode = 'Amber' | 'Blue' | 'Pink' | 'Rose' | 'Emerald' | 'Black';

const ColorModeContext = React.createContext<{
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
}>({
  colorMode: 'Blue',
  setColorMode: () => {},
});

export function useColorMode() {
  return React.useContext(ColorModeContext);
}

const colorConfigs: Record<ColorMode, { primary: string; ring: string }> = {
  Amber: { primary: '#d97706', ring: '#d97706' },
  Blue: { primary: '#2563eb', ring: '#2563eb' },
  Pink: { primary: '#db2777', ring: '#db2777' },
  Rose: { primary: '#e11d48', ring: '#e11d48' },
  Emerald: { primary: '#059669', ring: '#059669' },
  Black: { primary: '#09090b', ring: '#09090b' },
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const [colorMode, setColorModeState] = React.useState<ColorMode>('Blue');

  React.useEffect(() => {
    const saved = localStorage.getItem('taskflow_color_mode') as ColorMode;
    if (saved && colorConfigs[saved]) {
      setColorModeState(saved);
    }
  }, []);

  const setColorMode = React.useCallback((mode: ColorMode) => {
    setColorModeState(mode);
    localStorage.setItem('taskflow_color_mode', mode);
  }, []);

  React.useEffect(() => {
    const config = colorConfigs[colorMode];
    if (config) {
      // Accent only — keep surface theme tokens intact
      document.documentElement.style.setProperty('--accent-brand', config.primary);
      document.documentElement.style.setProperty('--ring', config.ring);
    }
  }, [colorMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <ColorModeContext.Provider value={{ colorMode, setColorMode }}>
        <NextThemesProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
          storageKey="taskflow-theme"
        >
          {children}
        </NextThemesProvider>
      </ColorModeContext.Provider>
    </QueryClientProvider>
  );
}

