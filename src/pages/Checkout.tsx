import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBooks } from '@/context/BookContext';
import { ArrowLeft, Check } from 'lucide-react';

const PRICE_PER_PAGE = 1.5;
const DELIVERY_FEE = 4.99;

const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, setCurrentProject, currentProject, markOrdered } = useBooks();
  const [step, setStep] = useState<'summary' | 'address' | 'confirmed'>('summary');
  const [address, setAddress] = useState({ name: '', line1: '', city: '', postcode: '', country: '' });

  useEffect(() => {
    if (id) setCurrentProject(id);
  }, [id]);

  if (!currentProject) return null;

  const pageCount = currentProject.pages.length;
  const subtotal = pageCount * PRICE_PER_PAGE;
  const total = subtotal + DELIVERY_FEE;

  const handleOrder = () => {
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
        <p className="text-sm text-muted-foreground text-center mb-8">
          Your photobook "{currentProject.title}" is being prepared with care.
        </p>
        <button
          onClick={() => navigate('/home')}
          className="h-12 px-8 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
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
          <div className="bg-card rounded-xl p-5 card-shadow mb-6">
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
                <p className="text-xs text-muted-foreground">Premium matte finish</p>
              </div>
            </div>
          </div>

          {/* Price breakdown */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{pageCount} pages × £{PRICE_PER_PAGE.toFixed(2)}</span>
              <span className="text-foreground font-medium">£{subtotal.toFixed(2)}</span>
            </div>
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

          {/* Payment buttons */}
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
