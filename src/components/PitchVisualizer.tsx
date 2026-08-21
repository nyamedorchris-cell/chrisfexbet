import React from 'react';
import { Match } from '../types';
import { Shield, Sparkles, Activity } from 'lucide-react';

interface PitchVisualizerProps {
  match: Match;
}

export const PitchVisualizer: React.FC<PitchVisualizerProps> = ({ match }) => {
  if (match.status !== 'live') {
    return (
      <div className="bg-[#13151a] border border-gray-800 rounded-xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center mx-auto mb-3 text-gray-400">
          <Activity className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-gray-200">Match Scheduled: {match.startTime}</p>
        <p className="text-xs text-gray-400 mt-1">Live 2D Pitch Radar & Ball Tracking activates at kickoff.</p>
      </div>
    );
  }

  const pitch = match.pitchState || {
    ballZone: 50,
    actionText: 'Neutral midfield transition',
    attackingTeam: 'neutral',
    intensity: 'medium',
  };

  const ballPositionPercent = pitch.ballZone; // 0 to 100

  return (
    <div id="pitch-visualizer-card" className="bg-[#13151a] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header Info */}
      <div className="px-4 py-2.5 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-xs font-bold text-red-400 font-mono">
            {match.minute ? `${match.minute}' MIN` : match.period || 'IN PLAY'}
          </span>
          <span className="text-gray-600">|</span>
          <span className="text-xs font-semibold text-gray-300 truncate max-w-[200px]">
            {match.league}
          </span>
        </div>

        <div className="flex items-center space-x-2 text-[11px] font-mono font-bold text-gray-400">
          <span>{match.homeTeam.shortName || match.homeTeam.name}</span>
          <span className="px-2 py-0.5 bg-gray-800 text-white rounded font-bold">
            {match.score.home} - {match.score.away}
          </span>
          <span>{match.awayTeam.shortName || match.awayTeam.name}</span>
        </div>
      </div>

      {/* 2D Animated Pitch Court */}
      <div className="relative p-4 bg-gradient-to-b from-[#13151a] via-[#0f1116] to-[#13151a]">
        <div className="relative w-full h-44 sm:h-52 bg-slate-950/60 border-2 border-orange-500/30 rounded-lg overflow-hidden shadow-inner flex items-center justify-center">
          {/* Pitch grass pattern stripes */}
          <div className="absolute inset-0 grid grid-cols-6 opacity-15 pointer-events-none">
            <div className="bg-orange-400/20"></div>
            <div className="bg-amber-900/20"></div>
            <div className="bg-orange-400/20"></div>
            <div className="bg-amber-900/20"></div>
            <div className="bg-orange-400/20"></div>
            <div className="bg-amber-900/20"></div>
          </div>

          {/* Halfway line & center circle */}
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-orange-400/30 -translate-x-1/2"></div>
          <div className="absolute top-1/2 left-1/2 w-20 h-20 border border-orange-400/30 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-orange-400/50 rounded-full -translate-x-1/2 -translate-y-1/2"></div>

          {/* Left penalty box */}
          <div className="absolute left-0 top-1/4 bottom-1/4 w-16 border-r border-t border-b border-orange-400/30 bg-orange-500/5"></div>
          <div className="absolute left-0 top-1/3 bottom-1/3 w-7 border-r border-t border-b border-orange-400/30"></div>

          {/* Right penalty box */}
          <div className="absolute right-0 top-1/4 bottom-1/4 w-16 border-l border-t border-b border-orange-400/30 bg-orange-500/5"></div>
          <div className="absolute right-0 top-1/3 bottom-1/3 w-7 border-l border-t border-b border-orange-400/30"></div>

          {/* Team Side Labels */}
          <div className="absolute left-3 top-2.5 flex items-center space-x-1 text-[11px] font-bold text-orange-400/80 bg-[#13151a]/80 px-2 py-0.5 rounded border border-orange-500/20">
            <Shield className="w-3 h-3 text-orange-400" />
            <span>{match.homeTeam.name}</span>
          </div>

          <div className="absolute right-3 top-2.5 flex items-center space-x-1 text-[11px] font-bold text-amber-400/80 bg-[#13151a]/80 px-2 py-0.5 rounded border border-amber-500/20">
            <span>{match.awayTeam.name}</span>
            <Shield className="w-3 h-3 text-amber-400" />
          </div>

          {/* Dynamic Attack Wave Glow */}
          {pitch.attackingTeam === 'home' && (
            <div
              className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-orange-500/20 to-transparent pointer-events-none transition-all duration-700"
              style={{ opacity: pitch.intensity === 'high' ? 0.8 : 0.4 }}
            ></div>
          )}
          {pitch.attackingTeam === 'away' && (
            <div
              className="absolute left-0 top-0 bottom-0 w-1/3 bg-gradient-to-r from-amber-500/20 to-transparent pointer-events-none transition-all duration-700"
              style={{ opacity: pitch.intensity === 'high' ? 0.8 : 0.4 }}
            ></div>
          )}

          {/* Live Animated Ball */}
          <div
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-out z-10"
            style={{ left: `${ballPositionPercent}%` }}
          >
            <div className="relative">
              {/* Ball Pulse Halo */}
              <div className="absolute -inset-2 bg-amber-400/30 rounded-full animate-ping"></div>
              <div className="w-5 h-5 rounded-full bg-white border-2 border-gray-900 shadow-lg shadow-amber-400/50 flex items-center justify-center text-[8px] font-bold text-gray-900">
                ⚽
              </div>
            </div>
          </div>
        </div>

        {/* Live Action Commentary Banner */}
        <div className="mt-3 p-2.5 bg-gray-900 border border-gray-800 rounded-lg flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5 min-w-0">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded">
              RADAR
            </span>
            <p className="text-xs text-gray-200 font-medium truncate">
              {pitch.actionText}
            </p>
          </div>
          <div className="shrink-0 flex items-center space-x-1 text-[11px] text-gray-400 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Possession: {match.stats?.possession ? `${match.stats.possession[0]}% - ${match.stats.possession[1]}%` : '50% - 50%'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
