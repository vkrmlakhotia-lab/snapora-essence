import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useBooks } from '@/context/BookContext';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Check, Tag, X } from 'lucide-react';
import { PAPER_FINISHES } from '@/types/book';
import { supabase } from '@/lib/supabase';
import { GIFT_VOUCHER_AMOUNT } from './GiftFlow';

const PRICE_PER_PAGE = 1.5;
const DELIVERY_FEE = 4.99;
const LAYFLAT_SURCHARGE = 3;
const MIN_PAGES_COVERED_BY_VOUCHER = 16; // pages the £24 voucher covers

const Checkout = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, setCurrentProject, currentProject, markOrdered, updateProjectSettings } = useBooks();
  const [step, setStep] = useState<'summary' | 'gift' | 'address' | 'confirmed'>('summary');
  const [address, setAddress] = useState({ name: '', line1: '', city: '', postcode: '', country: '' });
  const [isGift, setIsGift] = useState(false);
  const [giftRecipientName, setGiftRecipientName] = useState('');
  const [giftNote, setGiftNote] = useState('');

  // Voucher state
  const [voucherInput, setVoucherInput] = useState(searchParams.get('voucher') ?? '');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; amountPence: number } | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [voucherLoading, setVoucherLoading] = useState(false);

  useEffect(() => {
    if (id) setCurrentProject(id);
  }, [id]);

  // Auto-apply voucher from URL param on mount
  useEffect(() => {
    if (searchParams.get('voucher')) applyVoucher();
  }, []);

  if (!currentProject) return null;

  const pageCount = currentProject.pages.length;
  const subtotal = pageCount * PRICE_PER_PAGE;
  const finishSurcharge = currentProject.paperFinish === 'layflat' ? LAYFLAT_SURCHARGE : 0;
  const voucherDiscount = appliedVoucher
    ? Math.min(appliedVoucher.amountPence / 100, subtotal + finishSurcharge)
    : 0;
  const total = Math.max(0, subtotal + DELIVERY_FEE + finishSurcharge - voucherDiscount);

  const applyVoucher = async () => {
    const code = voucherInput.trim().toUpperCase();
    if (!code) return;
    setVoucherLoading(true);
    setVoucherError(null);
    const { data, error } = await supabase
      .from('vouchers')
      .select('code, amount_pence, used, expires_at')
      .eq('code', code)
      .single();
    setVoucherLoading(false);
    if (error || !data) { setVoucherError('Voucher not found.'); return; }
    if (data.used) { setVoucherError('This voucher has already been used.'); return; }
    if (new Date(data.expires_at) < new Date()) { setVoucherError('This voucher has expired.'); return; }
    setAppliedVoucher({ code: data.code, amountPence: data.amount_pence });
  };

  const removeVoucher = () => { setAppliedVoucher(null); setVoucherInput(''); setVoucherError(null); };
  const finishLabel = PAPER_FINISHES.find(f => f.value === currentProject.paperFinish)?.label || 'Matte';

  const handleOrder = async () => {
    if (isGift) {
      await updateProjectSettings({ giftNote: giftNote || undefined });
    }
    const orderId = await markOrdered(currentProject.id);
    // Atomically redeem the voucher via DB function
    if (appliedVoucher && user && orderId) {
      await supabase.rpc('redeem_voucher', {
        p_code: appliedVoucher.code,
        p_user_id: user.id,
        p_order_id: orderId,
      });
    }
    setStep('confirmed');
  };

  if (step === 'confirmed') {
    const orderRef = `SN-${Date.now().toString(36).toUpperCase().slice(-8)}`;
    return (
      <div className="min-h-screen bg-white flex flex-col items-center px-6 animate-fade-in">
        {/* Green check */}
        <div className="mt-[180px] w-[80px] h-[80px] bg-[#e5faeb] rounded-[40px] flex items-center justify-center mb-7">
          <Check size={36} strokeWidth={2.5} className="text-[#33bf66]" />
        </div>

        <h1 className="text-[26px] font-semibold text-[#1a1a1a] text-center">Order Confirmed!</h1>
        <p className="text-[14px] text-[#999] text-center mt-2 leading-relaxed">
          We're printing your book now.{'\n'}Estimated delivery: 5-7 working days
        </p>

        {/* Order details card */}
        <div className="w-full mt-8 bg-[#f7f7f7] rounded-[12px] px-4 py-5">
          <p className="text-[14px] font-semibold text-[#1a1a1a]">Order #{orderRef}</p>
          <p className="text-[12px] text-[#999] mt-1">
            {currentProject.title} · {pageCount} pages{currentProject.paperFinish ? ` · ${finishLabel}` : ''}
          </p>
          <p className="text-[12px] text-[#999] mt-0.5">£{total.toFixed(2)} · Standard delivery</p>
          <div className="h-px bg-[#d9d9d9] my-3" />
          <p className="text-[12px] text-[#999]">Tracking will be emailed to you</p>
          {giftNote && (
            <p className="text-[12px] text-[#999] mt-1 italic">Gift note: "{giftNote}" 🎁</p>
          )}
        </div>

        {/* Buttons */}
        <div className="w-full mt-8 space-y-3">
          <button
            onClick={() => navigate('/order-tracking')}
            className="w-full h-[50px] bg-[#007aff] text-white rounded-[12px] font-medium text-[15px] hover:opacity-90 transition-opacity"
          >
            View My Orders
          </button>
          <button
            onClick={() => navigate('/home')}
            className="w-full h-[50px] bg-white text-[#666] border border-[#d9d9d9] rounded-[12px] font-medium text-[15px] hover:opacity-90 transition-opacity"
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
          {step === 'summary' ? 'Order Summary' : step === 'gift' ? 'Is This a Gift?' : 'Delivery Address'}
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
                <p className="text-xs text-muted-foreground mt-0.5">{pageCount} pages · A4 Landscape</p>
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

          {/* Price breakdown */}
          <div className="space-y-3 mb-4">
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
            {appliedVoucher && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <Tag size={12} strokeWidth={2} /> Voucher ({appliedVoucher.code})
                </span>
                <span className="text-green-600 font-medium">−£{voucherDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="h-px bg-border" />
            <div className="flex justify-between text-sm">
              <span className="text-foreground font-semibold">Total</span>
              <span className="text-foreground font-semibold">£{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Voucher input */}
          {!appliedVoucher ? (
            <div className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={voucherInput}
                  onChange={e => setVoucherInput(e.target.value.toUpperCase())}
                  placeholder="Voucher code (e.g. SNAP-XXXX-XXXX)"
                  className="flex-1 h-11 px-4 bg-card rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  onClick={applyVoucher}
                  disabled={voucherLoading || !voucherInput.trim()}
                  className="h-11 px-4 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  {voucherLoading ? '…' : 'Apply'}
                </button>
              </div>
              {voucherError && <p className="text-xs text-destructive mt-1.5">{voucherError}</p>}
            </div>
          ) : (
            <div className="flex items-center justify-between bg-green-50 rounded-xl px-4 py-3 mb-6">
              <div className="flex items-center gap-2">
                <Tag size={14} strokeWidth={2} className="text-green-600" />
                <div>
                  <p className="text-xs font-semibold text-green-700">{appliedVoucher.code}</p>
                  <p className="text-xs text-green-600">−£{voucherDiscount.toFixed(2)} applied</p>
                </div>
              </div>
              <button onClick={removeVoucher}>
                <X size={16} strokeWidth={2} className="text-green-600" />
              </button>
            </div>
          )}

          <button
            onClick={() => setStep('gift')}
            className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Continue
          </button>
        </div>
      ) : step === 'gift' ? (
        <div className="px-6 animate-fade-in space-y-4">
          <p className="text-xs text-muted-foreground">Choose how you'd like to send this book.</p>

          {/* For myself */}
          <button
            onClick={() => { setIsGift(false); setStep('address'); }}
            className="w-full bg-card rounded-xl p-5 card-shadow text-left flex items-start gap-4 hover:bg-accent transition-colors"
          >
            <span className="text-2xl mt-0.5">📦</span>
            <div>
              <p className="text-sm font-semibold text-foreground">For myself</p>
              <p className="text-xs text-muted-foreground mt-0.5">Deliver to my address</p>
            </div>
          </button>

          {/* As a gift */}
          <button
            onClick={() => { setIsGift(true); setStep('address'); }}
            className="w-full bg-card rounded-xl p-5 card-shadow text-left flex items-start gap-4 border-2 border-primary hover:bg-accent transition-colors relative"
          >
            <span className="absolute top-3 right-3 text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">POPULAR</span>
            <span className="text-2xl mt-0.5">🎁</span>
            <div>
              <p className="text-sm font-semibold text-foreground">Send as a gift</p>
              <p className="text-xs text-muted-foreground mt-0.5">Deliver straight to the recipient — gift note included</p>
            </div>
          </button>
        </div>

      ) : (
        <div className="px-6 animate-fade-in">
          {isGift && (
            <div className="space-y-4 mb-6 pb-6 border-b border-border">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Gift details</p>
              <div>
                <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Recipient's name</label>
                <input
                  type="text"
                  value={giftRecipientName}
                  onChange={e => setGiftRecipientName(e.target.value)}
                  placeholder="e.g. Mum, Grandma, Sarah"
                  className="w-full mt-1.5 h-12 px-4 bg-card rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Gift message (optional)</label>
                <textarea
                  value={giftNote}
                  onChange={e => setGiftNote(e.target.value)}
                  placeholder="Write a personal message..."
                  className="w-full mt-1.5 h-20 px-4 py-3 bg-card rounded-xl text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-2">Recipient's delivery address</p>
            </div>
          )}
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
