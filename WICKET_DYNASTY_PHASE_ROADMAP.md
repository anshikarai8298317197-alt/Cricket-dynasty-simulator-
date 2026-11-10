# WICKET DYNASTY – PHASE IMPLEMENTATION ROADMAP
**Version**: 1.0.0 (Phase 00 Blueprint)  
**Strict Implementation Policy**: Sequential Phase Progression — No premature jumping across phase boundaries.  

---

## Roadmap Overview

```
Phase 00: Master Game Blueprint & System Architecture [COMPLETED]
   │
   ▼
Phase 01: Core Architecture, Navigation Hub & Authoritative Store
   │
   ▼
Phase 02: 320-Player Master Database, Franchise Catalog & Attribute Engine
   │
   ▼
Phase 03: Live Auction Room Engine, AI Bidding Personas & RTM System
   │
   ▼
Phase 04: Squad Management, Playing XI Pitch Visualizer & Roster Validation
   │
   ▼
Phase 05: Headless Deterministic Cricket Match Simulation Engine
   │
   ▼
Phase 06: 2D Canvas Match Presentation Renderer & Live Manager HUD
   │
   ▼
Phase 07: Tournament Manager, Fixture Engine & Live Points Table
   │
   ▼
Phase 08: Training & Development Engine, Workload, Fatigue & Injury System
   │
   ▼
Phase 09: Tactical Management & In-Match Strategic Directives
   │
   ▼
Phase 10: Club Headquarters, Stadium Upgrades & Staff Management
   │
   ▼
Phase 11: Financial Engine, P&L Ledgers & Sponsorship Contracts
   │
   ▼
Phase 12: Multi-Season Dynasty Loop, Player Aging & Retirement Extensions
   │
   ▼
Phase 13: Save/Load Storage Persistence, Audio System & Settings
   │
   ▼
Phase 14: Final System Integration, Performance Optimization & QA Sign-Off
```

---

## Detailed Phase Breakdown

### Phase 00: Game Blueprint & System Architecture [ACTIVE / COMPLETE]
- **Deliverables**: Comprehensive GDD, System Architecture, 36-Screen Map, TypeScript Data Models, Career State Machine, UI Design System, Implementation Roadmap, QA Checklist.
- **Dependencies**: Reference image understanding & design lock.
- **Validation Criteria**: Complete specification documentation in place; zero mock/fake gameplay code written; architecture verified against constraints.
- **Strict Rule**: No UI code or gameplay engine code in this phase.

### Phase 01: Core Architecture, Navigation Hub & Authoritative Store
- **Deliverables**:
  - Global `CareerState` store with reducer action handlers.
  - Screen navigation state machine managing transitions across all 36 screens.
  - Mobile frame responsive shell (`App.tsx`) with dark navy theme and safe-area insets.
  - Functional Splash Screen (`SCR_01`) and Main Dashboard (`SCR_02`).
  - New Career Setup flow (`SCR_03`, `SCR_05`) saving validated career config.
- **Dependencies**: Phase 00 documentation.
- **Validation Criteria**: User can configure a career, select a franchise, and see state transition to `AUCTION` or `SQUAD_FINALIZED`. Zero broken routes.

### Phase 02: 320-Player Master Database & Franchise Catalog
- **Deliverables**:
  - Complete 320-player data registry spanning domestic and international talents.
  - Balanced distribution across Batters, Pace Bowlers, Spin Bowlers, All-Rounders, and Wicketkeepers.
  - Auction base prices, overall ratings (OVR 65–96), potential ratings, and role-specific skill sets.
  - 10 Franchises with authentic team colors, home venues, and AI manager bidding personas.
- **Dependencies**: Phase 01 Store.
- **Validation Criteria**: Database queries return valid player objects; player skill averages mathematically correspond to overall ratings.

### Phase 03: Live Auction Room Engine & AI Bidding System
- **Deliverables**:
  - Real-time bidding room (`SCR_08`) with lot presentations, hammer timers, and purse tickers.
  - AI bidding algorithms responding to team purse, positional deficits, and player tiers.
  - Increment steppers `[-] [₹ Amount] [+]` and Auto-Bid toggle.
  - Right-to-Match (RTM) logic and post-auction unsold pool clearance.
- **Dependencies**: Phase 02 Player Database.
- **Validation Criteria**: All 10 teams end auction with 18–25 players; maximum 8 overseas players respected; zero teams enter negative purse.

### Phase 04: Squad Management & Playing XI Selection
- **Deliverables**:
  - Squad roster screen (`SCR_10`) with category filters and balance telemetry.
  - Interactive 2D pitch formation view (`SCR_12`) for Playing XI selection.
  - Role designation for Captain `[C]` and Wicketkeeper `[WK]`.
  - Deep Player Profile screen (`SCR_11`) with circular condition dials (Form, Morale, Fitness).
  - Validation engine enforcing 11 players, max 4 overseas, and min 5 bowling options.
- **Dependencies**: Phase 03 Squad rosters.
- **Validation Criteria**: Lineup cannot be confirmed if validation rules are violated; auto-select generates legal lineup.

### Phase 05: Headless Cricket Match Simulation Engine
- **Deliverables**:
  - Seed-based, deterministic ball-by-ball physics and probability simulation.
  - Delivery calculations matching batter attributes vs bowler attributes + pitch/weather modifiers.
  - Full rule support: 20 overs, Powerplay restrictions, legal balls, wides, no-balls, byes, leg-byes, wickets (bowled, caught, LBW, run-out, stumped).
  - Strike rotation and Super Over mechanics for tied fixtures.
- **Dependencies**: Phase 04 Playing XIs.
- **Validation Criteria**: Simulating 100 automated matches produces realistic T20 statistics (average score 155–185, realistic strike rates and bowling economies).

### Phase 06: 2D Canvas Match Presentation Renderer & Live HUD
- **Deliverables**:
  - HTML5 Canvas top-down floodlit stadium with boundary ropes, 30-yard circle, and 22-yard pitch strip (`SCR_19`).
  - Animated ball trajectories, player sprites, and boundary/wicket visual particle FX.
  - Live broadcast score banner (`SCR_20`), ball-by-ball commentary ticker, and manager controls (`1x`, `2x`, `4x`, `Pause`, `Auto`).
  - Post-match Result screen (`SCR_21`) and Full Scorecard (`SCR_22`).
- **Dependencies**: Phase 05 Match Engine.
- **Validation Criteria**: Smooth 60fps canvas rendering; zero arcade controls; UI accurately reflects simulation engine events.

### Phase 07: Tournament Manager, Fixture Engine & Points Table
- **Deliverables**:
  - Complete 74-match schedule generation (`SCR_16`) with home/away grounds.
  - Real-time Points Table (`SCR_17`) with dynamic Net Run Rate (NRR) computation.
  - Page Playoff tournament bracket (Qualifier 1, Eliminator, Qualifier 2, Final).
  - Strict binding of Dashboard `NEXT_MATCH` button to active schedule.
- **Dependencies**: Phase 05 Match Engine, Phase 06 Results.
- **Validation Criteria**: Match victories award 2 points; NRR formula calculates exactly to 3 decimal places; playoffs seed correctly based on final standings.

### Phase 08: Training Centre, Development & Fatigue/Injury Engine
- **Deliverables**:
  - Training Hub (`SCR_13`) with 4 practice disciplines (Batting, Bowling, Fielding, Fitness).
  - Weekly training schedule cycle and workload intensity sliders (`Light`, `Moderate`, `Intense`).
  - Fatigue and injury risk curve calculations.
  - Player skill progression and youth potential breakthroughs.
  - Medical Centre rehab integration (`SCR_26`).
- **Dependencies**: Phase 04 Squad, Phase 05 Match workload.
- **Validation Criteria**: Overtraining fatigued players triggers acute injuries; training progression measurably improves player attribute ratings.

### Phase 09: Tactical Management & In-Match Manager Strategy
- **Deliverables**:
  - Tactical dashboard (`SCR_14`): Macro Strategy (`Attack`, `Balanced`, `Defend`), Batting approach, Bowling plan, and Fielding presets.
  - In-match managerial interventions (changing tempo between overs, bowling rotation, field adjustments).
  - Direct mathematical impact of tactics on match simulation probabilities.
- **Dependencies**: Phase 05 Match Engine, Phase 06 Live HUD.
- **Validation Criteria**: Setting "Attack" increases boundary frequency and wicket risk; defensive field spreads suppress boundaries.

### Phase 10: Club Headquarters, Facilities & Staff Management
- **Deliverables**:
  - Interactive isometric 2D campus visualizer (`SCR_23`) with 5 upgradable facilities (Stadium, Academy, Medical, Analytics, Training Nets).
  - Stadium seating and ticket pricing management (`SCR_24`).
  - Staff & Coaches hiring and tier upgrades (`SCR_28`).
  - Youth Academy scouting and prospect trials (`SCR_25`, `SCR_27`).
- **Dependencies**: Phase 01 Store, Phase 08 Training.
- **Validation Criteria**: Facility upgrades deduct funds and apply passive bonuses (e.g. Higher gate revenue, +6% Batting boost).

### Phase 11: Financial Engine, P&L Ledgers & Sponsorships
- **Deliverables**:
  - Franchise ledger screen (`SCR_29`) with current balance, season projections, and YTD P&L.
  - Itemized revenue (Ticket sales, Broadcasting, Sponsorship deals) and expenses (Player salaries, Staff payroll, Maintenance).
  - Financial health warning system preventing insolvent overspending.
- **Dependencies**: Phase 10 Facilities, Phase 03 Auction spending.
- **Validation Criteria**: Ledger entries balance correctly; gate receipts fluctuate with stadium capacity and fan popularity.

### Phase 12: Multi-Season Dynasty Loop, Aging & Retirement
- **Deliverables**:
  - Season Summary celebration (`SCR_30`) with Orange Cap, Purple Cap, and MVP awards.
  - Player aging (+1 year per season) and attribute decay curves.
  - Retirement Management (`SCR_31`) enforcing retirement at age 40 with up to 2 optional veteran extensions (max age 42).
  - Historical Record Book (`SCR_32`) and Trophy Cabinet (`SCR_33`) tracking up to 30 seasons.
- **Dependencies**: Phase 07 Tournament, Phase 02 Player DB.
- **Validation Criteria**: Careers progress continuously across multiple seasons with evolving rosters and accumulated records.

### Phase 13: Offline Storage Persistence, Audio System & Settings
- **Deliverables**:
  - IndexedDB storage adapter supporting 5 independent career slots (`SCR_04`, `SCR_36`).
  - Autosave triggers at every major milestone with JSON backup export/import.
  - Web Audio procedural soundscape (crowd roar, bat-ball impact, boundary fanfare, UI clicks) with 5-channel volume mixer (`SCR_35`).
  - App Settings and battery saver mode (`SCR_34`).
- **Dependencies**: Complete career state.
- **Validation Criteria**: Force-refreshing browser or restarting device restores exact career state without data loss; audio channels respond to sliders.

### Phase 14: Final System Integration, Performance Tuning & Release Sign-Off
- **Deliverables**:
  - Full end-to-end regression testing across all 36 screens.
  - Mobile viewport touch audit ensuring 48px hit targets and zero overflow glitches.
  - Build compilation verification with zero errors or lints.
  - Final packaging readiness for Android APK export.
- **Dependencies**: Phases 00 through 13.
- **Validation Criteria**: Flawless 30-season simulation pass; 100% Manager-Only compliance verified.

---
*Roadmap Approved for Phase 00.*
