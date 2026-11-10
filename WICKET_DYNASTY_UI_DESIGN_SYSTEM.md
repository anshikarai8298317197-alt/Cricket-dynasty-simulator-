# WICKET DYNASTY – UI DESIGN SYSTEM & COMPONENT SPECIFICATION
**Version**: 1.0.0 (Phase 00 Blueprint)  
**Target Viewport**: Portrait-First Mobile (390px - 430px base, centered container with letterboxing on tablet/desktop)  
**Styling Framework**: Tailwind CSS v4 (@import "tailwindcss")  

---

## 1. Visual Token Palette

### Primary Color Tokens
```css
/* Background Layers */
--color-bg-base: #080E1A;          /* Extreme deep dark navy */
--color-bg-surface: #0C1425;       /* Primary screen canvas */
--color-bg-card: #121E36;          /* Standard card background */
--color-bg-card-hover: #1A2846;    /* Interactive raised card */
--color-bg-card-subtle: #0E182D;   /* Inset well / recessed table */

/* Border & Dividers */
--color-border-subtle: #1E2D4A;    /* Default card stroke */
--color-border-light: #2A3C60;     /* Highlight card stroke */
--color-border-gold: #F59E0B;      /* Active selection border */
--color-border-gold-glow: rgba(245, 158, 11, 0.3);

/* Accent & Action Colors */
--color-gold-primary: #F59E0B;     /* Primary action CTA */
--color-gold-hover: #D97706;       /* Active tap state */
--color-gold-light: #FBBF24;       /* Badges, OVR tags, icons */
--color-gold-dark: #B45309;        /* Gradient low-stop */

/* Semantic Indicators */
--color-positive: #10B981;         /* Green: Wins, Form >80, Profits, Fitness */
--color-negative: #EF4444;         /* Red: Losses, Wickets, Expenses, Injuries */
--color-warning: #F59E0B;          /* Amber: Fatigue alert, Low purse, Caution */
--color-info: #38BDF8;             /* Blue: Information chips, Weather, Pitch */

/* Typography */
--color-text-primary: #FFFFFF;     /* Headings, Scores, Key Metrics */
--color-text-secondary: #94A3B8;   /* Labels, Metadata, Subtitles */
--color-text-muted: #64748B;       /* Inactive tabs, Footers, Captions */
```

---

## 2. Typography Rules & Scales

- **Font Family**: System Sans (`system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`).
- **Scale Breakdown**:
  - `Display / Logo`: `text-2xl font-black tracking-wider uppercase` (Gold gradient text).
  - `Screen Title`: `text-lg font-bold tracking-wide text-white`.
  - `Section Header`: `text-xs font-semibold tracking-widest uppercase text-slate-400`.
  - `Card Title`: `text-sm font-semibold text-white`.
  - `Score & Numbers`: `font-mono text-base font-bold tabular-nums text-white`.
  - `Body / Metadata`: `text-xs text-slate-300 leading-relaxed`.
  - `Badges & Captions`: `text-[10px] font-bold uppercase tracking-wider`.

---

## 3. Core Component Library Specifications

### 1. Rounded Card Container (`ManagerCard`)
- **Structure**:
  ```html
  <div class="bg-[#121E36] border border-[#1E2D4A] rounded-xl p-3.5 shadow-lg relative overflow-hidden">
    <!-- Card Header / Title -->
    <!-- Content Body -->
  </div>
  ```
- **Rules**:
  - Border radius is consistently `rounded-xl` (12px) or `rounded-2xl` (16px) for modals.
  - Never use pure black (`#000000`) or stark white backgrounds.

### 2. Primary Gold Action Button (`ManagerButton`)
- **Structure**:
  ```html
  <button class="w-full py-3 px-4 rounded-xl font-bold text-sm uppercase tracking-wider text-slate-950 bg-gradient-to-r from-[#FBBF24] via-[#F59E0B] to-[#D97706] shadow-[0_4px_14px_rgba(245,158,11,0.35)] active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
    <span>Place Bid</span>
  </button>
  ```
- **Rules**:
  - Minimum touch target height: 48px.
  - Active tap feedback: subtle scale-down (`active:scale-[0.98]`).
  - Text is dark slate (`text-slate-950`) over gold background for maximum contrast.

### 3. Segmented Tab Control (`SegmentedTabs`)
- **Structure**:
  - Dark recessed background pill (`bg-[#0C1425] p-1 rounded-xl border border-[#1E2D4A]`).
  - Inactive item: `text-slate-400 hover:text-white py-1.5 px-3 text-xs font-semibold rounded-lg`.
  - Active item: `bg-[#F59E0B] text-slate-950 shadow py-1.5 px-3 text-xs font-bold rounded-lg`.

### 4. Tri-Gauge Circular Condition Meters (`CircularMeter`)
- **Visuals**: SVG donut circle with circumference stroke-dashoffset.
- **Color Coding**:
  - Form: Emerald green (`#10B981`) ring with numerical value center.
  - Morale: Teal/Yellow (`#14B8A6` / `#FBBF24`) with smiley icon or score.
  - Fitness: Bright green (`#22C55E`) percentage gauge.

### 5. Horizontal Attribute Progress Bar (`StatBar`)
- **Structure**:
  ```html
  <div class="flex items-center justify-between text-xs mb-1">
    <span class="text-slate-300 font-medium">Power</span>
    <span class="font-mono font-bold text-emerald-400">92</span>
  </div>
  <div class="h-2 w-full bg-[#0C1425] rounded-full overflow-hidden border border-[#1E2D4A]">
    <div class="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style="width: 92%"></div>
  </div>
  ```

### 6. Stepper Counter (`StepperInput`)
- Used in Auction Room bidding (`[-] ₹12.50 Cr [+]`):
  - Decrement and Increment buttons: 40px square charcoal buttons (`bg-[#1A2846] text-white hover:bg-[#253860] active:scale-95`).
  - Center value box: `font-mono text-base font-bold text-amber-400 text-center flex-1`.

### 7. Bottom Navigation Dock
- **Structure**:
  - Fixed bottom bar on mobile (`h-16 bg-[#0C1425]/95 backdrop-blur border-t border-[#1E2D4A] flex justify-around items-center px-2 z-50`).
  - Active icon glows with golden underline indicator.
  - Inactive icon in muted slate (`#64748B`).

---

## 4. Mobile Ergonomics & Viewport Constraints

1. **Android Frame Fitting**:
   - The root application container must use:
     ```html
     <div class="min-h-screen bg-[#080E1A] text-white flex justify-center selection:bg-amber-500 selection:text-black">
       <div class="w-full max-w-md min-h-screen bg-[#0C1425] flex flex-col relative shadow-2xl border-x border-[#1E2D4A]/50">
         <!-- Screen Content with Safe Bottom Padding -->
       </div>
     </div>
     ```
2. **Safe Area Insets**:
   - Headers respect top status bar spacing.
   - Fixed footers include padding for Android navigation pills (`pb-safe` / `pb-4`).

---
*UI Design System Complete — Standardized for Phase 00.*
