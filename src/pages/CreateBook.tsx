import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooks } from '@/context/BookContext';
import { Upload, X, ArrowRight, Image as ImageIcon } from 'lucide-react';
import type { BookPhoto } from '@/types/book';

const CreateBook = () => {
  const [photos, setPhotos] = useState<BookPhoto[]>([]);
  const [title, setTitle] = useState('My Photobook');
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

  const removePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const handleCreate = () => {
    if (photos.length === 0) return;
    const project = createProject(title, photos);
    navigate('/editor/' + project.id);
  };

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

      {/* Upload Area */}
      {photos.length === 0 ? (
        <div className="px-6 animate-fade-in">
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full aspect-square max-h-80 bg-card rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 hover:border-primary/30 transition-colors"
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
      ) : (
        <>
          {/* Photo Grid */}
          <div className="px-6 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground font-medium">
                {photos.length} photo{photos.length !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => fileRef.current?.click()}
                className="text-xs text-primary font-medium"
              >
                Add More
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo, i) => (
                <div
                  key={photo.id}
                  className="aspect-square rounded-lg overflow-hidden relative group animate-scale-in"
                  style={{ animationDelay: `${i * 0.03}s` }}
                >
                  <img src={photo.url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removePhoto(photo.id)}
                    className="absolute top-1 right-1 w-6 h-6 bg-foreground/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} className="text-background" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Preview summary */}
          <div className="px-6 mb-6">
            <div className="bg-card rounded-xl p-4 card-shadow flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <ImageIcon size={18} strokeWidth={1.5} className="text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">
                  ~{Math.ceil(photos.length / 2)} pages · 1:1 Square
                </p>
              </div>
            </div>
          </div>

          {/* Create Button */}
          <div className="px-6">
            <button
              onClick={handleCreate}
              className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
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
