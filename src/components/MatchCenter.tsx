import React, { useState, useEffect } from 'react';
import { useSportsbook } from '../context/SportsbookContext';
import { PitchVisualizer } from './PitchVisualizer';
import { OddsButton } from './OddsButton';
import { LiveMatchChatRoom } from './chat/LiveMatchChatRoom';
import {
  Sparkles,
  Activity,
  Layers,
  BarChart3,
  History,
  Shield,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';

export const MatchCenter: React.FC = () => {
  const { activeMatch, fetchAIMatchAnalysis, aiAnalysisCache, isAnalyzingMatch } = useSportsbook();
  const [activeTab, setActiveTab] = useState<'tracker' | 'markets' | 'ai' | 'h2h' | 'chat'>('tracker');
  const [marketCategory, setMarketCategory] = useState<string>('all');

  useEffect(() => {
    if (activeMatch && activeTab === 'ai' && !aiAnalysisCache[activeMatch.id]) {
      fetchAIMatchAnalysis(activeMatch);
    }
  }, [activeMatch, activeTab, aiAnalysisCache, fetchAIMatchAnalysis]);

  if (!activeMatch) {
    return (
      <div className="bg-[#13151a] border border-gray-800 rounded-xl p-8 text-center text-gray-500">
        <Activity className="w-8 h-8 mx-auto mb-2 text-gray-600" />
        <p className="text-sm font-medium">Select any sports event to view live tracker & AI analytics</p>
      </div>
    );
  }

  const aiAnalysis = aiAnalysisCache[activeMatch.id];
  const categories = ['all', 'main', 'goals', 'halves', 'specials'];

  const filteredMarkets = activeMatch.markets.filter(
    (m) => marketCategory === 'all' || m.category === marketCategory
  );

  return (
    <div id="match-center-container" className="space-y-4">
      {/* Match Banner Card */}
      <div className="bg-[#13151a] border border-gray-800 rounded-xl p-4 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-800 text-xs">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 bg-gray-800 text-gray-300 font-bold uppercase rounded text-[10px]">
              {activeMatch.sport}
            </span>
            <span className="text-gray-400 font-semibold">{activeMatch.league}</span>
          </div>

          <div>
            {activeMatch.status === 'live' ? (
              <span className="flex items-center space-x-1.5 px-2.5 py-0.5 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 text-xs font-bold font-mono">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <span>{activeMatch.minute ? `${activeMatch.minute}' MIN` : activeMatch.period || 'LIVE'}</span>
              </span>
            ) : (
              <span className="text-xs font-medium text-gray-400 bg-gray-800 px-2.5 py-1 rounded-md border border-gray-700">
                {activeMatch.startTime}
              </span>
            )}
          </div>
        </div>

        {/* Big Teams Scoreboard */}
        <div className="grid grid-cols-11 items-center gap-2 text-center">
          {/* Home Team */}
          <div className="col-span-5 flex flex-col items-center space-y-2">
            <div className="w-14 h-14 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-lg font-black text-white shadow-lg">
              {activeMatch.homeTeam.shortName || activeMatch.homeTeam.name.slice(0, 3)}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {activeMatch.homeTeam.name}
              </h3>
              {activeMatch.homeTeam.rank && (
                <p className="text-[11px] text-gray-400">{activeMatch.homeTeam.rank}</p>
              )}
            </div>
          </div>

          {/* Center Score / VS */}
          <div className="col-span-1 flex flex-col items-center justify-center">
            {activeMatch.status === 'live' ? (
              <div className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-xl">
                <span className="font-mono text-xl sm:text-2xl font-bold text-orange-400 tracking-wider">
                  {activeMatch.score.home} : {activeMatch.score.away}
                </span>
              </div>
            ) : (
              <span className="text-sm font-bold font-mono text-gray-500 uppercase">VS</span>
            )}
          </div>

          {/* Away Team */}
          <div className="col-span-5 flex flex-col items-center space-y-2">
            <div className="w-14 h-14 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-lg font-black text-white shadow-lg">
              {activeMatch.awayTeam.shortName || activeMatch.awayTeam.name.slice(0, 3)}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {activeMatch.awayTeam.name}
              </h3>
              {activeMatch.awayTeam.rank && (
                <p className="text-[11px] text-gray-400">{activeMatch.awayTeam.rank}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center space-x-2 border-b border-gray-800 pb-2 overflow-x-auto no-scrollbar">
        <button
          id="tab-btn-tracker"
          onClick={() => setActiveTab('tracker')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'tracker'
              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/80'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Live Radar & Stats</span>
        </button>

        <button
          id="tab-btn-markets"
          onClick={() => setActiveTab('markets')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'markets'
              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/80'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Markets ({activeMatch.markets.length})</span>
        </button>

        <button
          id="tab-btn-ai"
          onClick={() => {
            setActiveTab('ai');
            if (!aiAnalysisCache[activeMatch.id]) {
              fetchAIMatchAnalysis(activeMatch);
            }
          }}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'ai'
              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
              : 'text-gray-400 hover:text-orange-400 hover:bg-gray-800/80'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
          <span>ChrisFix AI Intelligence</span>
        </button>

        <button
          id="tab-btn-h2h"
          onClick={() => setActiveTab('h2h')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'h2h'
              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/80'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Form & H2H</span>
        </button>

        <button
          id="tab-btn-chat"
          onClick={() => setActiveTab('chat')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'chat'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-black font-black shadow-md'
              : 'bg-orange-500/10 text-orange-400 border border-orange-500/30 hover:bg-orange-500/20'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 fill-current" />
          <span>Live Match Chat 🇬🇭</span>
        </button>
      </div>

      {/* TAB CONTENT: 1. LIVE TRACKER */}
      {activeTab === 'tracker' && (
        <div className="space-y-4">
          <PitchVisualizer match={activeMatch} />

          {/* Match Stats Comparison Bars */}
          {activeMatch.stats && (
            <div className="bg-[#13151a] border border-gray-800 rounded-xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center space-x-1.5">
                  <BarChart3 className="w-4 h-4 text-orange-400" />
                  <span>Match Performance Statistics</span>
                </h4>
                <div className="flex items-center space-x-3 text-[11px] font-bold">
                  <span className="text-orange-400">{activeMatch.homeTeam.shortName}</span>
                  <span className="text-gray-500">vs</span>
                  <span className="text-teal-400">{activeMatch.awayTeam.shortName}</span>
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Possession */}
                {activeMatch.stats.possession && (
                  <div>
                    <div className="flex justify-between font-mono text-[11px] font-semibold text-gray-300 mb-1">
                      <span>{activeMatch.stats.possession[0]}%</span>
                      <span className="text-gray-500 font-sans font-normal">Ball Possession</span>
                      <span>{activeMatch.stats.possession[1]}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden flex">
                      <div
                        className="bg-orange-500 transition-all duration-500"
                        style={{ width: `${activeMatch.stats.possession[0]}%` }}
                      ></div>
                      <div
                        className="bg-teal-500 transition-all duration-500"
                        style={{ width: `${activeMatch.stats.possession[1]}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Total Shots */}
                {activeMatch.stats.shots && (
                  <div>
                    <div className="flex justify-between font-mono text-[11px] font-semibold text-gray-300 mb-1">
                      <span>{activeMatch.stats.shots[0]}</span>
                      <span className="text-gray-500 font-sans font-normal">Total Shots (On Target)</span>
                      <span>{activeMatch.stats.shots[1]}</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden flex">
                      <div
                        className="bg-orange-500"
                        style={{
                          width: `${
                            (activeMatch.stats.shots[0] /
                              (activeMatch.stats.shots[0] + activeMatch.stats.shots[1] || 1)) *
                            100
                          }%`,
                        }}
                      ></div>
                      <div
                        className="bg-teal-500"
                        style={{
                          width: `${
                            (activeMatch.stats.shots[1] /
                              (activeMatch.stats.shots[0] + activeMatch.stats.shots[1] || 1)) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Dangerous Attacks / xG */}
                {activeMatch.stats.expectedGoals && (
                  <div>
                    <div className="flex justify-between font-mono text-[11px] font-semibold text-gray-300 mb-1">
                      <span>{activeMatch.stats.expectedGoals[0].toFixed(2)}</span>
                      <span className="text-gray-500 font-sans font-normal">Expected Goals (xG)</span>
                      <span>{activeMatch.stats.expectedGoals[1].toFixed(2)}</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden flex">
                      <div
                        className="bg-orange-500"
                        style={{
                          width: `${
                            (activeMatch.stats.expectedGoals[0] /
                              (activeMatch.stats.expectedGoals[0] + activeMatch.stats.expectedGoals[1] || 1)) *
                            100
                          }%`,
                        }}
                      ></div>
                      <div
                        className="bg-teal-500"
                        style={{
                          width: `${
                            (activeMatch.stats.expectedGoals[1] /
                              (activeMatch.stats.expectedGoals[0] + activeMatch.stats.expectedGoals[1] || 1)) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Live Events Stream */}
          {activeMatch.events && activeMatch.events.length > 0 && (
            <div className="bg-[#13151a] border border-gray-800 rounded-xl p-4 sm:p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-3 flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-red-400" />
                <span>Live Event Timeline</span>
              </h4>
              <div className="space-y-2.5">
                {activeMatch.events.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-start space-x-3 p-2.5 bg-gray-900 rounded-lg border border-gray-800 text-xs"
                  >
                    <span className="font-mono font-bold text-red-400 shrink-0 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                      {ev.minute}'
                    </span>
                    <div>
                      <p className="font-bold text-gray-200">{ev.title}</p>
                      <p className="text-gray-400 text-[11px]">{ev.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 2. ALL MARKETS */}
      {activeTab === 'markets' && (
        <div className="space-y-4">
          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                id={`market-cat-btn-${cat}`}
                onClick={() => setMarketCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  marketCategory === cat
                    ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                    : 'bg-gray-900 text-gray-400 hover:text-gray-200 border border-gray-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Markets List */}
          <div className="space-y-3">
            {filteredMarkets.map((market) => (
              <div
                key={market.id}
                className="bg-[#13151a] border border-gray-800 rounded-xl p-4 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wide">
                    {market.name}
                  </h4>
                  <span className="text-[10px] uppercase font-mono text-gray-500 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
                    {market.category}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {market.outcomes.map((outcome) => (
                    <OddsButton
                      key={outcome.id}
                      matchId={activeMatch.id}
                      matchTitle={`${activeMatch.homeTeam.name} vs ${activeMatch.awayTeam.name}`}
                      league={activeMatch.league}
                      sport={activeMatch.sport}
                      marketId={market.id}
                      marketName={market.name}
                      outcome={outcome}
                      isLive={activeMatch.status === 'live'}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 3. CHRISFIX AI INTELLIGENCE */}
      {activeTab === 'ai' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-orange-950/20 via-[#13151a] to-[#0f1116] border border-orange-500/30 rounded-xl p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">ChrisFix AI Deep Match Intelligence</h3>
                  <p className="text-[11px] text-gray-400">Powered by Google Gemini 3.7 Flash Quantitative Engine</p>
                </div>
              </div>

              <button
                onClick={() => fetchAIMatchAnalysis(activeMatch)}
                disabled={isAnalyzingMatch}
                className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors border border-gray-700"
                title="Re-run AI Analysis"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzingMatch ? 'animate-spin text-orange-400' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

            {isAnalyzingMatch ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-bold text-orange-400">Synthesizing Tactical & Probability Metrics...</p>
                <p className="text-[11px] text-gray-500">Evaluating expected goal variances, pressing structures, and line movement</p>
              </div>
            ) : aiAnalysis ? (
              <div className="space-y-5">
                {/* Win Probability Distribution Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-300 mb-2">
                    <span className="text-orange-400">{activeMatch.homeTeam.name} ({aiAnalysis.homeWinProb}%)</span>
                    {aiAnalysis.drawProb && <span className="text-gray-400">Draw ({aiAnalysis.drawProb}%)</span>}
                    <span className="text-teal-400">{activeMatch.awayTeam.name} ({aiAnalysis.awayWinProb}%)</span>
                  </div>

                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden flex shadow-inner">
                    <div
                      className="bg-orange-500 flex items-center justify-center text-[9px] font-bold text-black"
                      style={{ width: `${aiAnalysis.homeWinProb}%` }}
                    ></div>
                    {aiAnalysis.drawProb && (
                      <div
                        className="bg-gray-600 flex items-center justify-center text-[9px] font-bold text-white"
                        style={{ width: `${aiAnalysis.drawProb}%` }}
                      ></div>
                    )}
                    <div
                      className="bg-teal-400 flex items-center justify-center text-[9px] font-bold text-black"
                      style={{ width: `${aiAnalysis.awayWinProb}%` }}
                    ></div>
                  </div>
                </div>

                {/* Tactical Summary */}
                <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-4 text-xs text-gray-300 leading-relaxed">
                  <p>{aiAnalysis.summary}</p>
                </div>

                {/* Recommended Value Picks */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-2.5 flex items-center space-x-1.5">
                    <TrendingUp className="w-4 h-4 text-orange-400" />
                    <span>Algorithmic Value Picks</span>
                  </h4>
                  <div className="space-y-2">
                    {aiAnalysis.recommendedPicks.map((pick, i) => (
                      <div
                        key={i}
                        className="p-3 bg-gray-900 border border-orange-500/20 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-white">{pick.pick}</span>
                            <span className="px-1.5 py-0.2 bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-bold rounded">
                              {pick.confidence}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5">{pick.reasoning}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono font-bold text-orange-400 bg-gray-800 px-2 py-1 rounded border border-gray-700">
                            Odds: {pick.odds.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Factors & Risk */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-3.5 space-y-2">
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-orange-400" />
                      <span>Key Predictive Indicators</span>
                    </h5>
                    <ul className="space-y-1 text-xs text-gray-300">
                      {aiAnalysis.keyFactors.map((kf, i) => (
                        <li key={i} className="flex items-start space-x-1.5 text-[11px]">
                          <span className="text-orange-400 shrink-0">•</span>
                          <span>{kf}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-3.5 space-y-2">
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Risk Assessment</span>
                    </h5>
                    <p className="text-xs text-gray-300">{aiAnalysis.riskAssessment}</p>
                    <div className="flex items-center space-x-1 text-[11px] font-mono text-gray-400 pt-1">
                      <span>Model Confidence:</span>
                      <span className="text-orange-400 font-bold">{aiAnalysis.confidenceScore}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 4. FORM & H2H */}
      {activeTab === 'h2h' && (
        <div className="bg-[#13151a] border border-gray-800 rounded-xl p-5 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center space-x-1.5">
            <History className="w-4 h-4 text-orange-400" />
            <span>Recent Form & Head-to-Head Record</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Home Form */}
            <div className="p-3.5 bg-gray-900 border border-gray-800 rounded-xl space-y-2">
              <span className="text-xs font-bold text-gray-200">{activeMatch.homeTeam.name}</span>
              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] text-gray-400 mr-1">Last 5:</span>
                {activeMatch.homeTeam.form.map((res, i) => (
                  <span
                    key={i}
                    className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] text-white ${
                      res === 'W' ? 'bg-orange-600' : res === 'D' ? 'bg-amber-600' : 'bg-red-600'
                    }`}
                  >
                    {res}
                  </span>
                ))}
              </div>
            </div>

            {/* Away Form */}
            <div className="p-3.5 bg-gray-900 border border-gray-800 rounded-xl space-y-2">
              <span className="text-xs font-bold text-gray-200">{activeMatch.awayTeam.name}</span>
              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] text-gray-400 mr-1">Last 5:</span>
                {activeMatch.awayTeam.form.map((res, i) => (
                  <span
                    key={i}
                    className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] text-white ${
                      res === 'W' ? 'bg-orange-600' : res === 'D' ? 'bg-amber-600' : 'bg-red-600'
                    }`}
                  >
                    {res}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {activeMatch.h2hSummary && (
            <div className="p-3 bg-gray-900 border border-gray-800 rounded-xl text-xs text-gray-300">
              <p className="font-semibold text-gray-400 text-[11px] uppercase mb-1">Historical Meeting Summary</p>
              <p>{activeMatch.h2hSummary}</p>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 5. LIVE MATCH CHAT ROOM */}
      {activeTab === 'chat' && (
        <div className="animate-in fade-in duration-200">
          <LiveMatchChatRoom embedded defaultMatchId={activeMatch.id} />
        </div>
      )}
    </div>
  );
};
