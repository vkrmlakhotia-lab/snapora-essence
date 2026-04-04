import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { BookPage } from '@/types/book';
import PageLayoutRenderer from '@/components/PageLayoutRenderer';

interface FlipBookProps {
  pages: BookPage[];
  title: string;
}

const FlipBook = ({ pages, title }: FlipBookProps) => {
  // Pair pages into spreads (two pages side by side)
  const spreads: [BookPage | null, BookPage | null][] = [];
  for (let i = 0; i < pages.length; i += 2) {
    spreads.push([pages[i] || null, pages[i + 1] || null]);
  }

  const [spreadIndex, setSpreadIndex] = useState(-1); // -1 = cover
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');

  const totalSpreads = spreads.length;

  const flip = (direction: 'next' | 'prev') => {
    if (isFlipping) return;
    setFlipDirection(direction);
    setIsFlipping(true);
    setTimeout(() => {
      setSpreadIndex(prev =>
        direction === 'next'
          ? Math.min(prev + 1, totalSpreads - 1)
          : Math.max(prev - 1, -1)
      );
      setIsFlipping(false);
    }, 400);
  };

  const renderSpread = () => {
    if (spreadIndex === -1) {
      // Cover spread
      return (
        <div className="w-full h-full flex rounded-lg overflow-hidden">
          {/* Front cover - left page */}
          <div className="w-1/2 bg-primary flex flex-col items-center justify-center p-6 relative">
            <h2 className="text-primary-foreground text-lg font-semibold text-center leading-snug">{title}</h2>
            <p className="text-primary-foreground/50 text-[10px] mt-2 tracking-[0.2em] uppercase">Snaporia</p>
          </div>
          {/* Inside front cover - right page */}
          <div className="w-1/2 bg-card flex items-center justify-center border-l border-border">
            <p className="text-muted-foreground/40 text-[10px] italic">Title Page</p>
          </div>
        </div>
      );
    }

    const [left, right] = spreads[spreadIndex];
    return (
      <div className="w-full h-full flex rounded-lg overflow-hidden">
        {/* Left page */}
        <div className="w-1/2 bg-card overflow-hidden relative">
          {left ? (
            <PageLayoutRenderer page={left} showCaption />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-muted-foreground/30 text-[10px]">Blank</p>
            </div>
          )}
        </div>
        {/* Spine divider */}
        <div className="w-[2px] bg-gradient-to-b from-border via-foreground/10 to-border flex-shrink-0" />
        {/* Right page */}
        <div className="w-1/2 bg-card overflow-hidden relative">
          {right ? (
            <PageLayoutRenderer page={right} showCaption />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-muted-foreground/30 text-[10px]">Blank</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Book container - A4 landscape open spread (2:√2 ≈ 2:1.414) */}
      <div className="relative w-full max-w-2xl" style={{ perspective: '1200px' }}>
        <div
          className="w-full aspect-[2/1.414] rounded-lg overflow-hidden book-shadow bg-card relative"
          style={{
            transformStyle: 'preserve-3d',
            transition: 'transform 0.4s ease-in-out',
            transform: isFlipping
              ? flipDirection === 'next'
                ? 'rotateY(-8deg) scale(0.98)'
                : 'rotateY(8deg) scale(0.98)'
              : 'rotateY(0deg) scale(1)',
          }}
        >
          {renderSpread()}

          {/* Page edge effects */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[3px] -translate-x-1/2 bg-gradient-to-r from-foreground/5 via-foreground/10 to-foreground/5 z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-l from-foreground/5 to-transparent pointer-events-none" />
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r from-foreground/5 to-transparent pointer-events-none" />
        </div>

        {/* Shadow under book */}
        <div className="w-[80%] h-4 mx-auto mt-2 bg-foreground/5 rounded-full blur-md" />
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => flip('prev')}
          disabled={spreadIndex === -1 || isFlipping}
          className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-colors"
        >
          <ChevronLeft size={20} strokeWidth={1.5} />
        </button>
        <span className="text-xs text-muted-foreground tabular-nums min-w-[100px] text-center">
          {spreadIndex === -1 ? 'Cover' : `${spreadIndex * 2 + 1}–${Math.min(spreadIndex * 2 + 2, pages.length)} of ${pages.length}`}
        </span>
        <button
          onClick={() => flip('next')}
          disabled={spreadIndex === totalSpreads - 1 || isFlipping}
          className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-colors"
        >
          <ChevronRight size={20} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};

export default FlipBook;
