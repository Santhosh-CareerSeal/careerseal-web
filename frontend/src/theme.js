// GRID design system — single source of truth for colors and styles.
// Import what you need:  import { colors, primaryButton, card, input } from '../theme'

export const colors = {
  teal:      '#0D7377',
  tealSoft:  'rgba(13,115,119,0.15)',
  amber:     '#EF9F27',
  amberSoft: 'rgba(239,159,39,0.15)',
  mint:      '#5DCAA5',
  navy:      '#1A3C6E',
  darkBg:    '#060e1f',

  lightBg:   '#f4f5f7',
  card:      '#ffffff',
  border:    '#eeeeee',
  text:      '#1A3C6E',
  textBody:  '#333333',
  textMuted: '#9ca3af',
  danger:    '#dc2626',
  success:   '#0D7377',
}

// Dark front-door page background with brand glows
export const darkPageBg = {
  background: colors.darkBg,
  position: 'relative',
  overflow: 'hidden',
}
export const darkGlow = {
  position: 'absolute', inset: 0,
  background: 'radial-gradient(ellipse at 30% 40%, rgba(13,115,119,0.22), transparent 60%), radial-gradient(ellipse at 75% 60%, rgba(26,60,110,0.32), transparent 60%)',
}

// Light workspace card
export const card = {
  background: colors.card,
  borderRadius: '14px',
  padding: '16px',
  border: `1px solid ${colors.border}`,
}

// Buttons
export const primaryButton = {
  background: colors.teal, color: 'white', border: 'none',
  borderRadius: '10px', padding: '10px 18px',
  fontSize: '13px', fontWeight: 700, cursor: 'pointer',
}
export const secondaryButton = {
  background: colors.amberSoft, color: '#854F0B',
  border: '1px solid rgba(239,159,39,0.3)',
  borderRadius: '10px', padding: '10px 18px',
  fontSize: '13px', fontWeight: 700, cursor: 'pointer',
}
export const ghostButton = {
  background: '#f0f0f0', color: '#555', border: 'none',
  borderRadius: '10px', padding: '10px 18px',
  fontSize: '13px', fontWeight: 600, cursor: 'pointer',
}

// Inputs
export const input = {
  border: '2px solid #f0f0f0', borderRadius: '10px',
  padding: '10px 14px', fontSize: '13px', outline: 'none',
  fontFamily: 'system-ui', width: '100%', boxSizing: 'border-box',
}

// Text helpers
export const pageTitle  = { fontSize: '20px', fontWeight: 700, color: colors.text, margin: '0 0 4px' }
export const pageSubtle = { fontSize: '12px', color: colors.textMuted, margin: 0 }
