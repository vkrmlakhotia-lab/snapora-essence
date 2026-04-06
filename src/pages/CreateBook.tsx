import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooks } from '@/context/BookContext';
import { ArrowRight, Image as ImageIcon, ChevronDown } from 'lucide-react';
import type { BookPhoto, PaperFinish, BookStyle } from '@/types/book';
import { PAPER_FINISHES, BOOK_STYLES } from '@/types/book';
import ApplePhotosImport from '@/components/ApplePhotosImport';
import SmartCuration from '@/components/SmartCuration';

const CreateBook = () => {
  const [photos, setPhotos] = useState<BookPhoto[]>([]);
  const [title, setTitle] = useState('My Photobook');
  const [paperFinish, setPaperFinish] = useState<PaperFinish>('matte');
  const [bookStyle, setBookStyle] = useState<BookStyle>('classic');
  const [showOptions, setShowOptions] = useState(false);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ uploaded: 0, total: 0 });

  const { createProject } = useBooks();
  const navigate = useNavigate();

  const handleImport = (imported: BookPhoto[]) => {
    setPhotos(prev => {
      const existingIds = new Set(prev.map(p => p.id));
      const newPhotos = imported.filter(p => !existingIds.has(p.id));
      return [...prev, ...newPhotos];
    });
  };

  const removePhoto = (id: string) => setPhotos(prev => prev.filter(p => p.id !== id));

  const toggleHide = (id: string) => {
    setHiddenIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleCreate = async () => {
    const visiblePhotos = photos.filter(p => !hiddenIds.has(p.id));
    if (visiblePhotos.length === 0) return;
    setUploading(true);
    setUploadProgress({ uploaded: 0, total: visiblePhotos.filter(p => p.file).length });
    try {
      const project = await createProject(
        title,
        visiblePhotos,
        { style: bookStyle, paperFinish },
        (uploaded, total) => setUploadProgress({ uploaded, total })
      );
      navigate('/editor/' + project.id);
    } finally {
      setUploading(false);
    }
  };

  const visibleCount = photos.filter(p => !hiddenIds.has(p.id)).length;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="px-6 pt-14 pb-4">
        <button onClick={() => navigate(-1)} className="text-sm text-muted-foreground mb-4">
          ← Back
        </button>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">New Book</h1>
      </header>

      {/* Title */}
      <div className="px-6 mb-6">
        <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Title</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full mt-2 h-12 px-4 bg-card rounded-xl border-0 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          placeholder="My Photobook"
        />
      </div>

      {/* Apple Photos Import — always shown until photos are selected */}
      {photos.length === 0 && (
        <div className="px-6 mb-6">
          <ApplePhotosImport onImport={handleImport} />
        </div>
      )}

      {/* Photos selected state */}
      {photos.length > 0 && (
        <>
          {/* Photo grid */}
          <div className="px-6 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground font-medium">
                {visibleCount} photo{visibleCount !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => setPhotos([])}
                className="text-xs text-muted-foreground font-medium"
              >
                Change selection
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {photos.map((photo, i) => (
                <div
                  key={photo.id}
                  className={`aspect-square rounded-lg overflow-hidden relative animate-scale-in ${
                    hiddenIds.has(photo.id) ? 'opacity-30' : ''
                  }`}
                  style={{ animationDelay: `${i * 0.02}s` }}
                >
                  <img src={photo.url} alt="" className="w-full h-full object-cover" />
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

          {/* Customisation */}
          <div className="px-6 mb-4">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="flex items-center gap-2 text-xs text-primary font-medium"
            >
              Customise
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
              disabled={visibleCount === 0 || uploading}
              className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-30"
            >
              {uploading ? (
                uploadProgress.total > 0
                  ? `Uploading ${uploadProgress.uploaded}/${uploadProgress.total}…`
                  : 'Creating…'
              ) : (
                <>Create Book <ArrowRight size={16} strokeWidth={1.5} /></>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CreateBook;
