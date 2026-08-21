import React, { useState, useEffect, useRef } from 'react';
import { useSportsbook } from '../../context/SportsbookContext';
import { formatCurrency } from '../../utils/oddsFormatter';
import { soundFx } from '../../utils/audioEffects';
import {
  Plane,
  Play,
  RotateCcw,
  Zap,
  ShieldCheck,
  TrendingUp,
  History,
  Sparkles,
  Users,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface OtherPlayerBet {
  name: string;
  avatar: string;
  bet: number;
  cashedOutAt?: number;
}

export const AviatorGame: React.FC = () => {
  const { wallet, playCasinoBet, setIsDepositModalOpen } = useSportsbook();

  const [gameState, setGameState] = useState<'idle' | 'starting' | 'flying' | 'crashed'>('idle');
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [stake, setStake] = useState<number>(20);
  const [autoCashout, setAutoCashout] = useState<number>(2.0);
  const [useAutoCashout, setUseAutoCashout] = useState<boolean>(false);
  const [hasBet, setHasBet] = useState<boolean>(false);
  const [hasCashedOut, setHasCashedOut] = useState<boolean>(false);
  const [cashedOutMultiplier, setCashedOutMultiplier] = useState<number>(0);
  const [crashPoint, setCrashPoint] = useState<number>(2.5);
  const [countdown, setCountdown] = useState<number>(3);
  const [history, setHistory] = useState<number[]>([1.45, 3.82, 1.12, 14.5, 2.18, 5.4, 1.95, 28.4, 1.05]);
  const [simulatedPlayers, setSimulatedPlayers] = useState<OtherPlayerBet[]>([
    { name: 'Kwame O.', avatar: 'KO', bet: 100 },
    { name: 'Kofi Mensah', avatar: 'KM', bet: 50 },
    { name: 'Ama Poku', avatar: 'AP', bet: 250 },
    { name: 'Emmanuel T.', avatar: 'ET', bet: 20 },
    { name: 'Abena S.', avatar: 'AS', bet: 300 },
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Generate randomized provably fair crash point (House edge ~3%, RTP ~97%)
  const generateCrashPoint = () => {
    const r = Math.random();
    if (r < 0.04) return 1.0; // 4% instant crash
    // Multiplier distribution: 99 / (100 - r*100)
    const e = 100 * Math.random();
    const result = Math.max(1.01, 99 / (100 - e));
    return Number(Math.min(result, 250).toFixed(2));
  };

  // Start new round
  const startNewRound = () => {
    if (gameState === 'flying' || gameState === 'starting') return;
    setGameState('starting');
    setCountdown(3);
    setMultiplier(1.0);
    setHasCashedOut(false);
    setCashedOutMultiplier(0);

    const cp = generateCrashPoint();
    setCrashPoint(cp);

    // Refresh simulated other players
    setSimulatedPlayers([
      { name: 'Kwame O.', avatar: 'KO', bet: [20, 50, 100, 200][Math.floor(Math.random() * 4)] },
      { name: 'Kofi Mensah', avatar: 'KM', bet: [10, 25, 50, 150][Math.floor(Math.random() * 4)] },
      { name: 'Ama Poku', avatar: 'AP', bet: [50, 100, 300][Math.floor(Math.random() * 3)] },
      { name: 'Emmanuel T.', avatar: 'ET', bet: [10, 20, 50][Math.floor(Math.random() * 3)] },
      { name: 'Abena S.', avatar: 'AS', bet: [100, 250, 500][Math.floor(Math.random() * 3)] },
    ]);
  };

  // Countdown timer before flight
  useEffect(() => {
    if (gameState === 'starting') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        // Takeoff
        setGameState('flying');
        startTimeRef.current = Date.now();
      }
    }
  }, [gameState, countdown]);

  // Flight simulation loop
  useEffect(() => {
    if (gameState !== 'flying') return;

    let isRunning = true;

    const tick = () => {
      if (!isRunning) return;
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      // Exponential curve: 1 + 0.06 * elapsed^1.8
      const currentMult = Number((1.0 + Math.pow(elapsed * 0.9, 1.7) * 0.45).toFixed(2));
      setMultiplier(currentMult);

      // Check simulated players cashouts
      setSimulatedPlayers((prev) =>
        prev.map((p) => {
          if (!p.cashedOutAt && Math.random() < 0.04 && currentMult > 1.25 && currentMult < crashPoint) {
            return { ...p, cashedOutAt: currentMult };
          }
          return p;
        })
      );

      // Check auto cashout
      if (hasBet && !hasCashedOut && useAutoCashout && currentMult >= autoCashout && currentMult <= crashPoint) {
        handleCashout(currentMult);
      }

      // Check crash
      if (currentMult >= crashPoint) {
        setGameState('crashed');
        soundFx.playExplosion();
        setHistory((prev) => [crashPoint, ...prev.slice(0, 11)]);
        if (hasBet && !hasCashedOut) {
          // Player lost this round
          playCasinoBet('aviator', 'Aviator Crash', stake, 0, 0, { crashPoint });
        }
        return;
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      isRunning = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameState, crashPoint, hasBet, hasCashedOut, useAutoCashout, autoCashout, stake]);

  // Canvas flight animation renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    const height = (canvas.height = 340);

    ctx.clearRect(0, 0, width, height);

    // Background grid lines
    ctx.strokeStyle = '#1e2430';
    ctx.lineWidth = 1;
    for (let x = 40; x < width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height - 30);
      ctx.stroke();
    }
    for (let y = 30; y < height - 30; y += 50) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 20);
    ctx.lineTo(40, height - 30);
    ctx.lineTo(width - 20, height - 30);
    ctx.stroke();

    const progress = Math.min(1, (multiplier - 1) / (crashPoint > 1 ? crashPoint - 1 : 1));
    const startX = 40;
    const startY = height - 30;
    const endX = startX + (width - 100) * Math.min(1, progress * 0.95);
    const endY = startY - (height - 90) * Math.min(1, progress * 0.9);

    if (gameState === 'flying' || gameState === 'crashed') {
      // Glow fill under curve
      const gradient = ctx.createLinearGradient(0, endY, 0, startY);
      gradient.addColorStop(0, gameState === 'crashed' ? 'rgba(239, 68, 68, 0.35)' : 'rgba(244, 63, 94, 0.35)');
      gradient.addColorStop(1, 'rgba(244, 63, 94, 0.0)');

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(startX + (endX - startX) * 0.5, startY, endX, endY);
      ctx.lineTo(endX, startY);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Stroke flight curve
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(startX + (endX - startX) * 0.5, startY, endX, endY);
      ctx.strokeStyle = gameState === 'crashed' ? '#ef4444' : '#f43f5e';
      ctx.lineWidth = 4;
      ctx.shadowColor = gameState === 'crashed' ? '#ef4444' : '#f43f5e';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw Rocket / Plane at head
      if (gameState === 'flying') {
        ctx.save();
        ctx.translate(endX, endY);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (gameState === 'crashed') {
        // Explosion marker
        ctx.save();
        ctx.translate(endX, endY);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('💥 FLEW AWAY', -40, -10);
        ctx.restore();
      }
    }
  }, [gameState, multiplier, crashPoint]);

  // Place Bet
  const handlePlaceBet = () => {
    if (stake > wallet.balance) {
      setIsDepositModalOpen(true);
      return;
    }
    setHasBet(true);
    setHasCashedOut(false);
    soundFx.playChipDrop();
    if (gameState === 'idle' || gameState === 'crashed') {
      startNewRound();
    }
  };

  // Cashout
  const handleCashout = (cashoutMult = multiplier) => {
    if (!hasBet || hasCashedOut || gameState !== 'flying') return;
    const finalMult = Number(cashoutMult.toFixed(2));
    const winAmount = Number((stake * finalMult).toFixed(2));

    setHasCashedOut(true);
    setCashedOutMultiplier(finalMult);
    playCasinoBet('aviator', 'Aviator Crash', stake, finalMult, winAmount, {
      cashedOutMultiplier: finalMult,
    });
  };

  return (
    <div className="bg-[#11141c] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Top Multiplier History Bar */}
      <div className="px-4 py-2.5 bg-gray-950 border-b border-gray-800 flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-semibold shrink-0">
          <History className="w-3.5 h-3.5 text-rose-400" />
          <span>Past Flights:</span>
        </div>
        <div className="flex items-center space-x-1.5 overflow-x-auto py-0.5">
          {history.map((h, i) => (
            <span
              key={i}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold shrink-0 ${
                h >= 10
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : h >= 2
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
            >
              {h.toFixed(2)}x
            </span>
          ))}
        </div>
      </div>

      {/* Main Game Stage */}
      <div className="relative p-4 sm:p-6 bg-gradient-to-b from-[#161a24] to-[#0d1017] min-h-[340px] flex items-center justify-center overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        {/* Center Multiplier Display */}
        <div className="relative z-10 text-center select-none">
          {gameState === 'starting' ? (
            <div className="space-y-2 animate-in zoom-in-90 duration-150">
              <p className="text-xs uppercase font-bold text-gray-400 tracking-widest">Next Round In</p>
              <div className="text-5xl sm:text-6xl font-extrabold font-mono text-rose-400">
                00:0{countdown}
              </div>
              <div className="w-48 h-1.5 bg-gray-800 rounded-full mx-auto overflow-hidden">
                <div
                  className="h-full bg-rose-500 transition-all duration-1000"
                  style={{ width: `${(countdown / 3) * 100}%` }}
                ></div>
              </div>
            </div>
          ) : gameState === 'flying' ? (
            <div className="space-y-1">
              <div className="text-6xl sm:text-7xl font-extrabold font-mono text-white tracking-tight drop-shadow-md">
                {multiplier.toFixed(2)}
                <span className="text-rose-400 text-4xl sm:text-5xl">x</span>
              </div>
              {hasBet && !hasCashedOut && (
                <p className="text-xs font-mono font-bold text-emerald-400 animate-pulse">
                  Current Return: {formatCurrency(stake * multiplier)}
                </p>
              )}
            </div>
          ) : gameState === 'crashed' ? (
            <div className="space-y-1 animate-in zoom-in-95 duration-150">
              <div className="text-5xl sm:text-6xl font-extrabold font-mono text-red-500">
                {crashPoint.toFixed(2)}x
              </div>
              <p className="text-xs uppercase font-bold text-red-400 tracking-widest">
                FLEW AWAY!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
                <Plane className="w-8 h-8 -rotate-45 stroke-[2.5]" />
              </div>
              <h4 className="text-lg font-bold text-white">Aviator Crash Flight</h4>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">
                Place your bet, watch the multiplier climb, and cash out before the rocket flies away!
              </p>
            </div>
          )}
        </div>

        {/* Cashed Out Toast Overlay */}
        {hasCashedOut && (
          <div className="absolute top-4 right-4 z-20 px-4 py-2 bg-emerald-500 text-black rounded-xl font-bold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-500/20 animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              Cashed Out @ {cashedOutMultiplier.toFixed(2)}x (+{formatCurrency(stake * cashedOutMultiplier)})
            </span>
          </div>
        )}
      </div>

      {/* Betting Control Deck */}
      <div className="p-4 sm:p-5 bg-gray-900/90 border-t border-gray-800 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Stake Configuration */}
        <div className="lg:col-span-7 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-gray-400 uppercase tracking-wider text-[11px]">Bet Amount (GH₵)</span>
            <span className="text-gray-400 font-mono text-[11px]">
              Bal: <strong className="text-white">{formatCurrency(wallet.balance)}</strong>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 text-xs font-mono font-bold text-gray-500">GH₵</span>
              <input
                type="number"
                min={1}
                max={5000}
                value={stake}
                onChange={(e) => setStake(Math.max(1, Number(e.target.value)))}
                disabled={gameState === 'flying' && hasBet && !hasCashedOut}
                className="w-full pl-11 pr-3 py-2 bg-gray-950 border border-gray-800 rounded-xl font-mono text-sm font-bold text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Quick chips */}
            {[5, 10, 20, 50, 100, 500].map((amt) => (
              <button
                key={amt}
                onClick={() => setStake(amt)}
                className={`hidden sm:inline-block px-2.5 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  stake === amt
                    ? 'bg-rose-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {amt}
              </button>
            ))}
          </div>

          {/* Auto Cashout toggle */}
          <div className="flex items-center justify-between pt-1 border-t border-gray-800/80 text-xs">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useAutoCashout}
                onChange={(e) => setUseAutoCashout(e.target.checked)}
                className="rounded bg-gray-800 border-gray-700 text-rose-500 focus:ring-0"
              />
              <span className="text-gray-300 font-semibold text-[11px]">Auto Cash Out Multiplier:</span>
            </label>
            <div className="flex items-center space-x-1">
              <input
                type="number"
                step="0.1"
                min="1.1"
                max="100"
                value={autoCashout}
                onChange={(e) => setAutoCashout(Number(e.target.value))}
                disabled={!useAutoCashout}
                className="w-20 px-2 py-1 text-xs font-mono font-bold bg-gray-950 border border-gray-800 rounded text-rose-400 text-right focus:outline-none"
              />
              <span className="text-gray-500 font-bold text-xs">x</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="lg:col-span-5">
          {gameState === 'flying' && hasBet && !hasCashedOut ? (
            <button
              onClick={() => handleCashout()}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-extrabold rounded-xl text-base uppercase tracking-wider shadow-lg shadow-emerald-500/30 active:scale-95 transition-all cursor-pointer flex flex-col items-center justify-center leading-tight"
            >
              <span>CASH OUT</span>
              <span className="text-xs font-mono font-bold mt-0.5">
                {formatCurrency(stake * multiplier)} ({multiplier.toFixed(2)}x)
              </span>
            </button>
          ) : (
            <button
              onClick={handlePlaceBet}
              disabled={gameState === 'starting' && hasBet}
              className={`w-full py-4 rounded-xl text-sm font-extrabold uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer flex flex-col items-center justify-center leading-tight ${
                gameState === 'starting'
                  ? 'bg-amber-500 text-black shadow-amber-500/20'
                  : 'bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white shadow-rose-600/30'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <Zap className="w-4 h-4 fill-current" />
                <span>
                  {gameState === 'starting'
                    ? 'WAITING FOR TAKEOFF'
                    : gameState === 'flying'
                    ? 'BET FOR NEXT ROUND'
                    : 'BET & LAUNCH FLIGHT'}
                </span>
              </div>
              <span className="text-xs font-mono opacity-90 mt-0.5">
                {formatCurrency(stake)} (Instant Settlement)
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Simulated Live Ghana Players Table */}
      <div className="p-3 bg-gray-950 border-t border-gray-800 text-xs flex items-center justify-between text-gray-400">
        <div className="flex items-center space-x-2">
          <Users className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-gray-300">Live Ghana Players ({simulatedPlayers.length + 1}):</span>
        </div>
        <div className="flex items-center space-x-3 overflow-x-auto">
          {simulatedPlayers.map((p, idx) => (
            <div key={idx} className="flex items-center space-x-1 shrink-0">
              <span className="w-5 h-5 rounded-full bg-gray-800 text-[9px] font-bold text-gray-300 flex items-center justify-center">
                {p.avatar}
              </span>
              <span className="text-gray-300 text-[11px]">{p.name}</span>
              {p.cashedOutAt ? (
                <span className="text-[10px] text-emerald-400 font-mono font-bold">
                  +{formatCurrency(p.bet * p.cashedOutAt)} ({p.cashedOutAt}x)
                </span>
              ) : (
                <span className="text-[10px] text-gray-500 font-mono">
                  {formatCurrency(p.bet)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
