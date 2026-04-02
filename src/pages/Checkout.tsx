import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBooks } from '@/context/BookContext';
import { ArrowLeft, Check, Gift } from 'lucide-react';
import { PAPER_FINISHES } from '@/types/book';

const PRICE_PER_PAGE = 1.5;
const DELIVERY_FEE = 4.99;
const LAYFLAT_SURCHARGE = 3;

const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, setCurrentProject, currentProject, markOrdered, updateProjectSettings } = useBooks();
  const [step, setStep] = useState<'summary' | 'address' | 'confirmed'>('summary');
  const [address, setAddress] = useState({ name: '', line1: '', city: '', postcode: '', country: '' });
  const [giftNote, setGiftNote] = useState('');
  const [showGiftNote, setShowGiftNote] = useState(false);

  useEffect(() => {
    if (id) setCurrentProject(id);
  }, [id]);

  if (!currentProject) return null;

  const pageCount = currentProject.pages.length;
  const subtotal = pageCount * PRICE_PER_PAGE;
  const finishSurcharge = currentProject.paperFinish === 'layflat' ? LAYFLAT_SURCHARGE : 0;
  const total = subtotal + DELIVERY_FEE + finishSurcharge;
  const finishLabel = PAPER_FINISHES.find(f => f.value === currentProject.paperFinish)?.label || 'Matte';

  const handleOrder = () => {
    if (giftNote) {
      updateProjectSettings({ giftNote });
    }
    markOrdered(currentProject.id);
    setStep('confirmed');
  };

  if (step === 'confirmed') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8 animate-fade-in">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6">
          <Check size={28} strokeWidth={2} className="text-primary-foreground" />
        </div>
        <h1 className="text-xl font-semibold text-foreground mb-2">Order Confirmed!</h1>
        <p className="text-sm text-muted-foreground text-center mb-2">
          Your photobook "{currentProject.title}" is being prepared with care.
        </p>
        {giftNote && (
          <p className="text-xs text-muted-foreground text-center mb-4 italic">
            Gift note included 🎁
          </p>
        )}
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => navigate('/order-tracking')}
            className="h-10 px-6 bg-card text-foreground rounded-xl text-sm font-medium card-shadow hover:opacity-90 transition-opacity"
          >
            Track Order
          </button>
          <button
            onClick={() => navigate('/home')}
            className="h-10 px-6 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="flex items-center gap-3 px-4 pt-12 pb-4">
        <button onClick={() => step === 'address' ? setStep('summary') : navigate(-1)} className="p-2">
          <ArrowLeft size={20} strokeWidth={1.5} className="text-foreground" />
        </button>
        <span className="text-sm font-medium text-foreground">
          {step === 'summary' ? 'Order Summary' : 'Delivery Address'}
        </span>
      </header>

      {step === 'summary' ? (
        <div className="px-6 animate-fade-in">
          {/* Book summary */}
          <div className="bg-card rounded-xl p-5 card-shadow mb-4">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                {currentProject.coverPhoto ? (
                  <img src={currentProject.coverPhoto} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground text-[10px] font-medium">S</span>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">{currentProject.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{pageCount} pages · 1:1 Square</p>
                <p className="text-xs text-muted-foreground">{finishLabel} finish</p>
                {currentProject.style && currentProject.style !== 'classic' && (
                  <p className="text-xs text-muted-foreground capitalize">{currentProject.style} style</p>
                )}
              </div>
            </div>
          </div>

          {/* Collaborators */}
          {currentProject.collaborators && currentProject.collaborators.length > 0 && (
            <div className="bg-card rounded-xl p-4 card-shadow mb-4">
              <p className="text-xs text-muted-foreground font-medium mb-2">
                {currentProject.collaborators.length} contributor{currentProject.collaborators.length !== 1 ? 's' : ''}
              </p>
              <div className="flex -space-x-2">
                {currentProject.collaborators.map(c => (
                  <div key={c.id} className="w-7 h-7 bg-primary/10 rounded-full border-2 border-background flex items-center justify-center">
                    <span className="text-[10px] font-medium text-primary">{c.name[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gift Note */}
          <div className="mb-4">
            <button
              onClick={() => setShowGiftNote(!showGiftNote)}
              className="flex items-center gap-2 text-xs text-primary font-medium mb-2"
            >
              <Gift size={14} strokeWidth={1.5} />
              {showGiftNote ? 'Remove gift note' : 'Add a gift note'}
            </button>
            {showGiftNote && (
              <textarea
                value={giftNote}
                onChange={e => setGiftNote(e.target.value)}
                placeholder="Write a personal message..."
                className="w-full h-20 px-4 py-3 bg-card rounded-xl text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 animate-fade-in"
              />
            )}
          </div>

          {/* Price breakdown */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{pageCount} pages × £{PRICE_PER_PAGE.toFixed(2)}</span>
              <span className="text-foreground font-medium">£{subtotal.toFixed(2)}</span>
            </div>
            {finishSurcharge > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Lay-flat upgrade</span>
                <span className="text-foreground font-medium">£{finishSurcharge.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span className="text-foreground font-medium">£{DELIVERY_FEE.toFixed(2)}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between text-sm">
              <span className="text-foreground font-semibold">Total</span>
              <span className="text-foreground font-semibold">£{total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => setStep('address')}
            className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Continue to Delivery
          </button>
        </div>
      ) : (
        <div className="px-6 animate-fade-in">
          <div className="space-y-4 mb-8">
            {(['name', 'line1', 'city', 'postcode', 'country'] as const).map(field => (
              <div key={field}>
                <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  {field === 'line1' ? 'Address' : field === 'postcode' ? 'Postcode' : field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type="text"
                  value={address[field]}
                  onChange={e => setAddress({ ...address, [field]: e.target.value })}
                  className="w-full mt-1.5 h-12 px-4 bg-card rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <button
              onClick={handleOrder}
              className="w-full h-12 bg-foreground text-background rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
               Pay with Apple Pay
            </button>
            <button
              onClick={handleOrder}
              className="w-full h-12 bg-foreground text-background rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              Pay with Google Pay
            </button>
            <button
              onClick={handleOrder}
              className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Pay £{total.toFixed(2)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
