import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Splash screen shown on every cold launch (screen 01)
const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [splashDone, setSplashDone] = useState(false);

  // Show splash for 1.8 s then redirect
  useEffect(() => {
    const timer = setTimeout(() => setSplashDone(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!splashDone || isLoading) return;
    navigate(isAuthenticated ? '/home' : '/onboarding', { replace: true });
  }, [splashDone, isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center animate-fade-in" style={{ backgroundColor: '#F9F6F1' }}>
      {/* Polaroid-style logo mark */}
      <div className="mb-8 animate-scale-in" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
        <svg width="52" height="56" viewBox="0 0 52 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Polaroid frame */}
          <rect x="1" y="1" width="50" height="50" rx="4" stroke="#1C2A47" strokeWidth="1.5" fill="white"/>
          {/* Photo area */}
          <rect x="7" y="7" width="38" height="30" rx="2" fill="#F0EBE3"/>
          {/* Mountain / scene icon */}
          <path d="M7 37 L18 22 L27 31 L34 24 L45 37 Z" fill="#1C2A47" opacity="0.15"/>
          <circle cx="34" cy="16" r="4" fill="#C9A96E" opacity="0.6"/>
          {/* Polaroid bottom tab */}
          <rect x="1" y="43" width="50" height="12" rx="0" fill="white" opacity="0"/>
          <line x1="1" y1="43" x2="51" y2="43" stroke="#1C2A47" strokeWidth="1" opacity="0.12"/>
          {/* Bottom dots on polaroid */}
          <circle cx="26" cy="49" r="1.5" fill="#1C2A47" opacity="0.2"/>
        </svg>
      </div>

      {/* Wordmark */}
      <h1
        className="text-[38px] tracking-tight text-[#1C2A47] animate-fade-in-up"
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontWeight: 400,
          animationDelay: '0.2s',
          opacity: 0,
          animationFillMode: 'forwards',
        }}
      >
        Snapora
      </h1>

      {/* Tagline */}
      <p
        className="text-[13px] tracking-wide mt-2 animate-fade-in-up"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 300,
          color: '#9C8C7C',
          letterSpacing: '0.04em',
          animationDelay: '0.35s',
          opacity: 0,
          animationFillMode: 'forwards',
        }}
      >
        Your memories, beautifully printed.
      </p>

      {/* Warm loading dots */}
      <div className="flex gap-2 mt-16 animate-fade-in" style={{ animationDelay: '0.6s', opacity: 0, animationFillMode: 'forwards' }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: '#C9A96E',
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Index;
