# WICKET DYNASTY – OFFICIAL DESIGN BIBLE
**Permanent Visual, Functional, and Architectural Reference Specification**
*Version: 1.0.0 — Design Locked for Phase 00*

---

## 1. Game Identity

| Attribute | Specification |
|---|---|
| **Game Title** | **WICKET DYNASTY** (*Cricket Franchise Manager*) |
| **Genre** | Deep Cricket Franchise Management Simulator |
| **Platform Target** | Android (Mobile & Tablet responsive, Portrait-First) |
| **Graphics Engine** | 2D Stylized Vector / Canvas & High-Fidelity UI |
| **Orientation** | Portrait-First (9:16 mobile canvas, adaptive tablet landscape container) |
| **Core Gameplay Loop** | **100% Manager-Only**. The player acts as Chief Executive and Head Manager. Batting, bowling, running, and fielding are simulated strictly via the AI match engine. Zero arcade/action execution. |

---

## 2. Reference Image Comprehensive Analysis

The reference image (`/public/assets/aistudio/file_000000003a3882119f8c492ed1ac4351_c836ca35.png`) establishes a cohesive 15-screen suite displaying the end-to-end franchise lifecycle.

### Screen-by-Screen Breakdown:

#### 1. Home / Dashboard
- **Visuals**: Dynamic floodlit night-match stadium backdrop with manager protagonist silhouette holding the franchise championship trophy. Bold gold serif-embossed title lockup *"WICKET DYNASTY - CRICKET MANAGER"*.
- **Primary CTAs**: Large golden pill-button *"Continue Career"* with play icon; secondary charcoal-navy cards: *"New Career"*, *"Save Games"*, *"Settings"*.
- **Bottom Status Dock**: Clean 3-item navigation footer (*Achievements*, *Events*, *News*) with badge indicators.

#### 2. Career Setup
- **Configuration Flow**: 
  - Career Name input field (clean dark pill styling).
  - Tournament carousel selector (e.g., *"T20 Franchise League"*, with national flag and trophy graphic).
  - Squad Mode segmented pills: `[ Auction | Real Squads | Custom ]`.
  - Difficulty segmented selector: `[ Easy | Normal | Hard | Expert ]`.
  - Season Length toggle: `[ Single (1) | Multi (30) ]`.
- **Primary Action**: Bright gold gradient button *"Pick Franchise >"*.

#### 3. Auction Room (Round 1)
- **Top Metrics Bar**: Real-time purse tracking: `Purse: ₹100.0 Cr`, `Players: 0/25`, `Overseas: 0/8`.
- **Role Filters**: Quick pill toggles `[ All | BAT | BOWL | AR | WK ]`.
- **Player Card List**: High-detail player cards displaying circular portrait, nationality flag, primary role tag (`BOWL`, `BAT`, `AR`), overall rating badge (`95`, `94`, etc.), base price (`₹2.00 Cr`), and live current bid highlight.
- **Bidding Console**:
  - Stepper controls (`[-] ₹12.50 Cr [+]`) with dynamic bid increments.
  - Auto-Bid toggle switch.
  - Primary gold call-to-action button *"Place Bid"*.

#### 4. Squad Management & Tactical Lineup
- **Top Tabs**: Segmented control `[ Squad | Playing XI | Roles ]`.
- **Visual 2D Pitch XI Display**: 
  - Top-down lush green cricket pitch representation.
  - Interactive player tokens arranged by batting position: Openers (V. Kohli [C], R. Sharma), Middle order (S. Iyer, H. Pandya, R. Jadeja, T. Varma), Wicketkeeper (D. Karthik [WK]), Bowlers (B. Kumar, J. Bumrah, R. Bishnoi, A. Singh).
  - Captaincy `[C]` and Wicketkeeping `[WK]` badges.
- **Team Balance Telemetry**:
  - Four glowing horizontal progress bars: `Batting (92)`, `Bowling (88)`, `All-round (90)`, `Fielding (87)`.

#### 5. Player Profile & Deep Scouting
- **Header**: Circular avatar, Player Name (*Virat Kohli*), Bio (*BAT · 35 yrs · RHB · IND*), high-contrast golden Overall badge (*94 OVR*).
- **Navigation**: `[ Overview | Stats | Career ]`.
- **Tri-Ring Condition Gauges**:
  - `Form`: 94 (Green circular dial).
  - `Morale`: 8/10 (Teal/Green smiley dial).
  - `Fitness`: 100% (Solid green circular meter).
- **Detailed Attributes Matrix (0-100)**:
  - Batting: 94 | Power: 92 | Technique: 95 | Against Spin: 93 | Against Pace: 94
  - Fielding: 88 | Catching: 87 | Fitness: 90 | Leadership: 96 | Experience: 98
- **Footer**: Player Tactical Role (*Top-order Batter*), Market Value (*₹15.00 Cr*).

#### 6. Training & Development
- **Navigation Tabs**: `[ Training | Development | Reports ]`.
- **Atmospheric Visual**: Picturesque green cricket pavilion and net practice ground illustration.
- **Active Training Regimes**:
  - Batting: 12 Players
  - Bowling: 9 Players
  - Fielding: 25 Players
  - Fitness: 25 Players
- **Training Cycle Tracker**: Week progress bar (e.g., *Week 2/4 - 50%*).
- **Tactical Focus Area**: Dropdown (*T20 Match Preparation*).
- **Cycle Outcome**: Overall squad improvement tag (*▲ +2*).

#### 7. Tactics & Strategy
- **Top Tabs**: `[ Match Plan | Batting | Bowling | Field ]`.
- **Macro Strategy Selector**: 3 high-contrast cards:
  - `Attack` (Red / Crossed swords icon - High risk, high boundary intent).
  - `Balanced` (Amber / Sun icon - Adaptive rotation & risk assessment).
  - `Defend` (Blue / Shield icon - Wicket preservation, consolidation).
- **Micro Instruction Dropdowns**:
  - Batting Approach: *"Aggressive with Freedom"*.
  - Bowling Plan: *"Mix with Death Overs Focus"*.
  - Fielding Strategy: *"Standard (T20)"*.
- **Key Focus Checkboxes**: `[✓] Powerplay Advantage`, `[✓] Middle Overs Control`, `[✓] Death Overs Execution`.

#### 8. Match Day (Manager Pre-Match)
- **Header**: Fixture identifier (*T20 League - Match 28*).
- **Team Matchup Clash**: Club Crest BLR (You) vs Club Crest PUN.
- **Environmental Match Conditions**:
  - Pitch Type: *Batting Pitch*
  - Weather: *Clear 28°C*
  - Overs: *20 Overs*
- **Toss Strategy Decision**: Radio group `[ Bat First | Bowl First | Auto ]`.
- **Pre-match Final Strategy**: Quick adjustment tile (*Balanced*).
- **Primary CTA**: Big gold button *"Start Match"*.

#### 9. Match Simulation (Auto 2D Broadcast View)
- **Top HUD**:
  - Current state: *1st Innings*.
  - Main Scorecard: `BLR 75/2 (8.4)`.
  - Current Run Rate (CRR): `8.65` | Partnership: `28 (18)`.
- **2D Stadium & Field Representation**:
  - High-angle top-down oval cricket ground with boundary rope, inner 30-yard fielding ring, 22-yard pitch strip, crease lines.
  - Active 2D sprite representations: Striker and non-striker at wickets, bowler running up, wicketkeeper stationed behind stumps, 9 dynamic fielders positioned tactically.
  - Animated ball trajectory with ground traces and boundary impact effects.
- **Live Match Ticker**:
  - Current Batsmen: `R. Patidar 38 (24)` & `V. Kohli 12 (8)`.
  - Current Bowler: `A. Singh 1/14 (2.4)`.
  - Ball-by-ball commentary bubble: *"8.4 Short of a length... pulled away for FOUR!"*.
- **Manager Live Controls**:
  - `[ Pause / Play ]` toggle.
  - Speed toggles: `[ 1x | 2x | 4x ]`.
  - `[ Auto ]` fast-forward to milestones / end of over.

#### 10. Match Result & Post-Match Review
- **Header**: Fixture outcome: `BLR 186/5 (20.0) VS PUN 172/8 (20.0)`.
- **Victory Banner**: Prominent emerald green badge: *"BLR Won by 14 Runs"*.
- **Player of the Match Spotlight**: Avatar card with Kohli portrait, *76 (47)* statline.
- **Deep Analysis Tabs**: `[ Scorecard | Stats | Report ]`.
- **Action**: Golden CTA *"Continue"*.

#### 11. Leagues & Standings
- **Sub-views**: `[ Fixtures | Table | Playoffs ]`.
- **Points Table Matrix**: Columns `#`, `Team`, `P`, `W`, `L`, `Pts`, `NRR`.
- **Visual Tiering**: Top 4 playoff qualification zone highlighted in rich golden/green tint; clear visual crests and team abbreviation tags.

#### 12. Facilities / Club HQ
- **View Toggles**: `[ Club HQ | National HQ ]`.
- **Campus Isometric Map**: Beautiful interactive 2D isometric sports campus depicting:
  - Stadium (Lv. 4)
  - Academy (Lv. 4)
  - Medical Centre (Lv. 3)
  - Analytics Centre (Lv. 4)
  - Training Nets (Lv. 4)
- **Action**: *"Upgrade Facility"* with level-up requirement and balance impact.

#### 13. Staff Management
- **Department Tabs**: `[ Coaching | Support | Scouting ]`.
- **Staff Roster**: Cards with portraits, specialized roles, tiers, and passive squad buffs:
  - Head Coach: *Tier 5 (Overall +5%)*
  - Batting Coach: *Tier 5 (Batting +6%)*
  - Bowling Coach: *Tier 5 (Bowling +6%)*
  - Fielding Coach: *Tier 4 (Fielding +4%)*
  - Physio: *Tier 4 (Fitness +5%)*
- **Management Actions**: Hire / Replace / Extend contracts.

#### 14. Finances & Budgeting
- **Navigation**: `[ Overview | Revenue | Expenses ]`.
- **High-Level Financial Health**:
  - Current Club Balance: `₹74.00 Cr`.
  - Season Projected Revenue: `₹120.00 Cr`.
- **Ledger Breakdown**:
  - Revenue (YTD): `+₹94.00 Cr` (Broadcasting, Sponsorships, Ticket Sales, Merchandising).
  - Expenses (YTD): `-₹36.00 Cr` (Salaries -₹18.50 Cr, Facilities Upkeep -₹12.00 Cr, Other -₹5.50 Cr).
- **Report CTA**: *"Financial Report"*.

#### 15. Season Hub & Dynasty Transition
- **Header Badge**: `Season 4 / 30` with gleaming golden franchise trophy and celebration stadium lights.
- **Dynasty Menu Navigation**:
  - `Retentions & Releases >` (Contract renewal, releasing deadweight).
  - `Next Season Auction >` (Entering next draft).
  - `Schedule & Calendar >` (Pre-season friendlies, league schedule).
  - `Season Summary >` (Historic record book, honors).
  - `Records & Awards >` (Orange cap, purple cap, MVP records).
- **Primary CTA**: *"Start Next Season"*.

---

## 3. Visual Design System & Color Palette

### Color Palette Specification:

| Design Token | Hex Code | Purpose & Usage |
|---|---|---|
| **`bg-navy-darkest`** | `#080E1A` | Root screen background, canvas surround, extreme dark contrast |
| **`bg-navy-deep`** | `#0C1425` | Base page layer, card container backdrop |
| **`bg-panel-charcoal`** | `#121E36` | Primary card panels, modal sheets, list containers |
| **`bg-panel-subtle`** | `#1A2846` | Active states, hover tiles, secondary card containers |
| **`border-subtle`** | `#1E2D4A` | Card dividers, subtle outline strokes |
| **`gold-primary`** | `#F59E0B` | Primary action buttons, active navigation markers, trophy highlights |
| **`gold-bright`** | `#FBBF24` | Highlights, badges, overall rating pill tags |
| **`gold-glow`** | `rgba(245, 158, 11, 0.25)` | Shadows on active elements, selected cards |
| **`emerald-positive`** | `#10B981` | Positive stats, win banners, profit numbers, high fitness |
| **`red-alert`** | `#EF4444` | Attack tactical state, expense negatives, injury alerts, wickets |
| **`blue-info`** | `#38BDF8` | Informational chips, pitch conditions, defensive tactical state |
| **`text-primary`** | `#FFFFFF` | Primary headers, prominent scores, player names |
| **`text-secondary`** | `#94A3B8` | Subtext, labels, metadata, secondary stats |
| **`text-muted`** | `#64748B` | Disabled states, quiet captions, inactive tabs |

### Typography Rules:
- **Font Stack**: Clean sans-serif system font (`Inter`, `system-ui`, `-apple-system`, `Roboto`, `sans-serif`) with custom letter-spacing for premium feel.
- **Numbers & Readouts**: Use `tabular-nums` on all score tickers, overs, run rates, financial numbers, and attribute meters.
- **Headers**: Uppercase tracking (`tracking-wide` / `tracking-wider`) for screen titles and section categorizers.
- **Stat Badges**: Bold, compact typography inside high-contrast circular or rounded-pill badges.

---

## 4. Architecture & Navigation Structure

```
                  ┌──────────────────────────────────────────┐
                  │              HOME / DASHBOARD            │
                  │  (Continue Career, New Career, Settings) │
                  └─────────────────────┬────────────────────┘
                                        │
                         ┌──────────────┴──────────────┐
                         ▼                             ▼
                 [ CAREER SETUP ]             [ LOAD / SAVE STATE ]
                 (Pick Franchise,             (Persistent DB / Storage)
                  Tournament, Rules)
                         │
                         ▼
        ┌─────────────────────────────────────────────────────────────┐
        │                       MAIN MANAGER HUB                      │
        │                       (Persistent Dock)                     │
        └───────┬──────────┬──────────┬──────────┬──────────┬─────────┘
                │          │          │          │          │
   ┌────────────▼┐  ┌──────▼──────┐ ┌─▼─────────┐ ┌▼────────┴──┐ ┌────▼──────────┐
   │ SQUAD &     │  │ TACTICS &   │ │ MATCH DAY │ │ FACILITIES │ │ FINANCES &    │
   │ ROSTER      │  │ STRATEGY    │ │ & ENGINE  │ │ & STAFF    │ │ AUCTIONS      │
   ├─────────────┤  ├─────────────┤ ├───────────┤ ├────────────┤ ├───────────────┤
   │• Playing XI │  │• Attack/Def │ │• Pre-Match│ │• Campus HQ │ │• Budget       │
   │• Pitch View │  │• Approach   │ │• 2D Sim   │ │• Coaches   │ │• Mega Auction │
   │• Attributes │  │• Death Plan │ │• Live HUD │ │• Physios   │ │• Retentions   │
   │• Profiles   │  │• Fields     │ │• Results  │ │• Scouting  │ │• P&L Ledgers  │
   └─────────────┘  └─────────────┘ └───────────┘ └────────────┘ └───────────────┘
```

---

## 5. Match Engine & 2D Simulation Specification

### Strict Rules:
1. **Managerial Oversight Only**: The human player NEVER executes shots, bowls deliveries, or times a swing.
2. **Pure Simulation Engine**: Every ball is calculated by probabilistic statistical physics matching:
   - Striker Batting Technique + Power + Against Pace/Spin + Current Form vs Bowler Accuracy + Pace/Variation + Pitch Condition + Tactical Strategy.
3. **2D Ground Rendering**:
   - High-fidelity vector/canvas presentation representing a top-down floodlit stadium.
   - Distinct outfield turf rings (30-yard fielding circle, boundary line, grass mowing pattern).
   - Real-time animated ball trajectory with vector easing and trail lines.
   - Dynamic player markers (striker, non-striker, bowler, keeper, 9 fielders).
   - Visual cues for **FOUR**, **SIX**, **WICKET**, and **EXTRA**.
4. **Broadcast HUD**:
   - Real-time runs/wickets, overs, CRR, required run rate (RRR in chase).
   - Current active partnership tracker.
   - Batter scorelines `Runs (Balls)` & Bowler spell `Wickets/Runs (Overs)`.
   - Rich ball-by-ball text commentary ticker.
5. **Manager In-Match Interventions**:
   - Play / Pause simulation.
   - Simulation speed multipliers: `1x`, `2x`, `4x`, `Instant Skip / Sim to Over End`.
   - Mid-innings tactical pivot: switch match intent between *Aggressive*, *Balanced*, *Anchor*, *Contain*.
   - Bowling changes: select which bowler takes the next over based on stamina and economy.
   - Field preset adjustments: *Attacking Slips*, *Ring Field*, *Boundary Defend*.

---

## 6. Training & Development System Specification (Advanced Expansion)

Based on Section 5 of the design prompt, the Training & Development suite expands significantly beyond basic presets:

1. **Individual Player Regimes**:
   - Assign specialized individual focus: Power Hitting, Defensive Technique, Death Bowling, Spin Variations, Slip Catching, Aerobic Stamina.
2. **Positional Training Categories**:
   - Batting Net Practice
   - Pace Bowling Precision
   - Spin Laboratory
   - Fielding Drills & Reflex Testing
   - Physical Conditioning & Rehab
3. **Workload, Fatigue, and Injury Risk Modeling**:
   - Each training intensity level (`Light`, `Moderate`, `Intense`) generates a workload score.
   - Overworking players increases fatigue, reducing match performance and escalating injury probability (e.g., hamstring tear, shoulder strain, stress fracture).
   - Physios and Medical Centre facilities mitigate fatigue decay and speed up recovery times.
4. **Coaching Multipliers**:
   - High-tier specialized coaches (Head Coach, Batting Coach, Bowling Coach, Fielding Coach) provide percentage boost multipliers to attribute growth rates.
5. **Training Progress & Development Reports**:
   - Weekly training cycle logs showing attribute deltas (e.g., `+1 Power`, `+2 Against Spin`).
   - Young prodigy breakthrough events vs veteran attribute degradation curves.

---

## 7. Approved Design Decisions & Constraints

1. **Visual Tone**: Dark Navy & Charcoal with luminous Golden Accents (`#F59E0B`), crisp athletic borders, and mobile ergonomic card touch targets (minimum 44px hit-box).
2. **Zero Arcade Rule**: Absolutely no shot timing wheels, directional batting arrows, manual bowling power bars, or joystick inputs. The integrity of the game relies purely on tactical management depth.
3. **Responsive Android Viewport**: Optimized for high-density Android mobile displays (360px–480px width base) while seamlessly scaling to tablet containers with letterboxed centering.
4. **State Persistence**: Complete career mode state must be serializeable to local storage and persistent database (franchise stats, 30-season history, player attributes, trophies, finances).
5. **Phase Discipline**: Strict adherence to phased implementation — no architectural deviations or unauthorized code writes without explicit prompt instructions.

---

*WICKET DYNASTY DESIGN REFERENCE LOCKED. READY FOR PHASE 00.*
