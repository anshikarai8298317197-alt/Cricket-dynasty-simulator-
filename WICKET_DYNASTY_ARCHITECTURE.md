# WICKET DYNASTY – SYSTEM ARCHITECTURE SPECIFICATION
**Version**: 1.0.0 (Phase 00 Blueprint)  
**Status**: Architecture Approved  
**Author**: Lead Game Architect & Simulation Designer  

---

## 1. Architectural Principles

1. **Single Authoritative Source of Truth**:  
   All state is managed centrally within an immutable/controlled state tree (`CareerState`). No individual UI screen or React component can directly mutate franchise balances, player skills, tournament fixtures, or match scores. Every state mutation is performed via strongly typed Action Dispatches validated by domain engines.

2. **Strict Separation of Simulation Logic & Presentation**:  
   The `CricketMatchSimulationEngine` runs headlessly. It operates on numerical probabilities, pseudo-random seed sequences, and athlete attribute matrices. It produces deterministic ball events (`BallEvent`). The `MatchPresentationRenderer` is purely a visual consumer of these events, driving the 2D canvas, animations, and broadcast tickers without influencing the simulation outcome.

3. **Deterministic & Seed-Based**:  
   Matches and career events use seeded PRNG (Pseudo-Random Number Generator, e.g. Mulberry32 or SplitMix32). Given the same starting seed and tactical instructions, a match replay produces the exact same ball-by-ball events. This enables instant crash recovery and tiny save-state footprints.

4. **Offline-First & Decoupled Storage**:  
   The storage layer is encapsulated behind a `StorageAdapter` interface that defaults to `IndexedDB` with fallback to `localStorage`. No external cloud or backend connection is required for gameplay.

---

## 2. Global System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER (UI)                         │
│   React 19 Components · Tailwind CSS · 2D Canvas Stadium · Audio Synth │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │ Events & Selectors
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      APPLICATION & NAVIGATION HUB                      │
│             Route Controller · Screen Stack · Modal Overlays           │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │ Dispatches Actions
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        CAREER CONTROLLER / STORE                       │
│    Authoritative Game State · Action Dispatcher · Middleware Validator │
└───────┬──────────────┬──────────────┬──────────────┬─────────────┬─────┘
        │              │              │              │             │
        ▼              ▼              ▼              ▼             ▼
┌──────────────┐┌──────────────┐┌──────────────┐┌───────────┐┌───────────┐
│ FRANCHISE &  ││ PLAYER DB &  ││ AUCTION ROOM ││ TRAINING  ││ TACTICS   │
│ SQUAD MGR    ││ ATTRIBUTES   ││ ENGINE       ││ & FATIGUE ││ ENGINE    │
└───────┬──────┘└──────┬───────┘└──────┬───────┘└─────┬─────┘└─────┬─────┘
        │              │               │              │            │
        ▼              ▼               ▼              ▼            ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 CRICKET MATCH SIMULATION ENGINE (HEADLESS)             │
│   Ball Physics · Probabilities · Batter/Bowler Matchups · State Ticker │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Emits BallEvents
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 MATCH PRESENTATION RENDERER (2D CANVAS)                │
│    Top-Down Pitch · Player Sprites · Trajectory Easing · FX Overlays   │
└────────────────────────────────────────────────────────────────────────┘
        ▲              ▲               ▲              ▲            ▲
        │              │               │              │            │
┌───────┴──────┐┌──────┴───────┐┌──────┴───────┐┌─────┴─────┐┌─────┴─────┐
│ TOURNAMENT & ││ CLUB HQ &    ││ FINANCE &    ││ RETIREMENT││ AUDIO &   │
│ FIXTURES     ││ FACILITIES   ││ P&L LEDGER   ││ & AGING   ││ SETTINGS  │
└──────────────┘└──────────────┘└──────────────┘└───────────┘└───────────┘
```

---

## 3. Subsystem Breakdown & Contracts

### 3.1 Application & Navigation Manager
- **Responsibilities**: Controls active screen, view stack history, transition animations, back-button handling, and modal popups.
- **Inputs**: Navigation actions (`NAVIGATE_TO`, `GO_BACK`, `OPEN_MODAL`, `CLOSE_MODAL`).
- **Outputs**: Active screen ID, route breadcrumbs, modal parameters.
- **Dependencies**: None.

### 3.2 Career Manager
- **Responsibilities**: Controls macro lifecycle of a career mode save: creates new career, loads existing save slot, advances calendar days, triggers season transitions.
- **Inputs**: User configuration (difficulty, franchise, rules), save slot selection.
- **Outputs**: `CareerState` snapshots, career milestone achievements, dynasty records.
- **Dependencies**: Storage Manager, Tournament Manager, Franchise Manager.

### 3.3 Franchise Manager
- **Responsibilities**: Maintains 10 league franchises (logos, team colors, city, fan reputation, historical titles, current roster IDs, budget).
- **Inputs**: Franchise creation/update requests.
- **Outputs**: Franchise profile data, AI franchise manager personas.
- **Dependencies**: None.

### 3.4 Player Database
- **Responsibilities**: Holds authoritative master records of all 320 cricketers (real or fictional), attribute matrices, career stats, current contracts, physical fitness, form, and morale.
- **Inputs**: Player ID queries, attribute delta updates from matches and training.
- **Outputs**: Read-only player entity references, filtered search queries.
- **Dependencies**: None.

### 3.5 Squad Manager
- **Responsibilities**: Enforces roster constraints: minimum 18, maximum 25 players; maximum 8 overseas players. Manages Playing XI selection, batting orders, captaincy `[C]`, wicketkeeper `[WK]`, and 12th man assignments.
- **Inputs**: Roster swap actions, Playing XI configuration.
- **Outputs**: Playing XI squad validation flags (`isValid: boolean`, `errors: string[]`), squad overall ratings.
- **Dependencies**: Player Database, Franchise Manager.

### 3.6 Auction Engine
- **Responsibilities**: Simulates live IPL-style bidding rooms. Groups players into sets (e.g., Marquee Batsmen, Elite Fast Bowlers, Spin Wizards, All-Rounders, Wicketkeepers). Manages bidding increments, hammer countdown timers, AI bidding logic based on team purse and positional needs, and Right-To-Match (RTM) clauses.
- **Inputs**: User bids, auto-bid parameters, player lot nominations.
- **Outputs**: Bid history, lot result (`SOLD`, `UNSOLD`), purse deductions, updated franchise rosters.
- **Dependencies**: Player Database, Franchise Manager, Finance Engine.

### 3.7 Training Engine
- **Responsibilities**: Computes weekly training cycle developments. Simulates skill progression based on coach tier buffs, assigned regimes (Power Hitting, Death Bowling, Slip Catching, etc.), player age, and potential caps. Calculates fatigue accumulation and evaluates injury risk.
- **Inputs**: Training assignments, schedule intensity, active coaching staff.
- **Outputs**: Attribute deltas, fatigue changes, injury reports (injury type, recovery duration in days).
- **Dependencies**: Player Database, Staff Manager, Medical Centre.

### 3.8 Tactics Engine
- **Responsibilities**: Configures pre-match and in-match tactical directives: Macro strategy (`Attack`, `Balanced`, `Defend`), Batting approach (`Anchor`, `Aggressive with Freedom`, `Conserve Wickets`), Bowling strategy (`Attack Stumps`, `Death Overs Focus`, `Containment`), and Field spread presets (`Powerplay Ring`, `Attacking Slips`, `Deep Boundary Patrol`).
- **Inputs**: Manager slider/dropdown selections.
- **Outputs**: Tactical modifier matrices consumed directly by the Match Engine.
- **Dependencies**: None.

### 3.9 Tournament Manager & Fixture Generator
- **Responsibilities**: Generates balanced round-robin league schedules, determines home/away venues, tracks league standings (Matches, Won, Lost, Points, NRR), and manages playoff brackets (Qualifier 1, Eliminator, Qualifier 2, Final).
- **Inputs**: List of participating franchises, season start trigger.
- **Outputs**: Ordered fixture list, updated points table, playoff matchups.
- **Dependencies**: Franchise Manager, Match Engine.

### 3.10 Cricket Match Simulation Engine (Headless)
- **Responsibilities**: High-precision, seed-based, ball-by-ball statistical simulation. Computes delivery outcomes (0, 1, 2, 3, 4, 6, Wide, No-Ball, Leg Bye, Bye, Wicket: Bowled, Caught, LBW, Run Out, Stumped) based on striker attributes vs bowler attributes, pitch type, weather, field placement, and tactical instructions.
- **Inputs**: Active Playing XI (both teams), pitch/weather conditions, tactical modifiers, random seed.
- **Outputs**: Emitted `BallEvent` objects, current scoreboard state, player performance tallies.
- **Dependencies**: Player Database, Tactics Engine.

### 3.11 Match Presentation Renderer (2D)
- **Responsibilities**: Renders top-down 2D vector cricket ground on HTML5 Canvas. Interpolates ball trajectory paths, animates fielder movements, draws boundary line hits, and triggers visual celebration overlays (*WICKET!*, *FOUR!*, *MAXIMUM!*).
- **Inputs**: Stream of `BallEvent` objects from the Match Engine.
- **Outputs**: Visual 60fps canvas frames.
- **Dependencies**: Cricket Match Simulation Engine.

### 3.12 Club Headquarters & Facilities Manager
- **Responsibilities**: Tracks facility tiers (Stadium, Academy, Training Nets, Medical Centre, Analytics Lab). Computes upgrade costs, construction countdowns, and passive bonuses (e.g., higher gate receipts, faster injury healing, higher scouting accuracy).
- **Inputs**: Upgrade requests, facility investment actions.
- **Outputs**: Current facility levels, passive bonus coefficients.
- **Dependencies**: Finance Engine.

### 3.13 Finance Engine
- **Responsibilities**: Manages the franchise ledger: cash balance, seasonal revenue streams (ticket sales, merchandise, TV rights, tournament prize money), and operational expenditure (player salaries, staff payroll, facility maintenance, scouting costs).
- **Inputs**: Match attendance, prize winnings, payroll dates, facility bills.
- **Outputs**: Updated balance, P&L statement, seasonal projections, bankruptcy alerts.
- **Dependencies**: Club Headquarters, Squad Manager, Tournament Manager.

### 3.14 Retirement & Aging Engine
- **Responsibilities**: At the end of each season, advances player ages by 1. Computes attribute maintenance or physical decline based on age curve (peaks at 27–31, gradual decay at 32–35, accelerated decay at 36+). Enforces natural retirement at age 40, offering optional rewarded veteran extensions up to age 42 (maximum 2 extensions).
- **Inputs**: End-of-season trigger, user extension requests.
- **Outputs**: Updated player ages, modified attributes, retired player list.
- **Dependencies**: Player Database, Career Manager.

### 3.15 Save/Load Manager
- **Responsibilities**: Serializes the entire `CareerState` into compressed JSON format with version headers and integrity checksums. Handles schema migrations between versions, automatic autosaving at key milestones, and corrupt save detection.
- **Inputs**: Save/Load/Export commands.
- **Outputs**: Persistence status, validated save slot records.
- **Dependencies**: Storage Adapter (`IndexedDB`).

### 3.16 Audio Manager
- **Responsibilities**: Procedural Web Audio API sound generator and sample player. Coordinates audio channels: Master, Commentary, Crowd Ambience, Match Effects (ball striking wood, stumps shattering), and UI interaction sounds.
- **Inputs**: Match events, UI click events, volume settings.
- **Outputs**: Spatial and dynamic sound playback.
- **Dependencies**: Settings Manager.

### 3.17 Settings Manager
- **Responsibilities**: Stores and applies user preferences: audio volume sliders, simulation text speed, high-contrast mode, auto-save interval, and device vibration/haptics toggles.
- **Inputs**: User settings changes.
- **Outputs**: Active configuration state.
- **Dependencies**: Local Storage.

---

## 4. Authoritative Data Flow & Immutability Rules

```
               [ User Interaction in UI ]
                           │
                           ▼
               [ Action Dispatch (Typed) ]
                           │
                           ▼
          [ Domain Engine Validation & Guard ]
                           │
              (Valid) ───► │ ◄─── (Invalid: Throw Handled Error)
                           │
                           ▼
          [ State Reducer (Pure Function) ]
                           │
                           ▼
          [ New Immutable CareerState Tree ]
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
[ Auto-Save Checkpoint ]     [ UI Subscriptions & Rerender ]
```

1. **No Out-of-Band State Alteration**: All modifications pass through pure reducers.
2. **Replayability**: Every ball in a match has an index `overNumber.ballNumber` and stores the random seed used.
3. **No UI State Drift**: The UI is a pure projection of the `CareerState`.

---
*Signed and Approved for Phase 00 Architecture.*
