# WICKET DYNASTY – COMPLETE SCREEN MAP & UI ARCHITECTURE
**Version**: 1.0.0 (Phase 00 Blueprint)  
**Total Screens**: 36 Screens (Zero Decorative Buttons, Full Action Definitions)  

---

## Screen Inventory Index
1. `SCR_01_SPLASH`: Splash Screen
2. `SCR_02_MAIN_DASHBOARD`: Main Dashboard (Home)
3. `SCR_03_NEW_CAREER`: New Career Setup
4. `SCR_04_LOAD_CAREER`: Load Career Slots
5. `SCR_05_FRANCHISE_SELECTION`: Franchise Selection
6. `SCR_06_CAREER_OVERVIEW`: Career Hub & Overview
7. `SCR_07_AUCTION_HUB`: Auction Hub
8. `SCR_08_PLAYER_AUCTION`: Live Player Auction Room
9. `SCR_09_RETENTION_RTM`: Retention & RTM Manager
10. `SCR_10_SQUAD_MANAGEMENT`: Squad Management & Roster
11. `SCR_11_PLAYER_PROFILE`: Player Profile & Attributes
12. `SCR_12_PLAYING_XI`: Playing XI & Pitch Formation
13. `SCR_13_TRAINING_CENTRE`: Training Centre & Schedules
14. `SCR_14_TACTICAL_MANAGEMENT`: Tactical Management & Match Plans
15. `SCR_15_TOURNAMENT_HUB`: Tournament Hub & Schedule
16. `SCR_16_FIXTURES_SCHEDULE`: Fixtures & Schedule List
17. `SCR_17_POINTS_TABLE`: Points Table & Standings
18. `SCR_18_MATCH_PREVIEW`: Match Day Preview & Toss
19. `SCR_19_2D_MATCH_PRESENTATION`: 2D Match Ground Presentation
20. `SCR_20_LIVE_MATCH_SIMULATION`: Live Match Simulation HUD
21. `SCR_21_MATCH_RESULT`: Match Result & Awards
22. `SCR_22_FULL_SCORECARD`: Detailed Full Scorecard
23. `SCR_23_CLUB_HQ`: Club Headquarters & Facilities
24. `SCR_24_STADIUM_MGMT`: Stadium Management & Upgrades
25. `SCR_25_ACADEMY`: Youth Academy & Prodigies
26. `SCR_26_MEDICAL_CENTRE`: Medical Centre & Rehab
27. `SCR_27_SCOUTING_CENTRE`: Scouting Centre & Global Talent
28. `SCR_28_STAFF_COACHES`: Staff & Coaches Management
29. `SCR_29_FINANCES`: Club Finances & P&L Ledgers
30. `SCR_30_SEASON_SUMMARY`: Season Summary & Dynasty Transition
31. `SCR_31_RETIREMENT_MGMT`: Retirement & Veteran Extension
32. `SCR_32_CAREER_RECORDS`: Career Records & Hall of Fame
33. `SCR_33_ACHIEVEMENTS`: Achievements & Trophy Cabinet
34. `SCR_34_SETTINGS`: Game Settings
35. `SCR_35_AUDIO_SETTINGS`: Audio Settings & Volume Mixers
36. `SCR_36_SAVE_LOAD_MGMT`: Save & Backup Management

---

## Detailed Specifications: Screens 1 to 36

### SCR_01: Splash Screen
- **Purpose**: Initial load, asset preloading, audio engine warmup, brand presentation.
- **Main Information**: "WICKET DYNASTY" gold lockup logo, version 1.0.0, loading status.
- **UI Sections**: Center animated logo, bottom progress bar, legal copyright.
- **Buttons & Actions**: Tap anywhere (`SKIP_INTRO`) -> Navigates to `SCR_02_MAIN_DASHBOARD`.
- **Navigation Destination**: `SCR_02_MAIN_DASHBOARD`.
- **Data Required**: App version, storage initialization status.
- **Empty State**: N/A.
- **Error State**: Displays storage failure alert with retry button.

### SCR_02: Main Dashboard (Home)
- **Purpose**: Title screen and primary launchpad for career modes.
- **Main Information**: Franchise trophy artwork, manager silhouette, latest active career summary badge.
- **UI Sections**: Hero banner, primary menu card stack, bottom navigation dock.
- **Buttons & Actions**:
  - `CONTINUE_CAREER`: Resumes latest active career -> Navigates to `SCR_06_CAREER_OVERVIEW`.
  - `NEW_CAREER`: Starts new save -> Navigates to `SCR_03_NEW_CAREER`.
  - `SAVE_GAMES`: Opens slot browser -> Navigates to `SCR_04_LOAD_CAREER`.
  - `SETTINGS`: Configures app -> Navigates to `SCR_34_SETTINGS`.
  - `ACHIEVEMENTS`: Opens trophy cabinet -> Navigates to `SCR_33_ACHIEVEMENTS`.
  - `EVENTS_NEWS`: Opens league news feed modal.
- **Navigation Destination**: Respective screens above.
- **Data Required**: Local save summary (active slot index, franchise name, season number).
- **Empty State**: If no save exists, `CONTINUE_CAREER` is disabled with subtext "No Saved Career Found".
- **Error State**: Storage read error shows dialog to reset local database.

### SCR_03: New Career Setup
- **Purpose**: Configuration of tournament, difficulty, squad mode, and career length.
- **Main Information**: Career Name input, tournament format, squad creation mode, difficulty level, season count.
- **UI Sections**: Text input header, tournament selector carousel, squad mode tabs, difficulty selector, season length toggle, action footer.
- **Buttons & Actions**:
  - `BACK`: Cancels setup -> Navigates to `SCR_02_MAIN_DASHBOARD`.
  - `SELECT_TOURNAMENT_PREV/NEXT`: Cycles through tournament types.
  - `SET_SQUAD_MODE`: Selects `[Auction | Real Squads | Custom]`.
  - `SET_DIFFICULTY`: Selects `[Easy | Normal | Hard | Expert]`.
  - `SET_SEASON_LENGTH`: Selects `[Single (1) | Multi (30)]`.
  - `PICK_FRANCHISE`: Validates name, creates draft state -> Navigates to `SCR_05_FRANCHISE_SELECTION`.
- **Navigation Destination**: `SCR_05_FRANCHISE_SELECTION`.
- **Data Required**: Tournament template catalog.
- **Empty State**: Default career name auto-populated ("Wicket Dynasty Career 1").
- **Error State**: Empty name validation banner: "Please enter a valid career name".

### SCR_04: Load Career Slots
- **Purpose**: Manage multiple saved career profiles.
- **Main Information**: Slot list (1 to 5), franchise logo, season number, current balance, last played timestamp.
- **UI Sections**: Header with back button, scrollable slot cards, delete/export action bar.
- **Buttons & Actions**:
  - `BACK`: Returns to `SCR_02_MAIN_DASHBOARD`.
  - `SELECT_SLOT(id)`: Loads state into memory -> Navigates to `SCR_06_CAREER_OVERVIEW`.
  - `DELETE_SLOT(id)`: Opens confirmation modal, purges record from IndexedDB.
  - `EXPORT_SAVE(id)`: Generates downloadable JSON backup.
- **Navigation Destination**: `SCR_06_CAREER_OVERVIEW`.
- **Data Required**: Saved metadata records for all 5 slots.
- **Empty State**: "Empty Slot — Tap to Start New Career".
- **Error State**: "Save file corrupted or invalid version" alert with recovery option.

### SCR_05: Franchise Selection
- **Purpose**: Choose the franchise to manage throughout the career.
- **Main Information**: 10 League Franchises (Name, City, Primary/Secondary Colors, Stadium, Starting Purse ₹100.0 Cr, Fan Base, Owner Expectations).
- **UI Sections**: Franchise carousel/grid, team info sheet, club prestige meter, confirmation bar.
- **Buttons & Actions**:
  - `BACK`: Returns to `SCR_03_NEW_CAREER`.
  - `SELECT_TEAM(id)`: Highlights team and updates info sheet.
  - `CONFIRM_FRANCHISE`: Finalizes team selection in state -> If Auction mode selected navigates to `SCR_07_AUCTION_HUB`; else navigates to `SCR_10_SQUAD_MANAGEMENT`.
- **Navigation Destination**: `SCR_07_AUCTION_HUB` or `SCR_10_SQUAD_MANAGEMENT`.
- **Data Required**: 10 Franchise master records.
- **Empty State**: N/A (10 teams preloaded).
- **Error State**: N/A.

### SCR_06: Career Overview (Manager Main Hub)
- **Purpose**: Central hub of the active career; display next match, club status, quick shortcuts.
- **Main Information**: Current Season (e.g. Season 1/30), Club Name, Balance, League Table Rank, Upcoming Match Preview, Team Morale.
- **UI Sections**: Top status bar, Next Match hero tile, Quick Navigation Cards (Squad, Training, Tactics, Club HQ, Standings, Finances), Bottom nav bar.
- **Buttons & Actions**:
  - `NEXT_MATCH`: Navigates directly to `SCR_18_MATCH_PREVIEW` for the scheduled opponent.
  - `GOTO_SQUAD`: Navigates to `SCR_10_SQUAD_MANAGEMENT`.
  - `GOTO_TRAINING`: Navigates to `SCR_13_TRAINING_CENTRE`.
  - `GOTO_TACTICS`: Navigates to `SCR_14_TACTICAL_MANAGEMENT`.
  - `GOTO_STANDINGS`: Navigates to `SCR_17_POINTS_TABLE`.
  - `GOTO_CLUB_HQ`: Navigates to `SCR_23_CLUB_HQ`.
  - `GOTO_FINANCES`: Navigates to `SCR_29_FINANCES`.
  - `SETTINGS`: Navigates to `SCR_34_SETTINGS`.
- **Navigation Destination**: Contextual screen based on selection.
- **Data Required**: Current `CareerState` snapshot.
- **Empty State**: If season is complete, `NEXT_MATCH` transitions to "View Season Summary" -> `SCR_30_SEASON_SUMMARY`.
- **Error State**: Invalid fixture triggers schedule regeneration.

### SCR_07: Auction Hub
- **Purpose**: Pre-auction staging area, rules review, and purse breakdown.
- **Main Information**: Purse (₹100.0 Cr), Squad Cap (18–25), Overseas Cap (8), Total registered players count, auction order overview.
- **UI Sections**: Budget summary cards, set nomination schedule, team purse status table, "Enter Auction" CTA.
- **Buttons & Actions**:
  - `BACK`: Returns to `SCR_06_CAREER_OVERVIEW`.
  - `VIEW_RULES`: Opens modal explaining increments, RTM cards, and minimum squad sizes.
  - `VIEW_RETAINED`: Navigates to `SCR_09_RETENTION_RTM`.
  - `START_AUCTION`: Commences live lot bidding -> Navigates to `SCR_08_PLAYER_AUCTION`.
- **Navigation Destination**: `SCR_08_PLAYER_AUCTION`.
- **Data Required**: Auction pool data, 10 franchise purse records.
- **Empty State**: N/A.
- **Error State**: Unbalanced pool displays warning.

### SCR_08: Player Auction (Live Bidding Room)
- **Purpose**: Interactive manager-only live bidding against AI franchises.
- **Main Information**: Current Lot Player Card (Avatar, Role, Country, Base Price, OVR, Key Skills), Highest Bidder, Live Bid Amount, Hammer Countdown, User Team Purse & Remaining Slots.
- **UI Sections**: Top purse ticker, center live lot display, bidding stepper `[-] [₹ Amount] [+]`, auto-bid toggle, bid activity feed.
- **Buttons & Actions**:
  - `PLACE_BID`: Dispatches valid increment bid for user franchise.
  - `PASS_LOT`: Withdraws user from current lot bidding.
  - `TOGGLE_AUTO_BID`: Enables/disables automated bidding up to designated ceiling.
  - `PAUSE_AUCTION`: Halts auction clock for tactical review.
  - `ACCELERATE_AUCTION`: Fast-forwards AI vs AI lots.
- **Navigation Destination**: Automatically transitions lot-to-lot, then to `SCR_10_SQUAD_MANAGEMENT` upon auction completion.
- **Data Required**: Active lot entity, bidding history, 10 franchise AI states.
- **Empty State**: Auction completed -> triggers summary modal.
- **Error State**: Over-budget bid attempt disabled with prompt "Insufficient Purse".

### SCR_09: Retention & RTM Manager
- **Purpose**: Inter-season player retentions and Right-To-Match card tracking.
- **Main Information**: Available RTM cards (up to 2 per franchise), pre-auction retention slots, salary deduction matrix.
- **UI Sections**: Retained player list, available squad pool, budget deduction calculator.
- **Buttons & Actions**:
  - `BACK`: Returns to `SCR_07_AUCTION_HUB`.
  - `RETAIN_PLAYER(id)`: Retains player, deducts standard retention bracket from purse.
  - `RELEASE_PLAYER(id)`: Sends player into general auction pool.
  - `CONFIRM_RETENTIONS`: Finalizes retentions, locks remaining purse.
- **Navigation Destination**: `SCR_07_AUCTION_HUB`.
- **Data Required**: Existing squad roster, contract expiration statuses.
- **Empty State**: Initial career year 1 has no prior contracts if fresh auction selected.
- **Error State**: Exceeding max retention allowance (5 players) blocks confirmation.

### SCR_10: Squad Management & Roster
- **Purpose**: View complete 25-man squad, inspect roles, overseas status, morale, fitness, and market value.
- **Main Information**: Squad list grouped by role (Batters, Wicketkeepers, All-Rounders, Pace Bowlers, Spin Bowlers), team balance bars (Batting, Bowling, All-round, Fielding).
- **UI Sections**: Filter tabs `[All | Bat | Bowl | AR | WK]`, scrollable player cards, team balance summary footer, quick action bar.
- **Buttons & Actions**:
  - `BACK`: Returns to `SCR_06_CAREER_OVERVIEW`.
  - `CLICK_PLAYER(id)`: Navigates to `SCR_11_PLAYER_PROFILE`.
  - `MANAGE_PLAYING_XI`: Navigates to `SCR_12_PLAYING_XI`.
  - `SORT_BY`: Toggles sort (OVR, Form, Fitness, Value, Age).
- **Navigation Destination**: `SCR_11_PLAYER_PROFILE` or `SCR_12_PLAYING_XI`.
- **Data Required**: Franchise player roster array.
- **Empty State**: Squad empty warning with link to auction.
- **Error State**: N/A.

### SCR_11: Player Profile & Deep Attributes
- **Purpose**: Deep analytical breakdown of an individual cricketer.
- **Main Information**: Name, photo, age, batting hand, bowling style, nationality, OVR, Potential, Form (0–100), Morale (0–10), Fitness (0–100%), detailed 15-attribute breakdown, contract terms, career statistics.
- **UI Sections**: Header card, tri-gauge meters (Form, Morale, Fitness), tabs `[Overview | Stats | Career]`, attribute progress bars, contract info tile.
- **Buttons & Actions**:
  - `BACK`: Returns to previous screen (`SCR_10` or `SCR_12`).
  - `ASSIGN_INDIVIDUAL_TRAINING`: Opens training popup.
  - `RENEW_CONTRACT`: Opens contract negotiation sheet.
  - `RELEASE_PLAYER`: Releases player to free agency (with payout).
- **Navigation Destination**: Contextual back, or modal sheets.
- **Data Required**: Selected Player entity.
- **Empty State**: N/A.
- **Error State**: Player not found triggers graceful exit back to squad list.

### SCR_12: Playing XI Selection & Pitch Formation
- **Purpose**: Select match-day starting 11, assign batting order, captain `[C]`, wicketkeeper `[WK]`, and 12th man.
- **Main Information**: 2D green pitch formation display, 11 on-field slots, bench roster, overseas player counter (Max 4/4).
- **UI Sections**: Pitch formation visualizer, bench drawer, team composition telemetry (Batters, Bowlers, All-rounders), validation alert box.
- **Buttons & Actions**:
  - `BACK`: Returns to `SCR_10_SQUAD_MANAGEMENT`.
  - `SWAP_PLAYERS(id1, id2)`: Exchanges on-field slot or replaces with bench player.
  - `SET_CAPTAIN(id)`: Designates team captain (affects team morale/leadership).
  - `SET_KEEPER(id)`: Designates designated wicketkeeper.
  - `AUTO_SELECT_BEST_XI`: Automatically picks highest-rated legal 11 based on pitch type.
  - `CONFIRM_LINEUP`: Validates constraints (11 players, 1 WK, min 5 bowling options, max 4 overseas) -> Saves lineup.
- **Navigation Destination**: `SCR_10_SQUAD_MANAGEMENT` or `SCR_18_MATCH_PREVIEW`.
- **Data Required**: Current roster, current Playing XI IDs.
- **Empty State**: Less than 11 selected displays warning banner.
- **Error State**: Invalid lineup (e.g. 5 overseas players) highlights illegal cards in red and disables confirm.

### SCR_13: Training Centre & Development
- **Purpose**: Manage individual and team training regimens, manage fatigue, and track player attribute growth.
- **Main Information**: Weekly Training Cycle (e.g., Week 2/4), overall squad improvement delta, workload distribution, injury risk tracker.
- **UI Sections**: Scenic pavilion header, 4 training plan cards (Batting, Bowling, Fielding, Fitness), training intensity slider, focus area selector, development report tab.
- **Buttons & Actions**:
  - `BACK`: Returns to `SCR_06_CAREER_OVERVIEW`.
  - `ASSIGN_BATTING_DRILLS`: Assigns selected players to batting net session.
  - `ASSIGN_BOWLING_DRILLS`: Assigns selected players to bowling net session.
  - `ASSIGN_FIELDING_DRILLS`: Sets fielding intensity.
  - `ASSIGN_FITNESS_SESSION`: Sets conditioning regime.
  - `SET_INTENSITY(Light|Moderate|Intense)`: Updates workload/fatigue multipliers.
  - `VIEW_PROGRESS_REPORT`: Opens detailed attribute delta modal.
- **Navigation Destination**: `SCR_06_CAREER_OVERVIEW`.
- **Data Required**: Roster training allocations, coach modifiers, fatigue values.
- **Empty State**: New season reset prompts schedule setup.
- **Error State**: Overworked players (>85 fatigue) display red warning pulse.

### SCR_14: Tactical Management & Match Plans
- **Purpose**: Configure franchise game plan, tempo, bowling rotation, and fielding spreads.
- **Main Information**: Macro strategy cards (Attack, Balanced, Defend), Batting approach, Bowling plan, Fielding strategy, Key tactical focus items.
- **UI Sections**: Tabs `[Match Plan | Batting | Bowling | Field]`, strategy cards with visual icons, dropdown instruction menus, tactical focus checkboxes.
- **Buttons & Actions**:
  - `BACK`: Returns to `SCR_06_CAREER_OVERVIEW`.
  - `SELECT_STRATEGY(Attack|Balanced|Defend)`: Sets primary tactical profile.
  - `SET_BATTING_APPROACH`: Dropdown select (`Conservative`, `Balanced`, `Aggressive with Freedom`, `All-out Attack`).
  - `SET_BOWLING_PLAN`: Dropdown select (`Standard`, `Attack Stumps`, `Death Overs Focus`, `Contain Run Rate`).
  - `SET_FIELDING_STRATEGY`: Dropdown select (`Standard T20`, `Aggressive Slips`, `Boundary Protection`).
  - `SAVE_TACTICS`: Commits tactical matrix to active career state.
- **Navigation Destination**: `SCR_06_CAREER_OVERVIEW` or `SCR_18_MATCH_PREVIEW`.
- **Data Required**: Active tactical matrix.
- **Empty State**: Default balanced presets pre-selected.
- **Error State**: N/A.

### SCR_15: Tournament Hub
- **Purpose**: Overview of the ongoing league campaign, stage progression, and prize money.
- **Main Information**: League logo, current match week, top 4 qualifying playoff cutoff line, current franchise standing.
- **UI Sections**: Stage status stepper, top-4 table teaser, recent results ticker, upcoming matches.
- **Buttons & Actions**:
  - `BACK`: Returns to `SCR_06_CAREER_OVERVIEW`.
  - `VIEW_FULL_TABLE`: Navigates to `SCR_17_POINTS_TABLE`.
  - `VIEW_SCHEDULE`: Navigates to `SCR_16_FIXTURES_SCHEDULE`.
  - `VIEW_PLAYOFF_BRACKET`: Opens playoff bracket modal.
- **Navigation Destination**: `SCR_17_POINTS_TABLE` or `SCR_16_FIXTURES_SCHEDULE`.
- **Data Required**: Tournament entity, current standings, fixtures.
- **Empty State**: Pre-season displays "Tournament starts following Auction".
- **Error State**: N/A.

### SCR_16: Fixtures & Schedule List
- **Purpose**: Complete chronological list of all tournament fixtures.
- **Main Information**: Match numbers, date/match-day, home vs away, stadium venue, result/status.
- **UI Sections**: Filter tabs `[All Matches | My Franchise | Completed | Upcoming]`, scrollable fixture card list.
- **Buttons & Actions**:
  - `BACK`: Returns to `SCR_15_TOURNAMENT_HUB` or `SCR_06_CAREER_OVERVIEW`.
  - `CLICK_COMPLETED_MATCH(id)`: Navigates to `SCR_22_FULL_SCORECARD`.
  - `CLICK_NEXT_MATCH(id)`: If upcoming match involves user franchise, navigates to `SCR_18_MATCH_PREVIEW`.
- **Navigation Destination**: `SCR_22_FULL_SCORECARD` or `SCR_18_MATCH_PREVIEW`.
- **Data Required**: Season fixture array (all 74 matches).
- **Empty State**: Unscheduled season displays "Awaiting Fixture Draw".
- **Error State**: N/A.

### SCR_17: Points Table & Standings
- **Purpose**: Official tournament standings, qualification positions, and NRR statistics.
- **Main Information**: Columns: `# Rank`, `Team Crest & Name`, `P (Played)`, `W (Won)`, `L (Lost)`, `T/NR (Tied/No Result)`, `Pts (Points)`, `NRR (Net Run Rate)`.
- **UI Sections**: Sub-tabs `[Fixtures | Table | Playoffs]`, color-coded table (top 4 in green/gold highlight, bottom 6 in dark slate), NRR explanation tooltip.
- **Buttons & Actions**:
  - `BACK`: Returns to `SCR_06_CAREER_OVERVIEW`.
  - `CLICK_TEAM(id)`: Opens team summary sheet.
  - `VIEW_PLAYOFFS`: Switches tab to playoff bracket.
- **Navigation Destination**: Contextual modal or previous screen.
- **Data Required**: Points table data computed from match outcomes.
- **Empty State**: 0 matches played displays alphabetical seeding.
- **Error State**: N/A.

### SCR_18: Match Preview & Toss
- **Purpose**: Pre-match briefing, venue conditions, toss ceremony, and final lineup check.
- **Main Information**: Fixture title (e.g. *T20 League - Match 28*), Team A vs Team B logos, Pitch condition (Batting/Bowling/Greentop), Weather condition, Toss decision.
- **UI Sections**: Matchup banner, environmental conditions card, toss choice radio group `[Bat First | Bowl First | Auto]`, quick tactic selector, starting 11 verification card, "Start Match" CTA.
- **Buttons & Actions**:
  - `BACK`: Returns to `SCR_06_CAREER_OVERVIEW`.
  - `EDIT_LINEUP`: Navigates to `SCR_12_PLAYING_XI`.
  - `EDIT_TACTICS`: Navigates to `SCR_14_TACTICAL_MANAGEMENT`.
  - `EXECUTE_TOSS`: Simulates coin toss, applies toss decision.
  - `START_MATCH`: Launches match engine -> Navigates to `SCR_19_2D_MATCH_PRESENTATION` & `SCR_20_LIVE_MATCH_SIMULATION`.
- **Navigation Destination**: `SCR_19_2D_MATCH_PRESENTATION`.
- **Data Required**: Upcoming fixture record, both teams' Playing XIs.
- **Empty State**: N/A.
- **Error State**: Incomplete Playing XI disables `START_MATCH` button with warning.

### SCR_19: 2D Match Presentation (Visual Canvas)
- **Purpose**: Top-down 2D canvas stadium rendering cricket action, player sprites, pitch, and ball physics.
- **Main Information**: Floodlit 2D cricket oval, boundary ropes, 30-yard circle, pitch strip, wickets, animated bowler, batsman, fielders, and ball trajectory trails.
- **UI Sections**: Canvas container (top 60% of viewport), boundary hit particle effects, dismissal animations.
- **Buttons & Actions**: Integrates with SCR_20 overlays; tap on fielders opens field placement editor.
- **Navigation Destination**: Sub-view paired with `SCR_20_LIVE_MATCH_SIMULATION`.
- **Data Required**: Emitted `BallEvent` frames from simulation engine.
- **Empty State**: Awaiting first delivery.
- **Error State**: WebGL/Canvas context loss triggers graceful 2D canvas recovery.

### SCR_20: Live Match Simulation HUD (Manager Console)
- **Purpose**: Live scoreboard, ball commentary ticker, and manager-only in-game speed/tactical controls.
- **Main Information**: Score (`BLR 75/2`), Overs (`8.4`), CRR (`8.65`), Required RR (if chasing), Active Striker & Non-Striker stats, Active Bowler spell, Ball-by-ball commentary text.
- **UI Sections**: Top broadcast score banner, middle mini commentary feed, bottom manager control bar.
- **Buttons & Actions**:
  - `PLAY_PAUSE`: Pauses or resumes simulation ticks.
  - `SET_SPEED(1x|2x|4x)`: Adjusts animation playback rate.
  - `AUTO_SKIP`: Simulates rest of over or match instantly.
  - `CHANGE_TACTIC`: Opens tactical adjustment sheet (Aggressive/Balanced/Defensive).
  - `ROTATE_BOWLER`: Opens bowler selection sheet for next over.
- **Navigation Destination**: Automatically transitions to `SCR_21_MATCH_RESULT` on 2nd innings completion.
- **Data Required**: Real-time match simulation state.
- **Empty State**: N/A.
- **Error State**: Sim engine stall recovered via step tick fallback.

### SCR_21: Match Result & Post-Match Awards
- **Purpose**: End-of-match celebration, summary outcome, and Player of the Match honors.
- **Main Information**: Final scores of both innings, outcome statement (e.g., *"BLR Won by 14 Runs"*), Player of the Match card (photo, performance stats), MVP points.
- **UI Sections**: Top score card comparison, victory banner, MVP card, quick action tabs `[Scorecard | Stats | Report]`, "Continue" CTA.
- **Buttons & Actions**:
  - `VIEW_FULL_SCORECARD`: Navigates to `SCR_22_FULL_SCORECARD`.
  - `CONTINUE`: Updates league points table, player career stats, franchise finances -> Navigates to `SCR_06_CAREER_OVERVIEW`.
- **Navigation Destination**: `SCR_22_FULL_SCORECARD` or `SCR_06_CAREER_OVERVIEW`.
- **Data Required**: Completed match record, MVP algorithm calculations.
- **Empty State**: N/A.
- **Error State**: State save failure alerts player before navigating.

### SCR_22: Full Scorecard
- **Purpose**: Comprehensive statistical record of both innings.
- **Main Information**: Both teams' batting cards (Batter, Dismissal mode, Bowler, Fielder, R, B, 4s, 6s, SR), Extras breakdown, Total score, Bowling cards (Bowler, O, M, R, W, Econ, Dots), Fall of Wickets.
- **UI Sections**: Inning 1 / Inning 2 switcher tabs, batting card table, bowling card table, partnership graph.
- **Buttons & Actions**:
  - `BACK`: Returns to `SCR_21_MATCH_RESULT` or `SCR_16_FIXTURES_SCHEDULE`.
  - `SHARE_SCORECARD`: Copies scorecard text summary to clipboard.
- **Navigation Destination**: Contextual back.
- **Data Required**: Full match box score data.
- **Empty State**: N/A.
- **Error State**: N/A.

### SCR_23: Club Headquarters & Campus
- **Purpose**: Visual management of the franchise's real estate, infrastructure, and facilities.
- **Main Information**: Isometric 2D sports campus map depicting Stadium (Lv. 4), Academy (Lv. 4), Medical Centre (Lv. 3), Analytics Lab (Lv. 4), and Training Nets (Lv. 4).
- **UI Sections**: Sub-tabs `[Club HQ | National HQ]`, campus visualizer, facility detail sheet, "Upgrade Facility" CTA.
- **Buttons & Actions**:
  - `BACK`: Returns to `SCR_06_CAREER_OVERVIEW`.
  - `SELECT_FACILITY(id)`: Focuses facility node, updates upgrade requirements.
  - `UPGRADE_FACILITY(id)`: Verifies purse balance, starts upgrade -> Deducts funds, elevates facility level.
  - `GOTO_STADIUM`: Navigates to `SCR_24_STADIUM_MGMT`.
  - `GOTO_ACADEMY`: Navigates to `SCR_25_ACADEMY`.
  - `GOTO_MEDICAL`: Navigates to `SCR_26_MEDICAL_CENTRE`.
  - `GOTO_SCOUTING`: Navigates to `SCR_27_SCOUTING_CENTRE`.
- **Navigation Destination**: Dedicated facility screens.
- **Data Required**: Facility levels, upgrade pricing curves, franchise balance.
- **Empty State**: N/A.
- **Error State**: Insufficient funds disables upgrade button.

### SCR_24: Stadium Management & Upgrades
- **Purpose**: Expand stadium seating capacity, upgrade luxury corporate boxes, optimize ticket pricing.
- **Main Information**: Current Capacity (e.g. 45,000 seats), Ticket Price (₹800/seat), Matchday Revenue average, Pitch curation quality.
- **UI Sections**: Stadium graphic, capacity upgrade tiers, ticket price slider, pitch maintenance controls.
- **Buttons & Actions**:
  - `BACK`: Returns to `SCR_23_CLUB_HQ`.
  - `UPGRADE_SEATING`: Expands capacity (requires capital).
  - `SET_TICKET_PRICE(val)`: Adjusts pricing (affects attendance % based on fan enthusiasm).
  - `RELAY_PITCH(type)`: Instructs head groundsman to prepare preferred home pitch type (Greentop, Spin, Batting).
- **Navigation Destination**: `SCR_23_CLUB_HQ`.
- **Data Required**: Stadium stats, historical attendance, franchise funds.
- **Empty State**: Max level reached displays "World-Class Stadium Reached".
- **Error State**: N/A.

### SCR_25: Youth Academy & Prodigies
- **Purpose**: Scout and develop homegrown young cricket talents.
- **Main Information**: Academy Tier, enrolled youth talents (ages 16–19), scout reports, potential ratings (⭐⭐⭐⭐⭐).
- **UI Sections**: Academy roster, youth prospect cards, coach assignment selector, "Promote to Senior Squad" button.
- **Buttons & Actions**:
  - `BACK`: Returns to `SCR_23_CLUB_HQ`.
  - `PROMOTE_TO_SENIOR(id)`: Promotes youth player to main 25-man squad (if slot available).
  - `SCOUT_REGIONAL_TRIAL`: Spends funds to unearth new youth prospects.
- **Navigation Destination**: `SCR_23_CLUB_HQ` or `SCR_10_SQUAD_MANAGEMENT`.
- **Data Required**: Academy youth pool, senior squad slot availability.
- **Empty State**: "No active youth prospects. Commission a regional trial."
- **Error State**: Squad full (25/25) blocks promotion with alert.

### SCR_26: Medical Centre & Rehabilitation
- **Purpose**: Monitor squad physical wellness, treat injuries, and accelerate recovery times.
- **Main Information**: Squad injury list, rehabilitation progress bars (Days remaining), Head Physio rating, injury prevention bonus.
- **UI Sections**: Injured player cards, medical equipment tier, recovery accelerator options.
- **Buttons & Actions**:
  - `BACK`: Returns to `SCR_23_CLUB_HQ`.
  - `FAST_TRACK_REHAB(id)`: Spends medical funds on specialized surgery/physio to cut recovery days by 50%.
  - `HIRE_PHYSIO`: Navigates to `SCR_28_STAFF_COACHES`.
- **Navigation Destination**: `SCR_23_CLUB_HQ` or `SCR_28_STAFF_COACHES`.
- **Data Required**: Injured players list, rehabilitation timelines.
- **Empty State**: "Clean Bill of Health — All players are fit and available!"
- **Error State**: N/A.

### SCR_27: Scouting Centre & Global Talent
- **Purpose**: Deploy scouts globally to discover hidden gems, overseas prospects, and monitor rival players.
- **Main Information**: Active scouting missions (Domestic, Caribbean, England, Australia, South Africa, Asia), scout accuracy level, discovered player dossiers.
- **UI Sections**: World map scouting sectors, scout assignments, scouted player list.
- **Buttons & Actions**:
  - `BACK`: Returns to `SCR_23_CLUB_HQ`.
  - `DISPATCH_SCOUT(region)`: Starts scouting mission for chosen duration.
  - `INSPECT_DOSSIER(id)`: Reveals hidden player potential and weakness tags.
- **Navigation Destination**: `SCR_23_CLUB_HQ`.
- **Data Required**: Scouting missions list, unlocked scout reports.
- **Empty State**: "No active missions. Dispatch scouts before the next auction."
- **Error State**: N/A.

### SCR_28: Staff & Coaches Management
- **Purpose**: Hire, evaluate, and upgrade coaching and support staff.
- **Main Information**: Staff slots: Head Coach, Batting Coach, Bowling Coach, Fielding Coach, Head Physio, Performance Analyst; Tier ratings (Tier 1–5), passive squad bonuses.
- **UI Sections**: Tabs `[Coaching | Support | Scouting]`, staff profile cards, available candidate market, hire/terminate buttons.
- **Buttons & Actions**:
  - `BACK`: Returns to `SCR_06_CAREER_OVERVIEW`.
  - `REPLACE_STAFF(role)`: Opens candidate pool for role.
  - `UPGRADE_CONTRACT(id)`: Increases salary to level up coach tier.
  - `FIRE_STAFF(id)`: Vacates role, pays severance.
- **Navigation Destination**: `SCR_06_CAREER_OVERVIEW`.
- **Data Required**: Active staff roster, free agent staff market.
- **Empty State**: Vacant position displays "Position Open — Hire Coach".
- **Error State**: Insufficient funds blocks hiring.

### SCR_29: Club Finances & P&L Ledgers
- **Purpose**: Complete financial accounting, cash flow, revenue streams, and payroll audits.
- **Main Information**: Current Cash Balance (`₹74.00 Cr`), Season Projected Revenue (`₹120.00 Cr`), Net Profit/Loss, Breakdown of Revenue (Broadcast, Sponsorships, Gate, Merchandising) vs Expenses (Salaries, Facilities Upkeep, Staff, Scouting, Medical).
- **UI Sections**: Financial overview card, revenue/expense toggle tabs, itemized line items, seasonal financial health graph.
- **Buttons & Actions**:
  - `BACK`: Returns to `SCR_06_CAREER_OVERVIEW`.
  - `VIEW_SPONSORSHIPS`: Opens sponsorship contract offers modal.
  - `EXPORT_FINANCIAL_REPORT`: Displays annual audited P&L statement.
- **Navigation Destination**: `SCR_06_CAREER_OVERVIEW`.
- **Data Required**: Detailed franchise finance ledger.
- **Empty State**: N/A.
- **Error State**: Negative balance triggers Board Warning and bankruptcy risk countdown.

### SCR_30: Season Summary & Dynasty Transition
- **Purpose**: Conclude current season, award league trophies, record historical stats, and transition to next year.
- **Main Information**: Champion franchise, Orange Cap winner, Purple Cap winner, Season MVP, Franchise performance review, Board approval rating.
- **UI Sections**: Season trophy hero graphic, awards carousel, season financial surplus report, "Start Next Season" primary CTA.
- **Buttons & Actions**:
  - `VIEW_HONORS_BOARD`: Opens records book -> `SCR_32_CAREER_RECORDS`.
  - `START_NEXT_SEASON`: Triggers player aging, contract renewals, releases -> Navigates to `SCR_31_RETIREMENT_MGMT` or `SCR_07_AUCTION_HUB`.
- **Navigation Destination**: `SCR_31_RETIREMENT_MGMT`.
- **Data Required**: Completed season statistics and honors.
- **Empty State**: N/A.
- **Error State**: Incomplete fixtures blocks season transition.

### SCR_31: Retirement Management & Veteran Extensions
- **Purpose**: Manage players reaching retirement age (age 40), offer rewarded optional extensions up to age 42.
- **Main Information**: List of retiring players, years of service, legacy stats, optional extension status (Max 2 extensions allowed per player).
- **UI Sections**: Retiring legend tribute cards, "Induct to Hall of Fame" button, "Offer 1-Year Veteran Extension" button.
- **Buttons & Actions**:
  - `INDUCT_HALL_OF_FAME(id)`: Adds player to franchise Hall of Fame.
  - `OFFER_VETERAN_EXTENSION(id)`: Consumes extension quota, keeps player active for 1 more season (max age 42).
  - `PROCEED_TO_AUCTION`: Advances career state to next season auction -> `SCR_07_AUCTION_HUB`.
- **Navigation Destination**: `SCR_07_AUCTION_HUB`.
- **Data Required**: Retiring player records.
- **Empty State**: "No retiring players this season." -> Auto-proceeds to next step.
- **Error State**: Player already aged 42 cannot be extended further.

### SCR_32: Career Records & Hall of Fame
- **Purpose**: Historical encyclopedia of league and franchise records across up to 30 seasons.
- **Main Information**: Highest individual scores, most career runs, most career wickets, highest team totals, lowest team totals, all-time trophy winners.
- **UI Sections**: Record category tabs `[Batting | Bowling | Team | Franchise]`, top 10 leaderboard entries.
- **Buttons & Actions**:
  - `BACK`: Returns to `SCR_06_CAREER_OVERVIEW` or `SCR_30_SEASON_SUMMARY`.
  - `FILTER_BY_SEASON`: Filter records by specific season or all-time.
- **Navigation Destination**: Contextual back.
- **Data Required**: Global career historical database.
- **Empty State**: Year 1 displays "Historical records will compile as matches conclude".
- **Error State**: N/A.

### SCR_33: Achievements & Trophy Cabinet
- **Purpose**: Player milestone achievements and franchise trophy display.
- **Main Information**: Trophies won (T20 League Champions, Runners-Up, Fair Play Trophy), unlockable badges (e.g., "Mega Auction Maestro", "Invincible Season", "Triple Century Milestone").
- **UI Sections**: 3D-styled trophy cabinet shelf, achievement card grid with progress bars and unlocked stamps.
- **Buttons & Actions**:
  - `BACK`: Returns to `SCR_02_MAIN_DASHBOARD` or `SCR_06_CAREER_OVERVIEW`.
  - `INSPECT_TROPHY(id)`: Opens 3D/2D trophy inspection card with season date and winning Playing XI.
- **Navigation Destination**: Contextual back.
- **Data Required**: Achievements unlock list, franchise trophy history.
- **Empty State**: Empty cabinet with encouragement message: "Win your first championship to display your silverware here."
- **Error State**: N/A.

### SCR_34: Game Settings
- **Purpose**: General game preferences, display options, simulation speeds, and credits.
- **Main Information**: Match simulation text speed slider, graphics quality, battery saver mode, developer credits, version info.
- **UI Sections**: Settings category tiles, toggles, sliders, legal links.
- **Buttons & Actions**:
  - `BACK`: Returns to caller screen.
  - `AUDIO_SETTINGS`: Navigates to `SCR_35_AUDIO_SETTINGS`.
  - `SAVE_MANAGEMENT`: Navigates to `SCR_36_SAVE_LOAD_MGMT`.
  - `TOGGLE_BATTERY_SAVER`: Caps rendering at 30fps to conserve battery.
  - `RESET_CAREER_DATA`: Prompts double-confirmation modal to clear data.
- **Navigation Destination**: `SCR_35_AUDIO_SETTINGS` or `SCR_36_SAVE_LOAD_MGMT`.
- **Data Required**: App settings entity.
- **Empty State**: N/A.
- **Error State**: N/A.

### SCR_35: Audio Settings & Volume Mixers
- **Purpose**: Granular control over sound channels and audio feedback.
- **Main Information**: Master Volume, Commentary Volume, Crowd Ambience Volume, Match Sound Effects (SFX), UI Click Sounds, Mute All toggle.
- **UI Sections**: 5 horizontal slider tracks with live preview audio ticks, Mute switch.
- **Buttons & Actions**:
  - `BACK`: Returns to `SCR_34_SETTINGS`.
  - `SET_VOLUME(channel, val)`: Updates gain node in Audio Manager, plays sample preview.
  - `TOGGLE_MUTE`: Instantly mutes/unmutes master output.
- **Navigation Destination**: `SCR_34_SETTINGS`.
- **Data Required**: Audio channel gain values.
- **Empty State**: N/A.
- **Error State**: AudioContext block detected prompts "Tap screen to enable audio".

### SCR_36: Save & Backup Management
- **Purpose**: Explicit manual saving, export/import of career files, and integrity verification.
- **Main Information**: Active save slot status, last saved timestamp, checksum verification badge, auto-save status.
- **UI Sections**: Slot status card, "Save Now" primary button, "Export Save File (JSON)" button, "Import Save File" button.
- **Buttons & Actions**:
  - `BACK`: Returns to `SCR_34_SETTINGS`.
  - `SAVE_NOW`: Forces synchronous dump of `CareerState` into IndexedDB with success toast.
  - `EXPORT_FILE`: Generates downloaded `.dynasty` save payload.
  - `IMPORT_FILE`: Uploads and parses valid `.dynasty` save file with schema check.
- **Navigation Destination**: `SCR_34_SETTINGS`.
- **Data Required**: Storage metadata and active state.
- **Empty State**: N/A.
- **Error State**: Invalid JSON payload rejected with error alert.

---
*Screen Map Complete — 36 Screens fully defined with zero non-functional buttons.*
