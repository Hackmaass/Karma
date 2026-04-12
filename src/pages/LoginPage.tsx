import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight, Moon, Sun } from 'lucide-react';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { auth, isFirebaseConfigured } from '../lib/firebase';
import { cn } from '../lib/utils';

/** Drop PNG/WebP files here: public/login-screenshots/slide-1.png, slide-2.png, … */
const SCREENSHOT_PATHS = [
  '/login-screenshots/slide-1.png',
  '/login-screenshots/slide-2.png',
  '/login-screenshots/slide-3.png',
];

const TESTIMONIALS = [
  {
    quote: 'AI-powered workforce intelligence that finally connects how we hire to how teams actually work.',
    name: 'Sarah Mitchell',
    role: 'Head of Talent',
  },
  {
    quote: 'KarmaOS gave us visibility into deep work and overload risk we never had from HRIS alone.',
    name: 'James Chen',
    role: 'VP Engineering',
  },
  {
    quote: 'The cleanest bridge between recruiting signals and post-hire performance we have tried.',
    name: 'Elena Ruiz',
    role: 'People Operations Lead',
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setTheme, isDark } = useTheme();
  const mode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';

  const { currentUser, loginWithGoogle, loginWithMicrosoft, sendSignInEmailLink, completeSignInWithEmailLink } =
    useAuth();
  const emailLinkHandled = useRef(false);

  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [pendingLinkCompletion, setPendingLinkCompletion] = useState(false);
  const [slide, setSlide] = useState(0);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'microsoft' | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      navigate('/app', { replace: true });
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth || emailLinkHandled.current) return;
    if (!isSignInWithEmailLink(auth, window.location.href)) return;
    emailLinkHandled.current = true;
    const stored = window.localStorage.getItem('emailForSignIn');
    if (stored) {
      setEmailLoading(true);
      signInWithEmailLink(auth, stored, window.location.href)
        .then(() => {
          window.localStorage.removeItem('emailForSignIn');
          window.history.replaceState({}, document.title, '/login');
          navigate('/app', { replace: true });
        })
        .catch((e) => {
          console.error(e);
          emailLinkHandled.current = false;
          setError('This sign-in link is invalid or has expired. Request a new one.');
        })
        .finally(() => setEmailLoading(false));
    } else {
      setPendingLinkCompletion(true);
    }
  }, [navigate]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSlide((s) => (s + 1) % Math.max(SCREENSHOT_PATHS.length, 1));
    }, 6000);
    return () => window.clearInterval(id);
  }, []);

  const goSlide = useCallback((delta: number) => {
    setSlide((s) => {
      const n = SCREENSHOT_PATHS.length;
      return (s + delta + n) % n;
    });
  }, []);

  const handleOAuth = async (provider: 'google' | 'microsoft') => {
    setError(null);
    if (!isFirebaseConfigured) {
      navigate('/app');
      return;
    }
    setOauthLoading(provider);
    try {
      if (provider === 'google') await loginWithGoogle();
      else await loginWithMicrosoft();
      navigate('/app', { replace: true });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Sign-in failed';
      setError(msg);
    } finally {
      setOauthLoading(null);
    }
  };

  const handleEmailContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!isFirebaseConfigured) {
      navigate('/app');
      return;
    }
    setEmailLoading(true);
    try {
      window.localStorage.setItem('emailForSignIn', email.trim());
      await sendSignInEmailLink(email.trim());
      setEmailSent(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Could not send sign-in link';
      setError(msg);
    } finally {
      setEmailLoading(false);
    }
  };

  const handleConfirmEmailLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!confirmEmail.trim()) return;
    setEmailLoading(true);
    try {
      window.localStorage.setItem('emailForSignIn', confirmEmail.trim());
      await completeSignInWithEmailLink(confirmEmail.trim());
      navigate('/app', { replace: true });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Could not complete sign-in';
      setError(msg);
    } finally {
      setEmailLoading(false);
    }
  };

  const themeToggle = (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'fixed top-5 right-5 z-50 p-2.5 rounded-full border backdrop-blur-sm transition-colors shadow-sm',
        'border-black/10 bg-white/90 text-zinc-700 hover:text-zinc-950 hover:bg-white',
        'dark:border-white/20 dark:bg-zinc-800 dark:text-amber-100 dark:shadow-black/40 dark:hover:bg-zinc-700 dark:hover:text-white'
      )}
      title={isDark ? 'Light mode' : 'Dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );

  if (pendingLinkCompletion) {
    return (
      <div className="min-h-screen bg-page-bg text-page-text flex items-center justify-center p-6 font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
        {themeToggle}
        <div
          className={cn(
            'w-full max-w-md rounded-2xl border p-8 shadow-sm',
            'bg-white border-black/[0.08] shadow-black/5',
            'dark:bg-zinc-900 dark:border-white/15 dark:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.75)]'
          )}
        >
          <h1 className="text-xl font-semibold tracking-tight mb-1 text-zinc-900 dark:text-white">Confirm your email</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-6">
            Enter the same address we sent the link to so we can finish signing you in.
          </p>
          <form onSubmit={handleConfirmEmailLink} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Email address</label>
              <input
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder="you@company.com"
                className={cn(
                  'w-full rounded-xl border px-4 py-3 text-sm outline-none transition-shadow',
                  'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400',
                  'focus:ring-2 focus:ring-zinc-900/15 focus:border-zinc-300',
                  'dark:bg-zinc-950 dark:border-white/20 dark:text-white dark:placeholder:text-zinc-400',
                  'dark:focus:ring-white/20 dark:focus:border-white/30'
                )}
                autoComplete="email"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={emailLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1a1a1a] text-white text-sm font-medium py-3 hover:bg-black/90 disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-white/90"
            >
              {emailLoading ? 'Signing in…' : 'Continue'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-page-bg text-page-text flex items-center justify-center p-6 font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
        {themeToggle}
        <div
          className={cn(
            'w-full max-w-md rounded-2xl border p-8 text-center shadow-sm',
            'bg-white border-black/[0.08] shadow-black/5',
            'dark:bg-zinc-900 dark:border-white/15 dark:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.75)]'
          )}
        >
          <h1 className="text-xl font-semibold tracking-tight mb-2 text-zinc-900 dark:text-white">Check your inbox</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-6">
            We sent a sign-in link to{' '}
            <span className="font-medium text-zinc-900 dark:text-white">{email}</span>. Open it on this device to
            continue.
          </p>
          <button
            type="button"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white underline underline-offset-2"
            onClick={() => setEmailSent(false)}
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  const title = mode === 'signup' ? 'Create your KarmaOS account' : 'Sign in to KarmaOS';
  const subtitle =
    mode === 'signup'
      ? 'Get started with workforce intelligence in minutes.'
      : 'Welcome back! Please sign in to continue.';

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-page-bg text-page-text font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      {themeToggle}
      {/* Left: card */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 min-h-[50vh] lg:min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            'w-full max-w-[420px] rounded-2xl border p-8 sm:p-10',
            'bg-white border-black/[0.08] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.1)]',
            'dark:bg-zinc-900 dark:border-white/15 dark:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.75)]'
          )}
        >
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm mb-8 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white"
            >
              <span className="w-5 h-5 bg-zinc-900 dark:bg-white rounded-full shrink-0" />
              <span className="font-medium tracking-tight text-zinc-900 dark:text-white">KarmaOS</span>
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-2">{title}</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">{subtitle}</p>
          </div>

          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              disabled={oauthLoading !== null || emailLoading}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 rounded-xl border py-3 px-3 text-sm font-medium transition-colors',
                'border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50',
                'disabled:opacity-60 disabled:grayscale-[0.3]',
                'dark:border-white/20 dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-800/80'
              )}
            >
              <GoogleMark className="w-5 h-5 shrink-0" />
              Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuth('microsoft')}
              disabled={oauthLoading !== null || emailLoading}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 rounded-xl border py-3 px-3 text-sm font-medium transition-colors',
                'border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50',
                'disabled:opacity-60 disabled:grayscale-[0.3]',
                'dark:border-white/20 dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-800/80'
              )}
            >
              <MicrosoftMark className="w-5 h-5 shrink-0" />
              Microsoft
            </button>
          </div>

          <div className="relative flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-zinc-200 dark:bg-white/15" />
            <span className="text-xs font-medium text-zinc-400 dark:text-zinc-400">or</span>
            <div className="h-px flex-1 bg-zinc-200 dark:bg-white/15" />
          </div>

          <form onSubmit={handleEmailContinue} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="login-email" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className={cn(
                  'w-full rounded-xl border px-4 py-3 text-sm outline-none transition-shadow',
                  'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400',
                  'focus:ring-2 focus:ring-zinc-900/15 focus:border-zinc-300',
                  'dark:bg-zinc-950 dark:border-white/20 dark:text-white dark:placeholder:text-zinc-400',
                  'dark:focus:ring-white/20 dark:focus:border-white/30'
                )}
                autoComplete="email"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={emailLoading || oauthLoading !== null}
              className={cn(
                'w-full flex items-center justify-center gap-2 rounded-xl text-sm font-medium py-3.5 transition-colors',
                'bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-55',
                'dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100'
              )}
            >
              {emailLoading ? 'Sending link…' : 'Continue'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-white/10 text-center text-sm text-zinc-600 dark:text-zinc-300">
            {mode === 'signup' ? (
              <>
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-zinc-900 dark:text-white hover:underline underline-offset-2"
                >
                  Sign in
                </Link>
              </>
            ) : (
              <>
                Don&apos;t have an account?{' '}
                <Link
                  to="/login?mode=signup"
                  className="font-semibold text-zinc-900 dark:text-white hover:underline underline-offset-2"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          <p className="mt-6 text-center text-[11px] text-zinc-400 dark:text-zinc-500">
            Secured with Firebase Authentication
          </p>
        </motion.div>
      </div>

      {/* Right: testimonial + carousel */}
      <div
        className={cn(
          'hidden lg:flex flex-1 flex-col justify-between p-12 xl:p-16 min-h-screen max-w-[52%] border-l',
          'bg-[#ECECED] border-black/[0.06]',
          'dark:bg-zinc-950 dark:border-white/[0.06]'
        )}
      >
        <div className="max-w-lg">
          <div className="flex gap-1 mb-4" aria-hidden>
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} className="text-page-text text-lg leading-none opacity-90">
                ★
              </span>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={slide}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              <p className="text-lg font-medium text-page-text leading-snug tracking-tight mb-4">
                &ldquo;{TESTIMONIALS[slide % TESTIMONIALS.length].quote}&rdquo;
              </p>
              <p className="text-sm font-semibold text-page-text">
                {TESTIMONIALS[slide % TESTIMONIALS.length].name}
              </p>
              <p className="text-sm text-black/50 dark:text-white/50">
                {TESTIMONIALS[slide % TESTIMONIALS.length].role}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div
          className={cn(
            'relative mt-8 rounded-2xl border overflow-hidden aspect-[16/10] max-h-[min(420px,42vh)]',
            'border-black/[0.06] bg-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)]',
            'dark:border-white/[0.1] dark:bg-zinc-900/50 dark:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)]'
          )}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={slide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="absolute inset-0"
            >
              <ScreenshotSlide src={SCREENSHOT_PATHS[slide]} index={slide} />
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {SCREENSHOT_PATHS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSlide(i)}
                className={cn(
                  'h-2 rounded-full transition-all',
                  i === slide
                    ? 'w-6 bg-[#111] dark:bg-white'
                    : 'w-2 bg-black/25 hover:bg-black/40 dark:bg-white/25 dark:hover:bg-white/45'
                )}
                aria-label={`Show screenshot ${i + 1}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => goSlide(-1)}
            className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full border shadow-sm flex items-center justify-center transition-colors',
              'bg-white/95 border-black/[0.08] text-black/65 hover:text-black hover:bg-white',
              'dark:bg-zinc-800/95 dark:border-white/[0.12] dark:text-white/70 dark:hover:text-white dark:hover:bg-zinc-800'
            )}
            aria-label="Previous screenshot"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => goSlide(1)}
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full border shadow-sm flex items-center justify-center transition-colors',
              'bg-white/95 border-black/[0.08] text-black/65 hover:text-black hover:bg-white',
              'dark:bg-zinc-800/95 dark:border-white/[0.12] dark:text-white/70 dark:hover:text-white dark:hover:bg-zinc-800'
            )}
            aria-label="Next screenshot"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ScreenshotSlide({ src, index }: { src: string; index: number }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-black/[0.04] to-black/[0.08] dark:from-white/[0.04] dark:to-white/[0.07] p-8 text-center">
        <p className="text-sm font-medium text-black/55 dark:text-white/55 mb-1">Screenshot {index + 1}</p>
        <p className="text-xs text-black/40 dark:text-white/40 max-w-xs">
          Add your image at{' '}
          <code className="text-black/55 dark:text-white/55 font-mono text-[11px]">public{src}</code> — it will appear
          here automatically.
        </p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`KarmaOS product screenshot ${index + 1}`}
      className="w-full h-full object-cover object-top"
      onError={() => setFailed(true)}
    />
  );
}

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
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

function MicrosoftMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path fill="#F25022" d="M1 1h10v10H1z" />
      <path fill="#00A4EF" d="M13 1h10v10H13z" />
      <path fill="#7FBA00" d="M1 13h10v10H1z" />
      <path fill="#FFB900" d="M13 13h10v10H13z" />
    </svg>
  );
}
