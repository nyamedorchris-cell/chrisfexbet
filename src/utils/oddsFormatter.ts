import { OddsFormat } from '../types';

export const CURRENCY_SYMBOL = 'GH₵';
export const CURRENCY_CODE = 'GHS';
export const MIN_DEPOSIT_GHS = 2;
export const MAX_DEPOSIT_GHS = 100000;

export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return `${CURRENCY_SYMBOL} 0.00`;
  return `${CURRENCY_SYMBOL} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatOdds(decimalOdds: number, format: OddsFormat): string {
  if (format === 'decimal') {
    return decimalOdds.toFixed(2);
  }

  if (format === 'american') {
    if (decimalOdds >= 2.0) {
      const american = Math.round((decimalOdds - 1) * 100);
      return `+${american}`;
    } else {
      const american = Math.round(-100 / (decimalOdds - 1));
      return `${american}`;
    }
  }

  if (format === 'fractional') {
    // Convert decimal to fractional
    const d = decimalOdds - 1;
    const tolerance = 0.05;
    const standardFractions: [number, number][] = [
      [1, 10], [1, 5], [1, 4], [2, 7], [1, 3], [4, 11], [2, 5], [4, 9], [1, 2],
      [8, 15], [4, 7], [8, 13], [4, 6], [8, 11], [4, 5], [9, 10], [1, 1], [11, 10],
      [6, 5], [5, 4], [11, 8], [6, 4], [13, 8], [7, 4], [15, 8], [2, 1], [9, 4],
      [5, 2], [11, 4], [3, 1], [7, 2], [4, 1], [9, 2], [5, 1], [6, 1], [7, 1],
      [8, 1], [9, 1], [10, 1], [12, 1], [15, 1], [20, 1], [25, 1], [50, 1], [100, 1]
    ];

    let bestFraction = `${Math.round(d * 100)}/100`;
    let minDiff = 999;

    for (const [num, den] of standardFractions) {
      const val = num / den;
      const diff = Math.abs(val - d);
      if (diff < minDiff && diff < tolerance) {
        minDiff = diff;
        bestFraction = `${num}/${den}`;
      }
    }

    return bestFraction;
  }

  return decimalOdds.toFixed(2);
}

export function calculatePotentialReturn(stake: number, odds: number): number {
  return Number((stake * odds).toFixed(2));
}

export function calculateParlayOdds(oddsList: number[]): number {
  if (oddsList.length === 0) return 1.0;
  const raw = oddsList.reduce((acc, curr) => acc * curr, 1);
  return Number(raw.toFixed(3));
}

export function calculateComboBonusPercentage(legsCount: number): number {
  if (legsCount < 3) return 0;
  if (legsCount === 3) return 5;
  if (legsCount === 4) return 10;
  if (legsCount === 5) return 15;
  if (legsCount === 6) return 20;
  if (legsCount >= 7) return 30;
  return 0;
}
