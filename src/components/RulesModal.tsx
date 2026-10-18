/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Trophy, ShieldAlert, Sparkles, Flame, Users } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-xl max-h-[88vh] overflow-y-auto rounded-2xl bg-[#12241c] border border-emerald-800/80 p-5 sm:p-6 shadow-2xl text-stone-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-lg bg-emerald-950/60"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-amber-400" />
          <h2 className="text-xl font-black text-amber-400 tracking-wide">
            Dahla Pakad — Rules & How to Play
          </h2>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-stone-300 leading-relaxed">
          {/* Seating and Partnership */}
          <div className="rounded-xl bg-[#183628] border border-emerald-900/60 p-3.5">
            <h3 className="flex items-center gap-2 text-amber-300 font-bold mb-1">
              <Users className="w-4 h-4 text-emerald-400" />
              1. Teams & Seating
            </h3>
            <p>
              4 players sit in a circle. Partners sit opposite each other:
            </p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-emerald-900/40 rounded-lg p-2 border border-emerald-700/50">
                <span className="font-bold text-emerald-300">Team A</span>: Player A (Seat 0) + Player C (Seat 2)
              </div>
              <div className="bg-rose-950/40 rounded-lg p-2 border border-rose-700/50">
                <span className="font-bold text-rose-300">Team B</span>: Player B (Seat 1) + Player D (Seat 3)
              </div>
            </div>
          </div>

          {/* Dealer and Trump */}
          <div className="rounded-xl bg-[#183628] border border-emerald-900/60 p-3.5">
            <h3 className="flex items-center gap-2 text-amber-300 font-bold mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              2. Dealer (Pehla Jack) & Trump (Rang Kholna)
            </h3>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                <strong>Dealer Selection</strong>: Cards are dealt one-by-one clockwise until the first <strong>Jack (J)</strong> appears. That player becomes the dealer.
              </li>
              <li>
                <strong>Deal 5 Cards</strong>: Dealer deals 5 cards to each player.
              </li>
              <li>
                <strong>Rang Kholna (Establishing Trump)</strong>: Player after the dealer leads. All players must follow suit. The first time any player has no cards in the led suit and plays a different suit, that played suit becomes the <strong>Trump Suit (Rang)</strong>!
              </li>
              <li>
                <strong>Deal Rest (13 each)</strong>: Remaining cards are dealt (4 cards x 2 rounds = 8 cards each, total 13 cards per hand).
              </li>
              <li>
                <strong>Court Cards Check</strong>: If any hand has zero court cards (no J, Q, K, or A), a fair re-deal is triggered.
              </li>
            </ul>
          </div>

          {/* Dahla and Trick Collection */}
          <div className="rounded-xl bg-[#183628] border border-emerald-900/60 p-3.5">
            <h3 className="flex items-center gap-2 text-amber-300 font-bold mb-1">
              <Flame className="w-4 h-4 text-orange-400" />
              3. Dahla (10) & 2 Consecutive Wins Rule
            </h3>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                <strong>Cards Accumulate</strong>: Tricks won do NOT get picked up each round. They stay in the center <em>table pile</em>.
              </li>
              <li>
                <strong>Dahla Pending</strong>: When a <strong>Dahla (10)</strong> appears in the pile, the winner of that trick has a <em>Pending Win</em>. They <u>cannot</u> collect the pile immediately!
              </li>
              <li>
                <strong>Collection</strong>: That player must win the <strong>very next trick</strong> (2 consecutive trick wins) to claim the table pile.
              </li>
              <li>
                <strong>Normal Rule Triggered</strong>: Once any player successfully collects a Dahla pile, the table switches to the standard rule: any player who wins 2 consecutive tricks collects whatever pile is on the table!
              </li>
              <li>
                <strong>Leftover Cards</strong>: At the end of round 13, any remaining table pile cards are awarded to the winner of the 13th trick.
              </li>
            </ul>
          </div>

          {/* Winning Conditions */}
          <div className="rounded-xl bg-[#183628] border border-emerald-900/60 p-3.5">
            <h3 className="flex items-center gap-2 text-amber-300 font-bold mb-1">
              <Trophy className="w-4 h-4 text-amber-400" />
              4. Winning the Game (Kotha)
            </h3>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                <strong className="text-amber-300">Instant Victory (Kotha / 4 Dahle)</strong>: If one team captures <strong>all 4 Dahle (40 points)</strong>, they immediately win the match on the spot!
              </li>
              <li>
                <strong>Standard Victory</strong>: If no team gets 4 Dahle, the team with the most Dahle (3 vs 1) wins.
              </li>
              <li>
                <strong>Tiebreaker (2 Dahle each)</strong>: If Dahle are tied 2-2, the team that collected the highest total number of cards (&gt; 26 cards) wins!
              </li>
            </ul>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 py-3 text-sm font-bold text-white shadow-lg transition"
        >
          Got It, Let's Play!
        </button>
      </div>
    </div>
  );
};
