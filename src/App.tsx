/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { LobbyView } from './components/LobbyView';
import { GameTable } from './components/GameTable';
import { RulesModal } from './components/RulesModal';
import { GameOverModal } from './components/GameOverModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  GameState,
  PublicGameState,
  Card,
  createInitialState,
  dealFiveCards,
  playCard,
  chooseAiCard,
  findDealerDeterministic,
  shuffleDeck,
  createDeck
} from './game/engine';
import { onAuthStateChanged } from 'firebase/auth';
import {
  testFirestoreConnection,
  auth,
  loginWithGoogle,
  logoutUser
} from './firebase/config';
import {
  UserStats,
  RoomData,
  getOrCreateUserProfile,
  updateUserStats,
  createPrivateRoom,
  findRoomByCode,
  joinRoom,
  switchSeat,
  togglePlayerReady,
  leaveRoom,
  fillSeatWithBot,
  startMultiplayerMatch,
  submitOnlineMove,
  joinQuickPlayQueue,
  cancelQuickPlayQueue,
  subscribeToRoom,
  subscribeToMatch,
  subscribeToPrivateHand,
  subscribeToTicket
} from './services/multiplayerService';
import { playCardSound, playCollectSound, playDahlaSound, playTurnChime } from './utils/sound';

export default function App() {
  const [userProfile, setUserProfile] = useState<UserStats | null>(null);
  const [activeMode, setActiveMode] = useState<'lobby' | 'offline' | 'online'>('lobby');
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  // Quick Play State
  const [isQuickPlaySearching, setIsQuickPlaySearching] = useState(false);
  const [quickPlayTicketId, setQuickPlayTicketId] = useState<string | null>(null);
  const [quickPlayTimer, setQuickPlayTimer] = useState(0);

  // Private Room State
  const [currentRoom, setCurrentRoom] = useState<RoomData | null>(null);
  const [mySeatIndex, setMySeatIndex] = useState(0);

  // Offline Game State
  const [offlineState, setOfflineState] = useState<GameState | null>(null);
  const [offlineHumanSeat, setOfflineHumanSeat] = useState(0);
  const [aiSpeed, setAiSpeed] = useState<'normal' | 'fast'>('normal');
  const aiInFlightRef = useRef(false);

  // Online Game State
  const [onlineMatchId, setOnlineMatchId] = useState<string | null>(null);
  const [onlinePublicState, setOnlinePublicState] = useState<PublicGameState | null>(null);
  const [onlinePrivateHand, setOnlinePrivateHand] = useState<Card[]>([]);

  // Subscriptions Unsub refs
  const roomUnsubRef = useRef<(() => void) | null>(null);
  const matchUnsubRef = useRef<(() => void) | null>(null);
  const handUnsubRef = useRef<(() => void) | null>(null);
  const ticketUnsubRef = useRef<(() => void) | null>(null);
  const qpTimerIntervalRef = useRef<number | null>(null);

  // 1. Boot, Auth & Profile Initialization
  useEffect(() => {
    testFirestoreConnection();

    // Listen to Firebase Auth state
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await getOrCreateUserProfile(user.uid, user.displayName || undefined);
        setUserProfile(profile);
      } else {
        // Unauthenticated local profile for offline mode
        setUserProfile({
          uid: 'offline_player',
          displayName: 'Player',
          avatar: '♠',
          gamesPlayed: 0,
          gamesWon: 0,
          dahleCaptured: 0,
        });
      }
    });

    // Check for URL room invite e.g. ?room=ABCD12
    const params = new URLSearchParams(window.location.search);
    const roomCode = params.get('room');
    if (roomCode) {
      handleJoinRoomByCode(roomCode);
    }

    // Check for autostart query parameter (Ultra Mode requirement)
    if (params.get('autostart') === '1') {
      handleStartOffline(0, 'fast');
    }

    return () => {
      unsubAuth();
      if (roomUnsubRef.current) roomUnsubRef.current();
      if (matchUnsubRef.current) matchUnsubRef.current();
      if (handUnsubRef.current) handUnsubRef.current();
      if (ticketUnsubRef.current) ticketUnsubRef.current();
      if (qpTimerIntervalRef.current) clearInterval(qpTimerIntervalRef.current);
    };
  }, []);

  // Quick Play Timer
  useEffect(() => {
    if (isQuickPlaySearching) {
      setQuickPlayTimer(0);
      qpTimerIntervalRef.current = window.setInterval(() => {
        setQuickPlayTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (qpTimerIntervalRef.current) clearInterval(qpTimerIntervalRef.current);
    }
    return () => {
      if (qpTimerIntervalRef.current) clearInterval(qpTimerIntervalRef.current);
    };
  }, [isQuickPlaySearching]);

  // Offline AI Turn Automation Loop
  useEffect(() => {
    if (activeMode !== 'offline' || !offlineState) return;
    if (offlineState.phase !== 'trump' && offlineState.phase !== 'play') return;
    if (offlineState.currentTurn === null || offlineState.currentTurn === offlineHumanSeat) return;
    if (aiInFlightRef.current) return;

    aiInFlightRef.current = true;
    const delay = aiSpeed === 'fast' ? 500 : 1000;

    const timer = setTimeout(() => {
      try {
        const curTurn = offlineState.currentTurn;
        if (curTurn !== null && curTurn !== offlineHumanSeat) {
          const aiCard = chooseAiCard(offlineState, curTurn);
          if (aiCard) {
            playCardSound();
            const nextState = playCard(offlineState, curTurn, aiCard.id);
            setOfflineState(nextState);

            if (nextState.dahlaPending) playDahlaSound();
            if (nextState.tablePile.length === 0 && offlineState.tablePile.length > 0) playCollectSound();
            if (nextState.currentTurn === offlineHumanSeat) playTurnChime();

            // Record offline stats on game over
            if (nextState.phase === 'game_over' && userProfile) {
              const humanTeam = offlineState.players[offlineHumanSeat].team;
              const won = nextState.winnerTeam === humanTeam;
              const dahle = nextState.playerDahle[offlineHumanSeat];
              updateUserStats(userProfile.uid, won, dahle);
            }
          }
        }
      } catch (err) {
        console.error('AI Turn error:', err);
      } finally {
        aiInFlightRef.current = false;
      }
    }, delay);

    return () => {
      clearTimeout(timer);
      aiInFlightRef.current = false;
    };
  }, [offlineState, activeMode, offlineHumanSeat, aiSpeed, userProfile]);

  // Online Match Listener
  useEffect(() => {
    if (!onlineMatchId || activeMode !== 'online') return;

    if (matchUnsubRef.current) matchUnsubRef.current();
    matchUnsubRef.current = subscribeToMatch(onlineMatchId, (matchData) => {
      if (matchData) {
        setOnlinePublicState(matchData);
        if (matchData.currentTurn === mySeatIndex) {
          playTurnChime();
        }
      }
    });

    if (handUnsubRef.current) handUnsubRef.current();
    handUnsubRef.current = subscribeToPrivateHand(onlineMatchId, mySeatIndex, (cards) => {
      setOnlinePrivateHand(cards);
    });

    return () => {
      if (matchUnsubRef.current) matchUnsubRef.current();
      if (handUnsubRef.current) handUnsubRef.current();
    };
  }, [onlineMatchId, activeMode, mySeatIndex]);

  // Google Sign-In & Sign-Out Handlers
  const handleGoogleSignIn = async () => {
    try {
      const user = await loginWithGoogle();
      const profile = await getOrCreateUserProfile(user.uid, user.displayName || undefined);
      setUserProfile(profile);
    } catch (err) {
      console.warn('Google sign-in cancelled or failed:', err);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await logoutUser();
      setUserProfile({
        uid: 'offline_player',
        displayName: 'Player',
        avatar: '♠',
        gamesPlayed: 0,
        gamesWon: 0,
        dahleCaptured: 0,
      });
    } catch (err) {
      console.warn('Sign-out error:', err);
    }
  };

  // Update Display Name
  const handleUpdateDisplayName = async (newName: string) => {
    if (!userProfile) return;
    const updated = { ...userProfile, displayName: newName };
    setUserProfile(updated);
    if (auth.currentUser) {
      await getOrCreateUserProfile(auth.currentUser.uid, newName);
    }
  };

  // Start Offline Match
  const handleStartOffline = (seatIndex: number, speed: 'normal' | 'fast') => {
    setOfflineHumanSeat(seatIndex);
    setAiSpeed(speed);

    const deck = shuffleDeck(createDeck());
    const { dealer } = findDealerDeterministic(deck);

    const playerNames = ['A', 'B', 'C', 'D'];
    playerNames[seatIndex] = userProfile?.displayName || 'Aap';

    let state = createInitialState({
      humanIndex: seatIndex,
      playerNames,
    });
    state.dealer = dealer;
    state = dealFiveCards(state);

    setOfflineState(state);
    setActiveMode('offline');

    if (state.currentTurn === seatIndex) {
      playTurnChime();
    }
  };

  // Offline Human Card Play
  const handleOfflinePlayCard = (cardId: string) => {
    if (!offlineState || aiInFlightRef.current) return;
    if (offlineState.currentTurn !== offlineHumanSeat) return;

    try {
      const nextState = playCard(offlineState, offlineHumanSeat, cardId);
      setOfflineState(nextState);

      if (nextState.dahlaPending) playDahlaSound();
      if (nextState.tablePile.length === 0 && offlineState.tablePile.length > 0) playCollectSound();

      if (nextState.phase === 'game_over' && userProfile) {
        const humanTeam = offlineState.players[offlineHumanSeat].team;
        const won = nextState.winnerTeam === humanTeam;
        const dahle = nextState.playerDahle[offlineHumanSeat];
        updateUserStats(userProfile.uid, won, dahle);
      }
    } catch (err) {
      console.warn('Illegal card move:', err);
    }
  };

  // Create Private Room
  const handleCreateRoom = async () => {
    const name = userProfile?.displayName || 'Host';
    const avatar = userProfile?.avatar || '♠';
    try {
      const room = await createPrivateRoom(name, avatar);
      setCurrentRoom(room);
      setMySeatIndex(0);

      // Subscribe to room updates
      if (roomUnsubRef.current) roomUnsubRef.current();
      roomUnsubRef.current = subscribeToRoom(room.id, (updatedRoom) => {
        if (!updatedRoom) {
          setCurrentRoom(null);
          return;
        }
        setCurrentRoom(updatedRoom);
        if (updatedRoom.status === 'in_game' && updatedRoom.matchId) {
          setOnlineMatchId(updatedRoom.matchId);
          setActiveMode('online');
        }
      });
    } catch (err) {
      console.error('Failed to create room:', err);
    }
  };

  // Join Room by Code
  const handleJoinRoomByCode = async (code: string) => {
    try {
      const room = await findRoomByCode(code);
      if (!room) {
        alert('Room code not found!');
        return;
      }
      const name = userProfile?.displayName || 'Player';
      const avatar = userProfile?.avatar || '♠';
      const seat = await joinRoom(room.id, name, avatar);
      setMySeatIndex(seat);
      setCurrentRoom(room);

      // Subscribe to room
      if (roomUnsubRef.current) roomUnsubRef.current();
      roomUnsubRef.current = subscribeToRoom(room.id, (updatedRoom) => {
        if (!updatedRoom) {
          setCurrentRoom(null);
          return;
        }
        setCurrentRoom(updatedRoom);
        if (updatedRoom.status === 'in_game' && updatedRoom.matchId) {
          setOnlineMatchId(updatedRoom.matchId);
          setActiveMode('online');
        }
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to join room');
    }
  };

  // Switch Seat in Room
  const handleSwitchSeat = async (targetSeat: number) => {
    if (!currentRoom) return;
    try {
      await switchSeat(currentRoom.id, mySeatIndex, targetSeat);
      setMySeatIndex(targetSeat);
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Ready
  const handleToggleReady = async () => {
    if (!currentRoom) return;
    try {
      await togglePlayerReady(currentRoom.id, mySeatIndex);
    } catch (err) {
      console.error(err);
    }
  };

  // Leave Room
  const handleLeaveRoom = async () => {
    if (!currentRoom) return;
    try {
      await leaveRoom(currentRoom.id, mySeatIndex);
      if (roomUnsubRef.current) roomUnsubRef.current();
      setCurrentRoom(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Fill Bot in Room
  const handleFillBots = async (seatIndex: number) => {
    if (!currentRoom) return;
    try {
      await fillSeatWithBot(currentRoom.id, seatIndex);
    } catch (err) {
      console.error(err);
    }
  };

  // Start Room Game
  const handleStartRoomGame = async () => {
    if (!currentRoom) return;
    try {
      const matchId = await startMultiplayerMatch(currentRoom.id);
      setOnlineMatchId(matchId);
      setActiveMode('online');
    } catch (err) {
      console.error('Failed to start game:', err);
    }
  };

  // Online Card Move
  const handleOnlinePlayCard = async (cardId: string) => {
    if (!onlineMatchId || !onlinePublicState) return;
    try {
      await submitOnlineMove(onlineMatchId, mySeatIndex, cardId, onlinePublicState, onlinePrivateHand);
    } catch (err) {
      console.error('Move submission error:', err);
    }
  };

  // Start Quick Play Matchmaking
  const handleStartQuickPlay = async () => {
    const name = userProfile?.displayName || 'Player';
    const avatar = userProfile?.avatar || '♠';
    try {
      setIsQuickPlaySearching(true);
      const ticketId = await joinQuickPlayQueue(name, avatar);
      setQuickPlayTicketId(ticketId);

      // Listen for matched status
      if (ticketUnsubRef.current) ticketUnsubRef.current();
      ticketUnsubRef.current = subscribeToTicket(ticketId, (ticket) => {
        if (ticket && ticket.status === 'matched' && ticket.matchId && ticket.seat !== undefined) {
          setIsQuickPlaySearching(false);
          setMySeatIndex(ticket.seat);
          setOnlineMatchId(ticket.matchId);
          setActiveMode('online');
        }
      });
    } catch (err) {
      console.error('Quick play queue error:', err);
      setIsQuickPlaySearching(false);
    }
  };

  // Cancel Quick Play
  const handleCancelQuickPlay = async () => {
    if (quickPlayTicketId) {
      await cancelQuickPlayQueue(quickPlayTicketId);
      setQuickPlayTicketId(null);
    }
    if (ticketUnsubRef.current) ticketUnsubRef.current();
    setIsQuickPlaySearching(false);
  };

  // Reset to Lobby
  const handleReturnToLobby = () => {
    setActiveMode('lobby');
    setOfflineState(null);
    setOnlineMatchId(null);
    setOnlinePublicState(null);
    setCurrentRoom(null);
  };

  return (
    <div className="min-h-screen bg-[#0c1410] text-stone-100 flex flex-col items-center justify-between font-sans">
      <main className="w-full flex-1 flex flex-col items-center justify-center p-2 sm:p-4">
        {activeMode === 'lobby' && (
          <LobbyView
            userStats={userProfile}
            isSignedIn={Boolean(auth.currentUser)}
            onGoogleSignIn={handleGoogleSignIn}
            onGoogleSignOut={handleGoogleSignOut}
            onUpdateDisplayName={handleUpdateDisplayName}
            onStartOffline={handleStartOffline}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoomByCode}
            onStartQuickPlay={handleStartQuickPlay}
            onCancelQuickPlay={handleCancelQuickPlay}
            onOpenRules={() => setIsRulesOpen(true)}
            isQuickPlaySearching={isQuickPlaySearching}
            quickPlayTime={quickPlayTimer}
            currentRoom={currentRoom}
            mySeatIndex={mySeatIndex}
            onSwitchSeat={handleSwitchSeat}
            onToggleReady={handleToggleReady}
            onLeaveRoom={handleLeaveRoom}
            onFillBots={handleFillBots}
            onStartRoomGame={handleStartRoomGame}
          />
        )}

        {/* Offline Play Screen */}
        {activeMode === 'offline' && offlineState && (
          <div className="w-full">
            <div className="flex items-center justify-between max-w-4xl mx-auto mb-2 px-1">
              <button
                onClick={handleReturnToLobby}
                className="text-xs font-bold text-stone-400 hover:text-white px-2.5 py-1 rounded-lg bg-stone-900 border border-emerald-950"
              >
                ← Return to Lobby
              </button>
              <span className="text-xs text-emerald-400 font-semibold">
                Offline Mode (Vs Smart AI)
              </span>
            </div>

            <GameTable
              state={offlineState}
              mySeatIndex={offlineHumanSeat}
              myPrivateHand={offlineState.players[offlineHumanSeat].hand}
              isMyTurn={offlineState.currentTurn === offlineHumanSeat && !aiInFlightRef.current}
              onPlayCard={handleOfflinePlayCard}
              statusMessage={offlineState.gameEndReason || undefined}
            />

            {offlineState.phase === 'game_over' && (
              <GameOverModal
                winnerTeam={offlineState.winnerTeam}
                humanTeam={offlineState.players[offlineHumanSeat].team}
                dahleScore={offlineState.dahleScore}
                cardScore={offlineState.cardScore}
                gameEndReason={offlineState.gameEndReason}
                onRematch={() => handleStartOffline(offlineHumanSeat, aiSpeed)}
                onHome={handleReturnToLobby}
              />
            )}
          </div>
        )}

        {/* Online Multiplayer Screen */}
        {activeMode === 'online' && onlinePublicState && (
          <div className="w-full">
            <div className="flex items-center justify-between max-w-4xl mx-auto mb-2 px-1">
              <button
                onClick={handleReturnToLobby}
                className="text-xs font-bold text-stone-400 hover:text-white px-2.5 py-1 rounded-lg bg-stone-900 border border-emerald-950"
              >
                ← Leave Table
              </button>
              <span className="text-xs text-amber-400 font-semibold">
                Live Online Match
              </span>
            </div>

            <GameTable
              state={onlinePublicState}
              mySeatIndex={mySeatIndex}
              myPrivateHand={onlinePrivateHand}
              isMyTurn={onlinePublicState.currentTurn === mySeatIndex}
              onPlayCard={handleOnlinePlayCard}
              statusMessage={onlinePublicState.gameEndReason || undefined}
              isOnlineMultiplayer
            />

            {onlinePublicState.phase === 'game_over' && (
              <GameOverModal
                winnerTeam={onlinePublicState.winnerTeam}
                humanTeam={onlinePublicState.players[mySeatIndex].team}
                dahleScore={onlinePublicState.dahleScore}
                cardScore={onlinePublicState.cardScore}
                gameEndReason={onlinePublicState.gameEndReason}
                onRematch={handleReturnToLobby}
                onHome={handleReturnToLobby}
              />
            )}
          </div>
        )}
      </main>

      {/* Rules Modal */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />

      {/* Offline Status Toast */}
      <OfflineIndicator />
    </div>
  );
}
