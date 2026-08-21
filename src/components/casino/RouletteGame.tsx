import React, { useState, useEffect, useRef } from 'react';
import { useSportsbook } from '../../context/SportsbookContext';
import { formatCurrency } from '../../utils/oddsFormatter';
import { soundFx } from '../../utils/audioEffects';
import {
  RotateCcw,
  Sparkles,
  Zap,
  CheckCircle2,
  Trash2,
  Trophy,
  History,
} from 'lucide-react';

const ROULETTE_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
  16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

interface BetPlacements {
  [key: string]: number; // key e.g. "num-17", "red", "black", "even", "odd", "low", "high", "dozen-1", "col-1"
}

interface LightningNumber {
  number: number;
  multiplier: number;
}

export const RouletteGame: React.FC = () => {
  const { wallet, playCasinoBet, setIsDepositModalOpen } = useSportsbook();

  const [bets, setBets] = useState<BetPlacements>({});
  const [selectedChip, setSelectedChip] = useState<number>(5);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [lightningNumbers, setLightningNumbers] = useState<LightningNumber[]>([]);
  const [history, setHistory] = useState<number[]>([17, 0, 32, 7, 22, 11, 29, 4]);
  const [lastWinAmount, setLastWinAmount] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wheelAngleRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  const totalBet: number = (Object.values(bets) as number[]).reduce((a, b) => a + (b || 0), 0);

  // Clear all chips
  const clearBets = () => {
    if (isSpinning) return;
    setBets({});
  };

  // Place or increment chip on a market
  const placeChip = (key: string) => {
    if (isSpinning) return;
    if (totalBet + selectedChip > wallet.balance) {
      setIsDepositModalOpen(true);
      return;
    }
    soundFx.playChipDrop();
    setBets((prev) => ({
      ...prev,
      [key]: (prev[key] || 0) + selectedChip,
    }));
  };

  // Wheel animation renderer
  const drawWheel = (angle: number, highlightNum: number | null = null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = (canvas.width = canvas.height = 320);
    const center = size / 2;
    const radius = center - 15;
    const sliceAngle = (Math.PI * 2) / ROULETTE_NUMBERS.length;

    ctx.clearRect(0, 0, size, size);

    // Outer rim metallic gradient
    const outerGrad = ctx.createRadialGradient(center, center, radius - 10, center, center, radius + 15);
    outerGrad.addColorStop(0, '#4b5563');
    outerGrad.addColorStop(0.5, '#1f2937');
    outerGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = outerGrad;
    ctx.beginPath();
    ctx.arc(center, center, radius + 12, 0, Math.PI * 2);
    ctx.fill();

    // Slices
    ROULETTE_NUMBERS.forEach((num, index) => {
      const sliceStart = angle + index * sliceAngle;
      const sliceEnd = sliceStart + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, sliceStart, sliceEnd);
      ctx.closePath();

      if (num === 0) {
        ctx.fillStyle = '#10b981'; // Green
      } else if (RED_NUMBERS.includes(num)) {
        ctx.fillStyle = '#dc2626'; // Red
      } else {
        ctx.fillStyle = '#111827'; // Black
      }

      if (num === highlightNum) {
        ctx.fillStyle = '#fbbf24'; // Highlight winner gold
      }

      ctx.fill();
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Number text
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(sliceStart + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = num === highlightNum ? '#000000' : '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(num.toString(), radius - 8, 4);
      ctx.restore();
    });

    // Center hub
    const hubGrad = ctx.createRadialGradient(center, center, 0, center, center, 45);
    hubGrad.addColorStop(0, '#f59e0b');
    hubGrad.addColorStop(0.7, '#b45309');
    hubGrad.addColorStop(1, '#1f2937');
    ctx.fillStyle = hubGrad;
    ctx.beginPath();
    ctx.arc(center, center, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fef3c7';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pointer indicator at top
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(center, 10);
    ctx.lineTo(center - 10, 0);
    ctx.lineTo(center + 10, 0);
    ctx.closePath();
    ctx.fill();
  };

  useEffect(() => {
    drawWheel(wheelAngleRef.current, winningNumber);
  }, [winningNumber]);

  // Spin the wheel
  const handleSpin = () => {
    if (totalBet <= 0 || isSpinning) return;
    if (totalBet > wallet.balance) {
      setIsDepositModalOpen(true);
      return;
    }

    setIsSpinning(true);
    setWinningNumber(null);
    setLastWinAmount(null);
    soundFx.playSpin();

    // Pick 1-3 Lightning lucky numbers with 50x-500x multipliers
    const numLightning = Math.floor(Math.random() * 3) + 1;
    const selectedLightning: LightningNumber[] = [];
    while (selectedLightning.length < numLightning) {
      const lucky = Math.floor(Math.random() * 37);
      if (!selectedLightning.some((l) => l.number === lucky)) {
        const mult = [50, 100, 200, 500][Math.floor(Math.random() * 4)];
        selectedLightning.push({ number: lucky, multiplier: mult });
      }
    }
    setLightningNumbers(selectedLightning);

    // Pick winning number randomly
    const targetWinner = Math.floor(Math.random() * 37);
    const targetIndex = ROULETTE_NUMBERS.indexOf(targetWinner);
    const sliceAngle = (Math.PI * 2) / 37;

    // Calculate angle so target lands at top (angle = -targetIndex * sliceAngle - Math.PI/2)
    const targetAngle = -targetIndex * sliceAngle - Math.PI / 2 + Math.PI * 2 * 6; // 6 full rotations

    const startAngle = wheelAngleRef.current % (Math.PI * 2);
    const totalRotation = targetAngle - startAngle;
    const duration = 4000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Cubic ease out
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentAngle = startAngle + totalRotation * ease;
      wheelAngleRef.current = currentAngle;
      drawWheel(currentAngle, progress === 1 ? targetWinner : null);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Spin finished
        setIsSpinning(false);
        setWinningNumber(targetWinner);
        setHistory((prev) => [targetWinner, ...prev.slice(0, 11)]);

        // Evaluate winnings
        evaluateWin(targetWinner, selectedLightning);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Calculate payouts
  const evaluateWin = (winner: number, lightnings: LightningNumber[]) => {
    let totalWin = 0;
    const isRed = RED_NUMBERS.includes(winner);
    const isEven = winner !== 0 && winner % 2 === 0;
    const isOdd = winner !== 0 && winner % 2 === 1;
    const isLow = winner >= 1 && winner <= 18;
    const isHigh = winner >= 19 && winner <= 36;
    const isDozen1 = winner >= 1 && winner <= 12;
    const isDozen2 = winner >= 13 && winner <= 24;
    const isDozen3 = winner >= 25 && winner <= 36;
    const isCol1 = winner % 3 === 1;
    const isCol2 = winner % 3 === 2;
    const isCol3 = winner > 0 && winner % 3 === 0;

    const lightningHit = lightnings.find((l) => l.number === winner);

    // Straight number bet
    if (bets[`num-${winner}`]) {
      const mult = lightningHit ? lightningHit.multiplier : 36;
      totalWin += bets[`num-${winner}`] * mult;
    }

    // Colors (2:1)
    if (isRed && bets['red']) totalWin += bets['red'] * 2;
    if (!isRed && winner !== 0 && bets['black']) totalWin += bets['black'] * 2;

    // Even / Odd (2:1)
    if (isEven && bets['even']) totalWin += bets['even'] * 2;
    if (isOdd && bets['odd']) totalWin += bets['odd'] * 2;

    // Low / High (2:1)
    if (isLow && bets['low']) totalWin += bets['low'] * 2;
    if (isHigh && bets['high']) totalWin += bets['high'] * 2;

    // Dozens (3:1)
    if (isDozen1 && bets['dozen-1']) totalWin += bets['dozen-1'] * 3;
    if (isDozen2 && bets['dozen-2']) totalWin += bets['dozen-2'] * 3;
    if (isDozen3 && bets['dozen-3']) totalWin += bets['dozen-3'] * 3;

    // Columns (3:1)
    if (isCol1 && bets['col-1']) totalWin += bets['col-1'] * 3;
    if (isCol2 && bets['col-2']) totalWin += bets['col-2'] * 3;
    if (isCol3 && bets['col-3']) totalWin += bets['col-3'] * 3;

    setLastWinAmount(totalWin);

    playCasinoBet(
      'roulette',
      'Lightning Roulette Pro',
      totalBet,
      totalWin > 0 ? Number((totalWin / totalBet).toFixed(2)) : 0,
      totalWin,
      { winningNumber: winner, lightningHit }
    );
  };

  return (
    <div className="bg-[#11141c] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Top History Bar */}
      <div className="px-4 py-2.5 bg-gray-950 border-b border-gray-800 flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-semibold shrink-0">
          <History className="w-3.5 h-3.5 text-amber-400" />
          <span>Last Winning Numbers:</span>
        </div>
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          {history.map((n, i) => (
            <span
              key={i}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold text-white shrink-0 ${
                n === 0 ? 'bg-emerald-600' : RED_NUMBERS.includes(n) ? 'bg-red-600' : 'bg-gray-800'
              }`}
            >
              {n}
            </span>
          ))}
        </div>
      </div>

      {/* Main Wheel & Lightning Display */}
      <div className="p-4 sm:p-6 bg-gradient-to-b from-[#181c26] to-[#0e1117] grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Wheel Canvas */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center">
          <div className="relative w-64 sm:w-80 h-64 sm:h-80 flex items-center justify-center">
            <canvas ref={canvasRef} className="w-full h-full drop-shadow-2xl" />
          </div>

          {winningNumber !== null && (
            <div className="mt-3 px-4 py-1.5 rounded-full bg-gray-900 border border-amber-500/40 text-center flex items-center space-x-2">
              <span className="text-xs text-gray-400 font-bold uppercase">Result:</span>
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                  winningNumber === 0
                    ? 'bg-emerald-500'
                    : RED_NUMBERS.includes(winningNumber)
                    ? 'bg-red-500'
                    : 'bg-gray-800'
                }`}
              >
                {winningNumber}
              </span>
              <span className="text-xs font-bold text-amber-400">
                {winningNumber === 0
                  ? 'Zero (Green)'
                  : RED_NUMBERS.includes(winningNumber)
                  ? 'Red'
                  : 'Black'}
              </span>
            </div>
          )}
        </div>

        {/* Lightning Numbers & Payout Status */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-gray-950/80 border border-amber-500/30 rounded-xl p-3.5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Lightning Lucky Multipliers
                </h4>
              </div>
              <span className="text-[10px] font-mono text-gray-500">Up to 500x</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {lightningNumbers.length > 0 ? (
                lightningNumbers.map((l, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-amber-500/10 border border-amber-500/40 rounded-lg text-center"
                  >
                    <span className="text-lg font-bold font-mono text-white block">{l.number}</span>
                    <span className="text-xs font-mono font-extrabold text-amber-400 block">
                      {l.multiplier}x BOOST
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-3 py-3 text-center text-xs text-gray-500">
                  Spin the wheel to activate Lightning Numbers!
                </div>
              )}
            </div>
          </div>

          {/* Last Win celebration box */}
          {lastWinAmount !== null && (
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between ${
                lastWinAmount > 0
                  ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                  : 'bg-gray-900 border-gray-800 text-gray-400'
              }`}
            >
              <div className="flex items-center space-x-2">
                {lastWinAmount > 0 ? (
                  <Trophy className="w-5 h-5 text-emerald-400" />
                ) : (
                  <RotateCcw className="w-5 h-5 text-gray-500" />
                )}
                <div>
                  <p className="text-xs font-bold">
                    {lastWinAmount > 0 ? 'YOU WON!' : 'NO WIN THIS ROUND'}
                  </p>
                  <p className="text-[10px] text-gray-400">Total Bet: {formatCurrency(totalBet)}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold font-mono text-emerald-400">
                  +{formatCurrency(lastWinAmount)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Betting Board Grid */}
      <div className="p-4 sm:p-5 bg-gray-900 border-t border-gray-800 space-y-4">
        {/* Chip Selection Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-gray-400 uppercase">Select Chip:</span>
            {[1, 5, 10, 25, 50, 100, 500].map((amt) => (
              <button
                key={amt}
                onClick={() => setSelectedChip(amt)}
                className={`w-9 h-9 rounded-full text-xs font-mono font-bold border-2 transition-all cursor-pointer flex items-center justify-center ${
                  selectedChip === amt
                    ? 'border-amber-400 bg-amber-500 text-black scale-110 shadow-lg shadow-amber-500/20'
                    : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500'
                }`}
              >
                {amt}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={clearBets}
              disabled={isSpinning || totalBet === 0}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-300 rounded-lg text-xs font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Bets</span>
            </button>
          </div>
        </div>

        {/* Roulette Table Board */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[580px] space-y-1.5 select-none">
            {/* Zero and 1-36 Numbers Grid */}
            <div className="flex gap-1.5">
              {/* Zero */}
              <button
                onClick={() => placeChip('num-0')}
                className="w-12 bg-emerald-700 hover:bg-emerald-600 rounded-lg flex flex-col items-center justify-center text-white font-bold text-sm relative transition-all cursor-pointer"
              >
                <span>0</span>
                {bets['num-0'] && (
                  <span className="absolute bottom-1 px-1 rounded-full bg-amber-400 text-black text-[9px] font-mono">
                    {bets['num-0']}
                  </span>
                )}
              </button>

              {/* 36 Numbers in 3 rows */}
              <div className="grid grid-rows-3 grid-flow-col gap-1.5 flex-1">
                {Array.from({ length: 36 }, (_, i) => i + 1).map((n) => {
                  const isRed = RED_NUMBERS.includes(n);
                  return (
                    <button
                      key={n}
                      onClick={() => placeChip(`num-${n}`)}
                      className={`h-9 rounded-lg font-bold font-mono text-xs text-white relative flex items-center justify-center transition-all cursor-pointer ${
                        isRed ? 'bg-red-700 hover:bg-red-600' : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      <span>{n}</span>
                      {bets[`num-${n}`] && (
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-black text-[9px] font-mono font-bold flex items-center justify-center shadow-md">
                          {bets[`num-${n}`]}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* 2 to 1 Columns */}
              <div className="grid grid-rows-3 gap-1.5 w-12">
                {['col-3', 'col-2', 'col-1'].map((c, i) => (
                  <button
                    key={c}
                    onClick={() => placeChip(c)}
                    className="h-9 bg-gray-800 hover:bg-gray-700 rounded-lg text-[10px] font-bold text-gray-300 relative flex items-center justify-center cursor-pointer"
                  >
                    <span>2:1</span>
                    {bets[c] && (
                      <span className="absolute -top-1 -right-1 px-1 rounded-full bg-amber-400 text-black text-[9px] font-mono">
                        {bets[c]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Dozens Row */}
            <div className="grid grid-cols-3 gap-1.5 pl-13 pr-13">
              {[
                { id: 'dozen-1', label: '1st 12 (1-12)' },
                { id: 'dozen-2', label: '2nd 12 (13-24)' },
                { id: 'dozen-3', label: '3rd 12 (25-36)' },
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => placeChip(d.id)}
                  className="py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-bold text-gray-300 relative text-center cursor-pointer"
                >
                  <span>{d.label}</span>
                  {bets[d.id] && (
                    <span className="absolute -top-1.5 right-2 px-1.5 rounded-full bg-amber-400 text-black text-[9px] font-mono">
                      {bets[d.id]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Outside Bets (1-18, Even, Red, Black, Odd, 19-36) */}
            <div className="grid grid-cols-6 gap-1.5 pl-13 pr-13">
              {[
                { id: 'low', label: '1 - 18' },
                { id: 'even', label: 'EVEN' },
                { id: 'red', label: 'RED', color: 'bg-red-700 hover:bg-red-600' },
                { id: 'black', label: 'BLACK', color: 'bg-gray-950 hover:bg-gray-900 border border-gray-700' },
                { id: 'odd', label: 'ODD' },
                { id: 'high', label: '19 - 36' },
              ].map((o) => (
                <button
                  key={o.id}
                  onClick={() => placeChip(o.id)}
                  className={`py-2 rounded-lg text-xs font-bold text-white relative text-center cursor-pointer ${
                    o.color || 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <span>{o.label}</span>
                  {bets[o.id] && (
                    <span className="absolute -top-1.5 right-1 px-1.5 rounded-full bg-amber-400 text-black text-[9px] font-mono">
                      {bets[o.id]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Spin Control Button Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-800">
          <div className="space-y-0.5">
            <p className="text-[11px] font-bold text-gray-400 uppercase">Total Table Stake</p>
            <p className="text-base font-extrabold font-mono text-amber-400">
              {formatCurrency(totalBet)}
            </p>
          </div>

          <button
            onClick={handleSpin}
            disabled={totalBet === 0 || isSpinning}
            className={`px-8 py-3 rounded-xl text-sm font-extrabold uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer flex items-center space-x-2 ${
              isSpinning
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : totalBet === 0
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black shadow-amber-500/20'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSpinning ? 'SPINNING WHEEL...' : 'SPIN ROULETTE'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
