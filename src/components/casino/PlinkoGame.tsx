import React, { useState, useEffect, useRef } from 'react';
import { useSportsbook } from '../../context/SportsbookContext';
import { formatCurrency } from '../../utils/oddsFormatter';
import { soundFx } from '../../utils/audioEffects';
import {
  ArrowDownCircle,
  Zap,
  Sparkles,
  RotateCcw,
  Trophy,
} from 'lucide-react';

type RiskLevel = 'low' | 'medium' | 'high';

const MULTIPLIERS_BY_RISK: Record<RiskLevel, number[]> = {
  low: [5.6, 2.1, 1.1, 1.0, 0.5, 1.0, 1.1, 2.1, 5.6],
  medium: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
  high: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
};

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  row: number;
  path: number[];
  stake: number;
}

export const PlinkoGame: React.FC = () => {
  const { wallet, playCasinoBet, setIsDepositModalOpen } = useSportsbook();

  const [risk, setRisk] = useState<RiskLevel>('medium');
  const [stake, setStake] = useState<number>(10);
  const [activeBalls, setActiveBalls] = useState<Ball[]>([]);
  const [lastBinHit, setLastBinHit] = useState<number | null>(null);
  const [lastWinAmount, setLastWinAmount] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const ballsRef = useRef<Ball[]>([]);

  const rows = 8;
  const multipliers = MULTIPLIERS_BY_RISK[risk];

  // Drop Ball
  const handleDropBall = () => {
    if (stake > wallet.balance) {
      setIsDepositModalOpen(true);
      return;
    }

    soundFx.playPlinkoBounce();

    // Precalculate final bin landing based on Bernoulli binomial distribution
    let pathDirection = 0;
    const path: number[] = [];
    for (let r = 0; r < rows; r++) {
      const step = Math.random() < 0.5 ? -1 : 1;
      path.push(step);
      pathDirection += step;
    }

    const newBall: Ball = {
      id: Date.now() + Math.random(),
      x: 200,
      y: 20,
      vx: 0,
      vy: 2.2,
      row: 0,
      path,
      stake,
    };

    ballsRef.current.push(newBall);
    setActiveBalls([...ballsRef.current]);
  };

  // Canvas Physics and Ball Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = 400);
    const height = (canvas.height = 360);

    const startY = 40;
    const rowHeight = 32;
    const pegSpacing = 36;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw Pegs Pyramid
      for (let r = 0; r < rows; r++) {
        const pegsInRow = r + 3;
        const rowStartX = width / 2 - ((pegsInRow - 1) * pegSpacing) / 2;
        const rowY = startY + r * rowHeight;

        for (let p = 0; p < pegsInRow; p++) {
          const pegX = rowStartX + p * pegSpacing;
          ctx.beginPath();
          ctx.arc(pegX, rowY, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = '#94a3b8';
          ctx.shadowColor = '#60a5fa';
          ctx.shadowBlur = 4;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // Draw bottom multiplier buckets
      const bucketWidth = width / multipliers.length;
      multipliers.forEach((mult, index) => {
        const bx = index * bucketWidth;
        const by = startY + rows * rowHeight + 10;

        ctx.fillStyle =
          mult >= 10
            ? 'rgba(239, 68, 68, 0.8)'
            : mult >= 2
            ? 'rgba(245, 158, 11, 0.8)'
            : 'rgba(59, 130, 246, 0.6)';

        ctx.fillRect(bx + 2, by, bucketWidth - 4, 28);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${mult}x`, bx + bucketWidth / 2, by + 18);
      });

      // Update & draw balls
      const updatedBalls: Ball[] = [];

      ballsRef.current.forEach((ball) => {
        ball.vy += 0.2; // Gravity
        ball.y += ball.vy;

        // Determine current row
        const targetRow = Math.min(rows - 1, Math.floor((ball.y - startY) / rowHeight));
        if (targetRow > ball.row && targetRow < rows) {
          ball.row = targetRow;
          const step = ball.path[targetRow] || 0;
          ball.vx = step * 1.6;
          soundFx.playPlinkoBounce();
        }

        ball.x += ball.vx;
        ball.vx *= 0.95; // Drag

        // Render ball
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, 6.5, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Check if landed at bottom
        if (ball.y >= startY + rows * rowHeight + 10) {
          // Bin index calculation
          const binIndex = Math.max(
            0,
            Math.min(multipliers.length - 1, Math.floor(ball.x / bucketWidth))
          );
          const mult = multipliers[binIndex];
          const winAmount = Number((ball.stake * mult).toFixed(2));

          setLastBinHit(binIndex);
          setLastWinAmount(winAmount);

          playCasinoBet('plinko', 'Plinko Master 1000x', ball.stake, mult, winAmount, {
            risk,
            binIndex,
          });
        } else {
          updatedBalls.push(ball);
        }
      });

      ballsRef.current = updatedBalls;
      setActiveBalls([...updatedBalls]);

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [risk, multipliers]);

  return (
    <div className="bg-[#11141c] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Header */}
      <div className="px-4 py-2.5 bg-gray-950 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ArrowDownCircle className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Plinko Master 1000x
          </span>
        </div>
        <span className="text-[11px] font-mono font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
          99.00% RTP • Physics Engine
        </span>
      </div>

      {/* Main Board Canvas Stage */}
      <div className="p-4 bg-gradient-to-b from-[#141529] to-[#0d0e1a] flex flex-col items-center justify-center select-none">
        <div className="relative">
          <canvas ref={canvasRef} className="rounded-xl shadow-2xl" />
        </div>

        {/* Win Banner */}
        {lastWinAmount !== null && (
          <div className="mt-2 px-4 py-1.5 rounded-full bg-gray-900 border border-violet-500/40 text-xs font-mono font-bold flex items-center space-x-2 animate-in zoom-in-95">
            <Trophy className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-gray-300">Last Drop Payout:</span>
            <span className="text-emerald-400">+{formatCurrency(lastWinAmount)}</span>
          </div>
        )}
      </div>

      {/* Control Deck */}
      <div className="p-4 sm:p-5 bg-gray-900 border-t border-gray-800 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Risk Level & Stake Chips */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-gray-400 uppercase">Risk Level:</span>
            {(['low', 'medium', 'high'] as RiskLevel[]).map((r) => (
              <button
                key={r}
                onClick={() => setRisk(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                  risk === r
                    ? r === 'high'
                      ? 'bg-red-600 text-white'
                      : r === 'medium'
                      ? 'bg-amber-500 text-black'
                      : 'bg-emerald-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-gray-400 uppercase">Drop Stake:</span>
            {[2, 5, 10, 20, 50, 100].map((amt) => (
              <button
                key={amt}
                onClick={() => setStake(amt)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                  stake === amt
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {amt}
              </button>
            ))}
          </div>
        </div>

        {/* Drop Ball Action */}
        <div className="lg:col-span-5">
          <button
            onClick={handleDropBall}
            className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 text-white font-extrabold rounded-xl text-base uppercase tracking-wider shadow-lg shadow-violet-600/30 active:scale-95 transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            <ArrowDownCircle className="w-5 h-5 stroke-[2.5]" />
            <span>DROP BALL ({formatCurrency(stake)})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
