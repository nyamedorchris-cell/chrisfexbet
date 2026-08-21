import React, { useState } from 'react';
import { Match } from '../types';
import { OddsButton } from './OddsButton';
import { useSportsbook } from '../context/SportsbookContext';
import { useChat } from '../context/ChatContext';
import { AnimatePresence, motion } from 'motion/react';
import { generateSmartTip } from '../utils/aiAnalysisHelper';
import { formatOdds } from '../utils/oddsFormatter';
import {
  Activity,
  Flame,
  ChevronRight,
  ChevronDown,
  Sparkles,
  BarChart3,
  TrendingUp,
  Shield,
  Zap,
  Target,
  Brain,
  CheckCircle2,
  Plus,
  Info,
  X,
  MessageSquare,
} from 'lucide-react';

interface MatchCardProps {
  match: Match;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const { setActiveMatch, activeMatch, oddsFormat, betSlipItems, addBetSelection } = useSportsbook();
  const { setCurrentRoomId, setIsChatOpen } = useChat();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [showSmartTipModal, setShowSmartTipModal] = useState(false);
  const isSelected = activeMatch?.id === match.id;

  const smartTip = generateSmartTip(match);
  const isTipSelected = betSlipItems.some((item) => item.outcomeId === smartTip.outcomeId);

  const mainMarket = match.markets.find((m) => m.category === 'main') || match.markets[0];
  const goalsMarket = match.markets.find((m) => m.category === 'goals');

  // Fallback stats or actual match stats
  const possession = match.stats?.possession || [52, 48];
  const xG = match.stats?.expectedGoals || [1.45, 1.10];
  const shotsOnTarget = match.stats?.shotsOnTarget || [5, 4];
  const dangerousAttacks = match.stats?.dangerousAttacks || [48, 39];
  const corners = match.stats?.corners || [6, 4];

  // Derived win probability from odds or standard defaults
  const homeOdd = mainMarket?.outcomes[0]?.odds || 2.10;
  const drawOdd = mainMarket?.outcomes[1]?.odds || 3.40;
  const awayOdd = mainMarket?.outcomes[2]?.odds || 3.20;

  const rawHome = 1 / homeOdd;
  const rawDraw = mainMarket?.outcomes.length === 3 ? 1 / drawOdd : 0;
  const rawAway = 1 / awayOdd;
  const sumProb = rawHome + rawDraw + rawAway;

  const homeProb = Math.round((rawHome / sumProb) * 100);
  const drawProb = rawDraw ? Math.round((rawDraw / sumProb) * 100) : 0;
  const awayProb = 100 - homeProb - drawProb;

  const handleAddSmartTipToSlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!smartTip.targetOutcome) return;

    addBetSelection({
      id: `${match.id}-${smartTip.marketId}-${smartTip.outcomeId}`,
      matchId: match.id,
      matchTitle: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
      league: match.league,
      sport: match.sport,
      marketId: smartTip.marketId,
      marketName: smartTip.marketName,
      outcomeId: smartTip.outcomeId,
      outcomeName: smartTip.targetOutcome.name || smartTip.outcomeName,
      odds: smartTip.odds,
      previousOdds: smartTip.targetOutcome.previousOdds,
      isLive: match.status === 'live',
    });
  };

  return (
    <div
      id={`match-card-${match.id}`}
      onClick={() => setActiveMatch(match)}
      className={`relative bg-[#13151a] hover:bg-[#171920] border rounded-xl p-4 sm:p-5 transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/40'
          : 'border-gray-800 hover:border-gray-700'
      }`}
    >
      {/* Top Meta: League, Live Status & Smart Tip Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-gray-800/80">
        <div className="flex items-center space-x-2 min-w-0">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest truncate">
            {match.league}
          </span>
          {match.isFeatured && (
            <span className="flex items-center space-x-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded">
              <Flame className="w-3 h-3" />
              <span>Top Event</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Smart Tip Interactive Badge */}
          <div className="relative">
            <button
              id={`smart-tip-badge-${match.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowSmartTipModal((prev) => !prev);
              }}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                showSmartTipModal
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-500/20 ring-1 ring-emerald-500/30'
                  : 'bg-gradient-to-r from-emerald-950/70 to-[#0f1d19] text-emerald-400 hover:text-emerald-300 border-emerald-500/30 hover:border-emerald-500/50 shadow-sm'
              }`}
              title="Click to view AI Historical Analysis"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Brain className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-400">Smart Tip:</span>
              <span className="text-gray-200 font-semibold text-[11px] truncate max-w-[110px] sm:max-w-[150px]">
                {smartTip.outcomeName}
              </span>
              <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold rounded">
                {smartTip.probability}%
              </span>
            </button>

            {/* Smart Tip Popover Panel */}
            <AnimatePresence>
              {showSmartTipModal && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 sm:right-auto sm:left-0 top-full mt-2 w-72 sm:w-80 p-3.5 bg-[#13151a] border border-emerald-500/40 rounded-xl shadow-2xl z-40 space-y-2.5 backdrop-blur-md ring-1 ring-emerald-500/20"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                    <div className="flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        AI Predictive Edge
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold uppercase rounded">
                        {smartTip.confidenceLevel}
                      </span>
                      <button
                        onClick={() => setShowSmartTipModal(false)}
                        className="text-gray-400 hover:text-white p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-2.5 bg-gray-900/90 rounded-lg border border-gray-800 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 font-medium">Recommended Pick:</span>
                      <span className="font-bold text-emerald-400">{smartTip.outcomeName}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-400">Model Probability:</span>
                      <span className="font-mono font-bold text-white">{smartTip.probability}%</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-400">Current Odds:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {formatOdds(smartTip.odds, oddsFormat)}
                      </span>
                    </div>
                  </div>

                  {/* Historical Rationale */}
                  <div className="space-y-1 text-[11px]">
                    <div className="text-gray-400 flex items-center space-x-1 font-semibold uppercase tracking-wider text-[9px]">
                      <Info className="w-3 h-3 text-emerald-400" />
                      <span>Historical Data Analysis</span>
                    </div>
                    <p className="text-gray-300 leading-relaxed bg-gray-900/50 p-2 rounded border border-gray-800/80">
                      {smartTip.historicalRationale}
                    </p>
                  </div>

                  {/* 1-Click Action to Add to Bet Slip */}
                  <button
                    id={`smart-tip-add-slip-${match.id}`}
                    type="button"
                    onClick={handleAddSmartTipToSlip}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                      isTipSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-md shadow-emerald-500/20 active:scale-[0.98]'
                    }`}
                  >
                    {isTipSelected ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>In Bet Slip ({formatOdds(smartTip.odds, oddsFormat)})</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Add Smart Tip @ {formatOdds(smartTip.odds, oddsFormat)}</span>
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {match.status === 'live' ? (
            <div className="flex items-center space-x-1.5 px-2.5 py-0.5 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 text-[11px] font-bold font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
              <span>{match.minute ? `${match.minute}'` : match.period || 'LIVE'}</span>
            </div>
          ) : (
            <span className="text-[11px] font-medium text-gray-400 bg-gray-800/80 px-2 py-0.5 rounded border border-gray-700/60">
              {match.startTime}
            </span>
          )}
        </div>
      </div>

      {/* Match Competitors & Scores */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
        <div className="sm:col-span-6 space-y-2.5">
          {/* Home Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-xs font-bold text-gray-300 shrink-0">
                {match.homeTeam.shortName?.slice(0, 3) || match.homeTeam.name.slice(0, 3)}
              </div>
              <span className="text-sm font-medium text-gray-100 truncate">
                {match.homeTeam.name}
              </span>
            </div>
            {match.status === 'live' && (
              <span className="font-mono font-bold text-sm text-white bg-gray-900 px-2.5 py-0.5 rounded border border-gray-800">
                {match.score.home}
              </span>
            )}
          </div>

          {/* Away Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-xs font-bold text-gray-300 shrink-0">
                {match.awayTeam.shortName?.slice(0, 3) || match.awayTeam.name.slice(0, 3)}
              </div>
              <span className="text-sm font-medium text-gray-100 truncate">
                {match.awayTeam.name}
              </span>
            </div>
            {match.status === 'live' && (
              <span className="font-mono font-bold text-sm text-white bg-gray-900 px-2.5 py-0.5 rounded border border-gray-800">
                {match.score.away}
              </span>
            )}
          </div>
        </div>

        {/* Odds Grid (Main Market) */}
        <div className="sm:col-span-6 flex flex-col justify-center space-y-1.5">
          {mainMarket && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {mainMarket.outcomes.slice(0, 3).map((outcome) => (
                <OddsButton
                  key={outcome.id}
                  matchId={match.id}
                  matchTitle={`${match.homeTeam.name} vs ${match.awayTeam.name}`}
                  league={match.league}
                  sport={match.sport}
                  marketId={mainMarket.id}
                  marketName={mainMarket.name}
                  outcome={outcome}
                  isLive={match.status === 'live'}
                />
              ))}
            </div>
          )}

          {goalsMarket && (
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {goalsMarket.outcomes.slice(0, 2).map((outcome) => (
                <OddsButton
                  key={outcome.id}
                  matchId={match.id}
                  matchTitle={`${match.homeTeam.name} vs ${match.awayTeam.name}`}
                  league={match.league}
                  sport={match.sport}
                  marketId={goalsMarket.id}
                  marketName={goalsMarket.name}
                  outcome={outcome}
                  isLive={match.status === 'live'}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Info: Markets Count, Quick View Toggle & Full Center link */}
      <div className="mt-3.5 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center space-x-3">
          <span className="text-[11px] font-medium text-gray-500">
            +{match.markets.length * 4} Markets
          </span>

          {/* Quick View Toggle Button */}
          <button
            id={`quick-view-toggle-${match.id}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsQuickViewOpen((prev) => !prev);
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center space-x-1.5 transition-all border cursor-pointer ${
              isQuickViewOpen
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                : 'bg-gray-900 text-gray-400 hover:text-gray-200 border-gray-800 hover:border-gray-700'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Quick View</span>
            <ChevronDown
              className={`w-3 h-3 transition-transform duration-200 ${
                isQuickViewOpen ? 'rotate-180 text-emerald-400' : ''
              }`}
            />
          </button>

          {/* Live Match Chat Trigger */}
          {match.status === 'live' && (
            <button
              id={`live-chat-toggle-${match.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentRoomId(match.id);
                setIsChatOpen(true);
              }}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-black border border-orange-500/30 flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <MessageSquare className="w-3 h-3 fill-current" />
              <span>Live Chat</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 text-emerald-500 hover:text-emerald-400 font-semibold text-xs transition-colors">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Match Center</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Expandable Quick View Statistics Section */}
      <AnimatePresence>
        {isQuickViewOpen && (
          <motion.div
            id={`quick-view-panel-${match.id}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            onClick={(e) => e.stopPropagation()}
            className="overflow-hidden"
          >
            <div className="mt-3.5 pt-3.5 border-t border-dashed border-gray-800 space-y-3.5">
              {/* Highlighted AI Smart Tip Insight Bar */}
              <div className="p-3 bg-gradient-to-r from-emerald-950/40 via-gray-900 to-[#121c19] rounded-xl border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">Smart Tip: {smartTip.outcomeName}</span>
                      <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px] rounded">
                        {smartTip.probability}% Confidence
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">{smartTip.historicalRationale}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddSmartTipToSlip}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                    isTipSelected
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-md shadow-emerald-500/20 active:scale-95'
                  }`}
                >
                  {isTipSelected ? 'In Slip ✓' : `Bet Pick @ ${formatOdds(smartTip.odds, oddsFormat)}`}
                </button>
              </div>

              {/* Form & Recent Head-to-Head */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-gray-900/90 rounded-lg border border-gray-800">
                {/* Home Form */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-300 truncate max-w-[100px]">
                      {match.homeTeam.name}
                    </span>
                    <span className="text-[10px] text-gray-500">Form:</span>
                  </div>
                  <div className="flex space-x-1">
                    {match.homeTeam.form?.map((f, i) => (
                      <span
                        key={i}
                        className={`w-4 h-4 rounded text-[9px] font-mono font-bold flex items-center justify-center ${
                          f === 'W'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : f === 'D'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {f}
                      </span>
                    )) || <span className="text-gray-500">W W D</span>}
                  </div>
                </div>

                {/* Away Form */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-300 truncate max-w-[100px]">
                      {match.awayTeam.name}
                    </span>
                    <span className="text-[10px] text-gray-500">Form:</span>
                  </div>
                  <div className="flex space-x-1">
                    {match.awayTeam.form?.map((f, i) => (
                      <span
                        key={i}
                        className={`w-4 h-4 rounded text-[9px] font-mono font-bold flex items-center justify-center ${
                          f === 'W'
                            ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                            : f === 'D'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {f}
                      </span>
                    )) || <span className="text-gray-500">W L W</span>}
                  </div>
                </div>
              </div>

              {/* Statistical Comparison Gauges */}
              <div className="space-y-2.5 p-3 bg-gray-900/60 rounded-lg border border-gray-800/80">
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 pb-1 border-b border-gray-800">
                  <span className="text-emerald-400">{match.homeTeam.shortName || match.homeTeam.name}</span>
                  <span className="uppercase tracking-wider text-[10px] text-gray-500">Match Insights</span>
                  <span className="text-teal-400">{match.awayTeam.shortName || match.awayTeam.name}</span>
                </div>

                {/* Possession Metric */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-emerald-400 font-bold">{possession[0]}%</span>
                    <span className="text-gray-400 text-[10px] uppercase font-sans">Possession</span>
                    <span className="text-teal-400 font-bold">{possession[1]}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full rounded-l-full transition-all duration-500"
                      style={{ width: `${possession[0]}%` }}
                    />
                    <div
                      className="bg-teal-400 h-full rounded-r-full transition-all duration-500"
                      style={{ width: `${possession[1]}%` }}
                    />
                  </div>
                </div>

                {/* Expected Goals (xG) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-emerald-400 font-bold">{xG[0].toFixed(2)}</span>
                    <span className="text-gray-400 text-[10px] uppercase font-sans">Expected Goals (xG)</span>
                    <span className="text-teal-400 font-bold">{xG[1].toFixed(2)}</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full rounded-l-full transition-all duration-500"
                      style={{
                        width: `${Math.round((xG[0] / (xG[0] + xG[1])) * 100)}%`,
                      }}
                    />
                    <div
                      className="bg-teal-400 h-full rounded-r-full transition-all duration-500"
                      style={{
                        width: `${Math.round((xG[1] / (xG[0] + xG[1])) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Shots on Target */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-emerald-400 font-bold">{shotsOnTarget[0]}</span>
                    <span className="text-gray-400 text-[10px] uppercase font-sans">Shots on Target</span>
                    <span className="text-teal-400 font-bold">{shotsOnTarget[1]}</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full rounded-l-full transition-all duration-500"
                      style={{
                        width: `${Math.round(
                          (shotsOnTarget[0] / (shotsOnTarget[0] + shotsOnTarget[1] || 1)) * 100
                        )}%`,
                      }}
                    />
                    <div
                      className="bg-teal-400 h-full rounded-r-full transition-all duration-500"
                      style={{
                        width: `${Math.round(
                          (shotsOnTarget[1] / (shotsOnTarget[0] + shotsOnTarget[1] || 1)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Dangerous Attacks & Corners Row */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-800/60 text-[10px] font-mono">
                  <div className="flex items-center justify-between px-2 py-1 bg-gray-950/60 rounded border border-gray-800">
                    <span className="text-gray-500 font-sans">Attacks:</span>
                    <span className="text-gray-300">
                      <strong className="text-emerald-400">{dangerousAttacks[0]}</strong> -{' '}
                      <strong className="text-teal-400">{dangerousAttacks[1]}</strong>
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-2 py-1 bg-gray-950/60 rounded border border-gray-800">
                    <span className="text-gray-500 font-sans">Corners:</span>
                    <span className="text-gray-300">
                      <strong className="text-emerald-400">{corners[0]}</strong> -{' '}
                      <strong className="text-teal-400">{corners[1]}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Estimated Win Probability Strip & H2H Summary */}
              <div className="p-3 bg-gray-900/40 rounded-lg border border-gray-800 space-y-2">
                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-gray-400">
                  <span className="flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    <span>Market Implied Probability</span>
                  </span>
                  {match.h2hSummary && (
                    <span className="text-gray-500 font-normal normal-case truncate max-w-[180px]">
                      {match.h2hSummary}
                    </span>
                  )}
                </div>

                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden flex text-[8px] font-mono font-bold text-black">
                  <div
                    style={{ width: `${homeProb}%` }}
                    className="bg-emerald-500 flex items-center justify-center"
                    title={`Home: ${homeProb}%`}
                  >
                    {homeProb > 20 && `${homeProb}%`}
                  </div>
                  {drawProb > 0 && (
                    <div
                      style={{ width: `${drawProb}%` }}
                      className="bg-amber-400 flex items-center justify-center"
                      title={`Draw: ${drawProb}%`}
                    >
                      {drawProb > 15 && `${drawProb}%`}
                    </div>
                  )}
                  <div
                    style={{ width: `${awayProb}%` }}
                    className="bg-teal-400 flex items-center justify-center"
                    title={`Away: ${awayProb}%`}
                  >
                    {awayProb > 20 && `${awayProb}%`}
                  </div>
                </div>

                <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                  <span>1 ({homeProb}%)</span>
                  {drawProb > 0 && <span>X ({drawProb}%)</span>}
                  <span>2 ({awayProb}%)</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


