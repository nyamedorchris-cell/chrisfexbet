import React from 'react';
import { useSportsbook } from '../context/SportsbookContext';
import { SportId } from '../types';
import {
  Flame,
  Activity,
  Trophy,
  Dribbble,
  Gamepad2,
  Swords,
  Footprints,
} from 'lucide-react';

interface SportNavItem {
  id: SportId | 'all' | 'live';
  label: string;
  icon: React.ReactNode;
}

export const SportsNav: React.FC = () => {
  const { selectedSport, setSelectedSport, matches, setSelectedLeague } = useSportsbook();

  const liveMatchesCount = matches.filter((m) => m.status === 'live').length;

  const items: SportNavItem[] = [
    {
      id: 'live',
      label: 'Live In-Play',
      icon: <Activity className="w-4 h-4 text-red-500 animate-pulse" />,
    },
    {
      id: 'all',
      label: 'All Sports',
      icon: <Flame className="w-4 h-4 text-amber-400" />,
    },
    {
      id: 'soccer',
      label: 'Soccer',
      icon: <Trophy className="w-4 h-4 text-orange-400" />,
    },
    {
      id: 'basketball',
      label: 'Basketball',
      icon: <Dribbble className="w-4 h-4 text-orange-400" />,
    },
    {
      id: 'tennis',
      label: 'Tennis',
      icon: <Footprints className="w-4 h-4 text-lime-400" />,
    },
    {
      id: 'mma',
      label: 'UFC / MMA',
      icon: <Swords className="w-4 h-4 text-red-400" />,
    },
    {
      id: 'esports',
      label: 'Esports',
      icon: <Gamepad2 className="w-4 h-4 text-purple-400" />,
    },
    {
      id: 'nfl',
      label: 'American Football',
      icon: <Trophy className="w-4 h-4 text-blue-400" />,
    },
  ];

  return (
    <div id="sports-nav-container" className="bg-[#0f1116] border-b border-gray-800 py-3 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex items-center space-x-2 overflow-x-auto no-scrollbar py-0.5">
        {items.map((item) => {
          const isSelected = selectedSport === item.id;
          const matchCount =
            item.id === 'all'
              ? matches.length
              : item.id === 'live'
              ? liveMatchesCount
              : matches.filter((m) => m.sport === item.id).length;

          return (
            <button
              key={item.id}
              id={`sport-nav-btn-${item.id}`}
              onClick={() => {
                setSelectedSport(item.id);
                setSelectedLeague(null);
              }}
              className={`flex items-center space-x-2.5 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all select-none ${
                isSelected
                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30 font-semibold'
                  : 'text-gray-400 hover:bg-gray-800/80 hover:text-gray-200 border border-transparent'
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              <span>{item.label}</span>
              {item.id === 'live' ? (
                <span className="px-1.5 py-0.2 bg-red-500 text-white font-mono text-[10px] font-bold rounded-full animate-pulse">
                  {liveMatchesCount}
                </span>
              ) : (
                <span className="text-[10px] font-mono text-gray-500 font-medium">({matchCount})</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
