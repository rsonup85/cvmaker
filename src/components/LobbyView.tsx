/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  Cpu,
  Zap,
  Volume2,
  VolumeX,
  HelpCircle,
  Trophy,
  Flame,
  Share2,
  Copy,
  Check,
  Bot,
  UserPlus,
  ArrowRight,
  Loader2,
  LogOut,
  Edit2
} from 'lucide-react';
import { UserStats, RoomData, RoomSeat } from '../services/multiplayerService';
import { PWAInstallButton } from './PWAInstallButton';
import { isSoundEnabled, setSoundEnabled } from '../utils/sound';

interface LobbyViewProps {
  userStats: UserStats | null;
  isSignedIn?: boolean;
  onGoogleSignIn?: () => void;
  onGoogleSignOut?: () => void;
  onUpdateDisplayName: (newName: string) => void;
  onStartOffline: (seatIndex: number, aiSpeed: 'normal' | 'fast') => void;
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  onStartQuickPlay: () => void;
  onCancelQuickPlay: () => void;
  onOpenRules: () => void;
  isQuickPlaySearching: boolean;
  quickPlayTime: number;
  currentRoom: RoomData | null;
  mySeatIndex: number;
  onSwitchSeat: (targetSeat: number) => void;
  onToggleReady: () => void;
  onLeaveRoom: () => void;
  onFillBots: (seatIndex: number) => void;
  onStartRoomGame: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  userStats,
  isSignedIn = false,
  onGoogleSignIn,
  onGoogleSignOut,
  onUpdateDisplayName,
  onStartOffline,
  onCreateRoom,
  onJoinRoom,
  onStartQuickPlay,
  onCancelQuickPlay,
  onOpenRules,
  isQuickPlaySearching,
  quickPlayTime,
  currentRoom,
  mySeatIndex,
  onSwitchSeat,
  onToggleReady,
  onLeaveRoom,
  onFillBots,
  onStartRoomGame,
}) => {
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [offlineSeat, setOfflineSeat] = useState(0);
  const [aiSpeed, setAiSpeed] = useState<'normal' | 'fast'>('normal');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userStats?.displayName || '');

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onUpdateDisplayName(nameInput.trim());
      setEditingName(false);
    }
  };

  const handleShareRoom = async () => {
    if (!currentRoom) return;
    const shareText = `Join my Dahla Pakad game! Room Code: ${currentRoom.code}`;
    const shareUrl = `${window.location.origin}/?room=${currentRoom.code}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Dahla Pakad Multiplayer',
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {}
    }

    navigator.clipboard.writeText(currentRoom.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // If currently in a private room lobby:
  if (currentRoom) {
    const isHost = currentRoom.hostId === userStats?.uid;
    const allReady = currentRoom.seats.filter(Boolean).length === 4 &&
      currentRoom.seats.every((s) => s && (s.isReady || s.isBot));

    return (
      <div className="w-full max-w-2xl mx-auto p-4 text-stone-100">
        {/* Lobby Header */}
        <div className="flex items-center justify-between mb-4 bg-[#12241c] border border-emerald-800/80 rounded-2xl p-4 shadow-lg">
          <div>
            <span className="text-xs text-stone-400 font-semibold">Private Room</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-amber-400 tracking-wider">
                {currentRoom.code}
              </span>
              <button
                onClick={handleShareRoom}
                className="flex items-center gap-1 bg-emerald-800/60 hover:bg-emerald-700 text-emerald-200 px-2.5 py-1 rounded-lg text-xs font-semibold transition"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Share Code'}</span>
              </button>
            </div>
          </div>

          <button
            onClick={onLeaveRoom}
            className="flex items-center gap-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 px-3 py-1.5 rounded-xl text-xs font-semibold transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Leave</span>
          </button>
        </div>

        {/* 4 Seating Slots */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Team A (Seats 0 & 2) */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-emerald-400 flex items-center justify-between px-1">
              <span>TEAM A</span>
              <span className="text-[0.65rem] text-stone-400">Seats 0 & 2 (Partners)</span>
            </div>

            {[0, 2].map((seatIdx) => {
              const seat = currentRoom.seats[seatIdx];
              const isMySeat = mySeatIndex === seatIdx;

              return (
                <div
                  key={seatIdx}
                  className={`rounded-xl border p-3 min-h-[90px] flex flex-col justify-between transition-all ${
                    seat
                      ? isMySeat
                        ? 'bg-emerald-950/90 border-emerald-500 shadow-md ring-2 ring-emerald-500/50'
                        : 'bg-[#183628] border-emerald-800/80'
                      : 'bg-black/30 border-dashed border-emerald-900/60 hover:border-emerald-600 cursor-pointer'
                  }`}
                  onClick={() => !seat && onSwitchSeat(seatIdx)}
                >
                  {seat ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-300">
                          Seat {seatIdx} {seat.isHost ? '👑' : ''}
                        </span>
                        <span
                          className={`text-[0.65rem] px-2 py-0.5 rounded-full font-bold ${
                            seat.isReady ? 'bg-emerald-600 text-white' : 'bg-stone-700 text-stone-300'
                          }`}
                        >
                          {seat.isReady ? 'READY' : 'WAITING'}
                        </span>
                      </div>
                      <div className="font-extrabold text-sm text-stone-100 truncate mt-1">
                        {seat.displayName} {isMySeat ? '(You)' : ''}
                      </div>
                      {seat.isBot && <span className="text-[0.65rem] text-stone-400">🤖 AI Bot</span>}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-stone-500 hover:text-emerald-400 py-3">
                      <span className="text-xs font-semibold">+ Open Seat</span>
                      {isHost && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onFillBots(seatIdx);
                          }}
                          className="mt-1 text-[0.65rem] text-amber-300 bg-amber-950/80 border border-amber-700/60 px-2 py-0.5 rounded-md hover:bg-amber-900"
                        >
                          + Add AI Bot
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Team B (Seats 1 & 3) */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-rose-400 flex items-center justify-between px-1">
              <span>TEAM B</span>
              <span className="text-[0.65rem] text-stone-400">Seats 1 & 3 (Partners)</span>
            </div>

            {[1, 3].map((seatIdx) => {
              const seat = currentRoom.seats[seatIdx];
              const isMySeat = mySeatIndex === seatIdx;

              return (
                <div
                  key={seatIdx}
                  className={`rounded-xl border p-3 min-h-[90px] flex flex-col justify-between transition-all ${
                    seat
                      ? isMySeat
                        ? 'bg-rose-950/90 border-rose-500 shadow-md ring-2 ring-rose-500/50'
                        : 'bg-[#241820] border-rose-900/80'
                      : 'bg-black/30 border-dashed border-rose-900/60 hover:border-rose-600 cursor-pointer'
                  }`}
                  onClick={() => !seat && onSwitchSeat(seatIdx)}
                >
                  {seat ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-300">
                          Seat {seatIdx} {seat.isHost ? '👑' : ''}
                        </span>
                        <span
                          className={`text-[0.65rem] px-2 py-0.5 rounded-full font-bold ${
                            seat.isReady ? 'bg-emerald-600 text-white' : 'bg-stone-700 text-stone-300'
                          }`}
                        >
                          {seat.isReady ? 'READY' : 'WAITING'}
                        </span>
                      </div>
                      <div className="font-extrabold text-sm text-stone-100 truncate mt-1">
                        {seat.displayName} {isMySeat ? '(You)' : ''}
                      </div>
                      {seat.isBot && <span className="text-[0.65rem] text-stone-400">🤖 AI Bot</span>}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-stone-500 hover:text-rose-400 py-3">
                      <span className="text-xs font-semibold">+ Open Seat</span>
                      {isHost && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onFillBots(seatIdx);
                          }}
                          className="mt-1 text-[0.65rem] text-amber-300 bg-amber-950/80 border border-amber-700/60 px-2 py-0.5 rounded-md hover:bg-amber-900"
                        >
                          + Add AI Bot
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Lobby Controls */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onToggleReady}
            className={`w-full py-3 rounded-xl font-bold text-sm shadow-md transition ${
              currentRoom.seats[mySeatIndex]?.isReady
                ? 'bg-stone-700 hover:bg-stone-600 text-stone-200'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {currentRoom.seats[mySeatIndex]?.isReady ? 'Cancel Ready' : 'I am Ready!'}
          </button>

          {isHost && (
            <button
              disabled={!allReady}
              onClick={onStartRoomGame}
              className={`w-full py-3.5 rounded-xl font-black text-base shadow-xl transition ${
                allReady
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 cursor-pointer animate-pulse'
                  : 'bg-stone-800 text-stone-500 cursor-not-allowed'
              }`}
            >
              {allReady ? 'Start Match (Khel Shuru Karo!)' : 'Waiting for 4 ready players...'}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Quick Play Searching Modal
  if (isQuickPlaySearching) {
    return (
      <div className="w-full max-w-md mx-auto p-6 text-center text-stone-100 bg-[#12241c] border border-emerald-800/80 rounded-2xl shadow-2xl my-8">
        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-950 border border-emerald-600/70 flex items-center justify-center mb-4">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        </div>
        <h3 className="text-xl font-extrabold text-amber-400 mb-1">
          Searching for Online Players...
        </h3>
        <p className="text-xs text-stone-400 mb-4">
          Finding 3 active players for a 4-player match
        </p>

        <div className="text-2xl font-mono font-bold text-stone-200 mb-6">
          {quickPlayTime}s
        </div>

        <button
          onClick={onCancelQuickPlay}
          className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-sm transition"
        >
          Cancel Matchmaking
        </button>
      </div>
    );
  }

  // Standard Lobby Screen
  return (
    <div className="w-full max-w-2xl mx-auto p-3 sm:p-4 text-stone-100">
      {/* Top Navbar */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-900/60">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-900 flex items-center justify-center font-black text-xl text-amber-300 shadow-md">
            ♠
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-amber-400 leading-none">
              DAHLA PAKAD
            </h1>
            <span className="text-[0.65rem] text-stone-400">Real 4-Player Card Game</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <PWAInstallButton />

          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-[#163028] border border-emerald-800/60 hover:bg-emerald-900/60 text-stone-300 transition"
            title={soundOn ? 'Sound On' : 'Sound Off'}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
          </button>

          <button
            onClick={onOpenRules}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#163028] border border-emerald-800/60 hover:bg-emerald-900/60 text-xs font-bold text-amber-300 transition"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Rules</span>
          </button>
        </div>
      </div>

      {/* Profile Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#12241c] border border-emerald-900/80 rounded-2xl p-3 sm:p-4 mb-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-emerald-950 border-2 border-amber-400/80 flex items-center justify-center text-xl shadow-inner shrink-0">
            {userStats?.avatar || '♠'}
          </div>
          <div>
            {editingName ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  maxLength={18}
                  className="bg-black/40 border border-emerald-600 rounded px-2 py-0.5 text-xs text-white"
                />
                <button
                  onClick={handleSaveName}
                  className="bg-emerald-600 text-white text-[0.65rem] px-2 py-1 rounded font-bold"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base text-stone-100">
                  {userStats?.displayName || 'Player'}
                </span>
                <button
                  onClick={() => setEditingName(true)}
                  className="text-stone-400 hover:text-amber-300"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 mt-0.5">
              {isSignedIn ? (
                <>
                  <span className="text-[0.65rem] text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Google Connected
                  </span>
                  {onGoogleSignOut && (
                    <button
                      onClick={onGoogleSignOut}
                      className="text-[0.65rem] text-stone-400 hover:text-rose-300 underline"
                    >
                      Sign out
                    </button>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-[0.65rem] text-amber-400/90 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    Guest (Offline Ready)
                  </span>
                  {onGoogleSignIn && (
                    <button
                      onClick={onGoogleSignIn}
                      className="flex items-center gap-1 bg-white hover:bg-stone-100 text-stone-900 px-2 py-0.5 rounded text-[0.68rem] font-bold shadow transition"
                    >
                      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                      Sign In with Google
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-2 sm:gap-3 text-right self-end sm:self-auto">
          <div className="bg-[#183628] px-2.5 py-1 rounded-xl border border-emerald-800/60">
            <span className="text-[0.6rem] text-stone-400 block">Matches</span>
            <span className="text-xs sm:text-sm font-extrabold text-stone-100">
              {userStats?.gamesPlayed || 0}
            </span>
          </div>
          <div className="bg-[#183628] px-2.5 py-1 rounded-xl border border-emerald-800/60">
            <span className="text-[0.6rem] text-stone-400 block">Wins</span>
            <span className="text-xs sm:text-sm font-extrabold text-emerald-400">
              {userStats?.gamesWon || 0}
            </span>
          </div>
          <div className="bg-[#183628] px-2.5 py-1 rounded-xl border border-emerald-800/60">
            <span className="text-[0.6rem] text-stone-400 block">Dahle</span>
            <span className="text-xs sm:text-sm font-extrabold text-amber-400">
              {userStats?.dahleCaptured || 0}
            </span>
          </div>
        </div>
      </div>

      {/* 3 Game Modes Grid */}
      <div className="space-y-4">
        
        {/* Mode 1: Offline Play */}
        <div className="rounded-2xl bg-[#12241c] border border-emerald-800/80 p-4 shadow-lg hover:border-emerald-600 transition">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-700/60 text-emerald-300">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-stone-100">1. Play Offline</h3>
                <p className="text-xs text-stone-400">1 Human vs 3 Smart AI Players (Works 100% Offline)</p>
              </div>
            </div>
            <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 font-bold border border-emerald-700/50">
              Instant
            </span>
          </div>

          <div className="bg-[#183628] rounded-xl p-3 mb-3 border border-emerald-900/60">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-xs text-stone-300 font-bold">Pick Your Player:</span>
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map((idx) => {
                  const names = ['A (Team A)', 'B (Team B)', 'C (Team A)', 'D (Team B)'];
                  return (
                    <button
                      key={idx}
                      onClick={() => setOfflineSeat(idx)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                        offlineSeat === idx
                          ? 'bg-amber-400 text-stone-950 shadow-md'
                          : 'bg-black/30 text-stone-300 hover:bg-black/50'
                      }`}
                    >
                      {names[idx]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-stone-400">
              <span>Game Speed:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setAiSpeed('normal')}
                  className={`px-2 py-0.5 rounded text-[0.7rem] font-semibold ${
                    aiSpeed === 'normal' ? 'bg-emerald-600 text-white' : 'bg-black/30 text-stone-400'
                  }`}
                >
                  Normal
                </button>
                <button
                  onClick={() => setAiSpeed('fast')}
                  className={`px-2 py-0.5 rounded text-[0.7rem] font-semibold ${
                    aiSpeed === 'fast' ? 'bg-emerald-600 text-white' : 'bg-black/30 text-stone-400'
                  }`}
                >
                  Fast AI
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => onStartOffline(offlineSeat, aiSpeed)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 py-3 text-sm font-extrabold text-white shadow-lg transition active:scale-95"
          >
            <span>Play Offline Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mode 2: Play With Friends */}
        <div className="rounded-2xl bg-[#12241c] border border-emerald-800/80 p-4 shadow-lg hover:border-emerald-600 transition">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-950 border border-purple-700/60 text-purple-300">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-stone-100">2. Play With Friends</h3>
                <p className="text-xs text-stone-400">Create private room or join using 6-character code</p>
              </div>
            </div>
            <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 font-bold border border-purple-700/50">
              Multiplayer
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={onCreateRoom}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-purple-700 hover:bg-purple-600 py-3 text-sm font-bold text-white shadow-md transition active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Private Room</span>
            </button>

            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="Enter Code (e.g. DP7890)"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                maxLength={8}
                className="flex-1 bg-black/40 border border-emerald-800/80 rounded-xl px-3 py-2 text-xs font-mono font-bold tracking-wider text-center text-white placeholder-stone-500 uppercase focus:outline-hidden focus:border-purple-500"
              />
              <button
                disabled={!joinCodeInput.trim()}
                onClick={() => onJoinRoom(joinCodeInput.trim())}
                className="rounded-xl bg-stone-700 hover:bg-stone-600 disabled:opacity-50 px-3.5 py-2 text-xs font-bold text-stone-200 transition"
              >
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Mode 3: Quick Play */}
        <div className="rounded-2xl bg-[#12241c] border border-emerald-800/80 p-4 shadow-lg hover:border-emerald-600 transition">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-950 border border-amber-700/60 text-amber-300">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-stone-100">3. Quick Play</h3>
                <p className="text-xs text-stone-400">Match with 4 online players automatically</p>
              </div>
            </div>
            <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-300 font-bold border border-amber-700/50">
              Online Queue
            </span>
          </div>

          <button
            onClick={onStartQuickPlay}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 py-3 text-sm font-black text-stone-950 shadow-lg transition active:scale-95"
          >
            <Zap className="w-4 h-4" />
            <span>Find Quick Match</span>
          </button>
        </div>
      </div>
    </div>
  );
};
