import React, { useEffect, useState } from 'react';
import { MarketOutcome, SportId } from '../types';
import { formatOdds } from '../utils/oddsFormatter';
import { useSportsbook } from '../context/SportsbookContext';
import { TrendingUp, TrendingDown, Lock } from 'lucide-react';

interface OddsButtonProps {
  matchId: string;
  matchTitle: string;
  league: string;
  sport: SportId;
  marketId: string;
  marketName: string;
  outcome: MarketOutcome;
  label?: string;
  isLive?: boolean;
  className?: string;
}

export const OddsButton: React.FC<OddsButtonProps> = ({
  matchId,
  matchTitle,
  league,
  sport,
  marketId,
  marketName,
  outcome,
  label,
  isLive = false,
  className = '',
}) => {
  const { oddsFormat, betSlipItems, addBetSelection } = useSportsbook();
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);

  const isSelected = betSlipItems.some((item) => item.outcomeId === outcome.id);

  // Trigger flash on odds changes
  useEffect(() => {
    if (outcome.previousOdds && outcome.previousOdds !== outcome.odds) {
      if (outcome.odds > outcome.previousOdds) {
        setFlash('up');
      } else {
        setFlash('down');
      }
      const t = setTimeout(() => setFlash(null), 1800);
      return () => clearTimeout(t);
    }
  }, [outcome.odds, outcome.previousOdds]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (outcome.isSuspended) return;

    addBetSelection({
      id: `${matchId}-${marketId}-${outcome.id}`,
      matchId,
      matchTitle,
      league,
      sport,
      marketId,
      marketName,
      outcomeId: outcome.id,
      outcomeName: outcome.name,
      odds: outcome.odds,
      previousOdds: outcome.previousOdds,
      isLive,
    });
  };

  if (outcome.isSuspended) {
    return (
      <button
        id={`odds-btn-${outcome.id}`}
        disabled
        className={`flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-zinc-500 cursor-not-allowed text-xs font-medium ${className}`}
      >
        <span className="truncate mr-1">{label || outcome.name}</span>
        <Lock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
      </button>
    );
  }

  let flashClass = '';
  if (flash === 'up') {
    flashClass = 'bg-orange-500/20 border-orange-500/60 text-orange-400';
  } else if (flash === 'down') {
    flashClass = 'bg-rose-500/20 border-rose-500/60 text-rose-400';
  } else if (isSelected) {
    flashClass = 'bg-gradient-to-r from-orange-500 to-amber-400 text-black font-bold border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.35)]';
  } else {
    flashClass = 'bg-gray-800/90 hover:bg-gray-800 border-gray-700 text-gray-200 hover:border-orange-500/50';
  }

  return (
    <button
      id={`odds-btn-${outcome.id}`}
      onClick={handleClick}
      className={`group relative flex items-center justify-between px-3 py-2 rounded-lg border transition-all duration-150 text-xs font-medium select-none active:scale-[0.98] ${flashClass} ${className}`}
    >
      <span className={`truncate text-left text-[11px] ${isSelected ? 'text-black font-bold opacity-80' : 'text-gray-400 group-hover:text-gray-300'}`}>
        {label || outcome.name}
      </span>
      <div className="flex items-center space-x-1 shrink-0 ml-1.5 font-mono font-semibold">
        {flash === 'up' && <TrendingUp className="w-3 h-3 text-orange-400 animate-bounce" />}
        {flash === 'down' && <TrendingDown className="w-3 h-3 text-rose-400 animate-bounce" />}
        <span className={isSelected ? 'text-black font-bold font-mono text-xs sm:text-sm' : 'text-orange-400 font-bold font-mono text-xs sm:text-sm group-hover:text-orange-300'}>
          {formatOdds(outcome.odds, oddsFormat)}
        </span>
      </div>
    </button>
  );
};
