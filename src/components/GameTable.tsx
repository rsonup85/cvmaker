/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CardView } from './CardView';
import {
  GameState,
  PublicGameState,
  Card,
  SUIT_EMOJI,
  SUIT_NAMES,
  TEAM_ASSIGNMENTS,
  isCardPlayable,
  calculateTrickWinner,
  RANK_NAMES
} from '../game/engine';
import { Flame, ShieldAlert, ChevronDown, ChevronUp, UserCheck, Bot, Sparkles } from 'lucide-react';
import { playCardSound } from '../utils/sound';

interface GameTableProps {
  state: GameState | PublicGameState;
  mySeatIndex: number;
  myPrivateHand: Card[];
  isMyTurn: boolean;
  onPlayCard: (cardId: string) => void;
  statusMessage?: string;
  isOnlineMultiplayer?: boolean;
}

export const GameTable: React.FC<GameTableProps> = ({
  state,
  mySeatIndex,
  myPrivateHand,
  isMyTurn,
  onPlayCard,
  statusMessage,
  isOnlineMultiplayer = false,
}) => {
  const [showLog, setShowLog] = useState(false);

  const humanPlayer = state.players[mySeatIndex];
  const myTeam = humanPlayer?.team ?? 0;

  // Relative player seat layout:
  // Bottom: mySeatIndex (Self)
  // Right: (mySeatIndex + 1) % 4 (Opponent)
  // Top: (mySeatIndex + 2) % 4 (Partner)
  // Left: (mySeatIndex + 3) % 4 (Opponent)
  const rightIndex = (mySeatIndex + 1) % 4;
  const topIndex = (mySeatIndex + 2) % 4;
  const leftIndex = (mySeatIndex + 3) % 4;

  const rightPlayer = state.players[rightIndex];
  const topPlayer = state.players[topIndex];
  const leftPlayer = state.players[leftIndex];

  const getCardCount = (idx: number): number => {
    const p = state.players[idx];
    if ('hand' in p && Array.isArray(p.hand)) {
      return p.hand.length;
    }
    if ('cardCount' in p && typeof p.cardCount === 'number') {
      return p.cardCount;
    }
    return 0;
  };

  const trickWinner = state.trick.length > 0 ? calculateTrickWinner(state.trick, state.ledSuit, state.trump) : null;
  const hasDahlaInPile = state.tablePile.some((c) => c.isDahla);

  const handleCardClick = (cardId: string) => {
    if (!isMyTurn) return;
    playCardSound();
    onPlayCard(cardId);
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto text-stone-100 select-none pb-4">
      {/* HUD Top Bar: Scores, Dealer, Trump, Dahla Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#12241c] border border-emerald-900/80 rounded-2xl p-2.5 sm:p-3 mb-2 shadow-lg text-xs sm:text-sm">
        <div className="flex flex-wrap items-center gap-2">
          {state.dealer !== null && (
            <div className="bg-[#1a3828] px-2.5 py-1 rounded-lg border border-emerald-800/60 font-semibold text-stone-300">
              Dealer: <span className="text-amber-300 font-bold">{state.players[state.dealer]?.name}</span>
            </div>
          )}

          {state.trump ? (
            <div className="flex items-center gap-1 bg-purple-950/80 px-2.5 py-1 rounded-lg border border-purple-600/60 font-bold text-purple-200">
              <span>Trump:</span>
              <span className="text-base leading-none">{SUIT_EMOJI[state.trump]}</span>
              <span className="hidden sm:inline text-xs font-normal text-purple-300">
                ({SUIT_NAMES[state.trump]})
              </span>
            </div>
          ) : (
            <div className="bg-stone-800/70 px-2 py-1 rounded-lg text-stone-400 text-xs">
              Rang nahi khula
            </div>
          )}

          {state.dahlaTriggered ? (
            <span className="bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded-md text-xs font-bold">
              Normal Rule Active
            </span>
          ) : state.dahlaPending ? (
            <span className="flex items-center gap-1 bg-orange-950 text-orange-300 border border-orange-600/70 px-2.5 py-0.5 rounded-md text-xs font-extrabold animate-pulse">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              DAHLA PENDING ({state.dahlaWinner !== null ? state.players[state.dahlaWinner]?.name : ''})
            </span>
          ) : null}

          {state.restartCount > 0 && (
            <span className="bg-rose-950 text-rose-300 border border-rose-700/60 px-2 py-0.5 rounded-md text-xs font-bold">
              Restart #{state.restartCount}
            </span>
          )}
        </div>

        {/* Team Scores */}
        <div className="flex items-center gap-3 font-bold text-xs sm:text-sm ml-auto">
          <div className="flex items-center gap-1 bg-emerald-950/80 border border-emerald-700/70 px-2.5 py-1 rounded-lg text-emerald-300">
            <span>TEAM A (A+C):</span>
            <span className="text-amber-300 text-sm font-extrabold">{state.dahleScore[0]}D</span>
            <span className="text-stone-400 text-[0.7rem]">({state.cardScore[0]}c)</span>
          </div>
          <div className="flex items-center gap-1 bg-rose-950/80 border border-rose-700/70 px-2.5 py-1 rounded-lg text-rose-300">
            <span>TEAM B (B+D):</span>
            <span className="text-amber-300 text-sm font-extrabold">{state.dahleScore[1]}D</span>
            <span className="text-stone-400 text-[0.7rem]">({state.cardScore[1]}c)</span>
          </div>
        </div>
      </div>

      {/* Status banner message */}
      {statusMessage && (
        <div className="text-center text-xs sm:text-sm text-amber-300 font-semibold mb-2 bg-[#102018]/80 py-1 px-3 rounded-lg border border-emerald-950">
          {statusMessage}
        </div>
      )}

      {/* Main Playing Arena: Dark Green Felt Table */}
      <div className="relative w-full rounded-3xl bg-[radial-gradient(ellipse_at_center,#1a4a30_0%,#0e2a1c_75%,#0a1a12_100%)] border-4 border-[#224835] shadow-[inset_0_0_40px_rgba(0,0,0,0.65)] p-3 sm:p-5 flex flex-col justify-between min-h-[460px] sm:min-h-[520px]">
        
        {/* Top Seat: Partner (Seat (mySeatIndex + 2) % 4) */}
        <div className="flex flex-col items-center z-10">
          <div
            className={`flex items-center gap-2 rounded-xl px-3 py-1.5 border transition-all ${
              state.currentTurn === topIndex
                ? 'bg-amber-950/80 border-amber-400 shadow-[0_0_15px_rgba(232,197,71,0.35)] ring-2 ring-amber-400/60'
                : 'bg-[#12241c]/90 border-emerald-900/70'
            }`}
          >
            <span className="text-xs sm:text-sm font-bold text-stone-100 flex items-center gap-1">
              {topPlayer?.name}
              <span className="text-[0.65rem] px-1.5 py-0.2 rounded-sm bg-emerald-800/80 text-emerald-200">
                Partner (Team {topPlayer?.team === 0 ? 'A' : 'B'})
              </span>
            </span>
            <span className="text-xs text-amber-300 font-black ml-1">
              {getCardCount(topIndex)} cards
            </span>
          </div>

          {/* Partner's Face-Down Cards Fan */}
          <div className="flex justify-center -space-x-5 mt-1">
            {Array.from({ length: Math.min(getCardCount(topIndex), 13) }).map((_, i) => (
              <CardView key={i} faceDown small />
            ))}
          </div>
        </div>

        {/* Middle Arena: Left Opponent, Center Trick & Table Pile, Right Opponent */}
        <div className="grid grid-cols-12 items-center my-3 sm:my-4">
          
          {/* Left Opponent (Seat (mySeatIndex + 3) % 4) */}
          <div className="col-span-3 flex flex-col items-start z-10">
            <div
              className={`rounded-xl px-2.5 py-1.5 border transition-all max-w-[130px] sm:max-w-[160px] ${
                state.currentTurn === leftIndex
                  ? 'bg-amber-950/80 border-amber-400 shadow-[0_0_15px_rgba(232,197,71,0.35)] ring-2 ring-amber-400/60'
                  : 'bg-[#12241c]/90 border-emerald-900/70'
              }`}
            >
              <div className="text-xs sm:text-sm font-bold text-stone-100 truncate">
                {leftPlayer?.name}
              </div>
              <div className="text-[0.65rem] text-rose-300 font-semibold">
                Team {leftPlayer?.team === 0 ? 'A' : 'B'} · {getCardCount(leftIndex)} cards
              </div>
            </div>

            <div className="flex flex-col -space-y-10 mt-1">
              {Array.from({ length: Math.min(getCardCount(leftIndex), 6) }).map((_, i) => (
                <CardView key={i} faceDown small />
              ))}
            </div>
          </div>

          {/* Center Table: Active Trick & Table Pile */}
          <div className="col-span-6 flex flex-col items-center justify-center">
            
            {/* Table Pile Summary */}
            <div className="mb-2 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-emerald-800/60 text-xs">
                <span className="text-stone-300">Table Pile:</span>
                <span className="font-extrabold text-amber-300">{state.tablePile.length} cards</span>
                {hasDahlaInPile && (
                  <span className="flex items-center gap-0.5 text-orange-400 font-black animate-pulse">
                    <Flame className="w-3.5 h-3.5" /> Dahla inside!
                  </span>
                )}
              </div>
            </div>

            {/* Active Trick Area (Cards played in current trick) */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 min-h-[90px] sm:min-h-[110px] w-full p-2 rounded-2xl bg-black/25 border border-emerald-800/40">
              {state.trick.length === 0 ? (
                <div className="text-stone-400 text-xs sm:text-sm italic py-4">
                  {state.currentTurn === mySeatIndex
                    ? 'Aapki chaal hai — Card chuno!'
                    : `Waiting for ${state.players[state.currentTurn ?? 0]?.name}...`}
                </div>
              ) : (
                state.trick.map((play, idx) => {
                  const isWinner = trickWinner === play.player;
                  const isPlayerSelf = play.player === mySeatIndex;

                  return (
                    <div key={idx} className="flex flex-col items-center relative animate-in fade-in duration-150">
                      <span className={`text-[0.65rem] sm:text-xs font-bold mb-0.5 ${isWinner ? 'text-emerald-400' : 'text-stone-300'}`}>
                        {state.players[play.player]?.name} {isPlayerSelf ? '(You)' : ''}
                      </span>
                      <CardView card={play.card} small />
                      {isWinner && (
                        <span className="absolute -top-2 -right-1 bg-emerald-500 text-stone-950 font-black text-[0.6rem] px-1.5 py-0.2 rounded-md shadow-md animate-bounce">
                          JEET
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Mini Cards of past rounds currently resting in pile */}
            {state.tableRounds.length > 0 && (
              <div className="mt-2 flex flex-col items-center gap-1 max-h-16 overflow-y-auto w-full px-2">
                <span className="text-[0.6rem] text-stone-400 font-semibold uppercase tracking-wider">
                  Cards on Table ({state.tablePile.length})
                </span>
                <div className="flex flex-wrap justify-center gap-1">
                  {state.tablePile.slice(-8).map((c, i) => (
                    <CardView key={i} card={c} mini />
                  ))}
                  {state.tablePile.length > 8 && (
                    <span className="text-[0.65rem] text-stone-400 self-center">
                      +{state.tablePile.length - 8} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Opponent (Seat (mySeatIndex + 1) % 4) */}
          <div className="col-span-3 flex flex-col items-end z-10">
            <div
              className={`rounded-xl px-2.5 py-1.5 border transition-all max-w-[130px] sm:max-w-[160px] text-right ${
                state.currentTurn === rightIndex
                  ? 'bg-amber-950/80 border-amber-400 shadow-[0_0_15px_rgba(232,197,71,0.35)] ring-2 ring-amber-400/60'
                : 'bg-[#12241c]/90 border-emerald-900/70'
              }`}
            >
              <div className="text-xs sm:text-sm font-bold text-stone-100 truncate">
                {rightPlayer?.name}
              </div>
              <div className="text-[0.65rem] text-rose-300 font-semibold">
                Team {rightPlayer?.team === 0 ? 'A' : 'B'} · {getCardCount(rightIndex)} cards
              </div>
            </div>

            <div className="flex flex-col -space-y-10 mt-1">
              {Array.from({ length: Math.min(getCardCount(rightIndex), 6) }).map((_, i) => (
                <CardView key={i} faceDown small />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Area: User Info & Interactive Card Hand */}
        <div className="flex flex-col items-center z-20">
          <div
            className={`flex items-center gap-2 rounded-xl px-4 py-1.5 border mb-2 transition-all ${
              isMyTurn
                ? 'bg-amber-950 border-amber-400 shadow-[0_0_20px_rgba(232,197,71,0.5)] ring-2 ring-amber-400/80 animate-pulse'
                : 'bg-[#12241c]/90 border-emerald-900/70'
            }`}
          >
            <span className="text-xs sm:text-sm font-black text-amber-300">
              {humanPlayer?.name} (Aap)
            </span>
            <span className="text-[0.65rem] px-2 py-0.5 rounded-md bg-emerald-800 text-white font-bold">
              Team {myTeam === 0 ? 'A (A+C)' : 'B (B+D)'}
            </span>
            {isMyTurn && (
              <span className="text-xs font-black text-amber-400 ml-2 animate-bounce">
                ← AAPKI CHAAL HAI!
              </span>
            )}
          </div>

          {/* Hand Cards Fan */}
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 px-1 max-w-full">
            {myPrivateHand.map((card) => {
              const playable = isMyTurn && isCardPlayable(card, myPrivateHand, state.ledSuit);
              return (
                <CardView
                  key={card.id}
                  card={card}
                  playable={playable}
                  ledSuit={state.ledSuit}
                  trumpSuit={state.trump}
                  showTag={isMyTurn && state.trick.length > 0}
                  onClick={() => handleCardClick(card.id)}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Collapsible Action Log */}
      <div className="mt-3 bg-[#0a120e] rounded-xl border border-emerald-950 p-2 sm:p-3 text-xs font-mono">
        <button
          onClick={() => setShowLog(!showLog)}
          className="w-full flex items-center justify-between text-stone-400 hover:text-stone-200"
        >
          <span className="font-bold flex items-center gap-1.5 text-stone-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Action Log ({state.log.length} events)
          </span>
          {showLog ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showLog && (
          <div className="mt-2 max-h-36 overflow-y-auto space-y-1 pr-1">
            {state.log.map((entry) => {
              let color = 'text-stone-400';
              if (entry.category === 'highlight') color = 'text-amber-300 font-bold';
              else if (entry.category === 'collect') color = 'text-emerald-400 font-bold';
              else if (entry.category === 'dahla') color = 'text-orange-400 font-bold';
              else if (entry.category === 'trump') color = 'text-purple-300 font-bold';
              else if (entry.category === 'restart') color = 'text-rose-400 font-bold';

              return (
                <div key={entry.id} className={`${color} leading-relaxed`}>
                  {entry.text}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
