'use client';

import * as React from 'react';
import { useAuth } from '../../../lib/hooks/use-tasks';
import { Loader2 } from 'lucide-react';

function PyramidMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <path d="M12 4L20 18H4L12 4Z" fill="white" />
    </svg>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const { guestLogin, isLoggingIn } = useAuth();
  const [notice, setNotice] = React.useState('');

  const handleGuestLogin = () => {
    setNotice('');
    guestLogin();
  };

  const handleGoogleLogin = () => {
    setNotice('This is a demo version. Firebase is not integrated. Logging you in as a guest.');
    window.setTimeout(() => guestLogin(), 700);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div className="mb-8 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-black">
          <PyramidMark />
        </span>
        <span className="text-[20px] font-bold tracking-tight text-black">Pyramid</span>
      </div>

      <div className="w-full max-w-[400px] rounded-2xl border border-[#e5e7eb] bg-white px-8 py-8">
        <h1 className="text-center text-[22px] font-bold tracking-tight text-[#18181b]">
          Let&apos;s get back on track
        </h1>
        <p className="mt-2 text-center text-[13px] text-[#8e8e8e]">
          Enter your email below to login to your account.
        </p>

        {notice && (
          <div className="mt-5 rounded-lg border border-[#fde68a] bg-[#fffbeb] px-3 py-2 text-center text-[12px] leading-relaxed text-[#92400e]">
            {notice}
          </div>
        )}

        <button
          type="button"
          onClick={handleGuestLogin}
          disabled={isLoggingIn}
          className="mt-6 flex h-11 w-full items-center justify-center rounded-full bg-black text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-70"
        >
          {isLoggingIn && !notice ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Continuing...
            </span>
          ) : (
            'Continue as Guest'
          )}
        </button>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoggingIn}
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#e5e7eb] bg-white text-[14px] font-medium text-black transition-colors hover:bg-[#fafafa] disabled:opacity-70"
        >
          {isLoggingIn && notice ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Logging in as guest...
            </span>
          ) : (
            <>
              <GoogleMark />
              Login with Google
            </>
          )}
        </button>
      </div>

      <p className="mt-6 max-w-[360px] text-center text-[12px] leading-relaxed text-[#9ca3af]">
        By clicking continue, you agree to our{' '}
        <span className="cursor-pointer underline underline-offset-2">Terms of Service</span> and{' '}
        <span className="cursor-pointer underline underline-offset-2">Privacy Policy</span>
      </p>
    </div>
  );
}
