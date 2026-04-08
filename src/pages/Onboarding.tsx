import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Slide data for the welcome carousel (screens 02 onwards)
const SLIDES = [
  {
    emoji: '📷',
    headline: 'Turn your photos into\na beautiful photo book',
    body: 'Snapora picks your best shots, arranges them into a gorgeous book, and ships it to your door.',
  },
  {
    emoji: '✨',
    headline: 'AI selects your\nbest moments',
    body: 'We analyse your library, remove duplicates and blurry shots, and curate the photos that matter most.',
  },
  {
    emoji: '📦',
    headline: 'Delivered to\nyour door',
    body: 'Premium print quality, delivered in 5–7 working days. From £24.',
  },
];

const Onboarding = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [slideIndex, setSlideIndex] = useState(0);
  const [showAuth, setShowAuth] = useState(false);

  const handleSignIn = (provider: 'google' | 'apple') => {
    signIn(provider);
  };

  // ── Sign In screen (03) ────────────────────────────────────────────────────
  if (showAuth) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center px-6">
        {/* Logo */}
        <div className="mt-[100px] w-16 h-16 bg-[#2eccb2] rounded-[16px] flex items-center justify-center mb-5">
          <span className="text-white text-[32px] font-bold leading-none">S</span>
        </div>

        <h1 className="text-[24px] font-semibold text-[#1a1a1a] text-center">Welcome to Snapora</h1>
        <p className="text-[13px] text-[#999] text-center mt-2">Sign in to save your books and order prints</p>

        <div className="w-full mt-[80px] space-y-3">
          {/* Apple */}
          <button
            onClick={() => handleSignIn('apple')}
            className="w-full h-[50px] bg-[#666] text-white rounded-[12px] font-medium text-[15px] flex items-center justify-center gap-3 hover:opacity-90 transition-opacity"
          >
            <svg width="17" height="20" viewBox="0 0 17 20" fill="currentColor">
              <path d="M14.09 10.53c-.02-2.1 1.71-3.11 1.79-3.16-0.97-1.42-2.49-1.61-3.03-1.64-1.3-.13-2.53.76-3.19.76-.66 0-1.68-.74-2.77-.72C5.3 5.79 3.72 6.64 2.86 8.04c-1.74 3-.45 7.44 1.25 9.88.83 1.19 1.82 2.52 3.11 2.47 1.25-.05 1.72-.8 3.23-.8 1.5 0 1.93.8 3.24.77 1.34-.02 2.19-1.21 3.01-2.41a10.6 10.6 0 0 0 1.37-2.77c-.03-.01-2.63-1.01-2.65-4.01l-.03.36zM12.06 3.3c.69-.84 1.16-2 1.03-3.17-1 .04-2.2.67-2.91 1.5-.64.74-1.2 1.92-1.05 3.05 1.11.09 2.24-.56 2.93-1.38z"/>
            </svg>
            Continue with Apple
          </button>

          {/* Google */}
          <button
            onClick={() => handleSignIn('google')}
            className="w-full h-[50px] bg-white text-[#1a1a1a] border border-[#d9d9d9] rounded-[12px] font-medium text-[15px] flex items-center justify-center gap-3 hover:opacity-90 transition-opacity"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <p className="text-[11px] text-[#999] text-center mt-6 max-w-[300px] leading-relaxed">
          By continuing you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    );
  }

  // ── Welcome carousel (02) ─────────────────────────────────────────────────
  const slide = SLIDES[slideIndex];
  const isLast = slideIndex === SLIDES.length - 1;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero area */}
      <div className="bg-[#f7f7f7] h-[420px] flex items-center justify-center flex-shrink-0">
        <div className="w-[270px] h-[270px] bg-[#d9d9d9] rounded-[20px] flex items-center justify-center">
          <span className="text-[80px]">{slide.emoji}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 pt-8">
        <h1 className="text-[26px] font-semibold text-[#1a1a1a] leading-tight whitespace-pre-line">
          {slide.headline}
        </h1>
        <p className="text-[14px] text-[#999] mt-4 leading-relaxed">{slide.body}</p>

        <div className="flex-1" />

        {/* Page dots */}
        <div className="flex justify-center gap-2 mb-5">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all ${
                i === slideIndex ? 'w-5 h-2 bg-[#007aff]' : 'w-2 h-2 bg-[#d9d9d9]'
              }`}
            />
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => isLast ? setShowAuth(true) : setSlideIndex(i => i + 1)}
          className="w-full h-[50px] bg-[#007aff] text-white rounded-[12px] font-medium text-[16px] mb-4 hover:opacity-90 transition-opacity"
        >
          {isLast ? 'Get Started' : 'Next'}
        </button>

        {/* Sign in link */}
        <button
          onClick={() => setShowAuth(true)}
          className="text-center text-[13px] text-[#007aff] mb-8"
        >
          Already have an account? Sign in
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
