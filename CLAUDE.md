# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**The Unraveller** - A cyberpunk/hacker-themed English learning game where players complete mission scenarios via chat-based interactions. Core mechanic: a "Suspicion Level" meter that increases with poor English responses and decreases with quality answers.

## Development Commands

```bash
npm run dev      # Start Vite dev server (http://localhost:5173)
npm run build    # TypeScript check + production build
npm run lint     # ESLint checks
npm run preview  # Preview production build
```

## Architecture

### Tech Stack
- **React 19 + TypeScript** - Core framework
- **Vite 7** - Build tool and dev server
- **TailwindCSS 3** - Styling with custom cyberpunk theme
- **React Router v7** - Client-side routing
- **Zustand** - State management (lightweight global state)
- **Axios** - HTTP client for API calls
- **Framer Motion** - Animations
- **Lucide React** - Icon library

### API Integration
- **Backend**: ASP.NET API at `http://localhost:5251/api`
- **Endpoints**: Mission, Game/message, Leaderboard
- **Fallback**: Mock data when API is unavailable (see [api.ts](file://C:\Users\shank\Desktop\Unraveller-FrontEnd\src\services\api.ts))

### Key Files

| File | Purpose |
|------|---------|
| [src/App.tsx](file://C:\Users\shank\Desktop\Unraveller-FrontEnd\src\App.tsx) | Router configuration with 10 routes |
| [src/services/api.ts](file://C:\Users\shank\Desktop\Unraveller-FrontEnd\src\services\api.ts) | Axios client + DTOs (MissionDto, DialogueResponseDto, etc.) |
| [src/store/useGameStore.ts](file://C:\Users\shank\Desktop\Unraveller-FrontEnd\src\store\useGameStore.ts) | Zustand store for XP/streak state |
| [tailwind.config.js](file://C:\Users\shank\Desktop\Unraveller-FrontEnd\tailwind.config.js) | Custom theme: navy/card/purple-brand/cyan-brand colors, glow effects |

### Routing Structure

```
/                   → Home (LandingPage)
/auth               → AuthPage
/courses            → Missions (mission selection)
/game/:id           → Game (chat-based scenario)
/result/:id         → Result (performance summary)
/scenario/:id       → ScenarioScreen
/about              → About (team info)
/premium            → Premium
/badges             → Badges
```

### Core Game Flow

1. **Mission Select** ([Missions.tsx](file://C:\Users\shank\Desktop\Unraveller-FrontEnd\src\pages\Missions\Missions.tsx)) - Grid of course cards, API-driven via [getMissions()](file://C:\Users\shank\Desktop\Unraveller-FrontEnd\src\services\api.ts#L43-L46)
2. **Game** ([Game.tsx](file://C:\Users\shank\Desktop\Unraveller-FrontEnd\src\pages\Game\Game.tsx)) - Chat interface with:
   - Suspicion meter ([SuspicionMeter.tsx](file://C:\Users\shank\Desktop\Unraveller-FrontEnd\src\components\game\SuspicionMeter.tsx))
   - Chat history ([ChatHistory.tsx](file://C:\Users\shank\Desktop\Unraveller-FrontEnd\src\components\game\ChatHistory.tsx))
   - NPC responses via [sendGameMessage()](file://C:\Users\shank\Desktop\Unraveller-FrontEnd\src\services\api.ts#L53-L56)
   - Win/lose conditions (suspicion >= 100 = fail, 5 turns = end)
3. **Result** ([Result.tsx](file://C:\Users\shank\Desktop\Unraveller-FrontEnd\src\pages\Result\Result.tsx)) - Summary screen with feedback

### State Management

- **Route-level state**: React Router URLs (`?status=success&xp=150`)
- **Global state**: Zustand [useGameStore](file://C:\Users\shank\Desktop\Unraveller-FrontEnd\src\store\useGameStore.ts) for persistent XP/streak
- **Component state**: Local `useState` for temporary UI/game state

### Design Tokens (tailwind.config.js)

**Colors**: navy (#0f0c1e), navy-2 (#1a1640), card (#2e2a5d), purple-brand (#7c3aed), cyan-brand (#06b6d4), xp-orange (#f59e0b)

**Custom classes**:
- `.app-bg` - Background gradient
- `.ur-card` / `.ur-card-hover` - Card containers
- `.btn`, `.btn-primary`, `.btn-sm` - Button variants
- `.ur-input` - Styled input fields
- `.sus-bar-track` / `.sus-bar-fill` - Suspicion bar
- `.choice-btn` - Game scenario choice buttons

### Common Tasks

**Add new mission**: Update backend API's Mission table; frontend auto-fetches via [getMissions()](file://C:\Users\shank\Desktop\Unraveller-FrontEnd\src\services\api.ts#L43-L46)

**Modify suspicion logic**: Edit [Game.tsx:222](file://C:\Users\shank\Desktop\Unraveller-FrontEnd\src\pages\Game\Game.tsx#L222-L222) (color thresholds) and [Game.tsx:153-157](file://C:\Users\shank\Desktop\Unraveller-FrontEnd\src\pages\Game\Game.tsx#L153-L157) (suspicion updates)

**Add API endpoint**: Extend [api.ts](file://C:\Users\shank\Desktop\Unraveller-FrontEnd\src\services\api.ts) with new method using [apiClient](file://C:\Users\shank\Desktop\Unraveller-FrontEnd\src\services\api.ts#L5-L10)

**Customize theme**: Edit [tailwind.config.js](file://C:\Users\shank\Desktop\Unraveller-FrontEnd\tailwind.config.js) extend section (colors, shadows, animations)