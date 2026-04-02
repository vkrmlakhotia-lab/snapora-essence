import { useNavigate } from 'react-router-dom';
import { useBooks } from '@/context/BookContext';
import { ShoppingBag } from 'lucide-react';

const PRICE_PER_PAGE = 1.5;
const DELIVERY_FEE = 4.99;

const Basket = () => {
  const { projects } = useBooks();
  const navigate = useNavigate();

  const draftProjects = projects.filter(p => p.status === 'draft');

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-6 pt-14 pb-6">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Basket</h1>
        <p className="text-sm text-muted-foreground mt-1">Ready to order</p>
      </header>

      {draftProjects.length === 0 ? (
        <div className="flex flex-col items-center pt-20 px-8 animate-fade-in">
          <ShoppingBag size={32} strokeWidth={1.2} className="text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-6">Your basket is empty</p>
          <button
            onClick={() => navigate('/home')}
            className="h-10 px-6 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Browse Books
          </button>
        </div>
      ) : (
        <div className="px-6 space-y-3">
          {draftProjects.map(project => {
            const total = project.pages.length * PRICE_PER_PAGE + DELIVERY_FEE;
            return (
              <div key={project.id} className="bg-card rounded-xl p-4 card-shadow animate-fade-in">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {project.coverPhoto ? (
                      <img src={project.coverPhoto} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground text-xs font-medium">S</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{project.title}</p>
                    <p className="text-xs text-muted-foreground">{project.pages.length} pages</p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">£{total.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => navigate('/checkout/' + project.id)}
                  className="w-full mt-3 h-10 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
                >
                  Checkout
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Basket;
