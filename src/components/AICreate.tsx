import { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { AI_PROMPTS } from '@/types/book';

interface AICreateProps {
  onGenerate: (prompt: string) => void;
}

const AICreate = ({ onGenerate }: AICreateProps) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = (prompt: string) => {
    setIsGenerating(true);
    // Simulate AI processing
    setTimeout(() => {
      onGenerate(prompt);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={16} strokeWidth={1.5} className="text-primary" />
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">AI Prompt-to-Create</p>
      </div>

      {/* Custom prompt */}
      <div className="relative">
        <input
          type="text"
          value={customPrompt}
          onChange={e => setCustomPrompt(e.target.value)}
          placeholder="Describe your dream photobook..."
          className="w-full h-12 px-4 pr-12 bg-card rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          onClick={() => customPrompt && handleGenerate(customPrompt)}
          disabled={!customPrompt || isGenerating}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-lg flex items-center justify-center disabled:opacity-30"
        >
          <ArrowRight size={14} className="text-primary-foreground" />
        </button>
      </div>

      {/* Preset prompts */}
      <div className="space-y-2">
        <p className="text-[11px] text-muted-foreground">Or try a suggestion:</p>
        <div className="flex flex-wrap gap-2">
          {AI_PROMPTS.map(({ prompt, label }) => (
            <button
              key={label}
              onClick={() => handleGenerate(prompt)}
              disabled={isGenerating}
              className="px-3 py-1.5 bg-card rounded-full text-xs font-medium text-foreground card-shadow hover:bg-accent transition-colors disabled:opacity-50"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {isGenerating && (
        <div className="flex items-center justify-center gap-2 py-4 animate-fade-in">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <p className="text-xs text-muted-foreground">AI is designing your book...</p>
        </div>
      )}
    </div>
  );
};

export default AICreate;
