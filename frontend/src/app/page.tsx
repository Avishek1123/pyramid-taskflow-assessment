'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
  const router = useRouter();

  React.useEffect(() => {
    router.replace('/tasks');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
    </div>
  );
}
