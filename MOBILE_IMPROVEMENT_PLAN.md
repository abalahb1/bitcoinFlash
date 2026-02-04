# 📱 Mobile UI/UX Audit & Improvement Plan (Bitcoin Flash)

## 🎯 Objective
Optimize the mobile experience to be "App-like", smooth, and visually coherent, eliminating scrolling issues and visual clutter.

## 🔍 Current Issues (Identified)
1. **Scaling Issues:** Elements often feel "too big" or "too close" on mobile screens. (Partially fixed with zoom-out, but needs refinement).
2. **Scrolling Behavior:**
   - Background scrolling when menus are open.
   - "Stiff" or non-native feeling scroll on some lists.
   - Sticky headers/footers sometimes overlap content.
3. **Sidebar/Navigation:** The current sidebar (Sheet) is functional but could be cleaner.
4. **Touch Targets:** Buttons and inputs need to be finger-friendly (min 44px height).
5. **Visual Hierarchy:** Too much information density in cards (e.g., Transactions Log).

## 🛠️ Action Plan

### 1. Viewport & Scaling Optimization (Refinement)
- **Problem:** `initial-scale=0.85` is a "hack" that might cause blurriness or touch target issues.
- **Solution:** Revert to `scale=1` but use `text-xs` and `text-sm` extensively for mobile, and adjust `padding/margin` using Tailwind's responsive prefixes (`p-2 md:p-4`).
- **Action:**
  - Standardize mobile font size to `14px` base.
  - Use tight leading/tracking for compact headers.

### 2. "App-Shell" Layout Fixes
- **Problem:** Double scrollbars or hidden content.
- **Solution:**
  - `body` -> `fixed inset-0 overflow-hidden` (prevent bounce).
  - `main` -> `flex-1 overflow-y-auto overscroll-y-contain` (native-like scroll area).
  - **TopBar** & **BottomNav** (if used) -> Fixed/Sticky with high Z-index.

### 3. Component Mobile-First Design
- **Transaction Cards:**
  - Desktop: Table row.
  - Mobile: Compact Card (stacked info).
  - *Current Implementation:* Already switches to cards, but padding is too generous.
  - **Fix:** Reduce internal padding (`p-3`), smaller badges, use grid layout inside card.
- **Charts/Stats:**
  - Desktop: 4 columns.
  - Mobile: 2x2 Grid or Horizontal Scroll (Carousel).
  - **Fix:** Use `grid-cols-2 gap-2` for stats on mobile.

### 4. Interactive Elements
- **Sheet/Drawer:** Ensure `SheetContent` has `max-h-[100dvh]` and handles virtual keyboard resize correctly.
- **Inputs:** Prevent auto-zoom on focus (ensure font-size >= 16px for inputs specifically, or use `touch-action` manipulation).

### 5. Visual Polish (Glassmorphism on Mobile)
- Reduce blur intensity on mobile (performance cost).
- Use solid/semi-transparent backgrounds for better readability in sunlight.

---

## 🚀 Execution Steps (Immediate)

1. **Reset Viewport:** Remove the `0.85` scale hack (it causes accessibility and layout issues long-term).
2. **Apply "Tight Mode" CSS:** Create a `mobile-tight` utility class that reduces padding/margins globally on small screens.
3. **Fix Scroll Containers:** Ensure only the content area scrolls, not the whole body (prevents "rubber banding" on the header).
4. **Optimize Cards:** Redesign the transaction history card for maximum information density with minimal height.

Shall we proceed with **Step 1 & 2** (Resetting scale and applying proper responsive spacing)? This is the "correct" engineering approach.
