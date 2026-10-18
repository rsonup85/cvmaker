/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createDeck,
  createCard,
  findDealerDeterministic,
  createInitialState,
  dealFiveCards,
  playCard,
  calculateTrickWinner,
  isCardPlayable,
  resolveTrick,
  sanitizeStateForPlayer,
  checkSinglePlayerFourAcesOrFourDahle,
  dealRemainingCards,
  TEAM_ASSIGNMENTS,
  GameState
} from './engine.ts';

test('createDeck creates 52 unique cards with 4 Dahle and 4 Jacks', () => {
  const deck = createDeck();
  assert.equal(deck.length, 52);
  const dahle = deck.filter((c) => c.isDahla);
  assert.equal(dahle.length, 4);
  const jacks = deck.filter((c) => c.isJack);
  assert.equal(jacks.length, 4);
});

test('findDealerDeterministic correctly finds the first Jack', () => {
  // Construct deck where first Jack appears on 3rd card (player 2)
  const deck = [
    createCard('S', 2),  // P0
    createCard('H', 5),  // P1
    createCard('D', 11), // P2 (Jack!)
    createCard('C', 9)
  ];
  const result = findDealerDeterministic(deck);
  assert.equal(result.dealer, 2);
  assert.equal(result.dealtCards.length, 3);
});

test('dealFiveCards sets phase to trump and gives 5 cards to each player', () => {
  const initial = createInitialState();
  initial.dealer = 1;
  const state = dealFiveCards(initial);

  assert.equal(state.phase, 'trump');
  assert.equal(state.leader, 2); // (dealer 1 + 1) % 4 = 2
  assert.equal(state.currentTurn, 2);
  for (let i = 0; i < 4; i++) {
    assert.equal(state.players[i].hand.length, 5);
  }
  assert.equal(state.deckLeft.length, 32);
});

test('follow-suit rule rejects illegal plays when suit is available', () => {
  const hand = [createCard('S', 5), createCard('H', 10), createCard('C', 14)];
  assert.equal(isCardPlayable(createCard('H', 10), hand, 'S'), false);
  assert.equal(isCardPlayable(createCard('S', 5), hand, 'S'), true);

  // If void in led suit, any card is playable
  const voidHand = [createCard('H', 10), createCard('C', 14)];
  assert.equal(isCardPlayable(createCard('H', 10), voidHand, 'S'), true);
});

test('calculateTrickWinner respects trump and highest led card', () => {
  const trickWithoutTrump = [
    { player: 0, card: createCard('H', 7) },
    { player: 1, card: createCard('H', 12) }, // Queen of Hearts
    { player: 2, card: createCard('H', 4) },
    { player: 3, card: createCard('H', 9) }
  ];
  assert.equal(calculateTrickWinner(trickWithoutTrump, 'H', null), 1);

  const trickWithTrump = [
    { player: 0, card: createCard('H', 14) }, // Ace of Hearts (led)
    { player: 1, card: createCard('H', 12) },
    { player: 2, card: createCard('S', 2) },  // 2 of Spades (Trump!)
    { player: 3, card: createCard('S', 8) }   // 8 of Spades (Higher Trump!)
  ];
  assert.equal(calculateTrickWinner(trickWithTrump, 'H', 'S'), 3);
});

test('Dahla in trick triggers dahlaPending and 2 consecutive wins collects pile', () => {
  let state = createInitialState();
  state.phase = 'play';
  state.currentTurn = 0;
  state.leader = 0;
  state.trump = 'S';

  // Setup trick containing a Dahla (H10)
  state.trick = [
    { player: 0, card: createCard('H', 10) }, // Dahla
    { player: 1, card: createCard('H', 4) },
    { player: 2, card: createCard('H', 8) },
    { player: 3, card: createCard('H', 14) }  // Ace of Hearts wins trick 1
  ];
  state.ledSuit = 'H';

  state = resolveTrick(state);
  assert.equal(state.dahlaPending, true);
  assert.equal(state.dahlaWinner, 3);
  assert.equal(state.tablePile.length, 4);

  // Trick 2: Player 3 wins again (consecutive win!)
  state.trick = [
    { player: 3, card: createCard('C', 14) }, // Ace of Clubs
    { player: 0, card: createCard('C', 2) },
    { player: 1, card: createCard('C', 5) },
    { player: 2, card: createCard('C', 9) }
  ];
  state.ledSuit = 'C';

  state = resolveTrick(state);
  assert.equal(state.dahlaTriggered, true);
  assert.equal(state.tablePile.length, 0); // Pile collected!
  assert.equal(state.playerCards[3], 8);    // 8 cards collected
  assert.equal(state.playerDahle[3], 1);    // 1 Dahla collected
  assert.equal(state.dahleScore[TEAM_ASSIGNMENTS[3]], 1);
});

test('instant 4-Dahle victory triggers game_over immediately', () => {
  let state = createInitialState();
  state.phase = 'play';
  state.dahleScore = [3, 0]; // Team A has 3 Dahle
  state.dahlaTriggered = true;
  state.lastWinner = 0; // Player 0 won trick 1

  // Player 0 (Team A) wins trick 2 with 4th Dahle in pile
  state.tablePile = [createCard('D', 10)]; // 4th Dahle
  state.trick = [
    { player: 0, card: createCard('S', 14) },
    { player: 1, card: createCard('S', 2) },
    { player: 2, card: createCard('S', 5) },
    { player: 3, card: createCard('S', 8) }
  ];
  state.ledSuit = 'S';

  state = resolveTrick(state);
  assert.equal(state.phase, 'game_over');
  assert.equal(state.winnerTeam, 0);
  assert.equal(state.dahleScore[0], 4);
});

test('sanitizeStateForPlayer conceals other players hands', () => {
  const state = createInitialState();
  state.players[0].hand = [createCard('S', 10), createCard('H', 14)];
  state.players[1].hand = [createCard('C', 2), createCard('D', 3)];

  const sanitized = sanitizeStateForPlayer(state, 0);
  assert.equal(sanitized.players[0].hand?.length, 2);
  assert.equal(sanitized.players[1].hand, undefined); // Hidden!
  assert.equal(sanitized.players[1].cardCount, 2);     // Count visible
});

test('single player holding all 4 Aces triggers game restart and deal cancellation', () => {
  const state = createInitialState();
  state.phase = 'deal_rest';
  state.dealer = 0;
  state.leader = 1;
  // Player 1 has all 4 Aces (S14, H14, D14, C14)
  state.players[1].hand = [
    createCard('S', 14),
    createCard('H', 14),
    createCard('D', 14),
    createCard('C', 14),
    createCard('S', 2),
    createCard('S', 3),
    createCard('S', 4),
    createCard('S', 5),
    createCard('S', 6),
    createCard('S', 7),
    createCard('S', 8),
    createCard('S', 9),
    createCard('H', 2)
  ];

  const check = checkSinglePlayerFourAcesOrFourDahle(state);
  assert.equal(check.shouldRestart, true);
  assert.equal(check.playerIndex, 1);
  assert.equal(check.cardType, 'aces');
  assert.match(check.reason || '', /Aces/);

  // When dealRemainingCards runs with this state, it cancels the deal and restarts from 5 cards deal
  state.deckLeft = [];
  const restarted = dealRemainingCards(state);
  assert.equal(restarted.phase, 'trump');
  assert.equal(restarted.restartCount, 1);
  assert.equal(restarted.players[0].hand.length, 5);
  assert.equal(restarted.players[1].hand.length, 5);
  assert.notEqual(restarted.dealer, null);
});

test('single player holding all 4 Dahla triggers game restart and deal cancellation', () => {
  const state = createInitialState();
  state.phase = 'deal_rest';
  state.dealer = 0;
  state.leader = 1;
  // Player 2 has all 4 Dahlas (S10, H10, D10, C10)
  state.players[2].hand = [
    createCard('S', 10),
    createCard('H', 10),
    createCard('D', 10),
    createCard('C', 10),
    createCard('H', 14), // Court card present so court check passes
    createCard('S', 2),
    createCard('S', 3),
    createCard('S', 4),
    createCard('S', 5),
    createCard('S', 6),
    createCard('S', 7),
    createCard('S', 8),
    createCard('S', 9)
  ];

  const check = checkSinglePlayerFourAcesOrFourDahle(state);
  assert.equal(check.shouldRestart, true);
  assert.equal(check.playerIndex, 2);
  assert.equal(check.cardType, 'dahle');
  assert.match(check.reason || '', /Dahla/);
});

test('team holding 4 Aces split between partners does NOT trigger restart', () => {
  const state = createInitialState();
  state.phase = 'deal_rest';
  // Team A (Seats 0 and 2):
  // Player 0 has 2 Aces: S14, H14
  state.players[0].hand = [
    createCard('S', 14),
    createCard('H', 14),
    createCard('S', 2),
    createCard('S', 3),
    createCard('S', 4)
  ];
  // Partner Player 2 has 2 Aces: D14, C14
  state.players[2].hand = [
    createCard('D', 14),
    createCard('C', 14),
    createCard('H', 2),
    createCard('H', 3),
    createCard('H', 4)
  ];
  // Opponents Player 1 and 3 have 0 Aces
  state.players[1].hand = [createCard('S', 5), createCard('S', 6)];
  state.players[3].hand = [createCard('H', 5), createCard('H', 6)];

  // Team A collectively holds all 4 Aces, but NO single player holds 4 Aces
  const check = checkSinglePlayerFourAcesOrFourDahle(state);
  assert.equal(check.shouldRestart, false);
});

test('team holding 4 Dahle split between partners does NOT trigger restart', () => {
  const state = createInitialState();
  state.phase = 'deal_rest';
  // Team B (Seats 1 and 3):
  // Player 1 has 3 Dahlas: S10, H10, D10
  state.players[1].hand = [
    createCard('S', 10),
    createCard('H', 10),
    createCard('D', 10),
    createCard('S', 2)
  ];
  // Partner Player 3 has 1 Dahla: C10
  state.players[3].hand = [
    createCard('C', 10),
    createCard('H', 2),
    createCard('H', 3)
  ];
  // Team A has 0 Dahlas
  state.players[0].hand = [createCard('S', 5)];
  state.players[2].hand = [createCard('H', 5)];

  // Team B collectively holds all 4 Dahlas, but NO single player has 4 Dahlas
  const check = checkSinglePlayerFourAcesOrFourDahle(state);
  assert.equal(check.shouldRestart, false);
});

test('single player whose 4 Aces include the card played in the trump trick triggers restart', () => {
  const state = createInitialState();
  state.phase = 'deal_rest';
  state.dealer = 0;
  state.leader = 1;

  // Player 1 played A♠ in the trump trick round
  state.tableRounds = [[
    { player: 0, card: createCard('S', 2) },
    { player: 1, card: createCard('S', 14) }, // A♠ played in round 1
    { player: 2, card: createCard('S', 5) },
    { player: 3, card: createCard('S', 8) }
  ]];

  // In Player 1's remaining 12 cards, they hold the other 3 Aces: A♥, A♦, A♣
  state.players[1].hand = [
    createCard('H', 14),
    createCard('D', 14),
    createCard('C', 14),
    createCard('H', 2),
    createCard('H', 3),
    createCard('H', 4),
    createCard('H', 5),
    createCard('H', 6),
    createCard('H', 7),
    createCard('H', 8),
    createCard('H', 9),
    createCard('D', 2)
  ];

  const check = checkSinglePlayerFourAcesOrFourDahle(state);
  assert.equal(check.shouldRestart, true);
  assert.equal(check.playerIndex, 1);
  assert.equal(check.cardType, 'aces');
});
