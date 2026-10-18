/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  runTransaction,
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType, loginWithGoogle } from '../firebase/config';
import {
  GameState,
  PublicGameState,
  Card,
  createInitialState,
  dealFiveCards,
  playCard,
  chooseAiCard,
  sanitizeStateForPlayer,
  TEAM_ASSIGNMENTS,
  createDeck,
  findDealerDeterministic,
  shuffleDeck
} from '../game/engine';

export interface RoomSeat {
  seatIndex: number;
  uid: string;
  displayName: string;
  avatar: string;
  team: 0 | 1;
  isReady: boolean;
  isHost: boolean;
  isBot?: boolean;
  connected: boolean;
}

export interface RoomData {
  id: string;
  code: string;
  hostId: string;
  hostName: string;
  status: 'waiting' | 'in_game' | 'finished' | 'abandoned';
  seats: (RoomSeat | null)[];
  matchId?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface QuickPlayTicket {
  id: string;
  uid: string;
  displayName: string;
  avatar: string;
  status: 'waiting' | 'matched' | 'cancelled';
  matchId?: string;
  roomId?: string;
  seat?: number;
  createdAt?: unknown;
}

export interface UserStats {
  uid: string;
  displayName: string;
  avatar: string;
  gamesPlayed: number;
  gamesWon: number;
  dahleCaptured: number;
  email?: string;
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Ensures user is authenticated before multiplayer operations
 */
export async function ensureOnlineUser(): Promise<User> {
  if (auth.currentUser) return auth.currentUser;
  try {
    return await loginWithGoogle();
  } catch (err) {
    throw new Error('Google Sign-In is required for online multiplayer. Please sign in with Google to continue.');
  }
}

/**
 * Get or create User Profile safely
 */
export async function getOrCreateUserProfile(uid?: string, defaultName?: string, avatar?: string): Promise<UserStats> {
  const currentUid = auth.currentUser?.uid || uid;
  if (!currentUid || !auth.currentUser) {
    // Return local profile for unauthenticated offline play without querying Firestore
    return {
      uid: 'guest_local',
      displayName: defaultName || 'Player',
      avatar: avatar || '♠',
      gamesPlayed: 0,
      gamesWon: 0,
      dahleCaptured: 0,
    };
  }
  const path = `users/${currentUid}`;
  try {
    const docRef = doc(db, 'users', currentUid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserStats;
    }

    const newProfile: UserStats = {
      uid: currentUid,
      displayName: defaultName || auth.currentUser.displayName || `Player_${currentUid.slice(0, 4)}`,
      avatar: avatar || '♠',
      gamesPlayed: 0,
      gamesWon: 0,
      dahleCaptured: 0,
      email: auth.currentUser.email || undefined,
    };
    await setDoc(docRef, {
      ...newProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return newProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function updateUserStats(uid: string, won: boolean, dahle: number): Promise<void> {
  if (!auth.currentUser) return;
  const path = `users/${uid}`;
  try {
    const docRef = doc(db, 'users', uid);
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(docRef);
      if (!snap.exists()) return;
      const data = snap.data() as UserStats;
      tx.update(docRef, {
        gamesPlayed: (data.gamesPlayed || 0) + 1,
        gamesWon: won ? (data.gamesWon || 0) + 1 : (data.gamesWon || 0),
        dahleCaptured: (data.dahleCaptured || 0) + dahle,
        updatedAt: serverTimestamp(),
      });
    });
  } catch (err) {
    console.error('Failed to update stats:', err);
  }
}

/**
 * Creates a new private room
 */
export async function createPrivateRoom(hostName: string, avatar: string): Promise<RoomData> {
  const user = await ensureOnlineUser();
  const uid = user.uid;

  const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const code = generateRoomCode();
  const path = `rooms/${roomId}`;

  const hostSeat: RoomSeat = {
    seatIndex: 0,
    uid,
    displayName: hostName || user.displayName || 'Host',
    avatar,
    team: 0, // Team A
    isReady: true,
    isHost: true,
    connected: true,
  };

  const roomData: RoomData = {
    id: roomId,
    code,
    hostId: uid,
    hostName,
    status: 'waiting',
    seats: [hostSeat, null, null, null],
  };

  try {
    await setDoc(doc(db, 'rooms', roomId), {
      ...roomData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return roomData;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Finds a room by its 6-character code
 */
export async function findRoomByCode(code: string): Promise<RoomData | null> {
  const path = 'rooms';
  try {
    const q = query(collection(db, 'rooms'), where('code', '==', code.toUpperCase().trim()), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as RoomData;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Joins a room atomically in an available seat
 */
export async function joinRoom(roomId: string, displayName: string, avatar: string, preferredSeat?: number): Promise<number> {
  const user = await ensureOnlineUser();
  const uid = user.uid;

  const path = `rooms/${roomId}`;
  const roomRef = doc(db, 'rooms', roomId);

  try {
    return await runTransaction(db, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) throw new Error('Room does not exist');

      const room = snap.data() as RoomData;
      if (room.status !== 'waiting') throw new Error('Game already started or finished');

      // Check if user is already seated
      const existingSeatIndex = room.seats.findIndex((s) => s && s.uid === uid);
      if (existingSeatIndex !== -1) {
        // Already seated, mark connected
        const updatedSeats = [...room.seats];
        const cur = updatedSeats[existingSeatIndex]!;
        updatedSeats[existingSeatIndex] = { ...cur, connected: true, displayName, avatar };
        tx.update(roomRef, { seats: updatedSeats, updatedAt: serverTimestamp() });
        return existingSeatIndex;
      }

      // Find target seat
      let targetSeat = preferredSeat !== undefined && room.seats[preferredSeat] === null ? preferredSeat : -1;
      if (targetSeat === -1) {
        targetSeat = room.seats.findIndex((s) => s === null);
      }
      if (targetSeat === -1) throw new Error('Room is full (4 players already joined)');

      const newSeat: RoomSeat = {
        seatIndex: targetSeat,
        uid,
        displayName,
        avatar,
        team: TEAM_ASSIGNMENTS[targetSeat],
        isReady: false,
        isHost: room.hostId === uid,
        connected: true,
      };

      const updatedSeats = [...room.seats];
      updatedSeats[targetSeat] = newSeat;

      tx.update(roomRef, {
        seats: updatedSeats,
        updatedAt: serverTimestamp(),
      });

      return targetSeat;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Switches to a different open seat in the room
 */
export async function switchSeat(roomId: string, fromSeat: number, toSeat: number): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not authenticated');

  const path = `rooms/${roomId}`;
  const roomRef = doc(db, 'rooms', roomId);

  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) throw new Error('Room does not exist');
      const room = snap.data() as RoomData;
      if (room.status !== 'waiting') throw new Error('Game already in progress');

      const currentSeat = room.seats[fromSeat];
      if (!currentSeat || currentSeat.uid !== uid) throw new Error('Invalid seat ownership');
      if (room.seats[toSeat] !== null) throw new Error('Target seat is already occupied');

      const updatedSeats = [...room.seats];
      updatedSeats[fromSeat] = null;
      updatedSeats[toSeat] = {
        ...currentSeat,
        seatIndex: toSeat,
        team: TEAM_ASSIGNMENTS[toSeat],
        isReady: false,
      };

      tx.update(roomRef, {
        seats: updatedSeats,
        updatedAt: serverTimestamp(),
      });
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Toggles ready status for a player
 */
export async function togglePlayerReady(roomId: string, seatIndex: number): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not authenticated');

  const path = `rooms/${roomId}`;
  const roomRef = doc(db, 'rooms', roomId);

  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) return;
      const room = snap.data() as RoomData;
      const seat = room.seats[seatIndex];
      if (!seat || seat.uid !== uid) return;

      const updatedSeats = [...room.seats];
      updatedSeats[seatIndex] = { ...seat, isReady: !seat.isReady };
      tx.update(roomRef, { seats: updatedSeats, updatedAt: serverTimestamp() });
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Leaves a room
 */
export async function leaveRoom(roomId: string, seatIndex: number): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const path = `rooms/${roomId}`;
  const roomRef = doc(db, 'rooms', roomId);

  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) return;
      const room = snap.data() as RoomData;
      const seat = room.seats[seatIndex];
      if (!seat || seat.uid !== uid) return;

      const updatedSeats = [...room.seats];
      updatedSeats[seatIndex] = null;

      // If host left, either assign new host or abandon room
      const remainingPlayers = updatedSeats.filter(Boolean) as RoomSeat[];
      if (remainingPlayers.length === 0) {
        tx.delete(roomRef);
      } else {
        let newHostId = room.hostId;
        let newHostName = room.hostName;
        if (seat.isHost && remainingPlayers.length > 0) {
          remainingPlayers[0].isHost = true;
          newHostId = remainingPlayers[0].uid;
          newHostName = remainingPlayers[0].displayName;
        }
        tx.update(roomRef, {
          seats: updatedSeats,
          hostId: newHostId,
          hostName: newHostName,
          updatedAt: serverTimestamp(),
        });
      }
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Add an AI bot to an empty seat (host feature)
 */
export async function fillSeatWithBot(roomId: string, seatIndex: number): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const path = `rooms/${roomId}`;
  const roomRef = doc(db, 'rooms', roomId);

  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) return;
      const room = snap.data() as RoomData;
      if (room.hostId !== uid) throw new Error('Only host can add AI players');
      if (room.seats[seatIndex] !== null) return;

      const botNames = ['Arjun (AI)', 'Karan (AI)', 'Dev (AI)', 'Suraj (AI)'];
      const botSeat: RoomSeat = {
        seatIndex,
        uid: `bot_${seatIndex}_${Date.now()}`,
        displayName: botNames[seatIndex],
        avatar: '🤖',
        team: TEAM_ASSIGNMENTS[seatIndex],
        isReady: true,
        isHost: false,
        isBot: true,
        connected: true,
      };

      const updatedSeats = [...room.seats];
      updatedSeats[seatIndex] = botSeat;

      tx.update(roomRef, { seats: updatedSeats, updatedAt: serverTimestamp() });
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Starts the multiplayer match from a full room
 */
export async function startMultiplayerMatch(roomId: string): Promise<string> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not authenticated');

  const path = `rooms/${roomId}`;
  const roomRef = doc(db, 'rooms', roomId);
  const snap = await getDoc(roomRef);
  if (!snap.exists()) throw new Error('Room not found');
  const room = snap.data() as RoomData;
  if (room.hostId !== uid) throw new Error('Only host can start the match');

  const players = room.seats.filter(Boolean) as RoomSeat[];
  if (players.length !== 4) throw new Error('Need all 4 seats occupied to start');

  const matchId = `match_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  // Determine dealer via first Jack
  const deck = shuffleDeck(createDeck());
  const { dealer } = findDealerDeterministic(deck);

  // Initialize pure game state
  let gameState = createInitialState({
    playerNames: room.seats.map((s, i) => s?.displayName || `Player ${i}`),
    playerUids: room.seats.map((s) => s?.uid),
  });
  gameState.id = matchId;
  gameState.dealer = dealer;

  // Deal first 5 cards
  gameState = dealFiveCards(gameState);

  // Separate private hands from public state
  const privateHands = gameState.players.map((p) => p.hand);

  // Save public match state
  const publicState = sanitizeStateForPlayer(gameState, -1); // Hide all hands in public state
  const matchPath = `matches/${matchId}`;

  try {
    await setDoc(doc(db, 'matches', matchId), {
      ...publicState,
      roomId,
      mode: 'friends',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Write private hands to subcollections (each protected by security rules)
    for (let i = 0; i < 4; i++) {
      const handDocRef = doc(db, 'matches', matchId, 'hands', String(i));
      await setDoc(handDocRef, {
        matchId,
        playerIndex: i,
        uid: room.seats[i]!.uid,
        cards: privateHands[i],
        updatedAt: serverTimestamp(),
      });
    }

    // Update room status
    await updateDoc(roomRef, {
      status: 'in_game',
      matchId,
      updatedAt: serverTimestamp(),
    });

    return matchId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, matchPath);
  }
}

/**
 * Submits a card move in an online match
 */
export async function submitOnlineMove(
  matchId: string,
  playerIndex: number,
  cardId: string,
  currentPublicState: PublicGameState,
  playerPrivateHand: Card[]
): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not authenticated');

  const matchRef = doc(db, 'matches', matchId);
  const handRef = doc(db, 'matches', matchId, 'hands', String(playerIndex));

  // Reconstruct local state with this player's hand for move calculation
  const reconstructedState: GameState = {
    ...currentPublicState,
    players: currentPublicState.players.map((p, idx) => ({
      index: p.index,
      name: p.name,
      team: p.team,
      hand: idx === playerIndex ? [...playerPrivateHand] : [],
      isHuman: p.isHuman,
      uid: p.uid,
    })),
    deckLeft: [],
  };

  // Execute transition in engine
  const nextState = playCard(reconstructedState, playerIndex, cardId);
  const nextPublicState = sanitizeStateForPlayer(nextState, -1);
  const updatedPrivateHand = playerPrivateHand.filter((c) => c.id !== cardId);

  const path = `matches/${matchId}`;
  try {
    await setDoc(matchRef, {
      ...nextPublicState,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    await setDoc(handRef, {
      matchId,
      playerIndex,
      uid,
      cards: updatedPrivateHand,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Quick Play Matchmaking Queue
 */
export async function joinQuickPlayQueue(displayName: string, avatar: string): Promise<string> {
  const user = await ensureOnlineUser();
  const uid = user.uid;

  const ticketId = `ticket_${uid}`;
  const path = `matchmakingQueue/${ticketId}`;
  const ticketRef = doc(db, 'matchmakingQueue', ticketId);

  try {
    await setDoc(ticketRef, {
      id: ticketId,
      uid,
      displayName,
      avatar,
      status: 'waiting',
      createdAt: serverTimestamp(),
    });

    // Attempt to match 4 players
    await tryMatchmakingBatch();

    return ticketId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function cancelQuickPlayQueue(ticketId: string): Promise<void> {
  const path = `matchmakingQueue/${ticketId}`;
  try {
    await deleteDoc(doc(db, 'matchmakingQueue', ticketId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Atomic batch matchmaking checking for 4 waiting players
 */
export async function tryMatchmakingBatch(): Promise<boolean> {
  const path = 'matchmakingQueue';
  try {
    const q = query(collection(db, 'matchmakingQueue'), where('status', '==', 'waiting'), orderBy('createdAt', 'asc'), limit(4));
    const snap = await getDocs(q);

    if (snap.docs.length < 4) {
      return false; // Not enough players yet
    }

    const tickets = snap.docs.map((d) => d.data() as QuickPlayTicket);
    const roomId = `room_qp_${Date.now()}`;
    const matchId = `match_qp_${Date.now()}`;

    // Atomically create room and assign tickets
    await runTransaction(db, async (tx) => {
      // Re-verify tickets are still waiting
      for (const t of tickets) {
        const tRef = doc(db, 'matchmakingQueue', t.id);
        const tSnap = await tx.get(tRef);
        if (!tSnap.exists() || tSnap.data()?.status !== 'waiting') {
          return; // Race condition: a player cancelled or already matched
        }
      }

      const seats: RoomSeat[] = tickets.map((t, idx) => ({
        seatIndex: idx,
        uid: t.uid,
        displayName: t.displayName,
        avatar: t.avatar,
        team: TEAM_ASSIGNMENTS[idx],
        isReady: true,
        isHost: idx === 0,
        connected: true,
      }));

      // Create room
      const roomRef = doc(db, 'rooms', roomId);
      tx.set(roomRef, {
        id: roomId,
        code: generateRoomCode(),
        hostId: tickets[0].uid,
        hostName: tickets[0].displayName,
        status: 'in_game',
        matchId,
        seats,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Update tickets to matched
      tickets.forEach((t, idx) => {
        const tRef = doc(db, 'matchmakingQueue', t.id);
        tx.update(tRef, {
          status: 'matched',
          roomId,
          matchId,
          seat: idx,
        });
      });
    });

    return true;
  } catch (error) {
    console.error('Matchmaking batch error:', error);
    return false;
  }
}

/**
 * Real-time room listener
 */
export function subscribeToRoom(roomId: string, callback: (room: RoomData | null) => void): () => void {
  const path = `rooms/${roomId}`;
  return onSnapshot(
    doc(db, 'rooms', roomId),
    (snap) => {
      if (!snap.exists()) {
        callback(null);
      } else {
        callback(snap.data() as RoomData);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

/**
 * Real-time public match listener
 */
export function subscribeToMatch(matchId: string, callback: (match: PublicGameState | null) => void): () => void {
  const path = `matches/${matchId}`;
  return onSnapshot(
    doc(db, 'matches', matchId),
    (snap) => {
      if (!snap.exists()) {
        callback(null);
      } else {
        callback(snap.data() as PublicGameState);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

/**
 * Real-time private hand listener
 */
export function subscribeToPrivateHand(matchId: string, seatIndex: number, callback: (cards: Card[]) => void): () => void {
  const path = `matches/${matchId}/hands/${seatIndex}`;
  return onSnapshot(
    doc(db, 'matches', matchId, 'hands', String(seatIndex)),
    (snap) => {
      if (!snap.exists()) {
        callback([]);
      } else {
        const data = snap.data();
        callback(data?.cards || []);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

/**
 * Real-time matchmaking ticket listener
 */
export function subscribeToTicket(ticketId: string, callback: (ticket: QuickPlayTicket | null) => void): () => void {
  const path = `matchmakingQueue/${ticketId}`;
  return onSnapshot(
    doc(db, 'matchmakingQueue', ticketId),
    (snap) => {
      if (!snap.exists()) {
        callback(null);
      } else {
        callback(snap.data() as QuickPlayTicket);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}
