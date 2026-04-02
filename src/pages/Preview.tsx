import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBooks } from '@/context/BookContext';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import FlipBook from '@/components/FlipBook';

const Preview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, setCurrentProject, currentProject } = useBooks();

  useEffect(() => {
    if (id) setCurrentProject(id);
  }, [id]);

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Book not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-12 pb-4">
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft size={20} strokeWidth={1.5} className="text-foreground" />
        </button>
        <span className="text-sm font-medium text-foreground">Preview</span>
        <div className="w-9" />
      </header>

      {/* Flip Book */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <FlipBook pages={currentProject.pages} title={currentProject.title} />
      </div>

      {/* Order Button */}
      <div className="px-6 pb-8">
        <button
          onClick={() => navigate('/checkout/' + currentProject.id)}
          className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <ShoppingBag size={16} strokeWidth={1.5} />
          Order This Book
        </button>
      </div>
    </div>
  );
};

export default Preview;
