import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBooks } from '@/context/BookContext';
import {
  ArrowLeft, Eye, Users, Plus, ChevronLeft, ChevronRight,
  Trash2, Type, LayoutGrid, Settings, Check, X, Undo2, Redo2,
} from 'lucide-react';
import type { PageLayout, BookPhoto, BookPage } from '@/types/book';
import { PAPER_FINISHES, BOOK_STYLES, LAYOUT_PHOTO_COUNT } from '@/types/book';
import CollaboratePanel from '@/components/CollaboratePanel';
import PageRenderer from '@/components/PageRenderer';

// ── Layout groups ────────────────────────────────────────────────────────────

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

// ── Spread component ─────────────────────────────────────────────────────────

const Spread = ({
  leftPage,
  rightPage,
  leftIndex,
  rightIndex,
  title,
  onTap,
}: {
  leftPage: BookPage | null;
  rightPage: BookPage | null;
  leftIndex: number;
  rightIndex: number | null;
  title: string;
  onTap: (page: BookPage, index: number) => void;
}) => (
  <div className="flex-shrink-0 w-full px-4 py-3">
    <div className="flex gap-1 rounded-xl overflow-hidden book-shadow bg-white">
      {/* Left page */}
      <div className="flex-1 aspect-square relative">
        {leftPage ? (
          <button
            onClick={() => onTap(leftPage, leftIndex)}
            className="w-full h-full"
          >
            <PageRenderer page={leftPage} title={title} />
          </button>
        ) : (
          <div className="w-full h-full bg-white" />
        )}
        <div className="absolute bottom-1.5 left-0 right-0 flex justify-center pointer-events-none">
          <span className="text-[9px] text-black/25 font-medium">{leftIndex + 1}</span>
        </div>
      </div>

      {/* Spine */}
      <div className="w-px bg-black/8 self-stretch" />

      {/* Right page */}
      <div className="flex-1 aspect-square relative">
        {rightPage ? (
          <button
            onClick={() => rightIndex !== null ? onTap(rightPage, rightIndex) : undefined}
            className="w-full h-full"
          >
            <PageRenderer page={rightPage} title={title} />
          </button>
        ) : (
          <div className="w-full h-full bg-gray-50 flex items-center justify-center">
            <span className="text-[10px] text-black/20">Back cover</span>
          </div>
        )}
        {rightIndex !== null && (
          <div className="absolute bottom-1.5 left-0 right-0 flex justify-center pointer-events-none">
            <span className="text-[9px] text-black/25 font-medium">{rightIndex + 1}</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

// ── Page Edit overlay ────────────────────────────────────────────────────────

const PageEdit = ({
  page,
  pageIndex,
  totalPages,
  title,
  onClose,
  onLayoutChange,
  onCaptionSave,
  onPhotoSwap,
  onDelete,
}: {
  page: BookPage;
  pageIndex: number;
  totalPages: number;
  title: string;
  onClose: () => void;
  onLayoutChange: (layout: PageLayout) => void;
  onCaptionSave: (caption: string) => void;
  onPhotoSwap: (photoIndex: number) => void;
  onDelete: () => void;
}) => {
  const [tab, setTab] = useState<'layout' | 'caption'>('layout');
  const [caption, setCaption] = useState(page.caption || '');

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-fade-in">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-12 pb-3 border-b border-border">
        <button onClick={onClose} className="p-2">
          <X size={20} strokeWidth={1.5} className="text-foreground" />
        </button>
        <span className="text-sm font-medium text-foreground">
          Page {pageIndex + 1} of {totalPages}
        </span>
        <button
          onClick={onDelete}
          disabled={totalPages <= 1}
          className="p-2 text-destructive disabled:opacity-30"
        >
          <Trash2 size={18} strokeWidth={1.5} />
        </button>
      </header>

      {/* Page preview */}
      <div className="flex-1 flex items-center justify-center px-6 py-4 overflow-hidden">
        <div className="w-full max-w-xs aspect-square rounded-xl overflow-hidden book-shadow bg-white">
          <PageRenderer
            page={page}
            title={title}
            interactive
            onPhotoClick={onPhotoSwap}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-t border-border">
        <button
          onClick={() => setTab('layout')}
          className={`flex-1 h-10 text-xs font-medium transition-colors ${
            tab === 'layout' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
          }`}
        >
          Layout
        </button>
        <button
          onClick={() => setTab('caption')}
          className={`flex-1 h-10 text-xs font-medium transition-colors ${
            tab === 'caption' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
          }`}
        >
          Text
        </button>
      </div>

      {/* Tab content */}
      <div className="max-h-52 overflow-y-auto px-4 py-3">
        {tab === 'layout' ? (
          <div className="space-y-3">
            {LAYOUT_GROUPS.map(group => (
              <div key={group.label}>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-2">
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.layouts.map(opt => (
                    <button
                      key={opt.layout}
                      onClick={() => onLayoutChange(opt.layout)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        page.layout === opt.layout
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {opt.label}
                      {opt.slots > 0 && (
                        <span className="ml-1 opacity-50">·{opt.slots}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder={
                page.layout === 'text-only' || page.layout === 'cover'
                  ? 'Title\nSubtitle or description'
                  : 'Add a caption...'
              }
              className="w-full h-20 px-4 py-3 bg-card rounded-xl text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              autoFocus
            />
            <p className="text-[10px] text-muted-foreground mt-1.5 px-1">
              Use a new line to separate title from body text
            </p>
            <button
              onClick={() => onCaptionSave(caption)}
              className="mt-3 w-full h-10 bg-primary text-primary-foreground rounded-xl text-sm font-medium"
            >
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Editor ──────────────────────────────────────────────────────────────

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    setCurrentProject, currentProject, updatePage, removePage,
    generateShareLink, addCollaborator, updateProjectSettings,
  } = useBooks();

  const [editingPage, setEditingPage] = useState<{ page: BookPage; index: number } | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState('');
  const [showCollaborate, setShowCollaborate] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'add' | 'arrange' | 'options' | null>(null);
  const [swapPhotoIndex, setSwapPhotoIndex] = useState<number | null>(null);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);

  // Undo/redo stack (page snapshots)
  const [history, setHistory] = useState<BookPage[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const fileRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) setCurrentProject(id);
  }, [id]);

  useEffect(() => {
    if (currentProject) {
      setTitleText(currentProject.title);
    }
  }, [currentProject?.title]);

  const pushHistory = useCallback((pages: BookPage[]) => {
    setHistory(prev => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, pages.map(p => ({ ...p }))];
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  if (!currentProject || currentProject.pages.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">No pages to edit</p>
      </div>
    );
  }

  const pages = currentProject.pages;
  const totalPages = pages.length;

  // Build spreads: [0,1], [2,3], ...
  const spreads: { left: BookPage; right: BookPage | null; leftIdx: number; rightIdx: number | null }[] = [];
  for (let i = 0; i < totalPages; i += 2) {
    spreads.push({
      left: pages[i],
      right: pages[i + 1] || null,
      leftIdx: i,
      rightIdx: pages[i + 1] ? i + 1 : null,
    });
  }

  const handlePageTap = (page: BookPage, index: number) => {
    setEditingPage({ page, index });
    setEditingPageId(page.id);
  };

  const handleLayoutChange = (layout: PageLayout) => {
    if (!editingPage) return;
    pushHistory(pages);
    updatePage(editingPage.page.id, { layout });
    setEditingPage(prev => prev ? { ...prev, page: { ...prev.page, layout } } : null);
  };

  const handleCaptionSave = (caption: string) => {
    if (!editingPage) return;
    pushHistory(pages);
    updatePage(editingPage.page.id, { caption });
    setEditingPage(prev => prev ? { ...prev, page: { ...prev.page, caption } } : null);
  };

  const handlePhotoSwap = (photoIndex: number) => {
    setSwapPhotoIndex(photoIndex);
    fileRef.current?.click();
  };

  const handleFileChange = (files: FileList | null) => {
    if (!files || !files[0] || swapPhotoIndex === null || !editingPage) return;
    const newPhoto: BookPhoto = {
      id: Math.random().toString(36).substring(2, 10),
      url: URL.createObjectURL(files[0]),
      file: files[0],
    };
    const newPhotos = [...editingPage.page.photos];
    newPhotos[swapPhotoIndex] = newPhoto;
    pushHistory(pages);
    updatePage(editingPage.page.id, { photos: newPhotos });
    setEditingPage(prev => prev ? { ...prev, page: { ...prev.page, photos: newPhotos } } : null);
    setSwapPhotoIndex(null);
  };

  const handleDeletePage = () => {
    if (!editingPage || totalPages <= 1) return;
    pushHistory(pages);
    removePage(editingPage.page.id);
    setEditingPage(null);
  };

  const handleTitleSave = () => {
    updateProjectSettings({ title: titleText } as Parameters<typeof updateProjectSettings>[0]);
    setEditingTitle(false);
  };

  const canUndo = historyIndex >= 0;
  const canRedo = false; // simplified — extend if needed

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => handleFileChange(e.target.files)}
      />

      {/* Page edit overlay */}
      {editingPage && (
        <PageEdit
          page={editingPage.page}
          pageIndex={editingPage.index}
          totalPages={totalPages}
          title={currentProject.title}
          onClose={() => setEditingPage(null)}
          onLayoutChange={handleLayoutChange}
          onCaptionSave={handleCaptionSave}
          onPhotoSwap={handlePhotoSwap}
          onDelete={handleDeletePage}
        />
      )}

      {/* Top bar */}
      <header className="flex items-center justify-between px-4 pt-12 pb-3 bg-background">
        <button onClick={() => navigate('/home')} className="p-2">
          <ArrowLeft size={20} strokeWidth={1.5} className="text-foreground" />
        </button>

        {/* Title */}
        {editingTitle ? (
          <input
            ref={titleRef}
            value={titleText}
            onChange={e => setTitleText(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={e => e.key === 'Enter' && handleTitleSave()}
            className="flex-1 mx-2 text-sm font-medium text-center bg-transparent border-b border-primary focus:outline-none"
            autoFocus
          />
        ) : (
          <button
            onClick={() => { setEditingTitle(true); setTitleText(currentProject.title); }}
            className="flex-1 mx-2 text-sm font-medium text-foreground text-center truncate"
          >
            {currentProject.title}
          </button>
        )}

        <div className="flex items-center gap-1">
          {canUndo && (
            <button className="p-2 text-muted-foreground">
              <Undo2 size={16} strokeWidth={1.5} />
            </button>
          )}
          <button onClick={() => navigate('/preview/' + currentProject.id)} className="p-2">
            <Eye size={18} strokeWidth={1.5} className="text-foreground" />
          </button>
          <button onClick={() => setShowCollaborate(!showCollaborate)} className="p-2">
            <Users size={18} strokeWidth={1.5} className="text-foreground" />
          </button>
        </div>
      </header>

      {/* Page count label */}
      <div className="text-center pb-1">
        <span className="text-[11px] text-muted-foreground">{totalPages} pages</span>
      </div>

      {/* Collaborate panel */}
      {showCollaborate && (
        <div className="px-6 mb-3 animate-fade-in">
          <CollaboratePanel
            shareLink={currentProject.shareLink}
            collaborators={currentProject.collaborators || []}
            onGenerateLink={() => generateShareLink(currentProject.id)}
            onAddCollaborator={addCollaborator}
          />
        </div>
      )}

      {/* Scrollable spreads */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto pb-4">
        {spreads.map((spread, si) => (
          <Spread
            key={si}
            leftPage={spread.left}
            rightPage={spread.right}
            leftIndex={spread.leftIdx}
            rightIndex={spread.rightIdx}
            title={currentProject.title}
            onTap={handlePageTap}
          />
        ))}
      </div>

      {/* Options panel (settings) */}
      {activeTab === 'options' && (
        <div className="border-t border-border px-4 py-4 space-y-4 bg-background animate-slide-up">
          {/* Paper finish */}
          <div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-2">Paper Finish</p>
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

          {/* Book style */}
          <div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-2">Style</p>
            <div className="grid grid-cols-3 gap-2">
              {BOOK_STYLES.map(s => (
                <button
                  key={s.value}
                  onClick={() => updateProjectSettings({ style: s.value })}
                  className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                    currentProject.style === s.value
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
        </div>
      )}

      {/* Bottom bar */}
      <div className="border-t border-border bg-background safe-bottom">
        <div className="flex items-center justify-around h-14 max-w-lg mx-auto px-4">
          <button
            onClick={() => setActiveTab(activeTab === 'add' ? null : 'add')}
            className={`flex flex-col items-center gap-0.5 transition-colors ${
              activeTab === 'add' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Plus size={18} strokeWidth={1.5} />
            <span className="text-[10px]">Add</span>
          </button>

          <button
            className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <LayoutGrid size={18} strokeWidth={1.5} />
            <span className="text-[10px]">Arrange</span>
          </button>

          <button
            onClick={() => setActiveTab(activeTab === 'options' ? null : 'options')}
            className={`flex flex-col items-center gap-0.5 transition-colors ${
              activeTab === 'options' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Settings size={18} strokeWidth={1.5} />
            <span className="text-[10px]">Options</span>
          </button>

          <button
            onClick={() => navigate('/preview/' + currentProject.id)}
            className="h-9 px-5 bg-primary text-primary-foreground rounded-full text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default Editor;
