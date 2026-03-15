// ── The Notebook — Design System ──────────────────────────────────────────────
// Central color palette and design tokens.
// Import this file anywhere you need consistent styling.

export const THEME = {
  // Core palette
  color: {
    black:       "#111111",   // Primary text, header
    offWhite:    "#faf9f7",   // Page background
    white:       "#ffffff",   // Cards, sidebar, modals
    beige:       "#f0ede8",   // Subtle surfaces, dividers
    border:      "#ebebeb",   // Standard borders

    // Accent — Terracotta / Rust
    accent:      "#b5522b",   // Hamburger icon, sidebar highlights, CTAs
    accentLight: "#f5ede9",   // Accent backgrounds (pills, hover states)
    accentMid:   "#d4714a",   // Hover state of accent elements

    // Text hierarchy
    textPrimary:   "#111111",
    textSecondary: "#555555",
    textMuted:     "#999999",
    textFaint:     "#bbbbbb",

    // Status
    publicGreen:   "#1a6b3c",
    publicBg:      "#e6f4ed",
    privateGray:   "#888888",
    privateBg:     "#f2f2f2",
  },

  // Typography
  font: {
    serif:  "Georgia, 'Times New Roman', serif",
    sans:   "system-ui, -apple-system, sans-serif",
  },

  // Spacing scale (px)
  space: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 40,
    xxl: 64,
  },

  // Border radii
  radius: {
    sm:   6,
    md:   10,
    lg:   14,
    pill: 999,
  },

  // Shadows
  shadow: {
    card:   "0 1px 4px rgba(0,0,0,.04)",
    hover:  "0 8px 28px rgba(0,0,0,.09)",
    modal:  "0 24px 64px rgba(0,0,0,.2)",
    sidebar:"4px 0 24px rgba(0,0,0,.08)",
  },
};

// Topic colors — kept here as single source of truth
export const TOPIC_COLORS = {
  "Energy":          "#6b4c1a",
  "Technology":      "#1a3a6b",
  "Markets":         "#1a6b3c",
  "Consumer Trends": "#4c1a6b",
  "Environment":     "#2d6b1a",
  "Deep Dive":       "#111111",
  "Other":           "#555555",
};

// Region colors
export const REGION_COLORS = {
  "Africa":       "#b45309",
  "Americas":     "#0369a1",
  "Asia-Pacific": "#7c3aed",
  "Europe":       "#0f766e",
  "Middle East":  "#b91c1c",
  "Global":       "#6b7280",
};