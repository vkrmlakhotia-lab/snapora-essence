import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooks } from '@/context/BookContext';
import { Upload, X, ArrowRight, Image as ImageIcon, Sparkles, ChevronDown } from 'lucide-react';
import type { BookPhoto, PaperFinish, BookStyle } from '@/types/book';
import { PAPER_FINISHES, BOOK_STYLES } from '@/types/book';
import CloudImport from '@/components/CloudImport';
import AICreate from '@/components/AICreate';
import SmartCuration from '@/components/SmartCuration';

type SourceTab = 'device' | 'cloud' | 'ai';

const CreateBook = () => {
  const [photos, setPhotos] = useState<BookPhoto[]>([]);
  const [title, setTitle] = useState('My Photobook');
  const [sourceTab, setSourceTab] = useState<SourceTab>('device');
  const [paperFinish, setPaperFinish] = useState<PaperFinish>('matte');
  const [bookStyle, setBookStyle] = useState<BookStyle>('classic');
  const [showOptions, setShowOptions] = useState(false);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);
  const { createProject } = useBooks();
  const navigate = useNavigate();

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newPhotos: BookPhoto[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substring(2, 10),
      url: URL.createObjectURL(file),
      file,
    }));
    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const handleCloudImport = (cloudPhotos: { id: string; url: string }[]) => {
    const newPhotos: BookPhoto[] = cloudPhotos.map(p => ({ ...p }));
    setPhotos(prev => [...prev, ...newPhotos]);
    setSourceTab('device'); // Switch back to show photos
  };

  const handleAIGenerate = (prompt: string) => {
    // Mock: create project with AI prompt and mock photos
    const mockPhotos: BookPhoto[] = [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=400&h=400&fit=crop',
    ].map(url => ({ id: Math.random().toString(36).substring(2, 10), url }));

    const style = prompt.toLowerCase().includes('wedding') ? 'wedding' as BookStyle
      : prompt.toLowerCase().includes('baby') ? 'baby' as BookStyle
      : prompt.toLowerCase().includes('travel') ? 'travel' as BookStyle
      : 'minimal' as BookStyle;

    const project = createProject(
      prompt.split(' ').slice(0, 3).join(' '),
      mockPhotos,
      { style, paperFinish, aiPrompt: prompt }
    );
    navigate('/editor/' + project.id);
  };

  const removePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const toggleHide = (id: string) => {
    setHiddenIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleCreate = () => {
    const visiblePhotos = photos.filter(p => !hiddenIds.has(p.id));
    if (visiblePhotos.length === 0) return;
    const project = createProject(title, visiblePhotos, { style: bookStyle, paperFinish });
    navigate('/editor/' + project.id);
  };

  const visibleCount = photos.filter(p => !hiddenIds.has(p.id)).length;

  return (
    <div className="min-h-screen bg-background pb-24">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />

      {/* Header */}
      <header className="px-6 pt-14 pb-4">
        <button onClick={() => navigate(-1)} className="text-sm text-muted-foreground mb-4">
          ← Back
        </button>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">New Book</h1>
      </header>

      {/* Title Input */}
      <div className="px-6 mb-4">
        <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Title</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full mt-2 h-12 px-4 bg-card rounded-xl border-0 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          placeholder="My Photobook"
        />
      </div>

      {/* Source Tabs */}
      <div className="px-6 mb-4">
        <div className="flex gap-1 bg-card rounded-xl p-1">
          {([
            { key: 'device' as SourceTab, label: 'Device' },
            { key: 'cloud' as SourceTab, label: 'Cloud' },
            { key: 'ai' as SourceTab, label: 'AI Create' },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setSourceTab(tab.key)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                sourceTab === tab.key
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Source Content */}
      {sourceTab === 'cloud' && (
        <div className="px-6 mb-6 animate-fade-in">
          <CloudImport onImport={handleCloudImport} />
        </div>
      )}

      {sourceTab === 'ai' && (
        <div className="px-6 mb-6 animate-fade-in">
          <AICreate onGenerate={handleAIGenerate} />
        </div>
      )}

      {sourceTab === 'device' && photos.length === 0 && (
        <div className="px-6 animate-fade-in">
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full aspect-[4/3] max-h-72 bg-card rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 hover:border-primary/30 transition-colors"
          >
            <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center">
              <Upload size={24} strokeWidth={1.5} className="text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Select Photos</p>
              <p className="text-xs text-muted-foreground mt-1">Choose images from your device</p>
            </div>
          </button>
        </div>
      )}

      {/* Photos selected state */}
      {photos.length > 0 && (
        <>
          {/* Photo Grid */}
          <div className="px-6 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground font-medium">
                {visibleCount} photo{visibleCount !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => fileRef.current?.click()}
                className="text-xs text-primary font-medium"
              >
                Add More
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {photos.map((photo, i) => (
                <div
                  key={photo.id}
                  className={`aspect-square rounded-lg overflow-hidden relative group animate-scale-in ${
                    hiddenIds.has(photo.id) ? 'opacity-30' : ''
                  }`}
                  style={{ animationDelay: `${i * 0.02}s` }}
                >
                  <img src={photo.url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removePhoto(photo.id)}
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-foreground/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10} className="text-background" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Smart Curation */}
          <div className="px-6 mb-4">
            <SmartCuration
              photos={photos}
              onRemove={removePhoto}
              onToggleHide={toggleHide}
              hiddenIds={hiddenIds}
            />
          </div>

          {/* Customization Options */}
          <div className="px-6 mb-4">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="flex items-center gap-2 text-xs text-primary font-medium"
            >
              Customize
              <ChevronDown size={14} className={`transition-transform ${showOptions ? 'rotate-180' : ''}`} />
            </button>

            {showOptions && (
              <div className="mt-3 space-y-4 animate-fade-in">
                {/* Book Style */}
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Style</p>
                  <div className="grid grid-cols-3 gap-2">
                    {BOOK_STYLES.map(s => (
                      <button
                        key={s.value}
                        onClick={() => setBookStyle(s.value)}
                        className={`py-2.5 rounded-lg text-xs font-medium transition-colors ${
                          bookStyle === s.value
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card text-foreground card-shadow'
                        }`}
                      >
                        <span className="block text-sm mb-0.5">{s.emoji}</span>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Paper Finish */}
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Paper Finish</p>
                  <div className="space-y-2">
                    {PAPER_FINISHES.map(f => (
                      <button
                        key={f.value}
                        onClick={() => setPaperFinish(f.value)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                          paperFinish === f.value
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card text-foreground card-shadow'
                        }`}
                      >
                        <div className="text-left">
                          <p className="text-xs font-medium">{f.label}</p>
                          <p className={`text-[10px] ${paperFinish === f.value ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {f.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="px-6 mb-4">
            <div className="bg-card rounded-xl p-4 card-shadow flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <ImageIcon size={18} strokeWidth={1.5} className="text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">
                  ~{Math.ceil(visibleCount / 2)} pages · {BOOK_STYLES.find(s => s.value === bookStyle)?.label} · {PAPER_FINISHES.find(f => f.value === paperFinish)?.label}
                </p>
              </div>
            </div>
          </div>

          {/* Create Button */}
          <div className="px-6">
            <button
              onClick={handleCreate}
              disabled={visibleCount === 0}
              className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-30"
            >
              Create Book
              <ArrowRight size={16} strokeWidth={1.5} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CreateBook;
