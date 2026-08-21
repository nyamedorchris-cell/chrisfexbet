import React, { useState } from 'react';
import { useSportsbook } from '../context/SportsbookContext';
import { PaymentTransaction } from '../types';
import {
  QrCode,
  Building,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  X,
  Lock,
  ArrowUpRight,
  AlertCircle,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatCurrency, MIN_DEPOSIT_GHS } from '../utils/oddsFormatter';

export const WithdrawalModal: React.FC = () => {
  const {
    isWithdrawModalOpen,
    setIsWithdrawModalOpen,
    setIsDepositModalOpen,
    withdrawFunds,
    wallet,
  } = useSportsbook();
  const [method, setMethod] = useState<PaymentTransaction['method']>('paystack');
  const [amount, setAmount] = useState<number>(50);
  const [destination, setDestination] = useState<string>('024 456 7890 (MTN MoMo / Paystack)');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [step, setStep] = useState<number>(0);
  const [result, setResult] = useState<{ success: boolean; message: string; txId?: string } | null>(null);

  if (!isWithdrawModalOpen) return null;

  const handleWithdraw = async () => {
    if (amount < MIN_DEPOSIT_GHS || amount > wallet.balance) return;
    setIsProcessing(true);
    setStep(1);

    setTimeout(() => setStep(2), 600);
    setTimeout(() => setStep(3), 1200);

    setTimeout(async () => {
      const res = await withdrawFunds(amount, method, destination);
      setIsProcessing(false);
      setStep(0);
      const txId = method === 'paystack'
        ? `PSTK-TRF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
        : `GH-WTH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      setResult({ ...res, txId });

      if (res.success) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
    }, 1600);
  };

  const closeModal = () => {
    setIsWithdrawModalOpen(false);
    setResult(null);
  };

  const openDeposit = () => {
    setIsWithdrawModalOpen(false);
    setIsDepositModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div
        id="withdrawal-modal-dialog"
        className="bg-[#13151a] border border-gray-800 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gray-900/90 border-b border-gray-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-black shadow-lg shadow-teal-500/20">
              <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Instant Payout Vault</h3>
                <span className="px-1.5 py-0.5 bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[9px] font-bold uppercase rounded">
                  Ghana Cedis (GH₵)
                </span>
              </div>
              <p className="text-xs text-gray-400">Automated Rapid Payout Rails • Zero Platform Fee</p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-4 pt-3 pb-2 bg-[#0f1116] border-b border-gray-800 grid grid-cols-2 gap-2 shrink-0">
          <button
            onClick={openDeposit}
            className="py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 bg-gray-900 text-gray-400 hover:text-gray-200 border border-gray-800 transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Switch to Deposit</span>
          </button>

          <button
            className="py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 bg-teal-500 text-black shadow-md shadow-teal-500/20 transition-all cursor-default"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Withdraw Vault</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {result ? (
            <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                  result.success
                    ? 'bg-teal-500/20 text-teal-400 border-2 border-teal-500/50 shadow-lg shadow-teal-500/20'
                    : 'bg-red-500/20 text-red-400 border border-red-500/40'
                }`}
              >
                {result.success ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">
                  {result.success ? 'Payout Dispatched Instantly!' : 'Withdrawal Request Failed'}
                </h4>
                <p className="text-xs text-gray-400 mt-1">{result.message}</p>
                {result.success && (
                  <div className="inline-flex items-center space-x-2 mt-2 px-3 py-1 bg-gray-900 border border-gray-800 rounded-lg text-xs font-mono text-teal-400 font-bold">
                    <span>TxID: {result.txId}</span>
                  </div>
                )}
              </div>

              {result.success && (
                <div className="p-4 bg-gray-900/80 border border-gray-800 rounded-xl max-w-sm mx-auto text-left space-y-2 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>Remaining Balance:</span>
                    <span className="font-mono font-bold text-white">{formatCurrency(wallet.balance)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Network Fee:</span>
                    <span className="font-mono font-bold text-orange-400">GH₵ 0.00 (Zero Fee)</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Est. Arrival:</span>
                    <span className="text-gray-300 font-semibold">&lt; 2 Minutes (Instant MoMo / Bank Rail)</span>
                  </div>
                </div>
              )}

              <button
                onClick={closeModal}
                className="px-8 py-2.5 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-teal-500/20 cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : isProcessing ? (
            <div className="py-12 text-center space-y-6 animate-in fade-in duration-200">
              <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="space-y-2">
                <h4 className="text-base font-bold text-white">Broadcasting Payout Rails...</h4>
                <p className="text-xs text-gray-400">Verifying ledger signatures and banking security checks.</p>
              </div>

              <div className="max-w-xs mx-auto space-y-2 text-left">
                <div
                  className={`p-2.5 rounded-lg border text-xs flex items-center space-x-2.5 transition-all ${
                    step >= 1
                      ? 'bg-teal-500/10 text-teal-300 border-teal-500/30 font-semibold'
                      : 'bg-gray-900/60 text-gray-500 border-gray-800'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>1. Verifying Account Limits & Balance</span>
                </div>
                <div
                  className={`p-2.5 rounded-lg border text-xs flex items-center space-x-2.5 transition-all ${
                    step >= 2
                      ? 'bg-teal-500/10 text-teal-300 border-teal-500/30 font-semibold'
                      : 'bg-gray-900/60 text-gray-500 border-gray-800'
                  }`}
                >
                  <Lock className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>2. Signing Cryptographic Payout Key</span>
                </div>
                <div
                  className={`p-2.5 rounded-lg border text-xs flex items-center space-x-2.5 transition-all ${
                    step >= 3
                      ? 'bg-teal-500/10 text-teal-300 border-teal-500/30 font-semibold'
                      : 'bg-gray-900/60 text-gray-500 border-gray-800'
                  }`}
                >
                  <Zap className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>3. Dispatched to Payment Network</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Balance Banner */}
              <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Available Withdrawable Balance:</span>
                  <span className="font-mono font-bold text-white text-base">
                    {formatCurrency(wallet.balance)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-800">
                  <span>Wagering Lock: 0% (Fully Cleared)</span>
                  <span className="text-orange-400 font-semibold">✓ KYC Tier 2 Verified</span>
                </div>
              </div>

              {/* Method */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                  Select Payout Rail
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    {
                      id: 'paystack',
                      label: 'Paystack Rails',
                      sub: 'MoMo & Bank Direct',
                      icon: (
                        <div className="w-4 h-4 rounded bg-cyan-400 text-black flex items-center justify-center font-black text-[9px]">
                          P
                        </div>
                      ),
                    },
                    { id: 'momo', label: 'MTN / Voda MoMo', sub: 'Instant Mobile Money', icon: <Smartphone className="w-4 h-4 text-yellow-400" /> },
                    { id: 'bank_transfer', label: 'Bank GIP Direct', sub: 'GCB, Ecobank, ABSA', icon: <Building className="w-4 h-4 text-orange-400" /> },
                    { id: 'crypto', label: 'Crypto Web3', sub: 'USDT TRC20 / BTC', icon: <QrCode className="w-4 h-4 text-teal-400" /> },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id as PaymentTransaction['method'])}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between space-y-1.5 transition-all cursor-pointer ${
                        method === m.id
                          ? 'bg-teal-500/10 text-white border-teal-500/60 ring-1 ring-teal-500/40 shadow-sm'
                          : 'bg-gray-900 text-gray-400 hover:bg-gray-800 border-gray-800'
                      }`}
                    >
                      <span>{m.icon}</span>
                      <div>
                        <p className="text-xs font-bold leading-tight truncate text-white">{m.label}</p>
                        <p className="text-[10px] text-gray-500 truncate">{m.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Percentage Quick Picks */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Withdrawal Amount (Ghana Cedis - GH₵)
                  </label>
                  <span className="text-[11px] text-gray-500 font-mono">Min: GH₵ {MIN_DEPOSIT_GHS}</span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 mb-2.5">
                  {[
                    { label: '25%', val: Math.max(MIN_DEPOSIT_GHS, Math.floor(wallet.balance * 0.25)) },
                    { label: '50%', val: Math.max(MIN_DEPOSIT_GHS, Math.floor(wallet.balance * 0.5)) },
                    { label: '75%', val: Math.max(MIN_DEPOSIT_GHS, Math.floor(wallet.balance * 0.75)) },
                    { label: '100% MAX', val: wallet.balance },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setAmount(p.val)}
                      className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        amount === p.val
                          ? 'bg-teal-500 text-black shadow'
                          : 'bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-800'
                      }`}
                    >
                      {p.label} ({formatCurrency(p.val)})
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-gray-500 font-mono font-bold text-xs">GH₵</span>
                  <input
                    id="withdrawal-amount-input"
                    type="number"
                    min={MIN_DEPOSIT_GHS}
                    max={wallet.balance}
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full pl-12 pr-3 py-2 text-sm font-mono font-bold bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>

              {/* Destination */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                  Destination Phone / Account / Wallet
                </label>
                <input
                  id="withdrawal-destination-input"
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-mono bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-teal-500"
                  placeholder={
                    method === 'momo' || method === 'paystack'
                      ? 'Enter 10-digit MoMo phone number (0244567890)...'
                      : method === 'crypto'
                      ? 'Enter USDT / BTC / ETH wallet address...'
                      : 'Enter Bank Account Number & Bank Name...'
                  }
                />
              </div>

              {/* Zero Fee Banner */}
              <div className="p-3 bg-gray-900/60 border border-gray-800 rounded-xl flex items-center justify-between text-xs">
                <span className="text-gray-400 flex items-center space-x-1.5">
                  <Zap className="w-3.5 h-3.5 text-teal-400" />
                  <span>Network Processing Fee:</span>
                </span>
                <span className="font-mono font-bold text-orange-400">GH₵ 0.00 (Zero Fee Guaranteed)</span>
              </div>

              {/* Submit CTA */}
              <button
                id="withdrawal-submit-btn"
                onClick={handleWithdraw}
                disabled={isProcessing || amount < MIN_DEPOSIT_GHS || amount > wallet.balance}
                className="w-full py-3.5 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl text-xs uppercase tracking-widest flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Lock className="w-4 h-4 stroke-[2.5]" />
                <span>Confirm Instant Payout ({formatCurrency(amount)})</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
