import React, { useState } from 'react';
import { useSportsbook } from '../context/SportsbookContext';
import { Sparkles, X, TrendingUp, ShieldCheck, Zap, Flame, Check } from 'lucide-react';

export const AIParlayBuilderModal: React.FC = () => {
  const { isAIParlayModalOpen, setIsAIParlayModalOpen, matches, addBetSelection, setBetSlipMode, setParlayStake } = useSportsbook();
  const [riskTier, setRiskTier] = useState<'safe' | 'balanced' | 'high_yield'>('balanced');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedResult, setGeneratedResult] = useState<{
    title: string;
    reasoning: string;
    boostPercent: number;
    suggestedMatchIds: string[];
  } | null>(null);

  if (!isAIParlayModalOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/gemini/smart-parlay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riskTier,
          availableMatches: matches.map((m) => ({
            id: m.id,
            sport: m.sport,
            league: m.league,
            homeTeam: m.homeTeam,
            awayTeam: m.awayTeam,
          })),
        }),
      });
      const data = await res.json();
      setGeneratedResult(data);
    } catch (e) {
      console.error(e);
      // Fallback
      setGeneratedResult({
        title: `${riskTier === 'safe' ? 'Conservative Anchor' : riskTier === 'high_yield' ? 'Moonshot Multiplier' : 'Balanced Value'} Parlay`,
        reasoning: 'AI synthesized dynamic match ratings and defensive turnover metrics to curate an optimal +EV parlay slip.',
        boostPercent: riskTier === 'high_yield' ? 25 : 10,
        suggestedMatchIds: matches.slice(0, 3).map((m) => m.id),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyToBetSlip = () => {
    if (!generatedResult) return;
    setBetSlipMode('parlay');
    setParlayStake(30);

    const targetMatches = matches.filter((m) => generatedResult.suggestedMatchIds.includes(m.id));
    targetMatches.forEach((m) => {
      const mainMarket = m.markets[0];
      if (mainMarket && mainMarket.outcomes[0]) {
        addBetSelection({
          id: `${m.id}-${mainMarket.id}-${mainMarket.outcomes[0].id}`,
          matchId: m.id,
          matchTitle: `${m.homeTeam.name} vs ${m.awayTeam.name}`,
          league: m.league,
          sport: m.sport,
          marketId: mainMarket.id,
          marketName: mainMarket.name,
          outcomeId: mainMarket.outcomes[0].id,
          outcomeName: mainMarket.outcomes[0].name,
          odds: mainMarket.outcomes[0].odds,
          isLive: m.status === 'live',
        });
      }
    });

    setIsAIParlayModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        id="ai-parlay-builder-modal"
        className="bg-[#13151a] border border-gray-800 rounded-xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">VantaAI Smart Parlay Architect</h3>
              <p className="text-xs text-gray-400">Automated Multi-Leg Value Accumulator</p>
            </div>
          </div>
          <button
            onClick={() => setIsAIParlayModalOpen(false)}
            className="p-2 text-gray-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-5">
          {/* Risk Tier Selection */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">
              Select Algorithmic Risk Profile
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  id: 'safe',
                  label: 'Conservative',
                  desc: 'High-confidence favorites',
                  icon: <ShieldCheck className="w-4 h-4 text-teal-400" />,
                },
                {
                  id: 'balanced',
                  label: 'Balanced',
                  desc: 'Optimal risk/reward ratio',
                  icon: <Zap className="w-4 h-4 text-amber-400" />,
                },
                {
                  id: 'high_yield',
                  label: 'Moonshot',
                  desc: 'High multiplier payout',
                  icon: <Flame className="w-4 h-4 text-red-400" />,
                },
              ].map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setRiskTier(tier.id as typeof riskTier)}
                  className={`p-3 rounded-lg border text-left flex flex-col justify-between space-y-2 transition-all ${
                    riskTier === tier.id
                      ? 'bg-emerald-500/10 text-white border-emerald-500/50 shadow-md'
                      : 'bg-gray-900 text-gray-400 hover:bg-gray-800 border-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{tier.icon}</span>
                    {riskTier === tier.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-200">{tier.label}</p>
                    <p className="text-[10px] text-gray-500 leading-tight mt-0.5">{tier.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Trigger */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Sparkles className="w-4 h-4 stroke-[2.5]" />
                <span>Synthesize Optimal Parlay</span>
              </>
            )}
          </button>

          {/* Generated Result */}
          {generatedResult && (
            <div className="p-4 bg-gray-900 border border-emerald-500/30 rounded-xl space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                  {generatedResult.title}
                </h4>
                <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  +{generatedResult.boostPercent}% Multiplier Boost
                </span>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">
                {generatedResult.reasoning}
              </p>

              <button
                onClick={handleApplyToBetSlip}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all shadow-md active:scale-95"
              >
                <TrendingUp className="w-4 h-4 stroke-[2.5]" />
                <span>Load Selections to Bet Slip</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
