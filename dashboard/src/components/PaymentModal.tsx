import { useState } from 'react';
import { X, CreditCard, ShieldCheck } from 'lucide-react';

interface Props {
  type: 'tax' | 'utility';
  amount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ type, amount, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');

  const handlePayment = () => {
    setStep('processing');
    
    // Simulate payment gateway delay
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
      <div className="glass-panel w-[400px] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CreditCard size={20} className={type === 'tax' ? 'text-red-400' : 'text-sky-400'} />
            Payment Gateway
          </h2>
          {step !== 'processing' && (
            <button onClick={onClose} className="text-[var(--text-muted)] hover:text-white transition-colors">
              <X size={20} />
            </button>
          )}
        </div>

        {step === 'details' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <p className="text-xs text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Total Amount Due</p>
              <p className="text-3xl font-bold text-white">₹{amount.toLocaleString()}</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-2">
                {type === 'tax' ? 'Property Tax Payment' : 'Utility Bill Payment'}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)] mb-1.5">Card Number</label>
                <input 
                  type="text" 
                  placeholder="0000 0000 0000 0000"
                  className="w-full bg-[var(--panel-bg)] border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-white placeholder-[var(--text-muted)] outline-none focus:border-white/30 transition-colors font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)] mb-1.5">Expiry</label>
                  <input 
                    type="text" 
                    placeholder="MM/YY"
                    className="w-full bg-[var(--panel-bg)] border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-white placeholder-[var(--text-muted)] outline-none focus:border-white/30 transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)] mb-1.5">CVV</label>
                  <input 
                    type="password" 
                    placeholder="***"
                    className="w-full bg-[var(--panel-bg)] border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-white placeholder-[var(--text-muted)] outline-none focus:border-white/30 transition-colors font-mono"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handlePayment}
              className={`w-full py-3 rounded-xl text-xs font-bold text-white uppercase tracking-wider transition-colors shadow-lg
                ${type === 'tax' ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-sky-500 hover:bg-sky-600 shadow-[0_0_15px_rgba(56,189,248,0.3)]'}
              `}
            >
              Pay ₹{amount.toLocaleString()}
            </button>
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-[var(--text-muted)]">
              <ShieldCheck size={12} className="text-emerald-400" /> Secure encrypted transaction
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-[var(--glass-border)] border-t-white rounded-full animate-spin" />
            <p className="text-sm font-semibold text-white">Processing Payment...</p>
            <p className="text-[10px] text-[var(--text-muted)] text-center">Please do not close this window or<br/>press the back button.</p>
          </div>
        )}

        {step === 'success' && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in-90">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mb-2">
              <ShieldCheck size={32} />
            </div>
            <p className="text-lg font-bold text-white">Payment Successful</p>
            <p className="text-xs text-[var(--text-secondary)]">Transaction ID: TXN-{Math.floor(Math.random() * 1000000000)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
