import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Splash screen shown on every cold launch (screen 01)
const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [splashDone, setSplashDone] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Navigate when video ends (or after fallback timeout if video fails)
  useEffect(() => {
    const fallback = setTimeout(() => setSplashDone(true), 5000);
    return () => clearTimeout(fallback);
  }, []);

  useEffect(() => {
    if (!splashDone || isLoading) return;
    navigate(isAuthenticated ? '/home' : '/onboarding', { replace: true });
  }, [splashDone, isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <video
        ref={videoRef}
        src="/tangible-splash-v6.mp4"
        autoPlay
        muted
        playsInline
        onEnded={() => setSplashDone(true)}
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
};

export default Index;
