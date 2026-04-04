import { useNavigate } from 'react-router-dom';
import { useBooks } from '@/context/BookContext';
import { BookOpen, MoreHorizontal, Trash2, RotateCcw } from 'lucide-react';
import { useState } from 'react';

const Creations = () => {
  const { projects, deleteProject } = useBooks();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const statusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-muted text-muted-foreground';
      case 'completed': return 'bg-primary/10 text-primary';
      case 'ordered': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-6 pt-14 pb-6">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Creations</h1>
        <p className="text-sm text-muted-foreground mt-1">All your photobook projects</p>
      </header>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center pt-20 px-8 animate-fade-in">
          <BookOpen size={32} strokeWidth={1.2} className="text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">No creations yet</p>
        </div>
      ) : (
        <div className="px-6 space-y-3">
          {projects.map(project => (
            <div
              key={project.id}
              className="bg-card rounded-xl p-4 card-shadow flex items-center gap-4 animate-fade-in relative"
            >
              <button
                onClick={() => navigate(project.status === 'ordered' ? '/preview/' + project.id : '/editor/' + project.id)}
                className="flex items-center gap-4 flex-1 text-left"
              >
                <div className="w-20 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {project.coverPhoto ? (
                    <img src={project.coverPhoto} alt={project.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <BookOpen size={18} strokeWidth={1.2} className="text-primary" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{project.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{project.pages.length} pages</p>
                  <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-1 ${statusColor(project.status)}`}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </span>
                </div>
              </button>

              <button
                onClick={() => setMenuOpen(menuOpen === project.id ? null : project.id)}
                className="p-2 text-muted-foreground"
              >
                <MoreHorizontal size={18} strokeWidth={1.5} />
              </button>

              {menuOpen === project.id && (
                <div className="absolute right-4 top-14 bg-background rounded-xl card-shadow border border-border p-1 z-10 animate-scale-in">
                  {project.status === 'ordered' && (
                    <button
                      onClick={() => { navigate('/checkout/' + project.id); setMenuOpen(null); }}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted rounded-lg w-full"
                    >
                      <RotateCcw size={14} strokeWidth={1.5} /> Reorder
                    </button>
                  )}
                  <button
                    onClick={() => { deleteProject(project.id); setMenuOpen(null); }}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 rounded-lg w-full"
                  >
                    <Trash2 size={14} strokeWidth={1.5} /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Creations;
