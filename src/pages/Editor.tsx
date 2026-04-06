import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBooks } from '@/context/BookContext';
import { ChevronLeft, ChevronRight, Eye, Type, LayoutGrid, Trash2, ArrowLeft, Users, Settings } from 'lucide-react';
import type { PageLayout, BookPhoto } from '@/types/book';
import { PAPER_FINISHES, LAYOUT_PHOTO_COUNT } from '@/types/book';
import CollaboratePanel from '@/components/CollaboratePanel';
import PageRenderer from '@/components/PageRenderer';

// Grouped layout options for the picker
const LAYOUT_GROUPS: { label: string; layouts: { layout: PageLayout; label: string; slots: number }[] }[] = [
  {
    label: 'Photos Only',
    layouts: [
      { layout: 'full-bleed', label: 'Full Bleed', slots: 1 },
      { layout: 'single-bordered', label: 'Bordered', slots: 1 },
      { layout: 'two-stacked', label: '2 Stacked', slots: 2 },
      { layout: 'two-side', label: '2 Side', slots: 2 },
      { layout: 'three-mixed', label: '3 Mixed', slots: 3 },
      { layout: 'four-grid', label: '4 Grid', slots: 4 },
      { layout: 'five-collage', label: '5 Collage', slots: 5 },
    ],
  },
  {
    label: 'Photos & Text',
    layouts: [
      { layout: 'photo-caption-below', label: 'Caption Below', slots: 1 },
      { layout: 'photo-caption-above', label: 'Title Above', slots: 1 },
      { layout: 'text-left-photo-right', label: 'Text + Photo', slots: 1 },
      { layout: 'photo-left-text-right', label: 'Photo + Text', slots: 1 },
    ],
  },
  {
    label: 'Special',
    layouts: [
      { layout: 'text-only', label: 'Text Only', slots: 0 },
      { layout: 'cover', label: 'Cover', slots: 1 },
    ],
  },
];

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    setCurrentProject, currentProject, updatePage, removePage,
    generateShareLink, addCollaborator, updateProjectSettings,
  } = useBooks();
  const [pageIndex, setPageIndex] = useState(0);
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);
  const [editingCaption, setEditingCaption] = useState(false);
  const [captionText, setCaptionText] = useState('');
  const [showCollaborate, setShowCollaborate] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [swapPhotoIndex, setSwapPhotoIndex] = useState<number | null>(null);

  useEffect(() => {
    if (id) setCurrentProject(id);
  }, [id]);

  if (!currentProject || currentProject.pages.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">No pages to edit</p>
      </div>
    );
  }

  const page = currentProject.pages[pageIndex];
  const totalPages = currentProject.pages.length;

  const handleLayoutChange = (layout: PageLayout) => {
    updatePage(page.id, { layout });
    setShowLayoutPicker(false);
  };

  const handleCaptionSave = () => {
    updatePage(page.id, { caption: captionText });
    setEditingCaption(false);
  };

  const handlePhotoSwap = (files: FileList | null) => {
    if (!files || !files[0] || swapPhotoIndex === null) return;
    const newPhoto: BookPhoto = {
      id: Math.random().toString(36).substring(2, 10),
      url: URL.createObjectURL(files[0]),
      file: files[0],
    };
    const newPhotos = [...page.photos];
    newPhotos[swapPhotoIndex] = newPhoto;
    updatePage(page.id, { photos: newPhotos });
    setSwapPhotoIndex(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => handlePhotoSwap(e.target.files)}
      />

      {/* Top bar */}
      <header className="flex items-center justify-between px-4 pt-12 pb-4">
        <button onClick={() => navigate('/home')} className="p-2">
          <ArrowLeft size={20} strokeWidth={1.5} className="text-foreground" />
        </button>
        <span className="text-sm font-medium text-foreground">{currentProject.title}</span>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowCollaborate(!showCollaborate)} className="p-2">
            <Users size={18} strokeWidth={1.5} className="text-foreground" />
          </button>
          <button onClick={() => navigate('/preview/' + currentProject.id)} className="p-2">
            <Eye size={18} strokeWidth={1.5} className="text-foreground" />
          </button>
        </div>
      </header>

      {/* Collaborate Panel */}
      {showCollaborate && (
        <div className="px-6 mb-4 animate-fade-in">
          <CollaboratePanel
            shareLink={currentProject.shareLink}
            collaborators={currentProject.collaborators || []}
            onGenerateLink={() => generateShareLink(currentProject.id)}
            onAddCollaborator={addCollaborator}
          />
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="px-6 mb-4 animate-fade-in space-y-3">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Paper Finish</p>
          <div className="flex gap-2">
            {PAPER_FINISHES.map(f => (
              <button
                key={f.value}
                onClick={() => updateProjectSettings({ paperFinish: f.value })}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                  currentProject.paperFinish === f.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-foreground card-shadow'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Page Display */}
      <div className="flex-1 flex items-center justify-center px-6 py-4">
        <div className="w-full max-w-sm aspect-square rounded-xl overflow-hidden book-shadow bg-white">
          <PageRenderer
            page={page}
            title={currentProject.title}
            interactive
            onPhotoClick={i => {
              setSwapPhotoIndex(i);
              fileRef.current?.click();
            }}
          />
        </div>
      </div>

      {/* Caption */}
      {page.caption && !editingCaption && (
        <div className="px-6 -mt-2 mb-2">
          <p className="text-xs text-muted-foreground text-center italic truncate">{page.caption.split('\n')[0]}</p>
        </div>
      )}

      {editingCaption && (
        <div className="px-6 mb-4 animate-fade-in">
          <textarea
            value={captionText}
            onChange={e => setCaptionText(e.target.value)}
            placeholder={
              page.layout === 'text-only' || page.layout === 'cover'
                ? 'Title\nSubtitle or description'
                : page.layout === 'photo-caption-above' || page.layout === 'text-left-photo-right'
                ? 'Title\nBody text (optional)'
                : 'Add a caption...'
            }
            className="w-full h-16 px-4 py-2 bg-card rounded-lg text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
            autoFocus
            onBlur={handleCaptionSave}
          />
          <p className="text-[10px] text-muted-foreground mt-1 px-1">Use a new line to separate title from body text</p>
        </div>
      )}

      {/* Page navigation */}
      <div className="flex items-center justify-center gap-4 py-2">
        <button
          onClick={() => setPageIndex(i => Math.max(0, i - 1))}
          disabled={pageIndex === 0}
          className="p-2 text-muted-foreground disabled:opacity-30"
        >
          <ChevronLeft size={18} strokeWidth={1.5} />
        </button>
        <span className="text-xs text-muted-foreground tabular-nums">
          {pageIndex + 1} / {totalPages}
        </span>
        <button
          onClick={() => setPageIndex(i => Math.min(totalPages - 1, i + 1))}
          disabled={pageIndex === totalPages - 1}
          className="p-2 text-muted-foreground disabled:opacity-30"
        >
          <ChevronRight size={18} strokeWidth={1.5} />
        </button>
      </div>

      {/* Layout picker */}
      {showLayoutPicker && (
        <div className="px-4 pb-4 animate-slide-up max-h-64 overflow-y-auto">
          <div className="bg-card rounded-xl p-3 card-shadow space-y-3">
            {LAYOUT_GROUPS.map(group => (
              <div key={group.label}>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-2">
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.layouts.map(opt => (
                    <button
                      key={opt.layout}
                      onClick={() => handleLayoutChange(opt.layout)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        page.layout === opt.layout
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {opt.label}
                      <span className="ml-1 opacity-50">
                        {opt.slots > 0 ? `·${opt.slots}` : ''}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="border-t border-border bg-background/80 backdrop-blur-xl">
        <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
          <button
            onClick={() => { setShowLayoutPicker(!showLayoutPicker); setShowSettings(false); }}
            className={`flex flex-col items-center gap-0.5 transition-colors ${showLayoutPicker ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <LayoutGrid size={18} strokeWidth={1.5} />
            <span className="text-[10px]">Layout</span>
          </button>
          <button
            onClick={() => { setCaptionText(page.caption || ''); setEditingCaption(true); setShowLayoutPicker(false); setShowSettings(false); }}
            className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Type size={18} strokeWidth={1.5} />
            <span className="text-[10px]">Caption</span>
          </button>
          <button
            onClick={() => { setShowSettings(!showSettings); setShowLayoutPicker(false); }}
            className={`flex flex-col items-center gap-0.5 transition-colors ${showSettings ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Settings size={18} strokeWidth={1.5} />
            <span className="text-[10px]">Finish</span>
          </button>
          <button
            onClick={() => {
              if (totalPages > 1) {
                removePage(page.id);
                setPageIndex(i => Math.max(0, i - 1));
              }
            }}
            disabled={totalPages <= 1}
            className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors"
          >
            <Trash2 size={18} strokeWidth={1.5} />
            <span className="text-[10px]">Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Editor;
