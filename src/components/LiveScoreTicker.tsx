import React from 'react';
import { useSportsbook } from '../context/SportsbookContext';
import { Radio, Zap } from 'lucide-react';

export const LiveScoreTicker: React.FC = () => {
  const { matches, setActiveMatch } = useSportsbook();
  const liveMatches = matches.filter((m) => m.status === 'live');

  if (liveMatches.length === 0) return null;

  return (
    <div id="live-score-ticker" className="bg-[#0f1116] border-b border-gray-800 py-2 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex items-center space-x-3 overflow-hidden text-xs">
        <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 font-bold uppercase tracking-widest text-[10px] shrink-0">
          <Radio className="w-3 h-3 animate-ping" />
          <span>Live Ticker</span>
        </div>

        <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar py-0.5">
          {liveMatches.map((match) => {
            return (
              <div
                key={match.id}
                onClick={() => setActiveMatch(match)}
                className="flex items-center space-x-2.5 bg-[#13151a] hover:bg-[#1a1c22] px-3 py-1.5 rounded-lg border border-gray-800 hover:border-emerald-500/30 cursor-pointer shrink-0 transition-colors group"
              >
                <span className="text-[10px] font-bold text-red-400 font-mono flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block mr-1"></span>
                  {match.minute ? `${match.minute}'` : match.period || 'LIVE'}
                </span>
                <span className="text-gray-300 font-medium group-hover:text-emerald-400 transition-colors">
                  {match.homeTeam.shortName || match.homeTeam.name}
                </span>
                <span className="font-mono font-bold text-white bg-gray-900 px-2 py-0.5 rounded border border-gray-800 text-[11px]">
                  {match.score.home} - {match.score.away}
                </span>
                <span className="text-gray-300 font-medium group-hover:text-emerald-400 transition-colors">
                  {match.awayTeam.shortName || match.awayTeam.name}
                </span>
                {match.pitchState && (
                  <Zap className="w-3 h-3 text-amber-400 shrink-0 opacity-80" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
