import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Gift, Mail, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

// £24 voucher — covers the cheapest book (16 pages × £1.50).
// Friend pays shipping (£4.99) + any pages above 16 at £1.50/page.
export const GIFT_VOUCHER_AMOUNT = 24
const GIFT_VOUCHER_AMOUNT_PENCE = GIFT_VOUCHER_AMOUNT * 100

type Step = 'recipient' | 'confirm' | 'sent'

function generateVoucherCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const seg = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `SNAP-${seg(4)}-${seg(4)}`
}

const GiftFlow = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState<Step>('recipient')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [voucherCode, setVoucherCode] = useState<string | null>(null)

  const handlePurchase = async () => {
    if (!user) return
    setLoading(true)
    setError(null)

    try {
      const code = generateVoucherCode()

      const { error: insertError } = await supabase.from('vouchers').insert({
        code,
        sender_user_id: user.id,
        recipient_email: recipientEmail,
        gift_message: message || null,
        amount_pence: GIFT_VOUCHER_AMOUNT_PENCE,
      })

      if (insertError) throw insertError

      // TODO: trigger Supabase Edge Function to email the voucher to recipientEmail
      // await supabase.functions.invoke('send-gift-voucher', {
      //   body: { code, recipientEmail, message, senderName: user.user_metadata.full_name, amount: GIFT_VOUCHER_AMOUNT }
      // })

      setVoucherCode(code)
      setStep('sent')
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="flex items-center gap-3 px-4 pt-12 pb-4">
        <button
          onClick={() => step === 'recipient' ? navigate('/home') : setStep('recipient')}
          className="p-2"
        >
          <ArrowLeft size={20} strokeWidth={1.5} className="text-foreground" />
        </button>
        <span className="text-sm font-medium text-foreground">
          {step === 'sent' ? 'Gift Sent!' : 'Gift a Book'}
        </span>
      </header>

      {/* ── Step 1: Recipient ────────────────────────────────────────────── */}
      {step === 'recipient' && (
        <div className="px-6 animate-fade-in">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5">
            <Gift size={24} strokeWidth={1.5} className="text-primary" />
          </div>

          <h1 className="text-xl font-semibold text-foreground mb-1">Gift a photo book</h1>
          <p className="text-sm text-muted-foreground mb-6">
            We'll email your friend a voucher worth <strong>£{GIFT_VOUCHER_AMOUNT}</strong> — enough to cover
            their first book. They just pay shipping.
          </p>

          {/* How it works */}
          <div className="bg-card rounded-xl p-4 card-shadow mb-6 space-y-3">
            {[
              { n: '1', text: 'Enter your friend\'s email and a personal message' },
              { n: '2', text: `You pay £${GIFT_VOUCHER_AMOUNT} — the cost of a starter book` },
              { n: '3', text: 'They receive an email with their unique voucher code' },
              { n: '4', text: 'They create their book and the voucher applies automatically at checkout' },
            ].map(row => (
              <div key={row.n} className="flex items-start gap-3">
                <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-primary">{row.n}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{row.text}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Recipient's email
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={e => setRecipientEmail(e.target.value)}
                placeholder="friend@example.com"
                className="w-full mt-1.5 h-12 px-4 bg-card rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Personal message <span className="normal-case text-muted-foreground">(optional)</span>
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="e.g. Happy birthday! I hope you make something beautiful 📸"
                className="w-full mt-1.5 h-24 px-4 py-3 bg-card rounded-xl text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <button
            onClick={() => setStep('confirm')}
            disabled={!recipientEmail.includes('@')}
            className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-30 flex items-center justify-center gap-2"
          >
            Continue <ChevronRight size={16} strokeWidth={2} />
          </button>
        </div>
      )}

      {/* ── Step 2: Confirm & pay ─────────────────────────────────────────── */}
      {step === 'confirm' && (
        <div className="px-6 animate-fade-in">
          <h2 className="text-lg font-semibold text-foreground mb-1">Confirm your gift</h2>
          <p className="text-sm text-muted-foreground mb-6">Review the details before paying.</p>

          {/* Summary card */}
          <div className="bg-card rounded-xl p-5 card-shadow mb-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sending to</span>
              <span className="text-foreground font-medium">{recipientEmail}</span>
            </div>
            {message && (
              <div className="flex justify-between text-sm gap-4">
                <span className="text-muted-foreground flex-shrink-0">Message</span>
                <span className="text-foreground text-right italic">"{message}"</span>
              </div>
            )}
            <div className="h-px bg-border" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Voucher value</span>
              <span className="text-foreground font-medium">£{GIFT_VOUCHER_AMOUNT}.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Covers</span>
              <span className="text-foreground font-medium">A 16-page starter book</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between text-sm">
              <span className="text-foreground font-semibold">You pay today</span>
              <span className="text-foreground font-semibold">£{GIFT_VOUCHER_AMOUNT}.00</span>
            </div>
          </div>

          {/* What friend pays */}
          <div className="bg-muted rounded-xl p-4 mb-6">
            <p className="text-xs font-medium text-foreground mb-1">What your friend pays</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Shipping only (£4.99). If they create a book with more than 16 pages,
              they pay £1.50 per extra page — the voucher covers the rest automatically.
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive mb-4">{error}</p>
          )}

          <div className="space-y-3">
            <button
              onClick={handlePurchase}
              disabled={loading}
              className="w-full h-12 bg-foreground text-background rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Processing…' : `Pay £${GIFT_VOUCHER_AMOUNT}.00 with Apple Pay`}
            </button>
            <button
              onClick={handlePurchase}
              disabled={loading}
              className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Processing…' : `Pay £${GIFT_VOUCHER_AMOUNT}.00 with card`}
            </button>
          </div>

          <p className="text-[10px] text-muted-foreground text-center mt-4">
            Secured by Stripe 🔒 · Voucher valid for 12 months
          </p>
        </div>
      )}

      {/* ── Step 3: Sent ──────────────────────────────────────────────────── */}
      {step === 'sent' && (
        <div className="px-6 flex flex-col items-center text-center animate-fade-in pt-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6">
            <Check size={28} strokeWidth={2} className="text-primary-foreground" />
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">Gift sent! 🎉</h1>
          <p className="text-sm text-muted-foreground mb-6">
            We've emailed <strong>{recipientEmail}</strong> their voucher. The code is also shown
            below in case they need it.
          </p>

          {/* Voucher code display */}
          {voucherCode && (
            <div className="w-full bg-card rounded-xl p-5 card-shadow mb-6 text-left">
              <div className="flex items-center gap-2 mb-3">
                <Mail size={14} strokeWidth={1.5} className="text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Voucher code</p>
              </div>
              <p className="text-2xl font-bold text-foreground tracking-widest">{voucherCode}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Worth £{GIFT_VOUCHER_AMOUNT} · Valid 12 months · Single use
              </p>
            </div>
          )}

          <div className="w-full space-y-3">
            <button
              onClick={() => navigate('/home')}
              className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Back to Home
            </button>
            <button
              onClick={() => { setStep('recipient'); setRecipientEmail(''); setMessage(''); }}
              className="w-full h-12 bg-card text-foreground rounded-xl font-medium text-sm hover:opacity-90 transition-opacity card-shadow"
            >
              Send another gift
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default GiftFlow
