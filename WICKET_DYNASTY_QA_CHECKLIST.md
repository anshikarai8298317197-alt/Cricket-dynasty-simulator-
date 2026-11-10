# WICKET DYNASTY – QUALITY ASSURANCE (QA) CHECKLIST
**Version**: 1.0.0 (Phase 00 Blueprint)  
**Standard**: Strict Android Cricket Simulator Certification  

---

## 1. 100% Manager-Only Gameplay Audit
- [ ] **No Arcade Controls**: Confirm there are no shot timing wheels, batting swipe gestures, bowling release meters, or manual fielder dives anywhere in the codebase.
- [ ] **Autonomous Execution**: Confirm all shots, bowling deliveries, catches, run-outs, and running between wickets are determined purely by the simulation engine.
- [ ] **Managerial Control Integrity**: Verify user interventions are restricted to macro strategy (Attack, Balanced, Defend), batting tempo directives, bowling rotations, field presets, and speed playback (1x, 2x, 4x, Pause, Auto).

---

## 2. Career State Machine & Navigation Verification
- [ ] **Legal Transitions Only**:
  - `NEW_CAREER` → `FRANCHISE_SELECTED` → `AUCTION` (or `SQUAD_FINALIZED`) → `SEASON_ACTIVE` → `MATCH` → `MATCH_RESULT` → `SEASON_COMPLETE` → `NEXT_SEASON`.
- [ ] **Illegal Transition Trapping**: Verify that jumping directly to `MATCH` without an active tournament schedule throws a handled error and redirects safely to Dashboard.
- [ ] **Real Next Match Binding**: Verify that the Dashboard `NEXT_MATCH` button ALWAYS dynamically loads the actual scheduled opponent from `fixtures[currentFixtureIndex]` and never points to a hardcoded or fake match.
- [ ] **Points Table Synchronization**: Verify that completing a match immediately updates points (+2 for win), runs, overs, and recalculates Net Run Rate (NRR) to 3 decimal places.

---

## 3. Squad & Playing XI Rule Enforcement
- [ ] **Squad Roster Size**: Roster must strictly contain between 18 and 25 players at the conclusion of an auction.
- [ ] **Overseas Player Limit**: Squad can hold a maximum of 8 overseas players.
- [ ] **Playing XI Constraints**:
  - Exactly 11 players selected.
  - Maximum 4 overseas players in the 11.
  - Exactly 1 designated Wicketkeeper `[WK]`.
  - Exactly 1 designated Captain `[C]`.
  - Minimum 5 bowling options available in the lineup.
- [ ] **Injury Ineligibility**: Injured players in the medical centre cannot be placed in the Playing XI.
- [ ] **Lineup Auto-Correction**: "Auto Select Best XI" button produces a 100% legal lineup adhering to all constraints.

---

## 4. Auction Room Integrity Verification
- [ ] **Salary Cap Compliance**: Franchise purse starts at ₹100.0 Cr and cannot be overdrawn below ₹0.00 Cr under any circumstance.
- [ ] **Bidding Increments**: Increments follow standard league brackets (₹5L increments up to ₹1 Cr, ₹10L up to ₹2 Cr, ₹20L up to ₹5 Cr, ₹25L/50L above ₹5 Cr).
- [ ] **AI Persona Differentiation**: Verify aggressive AI owners outbid conservative owners on marquee players, while youth-focused AI owners bid on high-potential uncapped prospects.
- [ ] **Unsold Clearance**: Unsold players enter an accelerated secondary pool ensuring all 10 franchises meet the minimum 18-player quota.

---

## 5. Match Engine Statistical Realism
- [ ] **Score Distribution**: Simulated T20 scores realistically fall within 130 to 220 runs across 20 overs, with an average around 165–175.
- [ ] **Dismissal Realism**: Frequency of dismissals aligns with T20 cricket norms:
  - Caught: ~60–65%
  - Bowled: ~18–22%
  - LBW: ~10–12%
  - Run Out: ~5–8%
  - Stumped: ~2–4%
- [ ] **Powerplay & Death Over Curves**: Run rate accelerates realistically during overs 1–6 (Powerplay) and overs 16–20 (Death overs).
- [ ] **Deterministic Seed Verification**: Re-simulating a fixture with the identical random seed produces the exact same ball-by-ball events.
- [ ] **Super Over Resolution**: Tied matches trigger a single-over eliminator with correct strike and bowling rules.

---

## 6. Training, Workload & Injury Modeling
- [ ] **Attribute Delta Tracking**: Training drills measurably increase assigned attributes (e.g., +1 Power, +2 Against Spin) over 4-week cycles.
- [ ] **Coach Multipliers**: Higher tier coaches (Tier 4–5) accelerate attribute gains compared to lower tier staff.
- [ ] **Fatigue Accumulation**: Consecutive high-intensity matches without rest elevate player fatigue (>75%).
- [ ] **Injury Trigger**: High fatigue combined with intense training regimes exponentially increases injury occurrence.
- [ ] **Medical Centre Acceleration**: Upgraded medical facilities and physiotherapists reduce recovery timelines by specified percentages.

---

## 7. Multi-Season Longevity & Financial Balance
- [ ] **30-Season Continuity**: Career successfully advances through multiple consecutive seasons without memory leaks or state corruption.
- [ ] **Player Aging**: Player ages increment by 1 each season; physical attributes decay after age 33.
- [ ] **Retirement at Age 40**: Players aged 40 automatically enter retirement management.
- [ ] **Veteran Extension Limit**: Maximum 2 rewarded extensions allowed per player (absolute hard stop at age 42).
- [ ] **Financial Solvency**: Gate receipts, broadcasting rights, and sponsorships realistically balance against player payrolls and facility upkeep.

---

## 8. Offline Storage & Mobile Accessibility
- [ ] **Offline Operation**: Entire game operates offline via local storage / IndexedDB without requiring network pings.
- [ ] **Autosave Recovery**: Interruption during a match or auction restores to the exact preceding safe point upon app reload.
- [ ] **Portrait Mobile Viewport**: UI renders cleanly within standard 390px–430px Android phone widths without horizontal scrolling or clipping.
- [ ] **Touch Target Sizing**: All interactive buttons, tabs, and toggles meet the 48px minimum touch target standard.
- [ ] **Audio Mixer Separation**: Volume sliders for Master, Commentary, Crowd, Match SFX, and UI clicks modulate their respective Web Audio gain nodes independently.

---
*QA Certification Checklist Established for Phase 00.*
