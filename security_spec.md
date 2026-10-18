# Dahla Pakad Security Specification

## 1. Data Invariants
1. **Private Hand Confidentiality**: A player's private hand `/matches/{matchId}/hands/{playerIndex}` must NEVER be readable by any client other than the authenticated user assigned to that seat (`resource.data.uid == request.auth.uid`).
2. **Room Membership Integrity**: A player cannot claim a seat in `/rooms/{roomId}` without setting their own authenticated `uid`.
3. **Seat Mutex / Double Booking**: Two different users cannot simultaneously occupy the same seat in a room.
4. **Authoritative State Immutability**: Match state updates require authenticated participant membership.
5. **No Spoofing**: Users cannot create or update profile documents where `userId != request.auth.uid`.

## 2. The Dirty Dozen Attack Payloads
1. **Hand Snooping Attack**: Attacker (UID `bob`) tries to `get` `/matches/m1/hands/0` where `resource.data.uid == 'alice'`. Expected: `PERMISSION_DENIED`.
2. **Ghost Room Seating**: User attempts to update a room with an arbitrary 5th seat (`seats[4]`). Expected: `PERMISSION_DENIED`.
3. **Profile Impersonation**: User `attacker123` attempts to write to `/users/victim456`. Expected: `PERMISSION_DENIED`.
4. **Matchmaking Ticket Hijacking**: User `attacker` tries to delete or modify another user's queue ticket. Expected: `PERMISSION_DENIED`.
5. **Score Tampering**: Non-participant writes `winnerTeam: 1` directly to `/matches/m1`. Expected: `PERMISSION_DENIED`.
6. **Room Code Poisoning**: Attacker sends a 500-character junk string as `code`. Expected: `PERMISSION_DENIED`.
7. **Negative Dahle Score**: Payload injecting `{ dahleScore: [-5, 10] }`. Expected: `PERMISSION_DENIED`.
8. **Unauthenticated Read on Hands**: Anonymous unauthenticated client queries `/matches/{matchId}/hands`. Expected: `PERMISSION_DENIED`.
9. **Fake Host Promotion**: Non-host player updates `hostId` to themselves. Expected: `PERMISSION_DENIED`.
10. **Card Duplication Injection**: Player pushes 15 cards into their hand. Expected: `PERMISSION_DENIED`.
11. **State Bypassing**: Jumping directly from `phase: 'setup'` to `phase: 'game_over'` without moves. Expected: `PERMISSION_DENIED`.
12. **Zombie Match Resurrect**: Modifying a match marked `phase: 'game_over'` with terminal state locking. Expected: `PERMISSION_DENIED`.
