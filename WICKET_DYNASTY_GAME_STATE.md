# WICKET DYNASTY – CAREER STATE MACHINE & PERSISTENCE
**Version**: 1.0.0 (Phase 00 Blueprint)  
**Status**: State Lifecycle Approved  
**Author**: Lead Game Architect & Simulation Designer  

---

## 1. Master Career State Flow Diagram

```
       ┌────────────────────────┐
       │      [NEW_CAREER]      │ ── (Career Setup & Rules Config)
       └───────────┬────────────┘
                   │ User picks Franchise & Mode
                   ▼
       ┌────────────────────────┐
       │  [FRANCHISE_SELECTED]  │ ── (Pre-Season Setup, Retentions & RTM)
       └───────────┬────────────┘
                   │ If Auction Mode Selected
                   ▼
       ┌────────────────────────┐
       │       [AUCTION]        │ ── (Live Bidding Room, AI Purchasing)
       └───────────┬────────────┘
                   │ Auction Concluded & Squad Size Validated
                   ▼
       ┌────────────────────────┐
       │   [SQUAD_FINALIZED]    │ ── (Playing XI Set, Cap/WK Assigned)
       └───────────┬────────────┘
                   │ Season Fixtures Generated & Standings Zeroed
                   ▼
  ┌──────────► ┌────────────────────────┐
  │            │    [SEASON_ACTIVE]     │ ◄──────────────────────┐
  │            └───────────┬────────────┘                        │
  │                        │ Tap "Next Match" (Real Fixture)     │
  │                        ▼                                     │
  │            ┌────────────────────────┐                        │
  │            │        [MATCH]         │                        │
  │            │ (Live 2D Sim / HUD)    │                        │
  │            └───────────┬────────────┘                        │
  │                        │ Inning 2 Closes                     │
  │                        ▼                                     │
  │            ┌────────────────────────┐                        │
  │            │     [MATCH_RESULT]     │                        │
  │            └───────────┬────────────┘                        │
  │                        │                                     │
  │            More Match Fixtures Remaining?                    │
  │             ├── [YES] ───────────────────────────────────────┘
  │             └── [NO] (League & Playoffs Complete)
  │                        │
  │                        ▼
  │            ┌────────────────────────┐
  │            │   [SEASON_COMPLETE]    │ ── (Awards, Orange/Purple Cap, P&L)
  │            └───────────┬────────────┘
  │                        │ Aging, Retentions, Retiring Stars
  │                        ▼
  └─────────── ┌────────────────────────┐
               │     [NEXT_SEASON]      │ ── (Advance Season: e.g. Season 2/30)
               └────────────────────────┘
```

---

## 2. State Transition Guards, Validations & Recovery

### 1. `NEW_CAREER` → `FRANCHISE_SELECTED`
- **Trigger**: User inputs valid Career Name and clicks "Pick Franchise >" on `SCR_03`.
- **Validation**:
  - `careerName` must be non-empty (1 to 30 characters).
  - Selected tournament format must exist in tournament catalog.
  - Initial purse set to ₹100.0 Cr.
- **Save Checkpoint**: New career slot allocated with status `INITIALIZING`.
- **Failure Recovery**: If state initialization fails, aborts transition, displays inline error banner, and keeps user on setup screen.

### 2. `FRANCHISE_SELECTED` → `AUCTION` (or `SQUAD_FINALIZED`)
- **Trigger**: User selects franchise on `SCR_05` and clicks "Confirm Franchise".
- **Validation**:
  - `userFranchiseId` must match one of the 10 approved franchise IDs.
  - If `SquadMode == 'AUCTION'`, advances to `AUCTION`.
  - If `SquadMode == 'REAL_SQUADS'`, validates pre-existing squads and advances directly to `SQUAD_FINALIZED`.
- **Save Checkpoint**: Auto-saves career slot with selected franchise.

### 3. `AUCTION` → `SQUAD_FINALIZED`
- **Trigger**: All auction lots completed or auction fast-forward finished.
- **Critical Validation Guard**:
  - Every franchise (User + 9 AI teams) MUST have between 18 and 25 players.
  - Maximum 8 overseas players per squad.
  - Purse balance must not be negative ($\ge ₹0.00$).
  - At least 1 designated Wicketkeeper and at least 5 bowling options.
- **Unmet Validation Guard**: If user squad is below 18 players, trigger **Accelerated Unsold Draft** allowing user to pick from remaining unsold pool at base price until 18 players reached.
- **Save Checkpoint**: Comprehensive snapshot of all 10 squads, purse balances, and spent monies.

### 4. `SQUAD_FINALIZED` → `SEASON_ACTIVE`
- **Mandatory Lifecycle Trigger**:
  1. Complete schedule generation: creates 74 official fixtures (round-robin + home/away venues).
  2. Points table initialized with 10 franchises (Played: 0, Won: 0, Lost: 0, Pts: 0, NRR: 0.000).
  3. Dashboard `NEXT_MATCH` button is bound explicitly to `fixtures[0]`.
  4. Both teams' Playing XIs confirmed (11 players, max 4 overseas).
- **Save Checkpoint**: Critical Auto-Save point before any match can be launched.

### 5. `SEASON_ACTIVE` → `MATCH`
- **Trigger**: User clicks "Next Match" on Dashboard or Fixtures list, reviews pre-match conditions on `SCR_18`, and clicks "Start Match".
- **Validation**:
  - User Playing XI contains exactly 11 active, non-injured cricketers.
  - No more than 4 overseas players in Playing XI.
  - Exactly 1 Captain `[C]` and 1 Wicketkeeper `[WK]` designated.
  - Opponent AI team generates legal 11 based on pitch and player ratings.
  - Match seed generated via PRNG.
- **Save Checkpoint**: Match staging checkpoint (records lineup and toss).

### 6. `MATCH` → `MATCH_RESULT`
- **Trigger**: 2nd innings reaches 20.0 overs, target surpassed, or 10 wickets fallen.
- **Validation**:
  - Innings legal balls, extras, and wickets mathematically verified.
  - Winner franchise identified, or tie resolved via Super Over.
  - Player of the Match calculated via MVP scoring algorithm.
- **Database Commitment**:
  - Fixture marked `isCompleted: true`, scores and winner recorded.
  - Points table updated: +2 points to winner, NRR recalculated dynamically using total runs and overs.
  - Player career statistics and season statistics updated.
  - Player form updated (+5 for match-winning knocks/hauls, -2 for ducks/expensive spells).
  - Player fatigue increased (+15 to +25 based on match workload); fitness reduced.
- **Save Checkpoint**: Auto-Save immediately committed upon match close.

### 7. `MATCH_RESULT` → `SEASON_ACTIVE` (or `SEASON_COMPLETE`)
- **Evaluation**:
  - Increments `currentFixtureIndex`.
  - Checks if regular league fixtures remain.
    - If yes: binds `NEXT_MATCH` to `fixtures[currentFixtureIndex]`.
    - If regular season concluded: generates Playoff fixtures (Qualifier 1: 1st vs 2nd, Eliminator: 3rd vs 4th).
    - If playoffs concluded: advances to `SEASON_COMPLETE`.

### 8. `SEASON_COMPLETE` → `NEXT_SEASON`
- **Trigger**: Trophy presentation and Season Summary confirmed on `SCR_30`.
- **Validation**:
  - Season champions recorded in franchise trophy history.
  - Orange Cap, Purple Cap, MVP awards minted to career records.
  - Prize money and end-of-season gate receipts credited to club finances.
  - Player aging processed (+1 year to all active players).
  - Retirement checks evaluated (players aged 40 trigger `SCR_31`).
  - Contracts decremented by 1 year.
  - Increments `currentSeasonNumber` (e.g., Season 2 of 30).
- **Save Checkpoint**: Dynasty milestone permanent save point.

---

## 3. Strict Real-Match Binding Contract

To prevent any disconnected or fake UI:

1. **Dashboard Dynamic Binding**:
   - The Main Dashboard (`SCR_06`) contains:
     ```typescript
     const upcomingFixture = careerState.currentTournament.fixtures.find(f => !f.isCompleted && (f.homeFranchiseId === userFranchiseId || f.awayFranchiseId === userFranchiseId));
     ```
   - If `upcomingFixture` exists:
     - Displays actual opponent crest, stadium name, and match number.
     - `NEXT_MATCH` button dispatches `LAUNCH_MATCH_PREVIEW(upcomingFixture.fixtureId)`.
   - If no fixtures remain:
     - Button automatically transforms into `VIEW_PLAYOFFS` or `VIEW_SEASON_SUMMARY`.
2. **Deterministic Replay Guarantee**:
   - Every fixture object retains: `seed: number`. If app crashes mid-innings, simulation resumes from the exact last completed over without statistical discrepancies.

---
*Game State Machine Specification Approved for Phase 00.*
