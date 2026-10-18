/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home, Flame } from 'lucide-react';
import { playVictorySound } from '../utils/sound';

interface GameOverModalProps {
  winnerTeam: 0 | 1 | null;
  humanTeam: 0 | 1;
  dahleScore: [number, number];
  cardScore: [number, number];
  gameEndReason: string;
  onRematch: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winnerTeam,
  humanTeam,
  dahleScore,
  cardScore,
  gameEndReason,
  onRematch,
  onHome,
}) => {
  const isHumanWinner = winnerTeam !== null && winnerTeam === humanTeam;
  const isTie = winnerTeam === null;

  useEffect(() => {
    if (isHumanWinner) {
      playVictorySound();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#e8c547', '#2ecc71', '#e74c3c', '#ffffff'],
        });
      } catch {}
    }
  }, [isHumanWinner]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-[#12241c] border-2 border-emerald-700/80 p-6 shadow-2xl text-center text-stone-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg bg-emerald-950 border border-emerald-600/60">
          {isHumanWinner ? (
            <Trophy className="w-9 h-9 text-amber-400 animate-bounce" />
          ) : isTie ? (
            <Flame className="w-9 h-9 text-amber-400" />
          ) : (
            <span className="text-3xl">😢</span>
          )}
        </div>

        <h2 className="text-2xl font-black mb-1">
          {isHumanWinner ? (
            <span className="text-emerald-400">AAPKI TEAM JEETI! 🎉</span>
          ) : isTie ? (
            <span className="text-amber-400">MATCH TIE HUA!</span>
          ) : (
            <span className="text-rose-400">AAPKI TEAM HAAR GAYI 😢</span>
          )}
        </h2>

        {gameEndReason && (
          <p className="text-xs sm:text-sm text-amber-300 font-semibold mb-4 px-2">
            {gameEndReason}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 mb-5 text-left">
          <div
            className={`rounded-xl p-3 border ${
              winnerTeam === 0
                ? 'bg-emerald-900/40 border-emerald-500 ring-2 ring-emerald-500/50'
                : 'bg-emerald-950/20 border-emerald-900/40 opacity-75'
            }`}
          >
            <div className="text-xs text-emerald-300 font-bold">TEAM A (A+C)</div>
            <div className="text-xl font-extrabold text-amber-300 mt-1">
              {dahleScore[0]} <span className="text-xs text-stone-300">Dahle</span>
            </div>
            <div className="text-xs text-stone-400 mt-0.5">{cardScore[0]} cards total</div>
          </div>

          <div
            className={`rounded-xl p-3 border ${
              winnerTeam === 1
                ? 'bg-rose-900/40 border-rose-500 ring-2 ring-rose-500/50'
                : 'bg-rose-950/20 border-rose-900/40 opacity-75'
            }`}
          >
            <div className="text-xs text-rose-300 font-bold">TEAM B (B+D)</div>
            <div className="text-xl font-extrabold text-amber-300 mt-1">
              {dahleScore[1]} <span className="text-xs text-stone-300">Dahle</span>
            </div>
            <div className="text-xs text-stone-400 mt-0.5">{cardScore[1]} cards total</div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onRematch}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 py-3 text-sm font-bold text-white shadow-lg transition active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Naya Game</span>
          </button>
          <button
            onClick={onHome}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 px-4 py-3 text-sm font-bold text-stone-200 transition"
          >
            <Home className="w-4 h-4" />
            <span>Lobby</span>
          </button>
        </div>
      </div>
    </div>
  );
};
