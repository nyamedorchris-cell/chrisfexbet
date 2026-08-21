import React, { useState } from 'react';
import { useSportsbook } from '../context/SportsbookContext';
import {
  ShieldCheck,
  X,
  Sliders,
  CheckCircle2,
  Clock,
  HeartHandshake,
  AlertTriangle,
} from 'lucide-react';
import { formatCurrency, MIN_DEPOSIT_GHS, MAX_DEPOSIT_GHS } from '../utils/oddsFormatter';

export const ResponsibleGamingModal: React.FC = () => {
  const { isResponsibleModalOpen, setIsResponsibleModalOpen, wallet, updateDepositLimit } = useSportsbook();
  const [dailyLimit, setDailyLimit] = useState(wallet.depositLimitDaily || 10000);
  const [monthlyLimit, setMonthlyLimit] = useState(wallet.depositLimitMonthly || 50000);
  const [isSaved, setIsSaved] = useState(false);

  if (!isResponsibleModalOpen) return null;

  const handleSave = () => {
    updateDepositLimit(dailyLimit, monthlyLimit);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setIsResponsibleModalOpen(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        id="responsible-gaming-modal"
        className="bg-[#13151a] border border-gray-800 rounded-xl max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Responsible Gaming Hub</h3>
              <p className="text-xs text-gray-400">Player Protection & Deposit Limits (Ghana Cedis)</p>
            </div>
          </div>
          <button
            onClick={() => setIsResponsibleModalOpen(false)}
            className="p-2 text-gray-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-5">
          {isSaved ? (
            <div className="py-8 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-orange-400 mx-auto" />
              <p className="text-sm font-bold text-white">Limits Updated Successfully</p>
              <p className="text-xs text-gray-400">Your deposit caps have been saved to your player profile.</p>
            </div>
          ) : (
            <>
              <div className="p-3 bg-gray-900 border border-gray-800 rounded-lg flex items-start space-x-3 text-xs text-gray-300">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  CHRISFIXBET promotes safe and measured sports wagering. Setting limits ensures you stay within your entertainment budget.
                </p>
              </div>

              {/* Daily Limit Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-gray-300">Daily Deposit Limit:</span>
                  <span className="font-mono text-orange-400">{formatCurrency(dailyLimit)}</span>
                </div>
                <input
                  type="range"
                  min={MIN_DEPOSIT_GHS}
                  max={MAX_DEPOSIT_GHS}
                  step="50"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Number(e.target.value))}
                  className="w-full accent-orange-500 bg-gray-800 rounded-lg h-2 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-mono">
                  <span>GH₵ {MIN_DEPOSIT_GHS}</span>
                  <span>GH₵ {MAX_DEPOSIT_GHS.toLocaleString()}</span>
                </div>
              </div>

              {/* Monthly Limit Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-gray-300">Monthly Deposit Limit:</span>
                  <span className="font-mono text-orange-400">{formatCurrency(monthlyLimit)}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="250000"
                  step="500"
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(Number(e.target.value))}
                  className="w-full accent-orange-500 bg-gray-800 rounded-lg h-2 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-mono">
                  <span>GH₵ 500</span>
                  <span>GH₵ 250,000</span>
                </div>
              </div>

              {/* Support Links */}
              <div className="pt-2 border-t border-gray-800 space-y-1.5 text-xs text-gray-400">
                <p className="font-bold text-gray-300 flex items-center space-x-1.5">
                  <HeartHandshake className="w-3.5 h-3.5 text-rose-400" />
                  <span>24/7 Confidential Assistance</span>
                </p>
                <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                  <a
                    href="https://www.gamingcommission.gov.gh"
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-lg text-gray-300 hover:text-white"
                  >
                    Gaming Commission of Ghana
                  </a>
                  <a
                    href="https://www.begambleaware.org"
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-lg text-gray-300 hover:text-white"
                  >
                    BeGambleAware.org
                  </a>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                className="w-full py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-bold rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Save Limits
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
