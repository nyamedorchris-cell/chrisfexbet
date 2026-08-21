import React, { useState } from 'react';
import { useSportsbook } from '../context/SportsbookContext';
import { PaymentTransaction } from '../types';
import { launchPaystackPayment } from '../utils/paystackClient';
import {
  CreditCard,
  QrCode,
  Smartphone,
  Building,
  ShieldCheck,
  Lock,
  CheckCircle2,
  X,
  Sparkles,
  ArrowUpRight,
  Copy,
  Check,
  History,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
  AlertCircle,
  PhoneCall,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatCurrency, MIN_DEPOSIT_GHS, MAX_DEPOSIT_GHS } from '../utils/oddsFormatter';

interface DepositModalProps {
  initialTab?: 'deposit' | 'withdraw' | 'history';
}

export const DepositModal: React.FC<DepositModalProps> = ({ initialTab = 'deposit' }) => {
  const {
    isDepositModalOpen,
    setIsDepositModalOpen,
    depositFunds,
    withdrawFunds,
    wallet,
    transactions,
  } = useSportsbook();

  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>(initialTab);

  // Deposit State
  const [depositMethod, setDepositMethod] = useState<PaymentTransaction['method']>('paystack');
  const [depositAmount, setDepositAmount] = useState<number>(50);
  const [claimBonus, setClaimBonus] = useState<boolean>(true);
  const [isDepositProcessing, setIsDepositProcessing] = useState<boolean>(false);
  const [depositStep, setDepositStep] = useState<number>(0);
  const [depositSuccessTx, setDepositSuccessTx] = useState<{ ref: string; amount: number; method: string } | null>(null);
  const [depositError, setDepositError] = useState<string | null>(null);

  // Paystack Form State
  const [paystackEmail, setPaystackEmail] = useState<string>('player@chrisfixbet.com.gh');
  const [paystackPhone, setPaystackPhone] = useState<string>('024 456 7890');
  const [paystackChannel, setPaystackChannel] = useState<'all' | 'mobile_money' | 'card' | 'bank' | 'qr'>('all');

  // Mobile Money Form
  const [momoPhone, setMomoPhone] = useState('024 456 7890');
  const [momoNetwork, setMomoNetwork] = useState<'MTN MoMo' | 'Telecel Cash' | 'AT Money'>('MTN MoMo');

  // Card form
  const [useSavedCard, setUseSavedCard] = useState<boolean>(true);
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');

  // Crypto form
  const [cryptoCoin, setCryptoCoin] = useState('USDT (TRC-20)');
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Bank form
  const [selectedBank, setSelectedBank] = useState('GCB Bank');
  const [accountNumber, setAccountNumber] = useState('1041130009821');

  // Withdrawal State
  const [withdrawMethod, setWithdrawMethod] = useState<PaymentTransaction['method']>('paystack');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(50);
  const [withdrawDestination, setWithdrawDestination] = useState<string>('024 456 7890 (MTN MoMo / Paystack)');
  const [isWithdrawProcessing, setIsWithdrawProcessing] = useState<boolean>(false);
  const [withdrawStep, setWithdrawStep] = useState<number>(0);
  const [withdrawSuccessTx, setWithdrawSuccessTx] = useState<{ txId: string; amount: number; method: string } | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  // History Filter
  const [historyFilter, setHistoryFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'cashout' | 'bonus'>('all');

  if (!isDepositModalOpen) return null;

  const cryptoAddresses: Record<string, string> = {
    'USDT (TRC-20)': 'TYDtgZ91R89X42A91D0E43F1ChrisFixBetTRC',
    'USDT (ERC-20)': '0x71C8942A91D0E43F1B89ChrisFixBetUSDT',
    'BTC (Bitcoin)': 'bc1qchrisfixbet88942a91d0e43f1btc8829',
    'ETH (Ethereum)': '0x71C8942A91D0E43F1B89ChrisFixBetETH',
    'SOL (Solana)': 'ChrisFixSol8839210e43f1solanavault88291',
  };

  const isDepositAmountValid = depositAmount >= MIN_DEPOSIT_GHS && depositAmount <= MAX_DEPOSIT_GHS;

  const handleCopyAddress = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleDeposit = async () => {
    if (depositAmount < MIN_DEPOSIT_GHS) {
      setDepositError(`Minimum deposit amount is GH₵ ${MIN_DEPOSIT_GHS} (Two Ghana Cedis).`);
      return;
    }
    if (depositAmount > MAX_DEPOSIT_GHS) {
      setDepositError(`Maximum deposit amount per transaction is GH₵ ${MAX_DEPOSIT_GHS.toLocaleString()} (One Hundred Thousand Ghana Cedis).`);
      return;
    }

    setDepositError(null);
    setIsDepositProcessing(true);

    // If Paystack is selected, launch official Paystack Checkout
    if (depositMethod === 'paystack') {
      setDepositStep(1);
      setTimeout(() => setDepositStep(2), 500);

      await launchPaystackPayment({
        amount: depositAmount,
        email: paystackEmail,
        phone: paystackPhone,
        channel: paystackChannel,
        metadata: {
          platform: 'CHRISFIXBET Ghana',
          claimBonus,
        },
        onSuccess: async (reference, verifiedAmount) => {
          setDepositStep(3);
          const success = await depositFunds(verifiedAmount || depositAmount, 'paystack', {
            reference,
            paystackRef: reference,
            email: paystackEmail,
            phoneNumber: paystackPhone,
            channel: paystackChannel,
            claimBonus,
          });

          setIsDepositProcessing(false);
          setDepositStep(0);
          if (success) {
            setDepositSuccessTx({
              ref: reference,
              amount: verifiedAmount || depositAmount,
              method: 'Paystack Ghana (MoMo & Card)',
            });
            confetti({
              particleCount: 70,
              spread: 80,
              origin: { y: 0.6 },
            });
          } else {
            setDepositError('Paystack settlement could not be confirmed. Please contact support.');
          }
        },
        onClose: () => {
          setIsDepositProcessing(false);
          setDepositStep(0);
        },
        onError: (errMsg) => {
          setIsDepositProcessing(false);
          setDepositStep(0);
          setDepositError(errMsg || 'Paystack payment encountered an issue. Please retry.');
        },
      });
      return;
    }

    // Other deposit methods (Direct MoMo, Card, Crypto, Bank)
    setDepositStep(1);
    setTimeout(() => setDepositStep(2), 600);
    setTimeout(() => setDepositStep(3), 1200);

    setTimeout(async () => {
      const success = await depositFunds(depositAmount, depositMethod, {
        phoneNumber: momoPhone,
        network: momoNetwork,
        cardNumber: useSavedCard ? '4242 4242 4242 4242' : cardNumber,
        cryptoCurrency: cryptoCoin,
        bankName: selectedBank,
        claimBonus,
      });

      setIsDepositProcessing(false);
      setDepositStep(0);
      if (success) {
        const ref = `GH-DEP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        setDepositSuccessTx({
          ref,
          amount: depositAmount,
          method: depositMethod === 'momo' ? momoNetwork : depositMethod.replace('_', ' '),
        });
        confetti({
          particleCount: 65,
          spread: 75,
          origin: { y: 0.6 },
        });
      } else {
        setDepositError('Deposit request was declined by payment gateway. Please check details and retry.');
      }
    }, 1600);
  };

  const handleWithdrawal = async () => {
    if (withdrawAmount < MIN_DEPOSIT_GHS) {
      setWithdrawError(`Minimum withdrawal amount is GH₵ ${MIN_DEPOSIT_GHS}.`);
      return;
    }
    if (withdrawAmount > wallet.balance) {
      setWithdrawError(`Withdrawal amount exceeds available balance (${formatCurrency(wallet.balance)}).`);
      return;
    }

    setWithdrawError(null);
    setIsWithdrawProcessing(true);
    setWithdrawStep(1);

    setTimeout(() => setWithdrawStep(2), 600);
    setTimeout(() => setWithdrawStep(3), 1200);

    setTimeout(async () => {
      const res = await withdrawFunds(withdrawAmount, withdrawMethod, withdrawDestination);
      setIsWithdrawProcessing(false);
      setWithdrawStep(0);
      if (res.success) {
        setWithdrawSuccessTx({
          txId: withdrawMethod === 'paystack'
            ? `PSTK-TRF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
            : `GH-WTH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          amount: withdrawAmount,
          method: withdrawMethod === 'paystack'
            ? 'Paystack Instant MoMo / Bank Transfer'
            : withdrawMethod === 'momo'
            ? 'MTN MoMo / Mobile Money'
            : withdrawMethod.replace('_', ' '),
        });
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } else {
        setWithdrawError(res.message);
      }
    }, 1600);
  };

  const closeModal = () => {
    setIsDepositModalOpen(false);
    setDepositSuccessTx(null);
    setWithdrawSuccessTx(null);
    setDepositError(null);
    setWithdrawError(null);
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (historyFilter === 'all') return true;
    return tx.type === historyFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div
        id="deposit-modal-dialog"
        className="bg-[#13151a] border border-gray-800 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]"
      >
        {/* Header with Navigation Tabs */}
        <div className="p-4 sm:p-5 bg-gray-900/90 border-b border-gray-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 via-amber-500 to-amber-400 flex items-center justify-center text-black shadow-lg shadow-orange-500/20">
              <Wallet className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">CHRISFIXBET Banking Vault</h3>
                <span className="px-1.5 py-0.5 bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[9px] font-bold uppercase rounded">
                  Ghana Cedis (GHS)
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Available Sportsbook Balance:{' '}
                <strong className="text-orange-400 font-mono">{formatCurrency(wallet.balance)}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Row */}
        <div className="px-4 pt-3 pb-2 bg-[#0f1116] border-b border-gray-800 grid grid-cols-3 gap-2 shrink-0">
          <button
            id="vault-tab-deposit"
            onClick={() => {
              setActiveTab('deposit');
              setDepositSuccessTx(null);
              setDepositError(null);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'deposit'
                ? 'bg-orange-500 text-black shadow-md shadow-orange-500/20'
                : 'bg-gray-900 text-gray-400 hover:text-gray-200 border border-gray-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Deposit (GH₵ 2 - 100k)</span>
          </button>

          <button
            id="vault-tab-withdraw"
            onClick={() => {
              setActiveTab('withdraw');
              setWithdrawSuccessTx(null);
              setWithdrawError(null);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'withdraw'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-gray-900 text-gray-400 hover:text-gray-200 border border-gray-800'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Withdraw</span>
          </button>

          <button
            id="vault-tab-history"
            onClick={() => setActiveTab('history')}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-gray-800 text-orange-400 border border-orange-500/40 shadow-sm'
                : 'bg-gray-900 text-gray-400 hover:text-gray-200 border border-gray-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Ledger ({transactions.length})</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* ======================= TAB: DEPOSIT ======================= */}
          {activeTab === 'deposit' && (
            <>
              {depositSuccessTx ? (
                <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-full bg-orange-500/20 border-2 border-orange-500/50 flex items-center justify-center mx-auto text-orange-400 shadow-lg shadow-orange-500/20">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Deposit Settled Instantly!</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      +{formatCurrency(depositSuccessTx.amount)} credited to your active sportsbook balance.
                    </p>
                    <div className="inline-flex items-center space-x-2 mt-2 px-3 py-1 bg-gray-900 border border-gray-800 rounded-lg text-xs font-mono text-orange-400 font-bold">
                      <span>Ref: {depositSuccessTx.ref}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-900/80 border border-gray-800 rounded-xl max-w-sm mx-auto text-left space-y-2 text-xs">
                    <div className="flex justify-between text-gray-400">
                      <span>New Sportsbook Balance:</span>
                      <span className="font-mono font-bold text-white">{formatCurrency(wallet.balance)}</span>
                    </div>
                    {claimBonus && (
                      <div className="flex justify-between text-amber-400">
                        <span>100% Welcome Match Bonus:</span>
                        <span className="font-mono font-bold">+{formatCurrency(depositSuccessTx.amount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-400">
                      <span>Payment Channel:</span>
                      <span className="capitalize text-gray-300 font-semibold">{depositSuccessTx.method}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Processing Fee:</span>
                      <span className="text-orange-400 font-bold font-mono">GH₵ 0.00 (Zero Fee)</span>
                    </div>
                  </div>

                  <div className="flex space-x-2 justify-center pt-2">
                    <button
                      onClick={() => setDepositSuccessTx(null)}
                      className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      Make Another Deposit
                    </button>
                    <button
                      onClick={closeModal}
                      className="px-6 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-bold rounded-lg text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 cursor-pointer"
                    >
                      Start Betting
                    </button>
                  </div>
                </div>
              ) : isDepositProcessing ? (
                /* Step-by-step progress simulation */
                <div className="py-12 text-center space-y-6 animate-in fade-in duration-200">
                  <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <div className="space-y-2">
                    <h4 className="text-base font-bold text-white">
                      Connecting Paystack / Payment Rail...
                    </h4>
                    <p className="text-xs text-gray-400">
                      {depositMethod === 'paystack'
                        ? 'Opening Paystack Ghana checkout popup & verifying 256-bit token.'
                        : depositMethod === 'momo'
                        ? 'Please approve the USSD prompt sent to your mobile phone (*170#).'
                        : 'Securely authorising encrypted payment rail...'}
                    </p>
                  </div>

                  <div className="max-w-xs mx-auto space-y-2 text-left">
                    <div
                      className={`p-2.5 rounded-lg border text-xs flex items-center space-x-2.5 transition-all ${
                        depositStep >= 1
                          ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 font-semibold'
                          : 'bg-gray-900/60 text-gray-500 border-gray-800'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>1. Connecting Paystack Telco & Bank Switch</span>
                    </div>
                    <div
                      className={`p-2.5 rounded-lg border text-xs flex items-center space-x-2.5 transition-all ${
                        depositStep >= 2
                          ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 font-semibold'
                          : 'bg-gray-900/60 text-gray-500 border-gray-800'
                      }`}
                    >
                      <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>2. Tokenizing 256-Bit SSL Transaction</span>
                    </div>
                    <div
                      className={`p-2.5 rounded-lg border text-xs flex items-center space-x-2.5 transition-all ${
                        depositStep >= 3
                          ? 'bg-orange-500/10 text-orange-300 border-orange-500/30 font-semibold'
                          : 'bg-gray-900/60 text-gray-500 border-gray-800'
                      }`}
                    >
                      <Zap className="w-4 h-4 text-orange-400 shrink-0" />
                      <span>3. Crediting Sportsbook Vault Instantly</span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Step 1: Payment Method Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                        1. Select Payment Rail (Ghana & Global)
                      </label>
                      <span className="text-[10px] text-cyan-400 font-bold flex items-center space-x-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Paystack Enabled</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        {
                          id: 'paystack',
                          label: 'Paystack Ghana',
                          sub: 'MoMo • Cards • Bank • QR',
                          badge: 'Official / Fast',
                          badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
                          icon: (
                            <div className="w-5 h-5 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-[10px]">
                              P
                            </div>
                          ),
                        },
                        {
                          id: 'momo',
                          label: 'Direct MTN MoMo',
                          sub: 'Instant USSD *170#',
                          badge: 'Popular',
                          badgeColor: 'bg-yellow-500/20 text-yellow-300',
                          icon: <Smartphone className="w-4 h-4 text-yellow-400" />,
                        },
                        {
                          id: 'vodafone_cash',
                          label: 'Telecel / Voda',
                          sub: 'Voda Cash Voucher',
                          badge: 'Fast',
                          badgeColor: 'bg-red-500/20 text-red-300',
                          icon: <Smartphone className="w-4 h-4 text-red-400" />,
                        },
                        {
                          id: 'airteltigo',
                          label: 'AT Money',
                          sub: 'AirtelTigo Pay',
                          badge: 'Zero Fee',
                          badgeColor: 'bg-blue-500/20 text-blue-300',
                          icon: <Smartphone className="w-4 h-4 text-blue-400" />,
                        },
                        {
                          id: 'card',
                          label: 'Card / GHLink',
                          sub: 'Visa / MC / GHLink',
                          badge: '3D Secure',
                          badgeColor: 'bg-orange-500/20 text-orange-300',
                          icon: <CreditCard className="w-4 h-4 text-orange-400" />,
                        },
                        {
                          id: 'bank_transfer',
                          label: 'Bank Direct',
                          sub: 'GCB, Ecobank, ABSA',
                          badge: 'Instant GIP',
                          badgeColor: 'bg-purple-500/20 text-purple-300',
                          icon: <Building className="w-4 h-4 text-purple-400" />,
                        },
                        {
                          id: 'crypto',
                          label: 'Crypto Web3',
                          sub: 'USDT / BTC / ETH',
                          badge: 'No Limit',
                          badgeColor: 'bg-amber-500/20 text-amber-300',
                          icon: <QrCode className="w-4 h-4 text-amber-400" />,
                        },
                      ].map((m) => (
                        <button
                          key={m.id}
                          id={`deposit-method-${m.id}`}
                          onClick={() => setDepositMethod(m.id as PaymentTransaction['method'])}
                          className={`p-3 rounded-xl border text-left flex flex-col justify-between space-y-2 transition-all cursor-pointer ${
                            depositMethod === m.id
                              ? m.id === 'paystack'
                                ? 'bg-cyan-500/10 text-white border-cyan-400 ring-1 ring-cyan-400/50 shadow-md shadow-cyan-500/10'
                                : 'bg-orange-500/10 text-white border-orange-500/60 ring-1 ring-orange-500/40 shadow-sm'
                              : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-gray-200 border-gray-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{m.icon}</span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${m.badgeColor || 'bg-gray-800 text-gray-300'}`}>
                              {m.badge}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-bold leading-tight truncate text-white">{m.label}</p>
                            <p className="text-[10px] text-gray-500 truncate">{m.sub}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Amount Presets & Custom Input */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        2. Choose Deposit Amount (Ghana Cedis - GH₵)
                      </label>
                      <span className="text-[11px] text-orange-400 font-mono font-semibold">
                        Min: GH₵ {MIN_DEPOSIT_GHS} • Max: GH₵ {MAX_DEPOSIT_GHS.toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 mb-2.5">
                      {[2, 5, 10, 20, 50, 100, 500, 1000].map((amt) => (
                        <button
                          key={amt}
                          id={`deposit-preset-${amt}`}
                          onClick={() => {
                            setDepositAmount(amt);
                            setDepositError(null);
                          }}
                          className={`py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                            depositAmount === amt
                              ? 'bg-orange-500 text-black shadow-md shadow-orange-500/20'
                              : 'bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-800'
                          }`}
                        >
                          GH₵ {amt}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-gray-400 font-mono font-bold text-xs">
                        GH₵
                      </span>
                      <input
                        id="deposit-custom-amount-input"
                        type="number"
                        min={MIN_DEPOSIT_GHS}
                        max={MAX_DEPOSIT_GHS}
                        value={depositAmount || ''}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setDepositAmount(val);
                          if (val >= MIN_DEPOSIT_GHS && val <= MAX_DEPOSIT_GHS) {
                            setDepositError(null);
                          }
                        }}
                        className={`w-full pl-12 pr-3 py-2 text-sm font-mono font-bold bg-gray-900 border rounded-xl text-white focus:outline-none transition-colors ${
                          !isDepositAmountValid && depositAmount > 0
                            ? 'border-amber-500/80 focus:border-amber-400'
                            : 'border-gray-800 focus:border-orange-500'
                        }`}
                        placeholder="Enter amount between 2 and 100,000 GH₵..."
                      />
                    </div>

                    {/* Validation Hints */}
                    <div className="flex items-center justify-between text-[11px] mt-1.5 px-1">
                      {depositAmount < MIN_DEPOSIT_GHS && depositAmount > 0 ? (
                        <span className="text-amber-400 font-semibold flex items-center space-x-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Minimum deposit is GH₵ 2 (Two Ghana Cedis)</span>
                        </span>
                      ) : depositAmount > MAX_DEPOSIT_GHS ? (
                        <span className="text-red-400 font-semibold flex items-center space-x-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Maximum deposit is GH₵ 100,000 per transaction</span>
                        </span>
                      ) : (
                        <span className="text-gray-500">
                          Instant deposit with 0% fee • Daily limit: GH₵ {wallet.depositLimitDaily.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {depositError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 font-semibold flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{depositError}</span>
                    </div>
                  )}

                  {/* Step 3: Method Details Specific Form */}
                  {/* PAYSTACK DEDICATED SECTION */}
                  {depositMethod === 'paystack' && (
                    <div className="p-4 bg-gray-900 border border-cyan-500/30 rounded-xl space-y-3.5">
                      <div className="flex items-center justify-between pb-2 border-b border-gray-800 text-xs">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded bg-cyan-400 text-black flex items-center justify-center font-black text-xs">
                            P
                          </div>
                          <div>
                            <p className="font-bold text-white">Paystack Ghana Gateway</p>
                            <p className="text-[10px] text-gray-400">All Ghana Mobile Money & Cards</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded font-mono text-[10px] font-bold">
                          PCI-DSS Level 1
                        </span>
                      </div>

                      {/* Paystack Channel Selector */}
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1.5">
                          Preferred Payment Channel
                        </label>
                        <div className="grid grid-cols-4 gap-1.5 text-xs">
                          {[
                            { id: 'all', label: 'All (Popup)' },
                            { id: 'mobile_money', label: 'MoMo (MTN/Tel)' },
                            { id: 'card', label: 'Card (Visa/MC)' },
                            { id: 'bank', label: 'Bank Transfer' },
                          ].map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setPaystackChannel(c.id as any)}
                              className={`py-1.5 px-2 rounded-lg text-[11px] font-bold truncate transition-all cursor-pointer ${
                                paystackChannel === c.id
                                  ? 'bg-cyan-500 text-black shadow-sm'
                                  : 'bg-gray-950 text-gray-400 hover:text-white border border-gray-800'
                              }`}
                            >
                              {c.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                            Customer Email Address
                          </label>
                          <input
                            type="email"
                            value={paystackEmail}
                            onChange={(e) => setPaystackEmail(e.target.value)}
                            className="w-full px-3 py-2 font-mono text-xs bg-gray-950 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                            placeholder="your.email@example.com"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                            Mobile Money Phone (Optional)
                          </label>
                          <input
                            type="tel"
                            value={paystackPhone}
                            onChange={(e) => setPaystackPhone(e.target.value)}
                            className="w-full px-3 py-2 font-mono text-xs bg-gray-950 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                            placeholder="024 ••• ••••"
                          />
                        </div>
                      </div>

                      <div className="p-2.5 bg-gray-950 border border-gray-800 rounded-lg text-[11px] text-gray-400 flex items-center justify-between">
                        <span>🇬🇭 Accepts MTN MoMo, Telecel Cash, AT Money & GHLink</span>
                        <span className="text-cyan-400 font-bold font-mono">0% Fee</span>
                      </div>
                    </div>
                  )}

                  {/* MOBILE MONEY (MTN, Telecel, AT Money) */}
                  {(depositMethod === 'momo' || depositMethod === 'vodafone_cash' || depositMethod === 'airteltigo') && (
                    <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-gray-800 text-xs">
                        <span className="font-bold text-gray-300 flex items-center space-x-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-orange-400" />
                          <span>
                            {depositMethod === 'momo'
                              ? 'MTN Mobile Money Details'
                              : depositMethod === 'vodafone_cash'
                              ? 'Telecel / Vodafone Cash Details'
                              : 'AT Money Details'}
                          </span>
                        </span>
                        <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded font-mono text-[10px] font-bold">
                          Direct USSD Push
                        </span>
                      </div>

                      <div className="space-y-2.5 text-xs">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                            Mobile Money Phone Number (Ghana)
                          </label>
                          <div className="relative">
                            <input
                              type="tel"
                              value={momoPhone}
                              onChange={(e) => setMomoPhone(e.target.value)}
                              className="w-full pl-3.5 pr-3 py-2 font-mono text-xs bg-gray-950 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-orange-500"
                              placeholder="024 ••• •••• or 054/055/020/027..."
                            />
                          </div>
                        </div>

                        <div className="p-2.5 bg-gray-950 border border-gray-800 rounded-lg text-[11px] text-gray-400 space-y-1">
                          <p className="font-bold text-gray-200 flex items-center space-x-1">
                            <PhoneCall className="w-3 h-3 text-orange-400" />
                            <span>How it works:</span>
                          </p>
                          <p>
                            1. Click <strong>Authorize Instant Deposit</strong> below.
                          </p>
                          <p>
                            2. A prompt will immediately appear on your phone asking you to enter your 4-digit MoMo PIN.
                          </p>
                          <p>
                            3. Once approved, your CHRISFIXBET balance updates instantly with zero transaction fee.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CARD & GHLINK */}
                  {depositMethod === 'card' && (
                    <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-gray-800 text-xs">
                        <span className="font-bold text-gray-300 flex items-center space-x-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-orange-400" />
                          <span>Debit / Credit / GHLink Card</span>
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setUseSavedCard(!useSavedCard)}
                            className="text-[11px] text-orange-400 hover:underline cursor-pointer"
                          >
                            {useSavedCard ? '+ Use New Card' : '✓ Use Saved Card'}
                          </button>
                        </div>
                      </div>

                      {useSavedCard ? (
                        <div className="p-3 bg-gray-950 border border-orange-500/30 rounded-lg flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-5 bg-blue-600 rounded text-[9px] font-bold text-white flex items-center justify-center">
                              VISA
                            </div>
                            <div>
                              <p className="font-mono font-bold text-white">•••• •••• •••• 4242</p>
                              <p className="text-[10px] text-gray-500">Exp: 12/28 • Ecobank Ghana Visa</p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-bold rounded">
                            Verified 1-Click
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-2.5 text-xs">
                          <div>
                            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                              Card Number
                            </label>
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              className="w-full px-3 py-2 font-mono text-xs bg-gray-950 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-orange-500"
                              placeholder="4242 4242 4242 4242"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                                Expiration (MM/YY)
                              </label>
                              <input
                                type="text"
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                                className="w-full px-3 py-2 font-mono text-xs bg-gray-950 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-orange-500"
                                placeholder="12/28"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                                CVV / CVC (3D-Secure)
                              </label>
                              <input
                                type="password"
                                maxLength={4}
                                value={cardCvc}
                                onChange={(e) => setCardCvc(e.target.value)}
                                className="w-full px-3 py-2 font-mono text-xs bg-gray-950 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-orange-500"
                                placeholder="888"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* BANK TRANSFER (GHANA INTERBANK GIP) */}
                  {depositMethod === 'bank_transfer' && (
                    <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl space-y-3 text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                        <span className="font-bold text-gray-300 flex items-center space-x-1.5">
                          <Building className="w-3.5 h-3.5 text-orange-400" />
                          <span>Ghana Interbank Payment (GIP)</span>
                        </span>
                        <span className="text-[10px] text-orange-400 font-bold bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                          Instant Credit
                        </span>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-400 block">Select Your Bank</label>
                        <select
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white font-semibold focus:outline-none focus:border-orange-500"
                        >
                          <option value="GCB Bank">GCB Bank PLC</option>
                          <option value="Ecobank Ghana">Ecobank Ghana</option>
                          <option value="Stanbic Bank">Stanbic Bank Ghana</option>
                          <option value="ABSA Ghana">ABSA Bank Ghana</option>
                          <option value="Fidelity Bank">Fidelity Bank Ghana</option>
                          <option value="CalBank">CalBank PLC</option>
                          <option value="Zenith Bank">Zenith Bank Ghana</option>
                          <option value="Standard Chartered">Standard Chartered Bank</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* CRYPTO */}
                  {depositMethod === 'crypto' && (
                    <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl space-y-3.5">
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-[10px] uppercase font-bold text-gray-400">
                            Select Cryptocurrency / Network
                          </label>
                          <span className="text-[10px] font-mono text-orange-400">
                            1 USDT ≈ GH₵ 15.85
                          </span>
                        </div>
                        <select
                          id="crypto-network-select"
                          value={cryptoCoin}
                          onChange={(e) => setCryptoCoin(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-bold bg-gray-950 border border-gray-800 rounded-lg text-orange-400 focus:outline-none"
                        >
                          <option value="USDT (TRC-20)">Tether USDT (TRC-20 • Zero Gas Fee • Instant)</option>
                          <option value="USDT (ERC-20)">Tether USDT (ERC-20 Ethereum)</option>
                          <option value="BTC (Bitcoin)">Bitcoin BTC Native</option>
                          <option value="ETH (Ethereum)">Ethereum ETH Mainnet</option>
                          <option value="SOL (Solana)">Solana SOL Network</option>
                        </select>
                      </div>

                      <div className="p-3 bg-gray-950 border border-gray-800 rounded-xl flex flex-col sm:flex-row items-center gap-3">
                        <div className="w-24 h-24 bg-white rounded-lg p-1.5 flex items-center justify-center shrink-0 shadow">
                          <QrCode className="w-20 h-20 text-black" />
                        </div>
                        <div className="space-y-1.5 text-xs flex-1 min-w-0 w-full">
                          <p className="text-[10px] font-bold uppercase text-gray-400">Vault Deposit Address</p>
                          <div className="flex items-center space-x-1.5">
                            <p className="font-mono text-[11px] text-orange-400 break-all bg-gray-900 p-2 rounded-lg border border-gray-800 flex-1">
                              {cryptoAddresses[cryptoCoin] || 'TYDtgZ91R89X42A91D0E43F1ChrisFixBetTRC'}
                            </p>
                            <button
                              id="copy-crypto-address-btn"
                              type="button"
                              onClick={() =>
                                handleCopyAddress(
                                  cryptoAddresses[cryptoCoin] || 'TYDtgZ91R89X42A91D0E43F1ChrisFixBetTRC'
                                )
                              }
                              className="p-2 bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white rounded-lg border border-gray-800 transition-colors shrink-0 cursor-pointer"
                              title="Copy address"
                            >
                              {copiedAddress ? <Check className="w-4 h-4 text-orange-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                          <p className="text-[10px] text-gray-500">
                            ⚡ Funds auto-credit after 1 network confirmation (~45 seconds).
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bonus Match Checkbox */}
                  <div
                    onClick={() => setClaimBonus(!claimBonus)}
                    className="p-3 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/30 rounded-xl flex items-center justify-between cursor-pointer select-none transition-all hover:border-amber-500/50"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-amber-300">100% Sportsbook Welcome Bonus Match</p>
                        <p className="text-[10px] text-gray-400">
                          Receive +{formatCurrency(depositAmount || 0)} in Free Bet Credits (1x Wagering)
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={claimBonus}
                      onChange={() => {}}
                      className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                    />
                  </div>

                  {/* Submit CTA Button */}
                  <button
                    id="deposit-submit-btn"
                    onClick={handleDeposit}
                    disabled={isDepositProcessing || !isDepositAmountValid}
                    className={`w-full py-3.5 text-black font-black rounded-xl text-xs uppercase tracking-widest flex items-center justify-center space-x-2 shadow-lg active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      depositMethod === 'paystack'
                        ? 'bg-cyan-400 hover:bg-cyan-300 shadow-cyan-500/25'
                        : 'bg-orange-500 hover:bg-orange-400 shadow-orange-500/20'
                    }`}
                  >
                    <Lock className="w-4 h-4 stroke-[2.5]" />
                    <span>
                      {depositMethod === 'paystack'
                        ? `Pay with Paystack (${formatCurrency(depositAmount || 0)})`
                        : `Authorize Instant Deposit (${formatCurrency(depositAmount || 0)})`}
                    </span>
                  </button>

                  <div className="flex items-center justify-center space-x-4 text-[10px] text-gray-500 font-medium pt-1">
                    <span>🛡️ Bank of Ghana Compliant</span>
                    <span>🔒 256-Bit SSL Encryption</span>
                    <span>⚡ Instant 0% Fee Settlement</span>
                  </div>
                </>
              )}
            </>
          )}

          {/* ======================= TAB: WITHDRAW ======================= */}
          {activeTab === 'withdraw' && (
            <>
              {withdrawSuccessTx ? (
                <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-full bg-teal-500/20 border-2 border-teal-500/50 flex items-center justify-center mx-auto text-teal-400 shadow-lg shadow-teal-500/20">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Payout Dispatched Successfully!</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatCurrency(withdrawSuccessTx.amount)} is on its way to your destination.
                    </p>
                    <div className="inline-flex items-center space-x-2 mt-2 px-3 py-1 bg-gray-900 border border-gray-800 rounded-lg text-xs font-mono text-teal-400 font-bold">
                      <span>TxID: {withdrawSuccessTx.txId}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-900/80 border border-gray-800 rounded-xl max-w-sm mx-auto text-left space-y-2 text-xs">
                    <div className="flex justify-between text-gray-400">
                      <span>Remaining Balance:</span>
                      <span className="font-mono font-bold text-white">{formatCurrency(wallet.balance)}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Network Processing Fee:</span>
                      <span className="font-mono font-bold text-orange-400">GH₵ 0.00 (Zero Fee)</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Payment Rail:</span>
                      <span className="text-gray-300 font-semibold">{withdrawSuccessTx.method}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Est. Arrival:</span>
                      <span className="text-gray-300 font-semibold">&lt; 2 Minutes (Instant MoMo Rail)</span>
                    </div>
                  </div>

                  <div className="flex space-x-2 justify-center pt-2">
                    <button
                      onClick={() => setWithdrawSuccessTx(null)}
                      className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      New Withdrawal
                    </button>
                    <button
                      onClick={closeModal}
                      className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-lg text-xs uppercase tracking-wider shadow-lg shadow-teal-500/20 cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : isWithdrawProcessing ? (
                <div className="py-12 text-center space-y-6 animate-in fade-in duration-200">
                  <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <div className="space-y-2">
                    <h4 className="text-base font-bold text-white">Broadcasting Instant Payout...</h4>
                    <p className="text-xs text-gray-400">Verifying ledger signatures and clearing payment switch.</p>
                  </div>

                  <div className="max-w-xs mx-auto space-y-2 text-left">
                    <div
                      className={`p-2.5 rounded-lg border text-xs flex items-center space-x-2.5 transition-all ${
                        withdrawStep >= 1
                          ? 'bg-teal-500/10 text-teal-300 border-teal-500/30 font-semibold'
                          : 'bg-gray-900/60 text-gray-500 border-gray-800'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
                      <span>1. Verifying Account Limits & Balance</span>
                    </div>
                    <div
                      className={`p-2.5 rounded-lg border text-xs flex items-center space-x-2.5 transition-all ${
                        withdrawStep >= 2
                          ? 'bg-teal-500/10 text-teal-300 border-teal-500/30 font-semibold'
                          : 'bg-gray-900/60 text-gray-500 border-gray-800'
                      }`}
                    >
                      <Lock className="w-4 h-4 text-teal-400 shrink-0" />
                      <span>2. Signing Cryptographic Payout Key</span>
                    </div>
                    <div
                      className={`p-2.5 rounded-lg border text-xs flex items-center space-x-2.5 transition-all ${
                        withdrawStep >= 3
                          ? 'bg-teal-500/10 text-teal-300 border-teal-500/30 font-semibold'
                          : 'bg-gray-900/60 text-gray-500 border-gray-800'
                      }`}
                    >
                      <Zap className="w-4 h-4 text-teal-400 shrink-0" />
                      <span>3. Dispatched to MoMo / Bank Rail</span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Balance Summary Card */}
                  <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Available Withdrawable Balance:</span>
                      <span className="font-mono font-bold text-white text-base">
                        {formatCurrency(wallet.balance)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-800">
                      <span>Wagering Requirement: 100% Cleared</span>
                      <span className="text-orange-400 font-semibold">✓ KYC Tier 2 Verified</span>
                    </div>
                  </div>

                  {withdrawError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-300 font-semibold">
                      {withdrawError}
                    </div>
                  )}

                  {/* Payout Rail Selection */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                      Select Payout Rail
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        {
                          id: 'paystack',
                          label: 'Paystack Rails',
                          sub: 'MoMo & Bank Direct',
                          speed: '< 1 min',
                          icon: (
                            <div className="w-4 h-4 rounded bg-cyan-400 text-black flex items-center justify-center font-black text-[9px]">
                              P
                            </div>
                          ),
                        },
                        {
                          id: 'momo',
                          label: 'MTN / Telecel MoMo',
                          sub: 'Direct to Phone',
                          speed: '< 1 min',
                          icon: <Smartphone className="w-4 h-4 text-yellow-400" />,
                        },
                        {
                          id: 'bank_transfer',
                          label: 'Bank GIP Wire',
                          sub: 'Direct Bank Pay',
                          speed: '15 mins',
                          icon: <Building className="w-4 h-4 text-orange-400" />,
                        },
                        {
                          id: 'crypto',
                          label: 'Crypto Web3',
                          sub: 'USDT TRC20 / BTC',
                          speed: 'Instant',
                          icon: <QrCode className="w-4 h-4 text-teal-400" />,
                        },
                      ].map((m) => (
                        <button
                          key={m.id}
                          id={`withdraw-method-${m.id}`}
                          onClick={() => setWithdrawMethod(m.id as PaymentTransaction['method'])}
                          className={`p-3 rounded-xl border text-left flex flex-col justify-between space-y-1.5 transition-all cursor-pointer ${
                            withdrawMethod === m.id
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

                  {/* Percentage Quick-picks */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Withdrawal Amount (GH₵)
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
                          onClick={() => setWithdrawAmount(p.val)}
                          className="py-1.5 rounded-lg text-xs font-bold bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 cursor-pointer"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>

                    <input
                      id="withdrawal-custom-amount-input"
                      type="number"
                      min={MIN_DEPOSIT_GHS}
                      max={wallet.balance}
                      value={withdrawAmount || ''}
                      onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                      className="w-full px-3.5 py-2 font-mono text-sm font-bold bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-teal-500"
                      placeholder="Enter payout amount..."
                    />
                  </div>

                  {/* Destination Input */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                      Recipient Mobile Number / Account / Wallet
                    </label>
                    <input
                      id="withdraw-destination-input"
                      type="text"
                      value={withdrawDestination}
                      onChange={(e) => setWithdrawDestination(e.target.value)}
                      className="w-full px-3.5 py-2 font-mono text-xs bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-teal-500"
                      placeholder={
                        withdrawMethod === 'momo' || withdrawMethod === 'paystack'
                          ? 'Enter 10-digit MoMo number (e.g. 0244567890)...'
                          : withdrawMethod === 'crypto'
                          ? 'Enter USDT / BTC / ETH wallet address...'
                          : 'Enter Bank Account Number & Bank Name...'
                      }
                    />
                  </div>

                  {/* Zero Fee Assurance Banner */}
                  <div className="p-3 bg-gray-900/60 border border-gray-800 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-gray-400 flex items-center space-x-1.5">
                      <Zap className="w-3.5 h-3.5 text-teal-400" />
                      <span>Network Processing Fee:</span>
                    </span>
                    <span className="font-mono font-bold text-orange-400">GH₵ 0.00 (Zero Fee Guaranteed)</span>
                  </div>

                  {/* Submit Payout CTA */}
                  <button
                    id="withdrawal-submit-btn"
                    onClick={handleWithdrawal}
                    disabled={isWithdrawProcessing || withdrawAmount < MIN_DEPOSIT_GHS || withdrawAmount > wallet.balance}
                    className="w-full py-3.5 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl text-xs uppercase tracking-widest flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Lock className="w-4 h-4 stroke-[2.5]" />
                    <span>Confirm Instant Payout ({formatCurrency(withdrawAmount)})</span>
                  </button>
                </>
              )}
            </>
          )}

          {/* ======================= TAB: HISTORY / LEDGER ======================= */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {/* Filter Tabs */}
              <div className="flex space-x-1.5 overflow-x-auto pb-1">
                {(['all', 'deposit', 'withdrawal', 'cashout', 'bonus'] as const).map((filter) => (
                  <button
                    key={filter}
                    id={`filter-${filter}`}
                    onClick={() => setHistoryFilter(filter)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                      historyFilter === filter
                        ? 'bg-gray-800 text-orange-400 border border-orange-500/40'
                        : 'bg-gray-900 text-gray-500 hover:text-gray-300 border border-gray-800'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Transactions List */}
              {filteredTransactions.length === 0 ? (
                <div className="py-12 text-center text-gray-500 space-y-2">
                  <History className="w-8 h-8 mx-auto text-gray-600" />
                  <p className="text-sm font-bold text-gray-300">No Transactions Found</p>
                  <p className="text-xs text-gray-500">Your deposits and cashouts will be logged here.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTransactions.map((tx) => {
                    const isCredit = tx.type === 'deposit' || tx.type === 'bonus' || tx.type === 'bet_payout' || tx.type === 'cashout';
                    const isPaystack = tx.method === 'paystack' || (tx.referenceCode && tx.referenceCode.startsWith('PSTK'));
                    return (
                      <div
                        key={tx.id}
                        className="p-3 bg-gray-900/90 border border-gray-800 hover:border-gray-700 rounded-xl flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isPaystack
                                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                                : isCredit
                                ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                            }`}
                          >
                            {isPaystack ? (
                              <span className="font-black text-xs">P</span>
                            ) : isCredit ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white capitalize truncate flex items-center space-x-1.5">
                              <span>{tx.type.replace('_', ' ')} • {tx.method.replace('_', ' ')}</span>
                              {isPaystack && (
                                <span className="px-1.5 py-0.2 text-[8px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded">
                                  Paystack
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-gray-500 font-mono">
                              {new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Ref: {tx.referenceCode}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p
                            className={`text-xs font-bold font-mono ${
                              isCredit ? 'text-orange-400' : 'text-gray-200'
                            }`}
                          >
                            {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                          </p>
                          <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded">
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
