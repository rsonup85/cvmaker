/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Dahla Pakad (Dehla Pakad) Pure Core Game Engine
 * Authoritative, deterministic, and shared across Client, Offline AI, and Backend.
 */

export type Suit = 'S' | 'H' | 'D' | 'C';
export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

export interface Card {
  id: string;        // e.g. "S10", "H14"
  suit: Suit;
  rank: Rank;
  isDahla: boolean;  // rank === 10
  isJack: boolean;   // rank === 11
  label: string;     // e.g. "♠10", "♥A"
}

export const SUITS: Suit[] = ['S', 'H', 'D', 'C'];
export const SUIT_EMOJI: Record<Suit, string> = {
  S: '♠',
  H: '♥',
  D: '♦',
  C: '♣'
};

export const SUIT_NAMES: Record<Suit, string> = {
  S: 'Hukum (Spades)',
  H: 'Paan (Hearts)',
  D: 'It (Diamonds)',
  C: 'Chidi (Clubs)'
};

export const RANK_NAMES: Record<number, string> = {
  11: 'J',
  12: 'Q',
  13: 'K',
  14: 'A'
};

export const PLAYER_NAMES = ['A', 'B', 'C', 'D'];
// Seating: Seat 0 & Seat 2 = Team 0 (Team A+C); Seat 1 & Seat 3 = Team 1 (Team B+D)
export const TEAM_ASSIGNMENTS = [0, 1, 0, 1] as const;

export type GamePhase =
  | 'setup'
  | 'find_dealer'
  | 'deal5'
  | 'trump'
  | 'deal_rest'
  | 'play'
  | 'game_over';

export interface TrickPlay {
  player: number; // 0..3
  card: Card;
}

export interface PlayerState {
  index: number;
  name: string;
  team: 0 | 1;
  hand: Card[];
  isHuman: boolean;
  uid?: string;
}

export interface SanitizedPlayerState {
  index: number;
  name: string;
  team: 0 | 1;
  cardCount: number;
  isHuman: boolean;
  hand?: Card[]; // Only populated for the requesting player
  uid?: string;
}

export interface LogEntry {
  id: string;
  text: string;
  category: 'info' | 'highlight' | 'collect' | 'dahla' | 'restart' | 'trump';
  timestamp: number;
}

export interface GameState {
  id: string;
  phase: GamePhase;
  players: PlayerState[];
  dealer: number | null;
  trump: Suit | null;
  currentTurn: number | null;
  leader: number | null;
  ledSuit: Suit | null;
  trick: TrickPlay[];
  tablePile: Card[];
  tableRounds: TrickPlay[][];
  dahlaPending: boolean;
  dahlaWinner: number | null;
  dahlaTriggered: boolean;
  lastWinner: number | null;
  dahleScore: [number, number]; // [Team A Dahle, Team B Dahle]
  cardScore: [number, number];  // [Team A Cards, Team B Cards]
  playerDahle: [number, number, number, number];
  playerCards: [number, number, number, number];
  deckLeft: Card[];
  restartCount: number;
  gameEndReason: string;
  winnerTeam: 0 | 1 | null;
  log: LogEntry[];
  highestPlayed: Record<Suit, number>;
}

export interface PublicGameState extends Omit<GameState, 'players' | 'deckLeft'> {
  players: SanitizedPlayerState[];
  deckLeftCount: number;
}

export function createCard(suit: Suit, rank: Rank): Card {
  const isDahla = rank === 10;
  const isJack = rank === 11;
  const rankStr = RANK_NAMES[rank] || String(rank);
  return {
    id: `${suit}${rank}`,
    suit,
    rank,
    isDahla,
    isJack,
    label: `${SUIT_EMOJI[suit]}${rankStr}`
  };
}

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let r = 2; r <= 14; r++) {
      deck.push(createCard(suit, r as Rank));
    }
  }
  return deck;
}

export function shuffleDeck<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

export function sortHand(hand: Card[]): Card[] {
  const suitOrder: Record<Suit, number> = { S: 0, H: 1, D: 2, C: 3 };
  return [...hand].sort((a, b) => {
    if (a.suit !== b.suit) {
      return suitOrder[a.suit] - suitOrder[b.suit];
    }
    return a.rank - b.rank;
  });
}

export function hasSuit(hand: Card[], suit: Suit | null): boolean {
  if (!suit) return false;
  return hand.some((c) => c.suit === suit);
}

export function lowestOf(hand: Card[], suit: Suit | null): Card | null {
  const filtered = suit ? hand.filter((c) => c.suit === suit) : hand;
  if (!filtered.length) return null;
  return filtered.reduce((best, cur) => (cur.rank < best.rank ? cur : best), filtered[0]);
}

export function highestOf(hand: Card[], suit: Suit | null): Card | null {
  const filtered = suit ? hand.filter((c) => c.suit === suit) : hand;
  if (!filtered.length) return null;
  return filtered.reduce((best, cur) => (cur.rank > best.rank ? cur : best), filtered[0]);
}

/**
 * Calculates current trick winner based on led suit and established trump
 */
export function calculateTrickWinner(trick: TrickPlay[], ledSuit: Suit | null, trump: Suit | null): number | null {
  if (!trick.length) return null;

  const trumps = trump ? trick.filter((t) => t.card.suit === trump) : [];
  if (trumps.length) {
    return trumps.reduce((best, t) => (t.card.rank > best.card.rank ? t : best), trumps[0]).player;
  }

  if (ledSuit) {
    const ledCards = trick.filter((t) => t.card.suit === ledSuit);
    if (ledCards.length) {
      return ledCards.reduce((best, t) => (t.card.rank > best.card.rank ? t : best), ledCards[0]).player;
    }
  }

  return trick[0].player;
}

export function isCardPlayable(card: Card, hand: Card[], ledSuit: Suit | null): boolean {
  if (!ledSuit) return true; // Leader can play any card
  if (hasSuit(hand, ledSuit)) {
    return card.suit === ledSuit; // Must follow suit
  }
  return true; // Void in led suit can play anything
}

export function getLegalMoves(hand: Card[], ledSuit: Suit | null): Card[] {
  return hand.filter((c) => isCardPlayable(c, hand, ledSuit));
}

/**
 * Creates initial clean game state
 */
export function createInitialState(options: {
  humanIndex?: number;
  playerNames?: string[];
  playerUids?: (string | undefined)[];
} = {}): GameState {
  const humanIndex = options.humanIndex ?? 0;
  const names = options.playerNames ?? PLAYER_NAMES;
  const uids = options.playerUids ?? [undefined, undefined, undefined, undefined];

  const players: PlayerState[] = names.map((name, i) => ({
    index: i,
    name,
    team: TEAM_ASSIGNMENTS[i],
    hand: [],
    isHuman: i === humanIndex,
    uid: uids[i]
  }));

  return {
    id: `dp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    phase: 'setup',
    players,
    dealer: null,
    trump: null,
    currentTurn: null,
    leader: null,
    ledSuit: null,
    trick: [],
    tablePile: [],
    tableRounds: [],
    dahlaPending: false,
    dahlaWinner: null,
    dahlaTriggered: false,
    lastWinner: null,
    dahleScore: [0, 0],
    cardScore: [0, 0],
    playerDahle: [0, 0, 0, 0],
    playerCards: [0, 0, 0, 0],
    deckLeft: [],
    restartCount: 0,
    gameEndReason: '',
    winnerTeam: null,
    log: [],
    highestPlayed: { S: 0, H: 0, D: 0, C: 0 }
  };
}

export function appendLog(state: GameState, text: string, category: LogEntry['category'] = 'info'): void {
  const entry: LogEntry = {
    id: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    text,
    category,
    timestamp: Date.now()
  };
  state.log.push(entry);
  if (state.log.length > 120) {
    state.log.splice(0, state.log.length - 120);
  }
}

/**
 * Executes Dealer Search (Pehla Jack - First Jack wins dealer)
 */
export function findDealerDeterministic(deck: Card[]): { dealer: number; dealtCards: { player: number; card: Card }[] } {
  let player = 0;
  const dealtCards: { player: number; card: Card }[] = [];
  for (const card of deck) {
    dealtCards.push({ player, card });
    if (card.isJack) {
      return { dealer: player, dealtCards };
    }
    player = (player + 1) % 4;
  }
  return { dealer: 0, dealtCards };
}

/**
 * Deals first 5 cards to each player starting after the dealer
 */
export function dealFiveCards(state: GameState, customDeck?: Card[]): GameState {
  const newState = JSON.parse(JSON.stringify(state)) as GameState;
  const deck = customDeck ? [...customDeck] : shuffleDeck(createDeck());
  const dealer = newState.dealer ?? 0;
  const start = (dealer + 1) % 4;

  const hands: Card[][] = [[], [], [], []];
  for (let r = 0; r < 5; r++) {
    for (let j = 0; j < 4; j++) {
      const p = (start + j) % 4;
      const card = deck.pop();
      if (card) hands[p].push(card);
    }
  }

  for (let i = 0; i < 4; i++) {
    newState.players[i].hand = sortHand(hands[i]);
  }

  newState.deckLeft = deck;
  newState.phase = 'trump';
  newState.leader = start;
  newState.currentTurn = start;
  newState.trick = [];
  newState.ledSuit = null;
  newState.trump = null;

  appendLog(
    newState,
    `${newState.players[dealer].name} dealt 5 cards each. Play round 1 to discover Trump (Rang).`,
    'highlight'
  );

  return newState;
}

/**
 * Checks if court cards (J, Q, K, A) are present in each player's hand.
 * Traditional rule: If a player receives no court cards in their complete hand, a redeal can occur.
 */
export function hasCourtCard(hand: Card[]): boolean {
  return hand.some((c) => c.rank >= 11 && c.rank <= 14);
}

/**
 * Collects all 13 dealt cards for a given player in the current deal,
 * including cards currently in hand and any card played by this player in earlier rounds of this deal.
 */
export function getPlayerAllDealtCards(state: GameState, playerIndex: number): Card[] {
  const hand = state.players[playerIndex]?.hand || [];
  const playedInRounds = (state.tableRounds || [])
    .flat()
    .filter((tp) => tp.player === playerIndex)
    .map((tp) => tp.card);
  const currentTrickPlayed = (state.trick || [])
    .filter((tp) => tp.player === playerIndex)
    .map((tp) => tp.card);

  return [...hand, ...playedInRounds, ...currentTrickPlayed];
}

/**
 * Checks if any single player holds all 4 Aces (A♠, A♥, A♦, A♣) or all 4 Dahla (10♠, 10♥, 10♦, 10♣).
 * CRITICAL RULE: Checks ONLY that specific player's 13 cards. Does NOT combine cards from partner/team.
 */
export function checkSinglePlayerFourAcesOrFourDahle(state: GameState): {
  shouldRestart: boolean;
  reason?: string;
  playerIndex?: number;
  cardType?: 'aces' | 'dahle';
} {
  for (let i = 0; i < 4; i++) {
    const cards = getPlayerAllDealtCards(state, i);
    const aces = cards.filter((c) => c.rank === 14);
    if (aces.length === 4) {
      return {
        shouldRestart: true,
        reason: `${state.players[i].name} ke paas saare 4 Aces (A♠, A♥, A♦, A♣) hain! Deal cancel.`,
        playerIndex: i,
        cardType: 'aces'
      };
    }
    const dahle = cards.filter((c) => c.isDahla || c.rank === 10);
    if (dahle.length === 4) {
      return {
        shouldRestart: true,
        reason: `${state.players[i].name} ke paas saare 4 Dahla (10♠, 10♥, 10♦, 10♣) hain! Deal cancel.`,
        playerIndex: i,
        cardType: 'dahle'
      };
    }
  }
  return { shouldRestart: false };
}

/**
 * Cancels current deal and restarts game from the very beginning:
 * New shuffled deck -> new dealer selection (first Jack) -> initial 5 cards deal -> trump phase.
 */
export function restartFullGame(state: GameState, reason: string): GameState {
  const deck = shuffleDeck(createDeck());
  const { dealer } = findDealerDeterministic(deck);

  const humanIndex = state.players.findIndex((p) => p.isHuman);
  const freshState = createInitialState({
    humanIndex: humanIndex >= 0 ? humanIndex : 0,
    playerNames: state.players.map((p) => p.name),
    playerUids: state.players.map((p) => p.uid)
  });

  freshState.id = state.id;
  freshState.dealer = dealer;
  freshState.restartCount = (state.restartCount || 0) + 1;
  freshState.log = [...state.log];

  appendLog(
    freshState,
    `*** RESTART #${freshState.restartCount} — ${reason}`,
    'restart'
  );
  appendLog(
    freshState,
    `Deal cancel ho gayi. Naya dealer: ${freshState.players[dealer].name}. Shuruati 5-5 cards baant rahe hain.`,
    'highlight'
  );

  return dealFiveCards(freshState, deck);
}

/**
 * Deals the remaining 32 cards (4x2 = 8 cards each, 13 total)
 */
export function dealRemainingCards(state: GameState): GameState {
  const newState = JSON.parse(JSON.stringify(state)) as GameState;
  const deck = shuffleDeck([...newState.deckLeft]);
  const start = newState.leader ?? (newState.dealer !== null ? (newState.dealer + 1) % 4 : 0);

  const hands = newState.players.map((p) => [...p.hand]);
  let idx = 0;
  for (let packet = 0; packet < 2; packet++) {
    for (let j = 0; j < 4; j++) {
      const p = (start + j) % 4;
      hands[p].push(...deck.slice(idx, idx + 4));
      idx += 4;
    }
  }

  for (let i = 0; i < 4; i++) {
    newState.players[i].hand = sortHand(hands[i]);
  }
  newState.deckLeft = [];

  // 1. Mandatory Check: 4 Aces or 4 Dahla in any single player's 13 cards
  const fourCheck = checkSinglePlayerFourAcesOrFourDahle(newState);
  if (fourCheck.shouldRestart && fourCheck.reason) {
    return restartFullGame(newState, fourCheck.reason);
  }

  // 2. Court card check: If any hand has zero court cards (no J, Q, K, A)
  const anyPlayerLacksCourt = newState.players.some((p) => !hasCourtCard(p.hand));
  if (anyPlayerLacksCourt) {
    const reason = 'Kisi ke paas court card (J, Q, K, A) nahi hai!';
    return restartFullGame(newState, reason);
  }

  newState.phase = 'play';
  newState.trick = [];
  newState.ledSuit = null;
  newState.currentTurn = newState.leader;

  appendLog(newState, 'Remaining cards dealt (13 cards each). Let the battle begin!', 'highlight');
  return newState;
}

/**
 * Collects the table pile for a player and checks for 4-Dahle instant win
 */
function collectTablePile(state: GameState, winner: number, reason: string): void {
  const pile = [...state.tablePile];
  const count = pile.length;
  let dahleCount = 0;
  for (const c of pile) {
    if (c.isDahla) dahleCount++;
  }

  state.playerCards[winner] += count;
  state.playerDahle[winner] += dahleCount;

  const team = state.players[winner].team;
  state.cardScore[team] += count;
  state.dahleScore[team] += dahleCount;

  state.tablePile = [];
  state.tableRounds = [];

  appendLog(
    state,
    `${state.players[winner].name} (Team ${team === 0 ? 'A' : 'B'}) collected ${count} cards (${dahleCount} Dahle) — ${reason}`,
    'collect'
  );

  // 4 Dahle instant win rule (Kotha)
  if (state.dahleScore[0] === 4 || state.dahleScore[1] === 4) {
    const winningTeam = (state.dahleScore[0] === 4 ? 0 : 1) as 0 | 1;
    state.phase = 'game_over';
    state.winnerTeam = winningTeam;
    state.gameEndReason = `Team ${winningTeam === 0 ? 'A' : 'B'} captured ALL 4 DAHLE! Instant Kotha Victory!`;
    appendLog(state, `🏆 KOTHA! Team ${winningTeam === 0 ? 'A' : 'B'} captured ALL 4 DAHLE! GAME OVER!`, 'highlight');
  }
}

/**
 * Resolves an active 4-card trick
 */
export function resolveTrick(state: GameState): GameState {
  const newState = JSON.parse(JSON.stringify(state)) as GameState;
  const tr = [...newState.trick];
  if (tr.length !== 4) return newState;

  const winner = calculateTrickWinner(tr, newState.ledSuit, newState.trump) ?? 0;
  const hasDahlaInTrick = tr.some((t) => t.card.isDahla);

  // Track high cards
  for (const t of tr) {
    if (t.card.rank > newState.highestPlayed[t.card.suit]) {
      newState.highestPlayed[t.card.suit] = t.card.rank;
    }
  }

  // Push to table pile
  newState.tablePile.push(...tr.map((t) => t.card));
  newState.tableRounds.push(tr);

  appendLog(newState, `${newState.players[winner].name} won the trick.`, 'info');

  if (newState.dahlaTriggered) {
    // A Dahla has already been collected earlier in the match.
    // Standard rule: 2 consecutive trick wins collects whatever is in the pile.
    if (newState.lastWinner === winner) {
      collectTablePile(newState, winner, '2 consecutive trick wins');
      if (newState.phase !== 'game_over') {
        newState.lastWinner = null;
        newState.dahlaPending = false;
        newState.dahlaWinner = null;
      }
    } else {
      newState.lastWinner = winner;
      appendLog(newState, `Table pile: ${newState.tablePile.length} cards. ${newState.players[winner].name} must win the next trick to collect.`, 'info');
    }
  } else {
    // Dahla has not yet been collected
    if (hasDahlaInTrick) {
      if (newState.dahlaPending && winner === newState.dahlaWinner) {
        // Winner won 2 consecutive tricks while holding Dahla pending!
        collectTablePile(newState, winner, '2 consecutive trick wins with Dahla');
        if (newState.phase !== 'game_over') {
          newState.dahlaTriggered = true;
          newState.dahlaPending = false;
          newState.dahlaWinner = null;
          newState.lastWinner = null;
        }
      } else {
        newState.dahlaPending = true;
        newState.dahlaWinner = winner;
        appendLog(
          newState,
          `🔥 DAHLA (10) in pile! ${newState.players[winner].name} won trick but CANNOT collect yet. Must win next trick!`,
          'dahla'
        );
      }
    } else if (newState.dahlaPending) {
      if (winner === newState.dahlaWinner) {
        collectTablePile(newState, winner, '2 consecutive trick wins');
        if (newState.phase !== 'game_over') {
          newState.dahlaTriggered = true;
          newState.dahlaPending = false;
          newState.dahlaWinner = null;
          newState.lastWinner = null;
        }
      } else {
        newState.dahlaWinner = winner;
        appendLog(
          newState,
          `Pending Dahla transferred! ${newState.players[winner].name} won and must win next trick to collect.`,
          'dahla'
        );
      }
    } else {
      appendLog(newState, `Table pile: ${newState.tablePile.length} cards accumulating (no Dahla yet).`, 'info');
    }
  }

  // Clear active trick
  newState.trick = [];
  newState.ledSuit = null;
  newState.leader = winner;
  newState.currentTurn = winner;

  // Check if hand empty (end of 13 rounds: all 52 cards played)
  const totalCardsInPlay =
    newState.cardScore[0] +
    newState.cardScore[1] +
    newState.tablePile.length +
    newState.players.reduce((sum, p) => sum + p.hand.length, 0);

  const isHandEmpty =
    totalCardsInPlay >= 52 &&
    newState.players.every((p) => p.hand.length === 0);

  if (isHandEmpty && newState.phase !== 'game_over') {
    // Collect leftover table pile to last trick winner
    if (newState.tablePile.length > 0) {
      collectTablePile(newState, winner, 'Final trick winner collects leftover pile');
    }
    newState.phase = 'game_over';

    // Determine winner team
    if (newState.dahleScore[0] > newState.dahleScore[1]) {
      newState.winnerTeam = 0;
      newState.gameEndReason = `Team A won by Dahle (${newState.dahleScore[0]} vs ${newState.dahleScore[1]})!`;
    } else if (newState.dahleScore[1] > newState.dahleScore[0]) {
      newState.winnerTeam = 1;
      newState.gameEndReason = `Team B won by Dahle (${newState.dahleScore[1]} vs ${newState.dahleScore[0]})!`;
    } else {
      // Tied on Dahle -> check total cards
      if (newState.cardScore[0] > newState.cardScore[1]) {
        newState.winnerTeam = 0;
        newState.gameEndReason = `Tied on Dahle (2-2). Team A won by card count (${newState.cardScore[0]} vs ${newState.cardScore[1]})!`;
      } else if (newState.cardScore[1] > newState.cardScore[0]) {
        newState.winnerTeam = 1;
        newState.gameEndReason = `Tied on Dahle (2-2). Team B won by card count (${newState.cardScore[1]} vs ${newState.cardScore[0]})!`;
      } else {
        newState.winnerTeam = null; // Tie
        newState.gameEndReason = 'Match ended in a dead draw (2 Dahle and 26 cards each)!';
      }
    }
    appendLog(newState, `GAME OVER — ${newState.gameEndReason}`, 'highlight');
  }

  return newState;
}

/**
 * Handles trump trick completion when phase === 'trump'
 */
export function finishTrumpPhaseTrick(state: GameState): GameState {
  const newState = JSON.parse(JSON.stringify(state)) as GameState;
  const tr = [...newState.trick];
  if (tr.length !== 4) return newState;

  const firstSuit = tr[0].card.suit;
  let trumpFound: Suit | null = newState.trump;
  let breakerPlayer: number | null = null;

  for (let i = 1; i < tr.length; i++) {
    if (tr[i].card.suit !== firstSuit) {
      trumpFound = tr[i].card.suit;
      breakerPlayer = tr[i].player;
      break;
    }
  }

  // Push to table
  newState.tablePile.push(...tr.map((t) => t.card));
  newState.tableRounds.push(tr);

  // High card tracking
  for (const t of tr) {
    if (t.card.rank > newState.highestPlayed[t.card.suit]) {
      newState.highestPlayed[t.card.suit] = t.card.rank;
    }
  }

  const hasDahla = tr.some((t) => t.card.isDahla);

  if (trumpFound) {
    newState.trump = trumpFound;
    newState.leader = breakerPlayer;
    newState.currentTurn = breakerPlayer;
    appendLog(
      newState,
      `TRUMP ESTABLISHED: ${SUIT_EMOJI[trumpFound]} ${SUIT_NAMES[trumpFound]}!`,
      'trump'
    );

    if (hasDahla) {
      const winner = calculateTrickWinner(tr, firstSuit, trumpFound) ?? 0;
      newState.dahlaPending = true;
      newState.dahlaWinner = winner;
      appendLog(newState, `Dahla in trump round! ${newState.players[winner].name} has pending win.`, 'dahla');
    }

    newState.trick = [];
    newState.ledSuit = null;
    newState.phase = 'deal_rest';
    return dealRemainingCards(newState);
  } else {
    // Nobody broke suit: highest of first suit leads next 5-card trick
    const highestPlay = tr.reduce((best, t) => (t.card.rank > best.card.rank ? t : best), tr[0]);
    newState.leader = highestPlay.player;
    newState.currentTurn = highestPlay.player;
    newState.trick = [];
    newState.ledSuit = null;
    appendLog(newState, `Suit was not broken. ${newState.players[highestPlay.player].name} leads next trump trick.`, 'info');
    return newState;
  }
}

/**
 * Validates and executes playing a card
 */
export function playCard(state: GameState, playerIndex: number, cardId: string): GameState {
  if (state.phase !== 'trump' && state.phase !== 'play') {
    throw new Error(`Cannot play card in phase: ${state.phase}`);
  }
  if (state.currentTurn !== playerIndex) {
    throw new Error(`Not player ${playerIndex}'s turn. Current turn: ${state.currentTurn}`);
  }

  const player = state.players[playerIndex];
  const card = player.hand.find((c) => c.id === cardId);
  if (!card) {
    throw new Error(`Player ${playerIndex} does not have card ${cardId}`);
  }

  const isLeading = state.trick.length === 0;
  if (!isLeading && !isCardPlayable(card, player.hand, state.ledSuit)) {
    throw new Error(`Must follow suit ${state.ledSuit}`);
  }

  const newState = JSON.parse(JSON.stringify(state)) as GameState;
  const p = newState.players[playerIndex];
  p.hand = p.hand.filter((c) => c.id !== cardId);

  const trickPlay: TrickPlay = { player: playerIndex, card };
  newState.trick.push(trickPlay);

  if (isLeading) {
    newState.ledSuit = card.suit;
  }

  // Trump break detection during trump phase
  if (newState.phase === 'trump' && !isLeading && card.suit !== newState.ledSuit && !newState.trump) {
    newState.trump = card.suit;
    appendLog(
      newState,
      `${p.name} broke suit! TRUMP = ${SUIT_EMOJI[card.suit]} ${SUIT_NAMES[card.suit]}`,
      'trump'
    );
  }

  appendLog(newState, `${p.name} played ${card.label}`, 'info');

  if (newState.trick.length === 4) {
    if (newState.phase === 'trump') {
      return finishTrumpPhaseTrick(newState);
    } else {
      return resolveTrick(newState);
    }
  } else {
    newState.currentTurn = (playerIndex + 1) % 4;
  }

  return newState;
}

/**
 * AI Strategy Engine (Smart partner coordination and Dahla defense)
 */
export function chooseAiCard(state: GameState, playerIndex: number): Card {
  const player = state.players[playerIndex];
  const hand = player.hand;
  const led = state.ledSuit;
  const trump = state.trump;
  const trick = state.trick;
  const myTeam = player.team;

  const legalMoves = getLegalMoves(hand, led);
  if (legalMoves.length === 1) {
    return legalMoves[0];
  }

  // If Leading
  if (trick.length === 0) {
    // If we have a pending win on our team, lead a strong card or trump to secure consecutive win!
    const pendingTeam =
      state.dahlaPending && state.dahlaWinner !== null
        ? state.players[state.dahlaWinner].team
        : state.dahlaTriggered && state.lastWinner !== null
        ? state.players[state.lastWinner].team
        : null;

    if (pendingTeam === myTeam) {
      // Try to win! Lead highest safe card or highest trump
      if (hasSuit(hand, trump)) {
        const trumps = hand.filter((c) => c.suit === trump);
        return highestOf(trumps, null) || trumps[0];
      }
      return highestOf(hand, null) || hand[0];
    }

    // Lead lowest card to protect court cards and Dahla
    const nonDahla = hand.filter((c) => !c.isDahla);
    return lowestOf(nonDahla.length ? nonDahla : hand, null) || hand[0];
  }

  const currentWinPlayer = calculateTrickWinner(trick, led, trump);
  const isPartnerWinning = currentWinPlayer !== null && state.players[currentWinPlayer].team === myTeam;

  // Partner is winning the trick
  if (isPartnerWinning) {
    if (hasSuit(hand, led)) {
      // Must follow suit: play lowest card; avoid discarding Dahla unless unavoidable
      const ledCards = hand.filter((c) => c.suit === led);
      const nonDahla = ledCards.filter((c) => !c.isDahla);
      return lowestOf(nonDahla.length ? nonDahla : ledCards, null) || ledCards[0];
    }

    // Void in led suit: partner is winning, don't waste trump! Dump lowest off-suit non-dahla
    const nonTrump = hand.filter((c) => c.suit !== trump && !c.isDahla);
    if (nonTrump.length) return lowestOf(nonTrump, null) || nonTrump[0];

    const anyNonTrump = hand.filter((c) => c.suit !== trump);
    if (anyNonTrump.length) return lowestOf(anyNonTrump, null) || anyNonTrump[0];

    return lowestOf(hand, null) || hand[0];
  }

  // Opponent is winning the trick -> try to take it, especially if Dahla is at stake!
  if (hasSuit(hand, led)) {
    const ledCards = hand.filter((c) => c.suit === led);
    const winPlay = trick.find((t) => t.player === currentWinPlayer);
    const winRank = winPlay && winPlay.card.suit === led ? winPlay.card.rank : 0;

    const beaters = ledCards.filter((c) => c.rank > winRank);
    if (beaters.length) {
      // Beat with lowest possible winning card
      const nonDahlaBeaters = beaters.filter((c) => !c.isDahla);
      if (nonDahlaBeaters.length) {
        return lowestOf(nonDahlaBeaters, null) || nonDahlaBeaters[0];
      }
      return lowestOf(beaters, null) || beaters[0];
    }

    // Cannot beat: discard lowest card, save Dahla
    const nonDahla = ledCards.filter((c) => !c.isDahla);
    return lowestOf(nonDahla.length ? nonDahla : ledCards, null) || ledCards[0];
  }

  // Void in led suit: Opponent winning -> TRUMP it!
  if (hasSuit(hand, trump)) {
    const trumps = hand.filter((c) => c.suit === trump);
    const winPlay = trick.find((t) => t.player === currentWinPlayer);
    const isTrumpedAlready = winPlay && winPlay.card.suit === trump;

    if (isTrumpedAlready) {
      const overTrumps = trumps.filter((c) => c.rank > winPlay.card.rank);
      if (overTrumps.length) {
        return lowestOf(overTrumps, null) || overTrumps[0];
      }
    } else {
      // Play lowest trump to capture
      const nonDahlaTrump = trumps.filter((c) => !c.isDahla);
      return lowestOf(nonDahlaTrump.length ? nonDahlaTrump : trumps, null) || trumps[0];
    }
  }

  // Cannot trump: dump lowest non-dahla card
  const nonDahla = hand.filter((c) => !c.isDahla);
  return lowestOf(nonDahla.length ? nonDahla : hand, null) || hand[0];
}

/**
 * Sanitizes GameState for client delivery so no player can view other players' hidden cards
 */
export function sanitizeStateForPlayer(state: GameState, playerIndex: number): PublicGameState {
  const sanitizedPlayers: SanitizedPlayerState[] = state.players.map((p, idx) => ({
    index: p.index,
    name: p.name,
    team: p.team,
    cardCount: p.hand.length,
    isHuman: p.isHuman,
    uid: p.uid,
    hand: idx === playerIndex ? [...p.hand] : undefined
  }));

  const { players: _players, deckLeft, ...rest } = state;
  return {
    ...rest,
    players: sanitizedPlayers,
    deckLeftCount: deckLeft.length
  };
}
