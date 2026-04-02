import React, { createContext, useContext, useState, useEffect } from 'react';
import type { BookProject, BookPage, BookPhoto, PageLayout, PaperFinish, BookStyle, Collaborator } from '@/types/book';

interface BookContextType {
  projects: BookProject[];
  currentProject: BookProject | null;
  createProject: (title: string, photos: BookPhoto[], options?: { style?: BookStyle; paperFinish?: PaperFinish; aiPrompt?: string }) => BookProject;
  setCurrentProject: (id: string) => void;
  updatePage: (pageId: string, updates: Partial<BookPage>) => void;
  addPage: (page: BookPage) => void;
  removePage: (pageId: string) => void;
  reorderPages: (fromIndex: number, toIndex: number) => void;
  updateProjectTitle: (title: string) => void;
  updateProjectSettings: (updates: Partial<BookProject>) => void;
  deleteProject: (id: string) => void;
  markOrdered: (id: string) => void;
  clearCurrentProject: () => void;
  generateShareLink: (id: string) => string;
  addCollaborator: (name: string, email: string) => void;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substring(2, 10);

function autoLayout(photos: BookPhoto[], style?: BookStyle): BookPage[] {
  const pages: BookPage[] = [];
  let i = 0;

  // Style-specific layout patterns
  const layoutPatterns: Record<string, PageLayout[]> = {
    classic: ['1-up', '2-up', '3-up', '2-up', '1-up'],
    minimal: ['1-up', '1-up', '2-up', '1-up'],
    wedding: ['1-up', '2-up', '1-up', '2-up'],
    baby: ['1-up', '3-up', '2-up', '3-up', '1-up'],
    yearbook: ['3-up', '2-up', '3-up', '2-up'],
    travel: ['1-up', '1-up', '2-up', '3-up', '1-up'],
  };

  const layouts = layoutPatterns[style || 'classic'] || layoutPatterns.classic;
  let layoutIdx = 0;

  while (i < photos.length) {
    const layout = layouts[layoutIdx % layouts.length];
    const count = layout === '1-up' ? 1 : layout === '2-up' ? 2 : 3;
    const pagePhotos = photos.slice(i, i + count);
    pages.push({
      id: generateId(),
      layout: pagePhotos.length === 1 ? '1-up' : pagePhotos.length === 2 ? '2-up' : '3-up',
      photos: pagePhotos,
      caption: '',
    });
    i += count;
    layoutIdx++;
  }

  return pages;
}

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<BookProject[]>(() => {
    const stored = localStorage.getItem('snaporia_projects');
    return stored ? JSON.parse(stored) : [];
  });
  const [currentProject, setCurrentProjectState] = useState<BookProject | null>(null);

  useEffect(() => {
    localStorage.setItem('snaporia_projects', JSON.stringify(projects));
  }, [projects]);

  const createProject = (title: string, photos: BookPhoto[], options?: { style?: BookStyle; paperFinish?: PaperFinish; aiPrompt?: string }): BookProject => {
    const project: BookProject = {
      id: generateId(),
      title,
      coverPhoto: photos[0]?.url,
      pages: autoLayout(photos, options?.style),
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paperFinish: options?.paperFinish || 'matte',
      style: options?.style || 'classic',
      aiPrompt: options?.aiPrompt,
      collaborators: [],
    };
    setProjects(prev => [project, ...prev]);
    setCurrentProjectState(project);
    return project;
  };

  const setCurrentProject = (id: string) => {
    const p = projects.find(p => p.id === id);
    if (p) setCurrentProjectState(p);
  };

  const updateCurrentAndSave = (updater: (p: BookProject) => BookProject) => {
    if (!currentProject) return;
    const updated = updater({ ...currentProject, updatedAt: new Date().toISOString() });
    setCurrentProjectState(updated);
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const updatePage = (pageId: string, updates: Partial<BookPage>) => {
    updateCurrentAndSave(p => ({
      ...p,
      pages: p.pages.map(pg => pg.id === pageId ? { ...pg, ...updates } : pg),
    }));
  };

  const addPage = (page: BookPage) => {
    updateCurrentAndSave(p => ({ ...p, pages: [...p.pages, page] }));
  };

  const removePage = (pageId: string) => {
    updateCurrentAndSave(p => ({ ...p, pages: p.pages.filter(pg => pg.id !== pageId) }));
  };

  const reorderPages = (fromIndex: number, toIndex: number) => {
    updateCurrentAndSave(p => {
      const pages = [...p.pages];
      const [moved] = pages.splice(fromIndex, 1);
      pages.splice(toIndex, 0, moved);
      return { ...p, pages };
    });
  };

  const updateProjectTitle = (title: string) => {
    updateCurrentAndSave(p => ({ ...p, title }));
  };

  const updateProjectSettings = (updates: Partial<BookProject>) => {
    updateCurrentAndSave(p => ({ ...p, ...updates }));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (currentProject?.id === id) setCurrentProjectState(null);
  };

  const markOrdered = (id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status: 'ordered' as const } : p));
  };

  const generateShareLink = (id: string): string => {
    const link = `https://snaporia.app/collab/${id}`;
    setProjects(prev => prev.map(p => p.id === id ? { ...p, shareLink: link } : p));
    return link;
  };

  const addCollaborator = (name: string, email: string) => {
    updateCurrentAndSave(p => ({
      ...p,
      collaborators: [...(p.collaborators || []), {
        id: generateId(),
        name,
        email,
        photosAdded: 0,
        joinedAt: new Date().toISOString(),
      }],
    }));
  };

  const clearCurrentProject = () => setCurrentProjectState(null);

  return (
    <BookContext.Provider value={{
      projects, currentProject, createProject, setCurrentProject,
      updatePage, addPage, removePage, reorderPages,
      updateProjectTitle, updateProjectSettings, deleteProject,
      markOrdered, clearCurrentProject, generateShareLink, addCollaborator,
    }}>
      {children}
    </BookContext.Provider>
  );
};

export const useBooks = () => {
  const ctx = useContext(BookContext);
  if (!ctx) throw new Error('useBooks must be used within BookProvider');
  return ctx;
};
