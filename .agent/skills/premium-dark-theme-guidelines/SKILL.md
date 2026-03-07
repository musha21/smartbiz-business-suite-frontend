---
name: premium-dark-theme-guidelines
description: Guidelines for building and maintaining the "SmartBiz" premium dark theme. Use this when creating or updating any frontend components or pages in the SmartBiz web applications (Admin or Owner) to ensure a consistent, high-end, glassmorphic aesthetic.
---

# Premium Dark Theme Guidelines

This skill defines the visual language, component patterns, and animation standards for the SmartBiz premium dark theme.

## 1. Core Visual Language

### Color Palette
- **Primary Background**: `#0c0d10` (Deep obsidian)
- **Secondary Background/Cards**: `#15161c` (Elevated dark)
- **Elevated Surfaces**: `#1a1b24` (Focus state background)
- **Borders**: `white/5` (Subtle 5% white opacity)
- **Text (Primary)**: `white` (or `slate-300` for body)
- **Text (Muted)**: `slate-500` or `slate-600`
- **Accent Colors**:
  - Indigo: `#6366f1` (Primary Actions, active states)
  - Emerald: `#10b981` (Success, health, stable)
  - Rose: `#f43f5e` (Danger, restricted, isolated)
  - Amber: `#f59e0b` (Warnings, pending states)

### Typography
- **Primary Font**: 'Outfit', sans-serif.
- **Header Styles**: 
  - Use `font-black text-white italic uppercase tracking-tighter`.
  - Prefer responsive large sizes (e.g., `text-5xl` for page titles).
- **Sub-headers/Labels**:
  - Use `text-[10px] font-black uppercase tracking-[0.2em] text-slate-600`.

## 2. Component Patterns

### Glassmorphic Cards
- Background: `bg-[#15161c]`
- Border: `border border-white/5`
- Radius: `rounded-[32px]` or `rounded-[40px]`
- Interaction: `hover:bg-[#1a1b24] transition-all duration-300`

### Tables (DataTable)
- Container: `bg-[#15161c] border border-white/5 rounded-[32px] overflow-hidden`
- Headers: `text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]`
- Rows: Subtle borders `border-b border-white/03` and hover effect `hover:bg-white/[0.01]`

### Forms & Inputs
- Inputs: `bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-slate-700 focus:ring-1 focus:ring-indigo-500/50`
- Labels: `text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2`

### Modals
- Use the `dark` prop for the custom `Modal` component.
- Background: `#15161c`
- Header: Italic uppercase titles.
- Backdrop: `bg-black/80 backdrop-blur-md`

## 3. Motion & Animation

### Entry Animations
Every page entry should use:
- `animate-in fade-in slide-in-from-bottom-8 duration-700`

### Micro-interactions
- **Buttons**: `active:scale-95 transition-all`
- **Hover Effects**: 
  - Scale effects: `group-hover:scale-110` for icons inside cards.
  - Slide effects: `translate-x-4 group-hover:translate-x-0` for action buttons revealing on hover.

## 4. Icons
- Use `lucide-react` icons.
- Primary color for icons should be an accent color (e.g., `indigo-500`) with a low-opacity background (`bg-indigo-500/10`).
- Icon size should be consistent (usually 18-24px depending on context).
