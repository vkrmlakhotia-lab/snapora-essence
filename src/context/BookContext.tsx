import React, { createContext, useContext, useState, useEffect } from 'react';
import type { BookProject, BookPage, BookPhoto, PageLayout } from '@/types/book';

interface BookContextType {
  projects: BookProject[];
  currentProject: BookProject | null;
  createProject: (title: string, photos: BookPhoto[]) => BookProject;
  setCurrentProject: (id: string) => void;
  updatePage: (pageId: string, updates: Partial<BookPage>) => void;
  addPage: (page: BookPage) => void;
  removePage: (pageId: string) => void;
  reorderPages: (fromIndex: number, toIndex: number) => void;
  updateProjectTitle: (title: string) => void;
  deleteProject: (id: string) => void;
  markOrdered: (id: string) => void;
  clearCurrentProject: () => void;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substring(2, 10);

function autoLayout(photos: BookPhoto[]): BookPage[] {
  const pages: BookPage[] = [];
  let i = 0;
  const layouts: PageLayout[] = ['1-up', '2-up', '3-up', '2-up', '1-up'];
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

  const createProject = (title: string, photos: BookPhoto[]): BookProject => {
    const project: BookProject = {
      id: generateId(),
      title,
      coverPhoto: photos[0]?.url,
      pages: autoLayout(photos),
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (currentProject?.id === id) setCurrentProjectState(null);
  };

  const markOrdered = (id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status: 'ordered' as const } : p));
  };

  const clearCurrentProject = () => setCurrentProjectState(null);

  return (
    <BookContext.Provider value={{
      projects, currentProject, createProject, setCurrentProject,
      updatePage, addPage, removePage, reorderPages,
      updateProjectTitle, deleteProject, markOrdered, clearCurrentProject,
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
