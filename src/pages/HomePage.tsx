import { useNavigate } from 'react-router-dom';
import { useBooks } from '@/context/BookContext';
import { Plus, BookOpen } from 'lucide-react';

const HomePage = () => {
  const { projects } = useBooks();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="px-6 pt-14 pb-6">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Your Books</h1>
        <p className="text-sm text-muted-foreground mt-1">Create and manage your photobooks</p>
      </header>

      {projects.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center px-8 pt-20 animate-fade-in">
          <div className="w-20 h-20 bg-card rounded-2xl flex items-center justify-center mb-6 card-shadow">
            <BookOpen size={32} strokeWidth={1.2} className="text-muted-foreground" />
          </div>
          <h2 className="text-lg font-medium text-foreground mb-2">No books yet</h2>
          <p className="text-sm text-muted-foreground text-center max-w-[260px] mb-8">
            Create your first masterpiece from your favorite photos
          </p>
          <button
            onClick={() => navigate('/create')}
            className="h-12 px-8 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Create a Photobook
          </button>
        </div>
      ) : (
        /* Projects Grid */
        <div className="px-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Create New */}
            <button
              onClick={() => navigate('/create')}
              className="aspect-square bg-card rounded-xl border border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-primary/30 transition-colors"
            >
              <Plus size={24} strokeWidth={1.5} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">New Book</span>
            </button>

            {projects.map((project, i) => (
              <button
                key={project.id}
                onClick={() => {
                  navigate('/editor/' + project.id);
                }}
                className="animate-fade-in aspect-square bg-card rounded-xl overflow-hidden card-shadow hover:card-shadow-hover transition-shadow relative group"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {project.coverPhoto ? (
                  <img src={project.coverPhoto} alt={project.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <BookOpen size={24} strokeWidth={1.2} className="text-muted-foreground" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/60 to-transparent p-3">
                  <p className="text-background text-xs font-medium text-left truncate">{project.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-background/70 text-[10px]">{project.pages.length} pages</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      project.status === 'draft' ? 'bg-background/20 text-background/80' :
                      project.status === 'ordered' ? 'bg-primary text-primary-foreground' :
                      'bg-background/30 text-background'
                    }`}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
