/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Card, SUIT_EMOJI, RANK_NAMES, Suit } from '../game/engine';

interface CardViewProps {
  card?: Card;
  faceDown?: boolean;
  small?: boolean;
  mini?: boolean;
  playable?: boolean;
  ledSuit?: Suit | null;
  trumpSuit?: Suit | null;
  showTag?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  faceDown = false,
  small = false,
  mini = false,
  playable = false,
  ledSuit,
  trumpSuit,
  showTag = false,
  onClick,
  className = '',
  style,
}) => {
  if (faceDown) {
    const sizeClasses = mini
      ? 'w-6 h-9 text-xs rounded-sm'
      : small
      ? 'w-11 h-15 text-sm rounded-lg'
      : 'w-14 h-20 sm:w-16 sm:h-23 text-lg rounded-xl';

    return (
      <div
        style={style}
        className={`inline-flex items-center justify-center select-none bg-gradient-to-br from-[#1a3a6a] to-[#0c1e40] border-2 border-[#2a4a7a] text-[#6a9ad0] shadow-md ${sizeClasses} ${className}`}
      >
        <span>🂠</span>
      </div>
    );
  }

  if (!card) return null;

  const isRed = card.suit === 'H' || card.suit === 'D';
  const rankStr = RANK_NAMES[card.rank] || String(card.rank);

  let tag = '';
  if (showTag && ledSuit) {
    if (card.suit === ledSuit) tag = 'led';
    else if (card.suit === trumpSuit) tag = 'trump';
  }

  const sizeClasses = mini
    ? 'w-8 h-11 text-[0.7rem] rounded-md px-0.5'
    : small
    ? 'w-11 h-15 text-sm rounded-lg'
    : 'w-13 h-19 sm:w-15 sm:h-22 text-base sm:text-lg rounded-xl';

  const dahlaGlow = card.isDahla
    ? 'ring-2 ring-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.55)] border-amber-400'
    : 'border-stone-300';

  const playability = playable
    ? 'cursor-pointer hover:-translate-y-2.5 hover:shadow-2xl hover:border-emerald-500 ring-2 ring-emerald-500/80 active:translate-y-0 transition-transform duration-150'
    : 'cursor-default';

  return (
    <button
      type="button"
      disabled={!playable}
      onClick={playable ? onClick : undefined}
      style={style}
      title={card.label}
      className={`relative inline-flex flex-col items-center justify-center font-extrabold select-none bg-[#f8f4ec] shadow-md border-2 transition-all ${sizeClasses} ${isRed ? 'text-[#e74c3c]' : 'text-stone-900'} ${dahlaGlow} ${playability} ${className}`}
    >
      <span className="leading-none text-xs sm:text-sm">{rankStr}</span>
      <span className="leading-tight text-sm sm:text-base">{SUIT_EMOJI[card.suit]}</span>

      {card.isDahla && (
        <span className="absolute top-0.5 right-1 text-[0.55rem] font-black text-amber-600">
          ★
        </span>
      )}

      {tag && (
        <span
          className={`absolute bottom-0.5 text-[0.55rem] font-bold px-1 rounded-sm leading-none ${
            tag === 'led' ? 'bg-emerald-700/80 text-white' : 'bg-purple-700/80 text-white'
          }`}
        >
          {tag}
        </span>
      )}
    </button>
  );
};
