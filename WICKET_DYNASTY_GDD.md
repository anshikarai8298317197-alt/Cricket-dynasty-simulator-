# WICKET DYNASTY – GAME DESIGN DOCUMENT (GDD)
**Project Title**: Wicket Dynasty  
**Version**: 1.0.0 (Phase 00 Blueprint)  
**Target Platform**: Android (APK / Mobile Responsive Web Viewport)  
**Orientation**: Portrait-First (9:16 aspect ratio base, scalable tablet support)  
**Genre**: Premium 2D Cricket Franchise Management Simulator  
**Core Gameplay Philosophy**: 100% Manager-Only. Zero Arcade Action.  

---

## 1. Executive Summary & Vision
*WICKET DYNASTY* is a deep, authentic, multi-season cricket franchise management simulation designed specifically for cricket connoisseurs, tactical minds, and management enthusiasts. 

The player steps into the shoes of the Managing Director & Chief Cricket Officer of an elite cricket franchise in premier global T20 leagues. From navigating multi-million-crore mega auctions and assembling a balanced 25-man squad, to establishing elite training facilities, hiring world-class backroom staff, setting match-winning tactical field spreads, and managing player workloads across a grueling 30-season dynasty—every critical macro and micro decision rests in the player's hands.

### The Sacred Manager-Only Rule:
**Under no circumstances does the player directly control a cricketer on the pitch.** 
- There are no batting timing circles, swing gestures, bowling power meters, or fielding dive buttons.
- All on-field cricket action is simulated by an authoritative, deterministic statistical physics engine driven by player ratings, real-time stamina, morale, tactical instructions, pitch decay, and match pressure.
- The manager directs from the dugout: signaling tactical shifts (Attack, Balanced, Defend), rotating bowlers, altering field presets, managing run-rate requirements, and deciding bowling matchups.

---

## 2. Core Gameplay Pillars

### Pillar 1: Total Franchise Ownership
You are accountable for the entire ecosystem:
- **Finance & P&L**: Player payroll, facility upkeep, ticket pricing, sponsorship deals, broadcast revenue, and profit margins.
- **Club Infrastructure**: Upgrading Stadium capacity, Cricket Academy, High-Performance Training Nets, Medical Rehab Centre, and Data Analytics Lab.
- **Backroom Staff**: Scouting networks, specialized batting/bowling/fielding coaches, sports psychologists, and physiotherapists whose tier buffs directly influence player progression and injury recovery.

### Pillar 2: Dynamic Mega & Mini Auctions
An authentic auction room experience mirroring real-world franchise drafts:
- 320-player global pool categorized into Diamond, Gold, Silver, and Bronze tiers.
- Salary cap management (₹100.0 Cr purse), squad size restrictions (18–25 players), and overseas player limits (maximum 8 overseas in squad, maximum 4 in Playing XI).
- Strategic bidding wars with AI franchises that feature distinct owner personalities (Aggressive Spenders, Bargain Hunters, Youth Scouts, Balanced Powerhouses).
- Right-to-Match (RTM) cards and retention dynamics between seasons.

### Pillar 3: Tactical Depth & In-Match Influence
While manager-only, matches are thrilling and responsive:
- Pre-match analysis of pitch conditions (Greentop, Dustbowl, Flat Track, Slow & Low) and atmospheric weather.
- Toss strategy and tactical alignment.
- Live 2D top-down stadium presentation with realistic player positioning, animated ball trajectories, boundary ropes, and live broadcast HUD.
- Mid-match managerial decisions: changing batting tempo (*Conserve Wickets*, *Rotate Strike*, *Accelerate*, *All-Out Attack*), bowler spell allocation, field geometry, and target-defense tactics.

### Pillar 4: Player Development, Fatigue & Sports Science
Players are living athletes, not static cards:
- Comprehensive skill ratings covering Batting, Pace Bowling, Spin Bowling, Fielding, Mental Fortitude, and Physical Fitness.
- Workload management: playing high-intensity matches causes fatigue; overtraining triggers acute injury risks (hamstring tears, stress fractures).
- Meaningful training cycles: tailored individual training vs team drills guided by coach proficiencies.
- Career arc progression: young prodigies blossom through academy training, hit prime peak (ages 26–31), and face physical decline (ages 34+), culminating in retirement at age 40 (with optional rewarded veteran extensions up to age 42).

### Pillar 5: Multi-Season Dynasty & Legacy
- Up to 30 consecutive seasons of competition.
- Historical records: Orange Cap (leading run-scorer), Purple Cap (leading wicket-taker), MVP, Hall of Fame, franchise trophy cabinet.
- Roster turnover, contract renegotiations, aging stars, and newly drafted academy prospects ensuring every season feels fresh and challenging.

---

## 3. Tournament Structure & Regulations

### Standard T20 Franchise League Format:
- **Participating Teams**: 10 Franchises (e.g., Bangalore BLR, Mumbai MI, Chennai CSK, Kolkata KKR, Rajasthan RR, Punjab PUN, Delhi DC, Gujarat GT, Lucknow LSG, Hyderabad SRH).
- **League Stage**: Double round-robin or home/away fixtures (14 to 18 league matches per team).
- **Points Scoring**:
  - Win: 2 Points
  - Tie / No Result: 1 Point
  - Loss: 0 Points
  - Net Run Rate (NRR) tiebreaker: $(Runs\_Scored / Overs\_Faced) - (Runs\_Conceded / Overs\_Bowled)$.
- **Playoffs (Page Playoff System)**:
  - Qualifier 1: Team #1 vs Team #2 (Winner advances directly to Final).
  - Eliminator: Team #3 vs Team #4 (Loser eliminated).
  - Qualifier 2: Loser of Qualifier 1 vs Winner of Eliminator.
  - Grand Final: Winner of Qualifier 1 vs Winner of Qualifier 2.

### Match Playing Regulations:
- 20 overs per side. Maximum 4 overs per bowler.
- Mandatory 6-over Powerplay (maximum 2 fielders outside 30-yard circle).
- Middle overs (overs 7–15): maximum 5 fielders outside the circle.
- Death overs (overs 16–20): tactical boundary defense.
- Free Hit awarded on bowling Front-Foot No-Balls.
- Tied matches resolved via one-over Super Over.

---

## 4. Audio & Presentation Vision
- **Atmospheric Stadium Soundscape**: Procedural audio crowd swells matching match tension (cheering on boundaries, dramatic gasps on plays and misses, roar on wickets, deafening noise during close final overs).
- **Dynamic Commentary System**: Context-sensitive text commentary tickers describing ball delivery length, seam/swing movement, shot selection, fielding efforts, and tactical commentary.
- **Manager Feedback**: Tactile click audio, crisp financial cash-register cues on auction bids, whistle on match start, celebratory trumpet fanfare on trophy presentation.

---

## 5. Offline-First & Privacy Standards
- **Zero Cloud Mandate**: Full single-player offline career mode playable without constant internet connection.
- **Integrity of Progression**: Game state is serialized locally with checksum validation preventing corruption or unauthorized state tampering.
- **No Pay-to-Win**: Authentic sports management simulation where tactical acumen, scouting, and financial discipline dictate championship success.

---
*Signed and Approved for Phase 00 Architecture.*
