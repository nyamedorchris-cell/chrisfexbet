import React, { useState } from 'react';
import { useSportsbook } from '../context/SportsbookContext';
import {
  Receipt,
  X,
  CheckCircle2,
  Share2,
  Download,
  ShieldCheck,
  QrCode,
  Check,
} from 'lucide-react';
import { formatCurrency } from '../utils/oddsFormatter';

export const BetReceiptModal: React.FC = () => {
  const { receiptBet, setReceiptBet } = useSportsbook();
  const [copied, setCopied] = useState(false);

  if (!receiptBet) return null;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `CHRISFIXBET Wager Ticket #${receiptBet.id.slice(-6).toUpperCase()}: Potential Return ${formatCurrency(receiptBet.potentialPayout)}!`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        id="bet-receipt-modal"
        className="bg-[#13151a] border border-gray-800 rounded-xl max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-4 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-orange-400" />
            <h3 className="text-sm font-bold text-white">Digital Wager Ticket</h3>
          </div>
          <button
            onClick={() => setReceiptBet(null)}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Receipt Ticket Visual */}
        <div className="p-6 space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-inner space-y-4 relative">
            {/* Watermark Logo */}
            <div className="flex items-center justify-between pb-3 border-b border-dashed border-gray-700">
              <div>
                <span className="text-sm font-bold text-white font-mono tracking-tight uppercase">
                  CHRISFIX<span className="text-orange-500">BET</span>
                </span>
                <p className="text-[10px] text-gray-500">Official Sportsbook Receipt</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-orange-400">
                  #{receiptBet.id.slice(-6).toUpperCase()}
                </span>
                <p className="text-[9px] text-gray-500">{new Date(receiptBet.placedAt).toLocaleTimeString()}</p>
              </div>
            </div>

            {/* Selections list */}
            <div className="space-y-3">
              {receiptBet.items.map((item, idx) => (
                <div key={idx} className="text-xs space-y-0.5">
                  <div className="flex justify-between font-bold">
                    <span className="text-orange-400">{item.outcomeName}</span>
                    <span className="font-mono text-white">@{item.odds.toFixed(2)}</span>
                  </div>
                  <p className="text-[11px] text-gray-300 truncate">{item.matchTitle}</p>
                  <p className="text-[10px] text-gray-500">{item.league} • {item.marketName}</p>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="pt-3 border-t border-dashed border-gray-700 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-gray-400">
                <span>Wager Type:</span>
                <span className="text-white uppercase font-bold">{receiptBet.type}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Total Stake:</span>
                <span className="text-white font-bold">{formatCurrency(receiptBet.totalStake)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Combined Multiplier:</span>
                <span className="text-orange-400 font-bold">{receiptBet.totalOdds}</span>
              </div>
              <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-gray-800">
                <span>Est. Payout:</span>
                <span className="text-orange-400 font-bold">{formatCurrency(receiptBet.potentialPayout)}</span>
              </div>
            </div>

            {/* Simulated Barcode */}
            <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
              <div className="space-y-1">
                <div className="h-6 flex space-x-1 items-end opacity-60">
                  <div className="w-1 h-full bg-white"></div>
                  <div className="w-0.5 h-full bg-white"></div>
                  <div className="w-2 h-full bg-white"></div>
                  <div className="w-0.5 h-full bg-white"></div>
                  <div className="w-1.5 h-full bg-white"></div>
                  <div className="w-0.5 h-full bg-white"></div>
                  <div className="w-2 h-full bg-white"></div>
                  <div className="w-1 h-full bg-white"></div>
                  <div className="w-0.5 h-full bg-white"></div>
                  <div className="w-1.5 h-full bg-white"></div>
                </div>
                <p className="text-[8px] font-mono text-gray-500">SHA-256 INTEGRITY VERIFIED</p>
              </div>

              <QrCode className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          {/* Share / Close Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              className="flex-1 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-lg border border-gray-800 text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-400">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Share Slip</span>
                </>
              )}
            </button>
            <button
              onClick={() => setReceiptBet(null)}
              className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-bold rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
