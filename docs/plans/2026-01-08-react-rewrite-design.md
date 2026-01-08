# Training App - React + Vite + Tailwind + shadcn Rewrite Design

**Date:** 2026-01-08
**Status:** Approved
**Approach:** Modern refinements while preserving all features

## Overview

Rewrite the Training educational app from Angular 21 to React 18 + Vite + Tailwind + shadcn/ui. The app contains 6 interactive training tools with a dark, modern aesthetic. All features will be preserved with modern improvements to code quality, performance, and user experience.

## Architecture

### Tech Stack
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **React Router v6** for navigation
- **Tailwind CSS** with custom dark theme
- **shadcn/ui** full component install
- **Context API** for state management

### Project Structure
```
src/
├── components/
│   ├── ui/              # shadcn components (Button, Card, Slider, etc.)
│   ├── layout/          # Layout wrapper, Navigation
│   └── timers/          # Timer-specific components (TimerInstance, SequenceBuilder, SequenceTimer)
├── pages/               # One page component per tool
│   ├── Home.tsx
│   ├── Intervall.tsx
│   ├── Farben.tsx
│   ├── Kettenrechner.tsx
│   ├── Timers.tsx
│   ├── SoundCounter.tsx
│   └── Capitals.tsx
├── contexts/            # React contexts
│   └── AudioContext.tsx
├── hooks/               # Custom hooks
│   ├── useAudioService.ts
│   ├── useMicrophone.ts
│   ├── useTimer.ts
│   └── useLocalStorage.ts
├── lib/                 # Utilities
│   ├── audio.ts
│   ├── utils.ts
│   └── data/
│       └── capitals.ts
├── types/               # TypeScript types
│   └── index.ts
└── App.tsx
```

### State Management
- **Context API** for global audio service and shared utilities
- **Local component state** (useState, useReducer) for feature-specific logic
- **Custom hooks** for reusable patterns:
  - `useAudioService` - Web Audio API wrapper
  - `useMicrophone` - MediaDevices API for audio input
  - `useTimer` - Interval/timeout management with cleanup
  - `useLocalStorage` - Persistent state with TypeScript support

### Key Improvements Over Angular Version
- Replace Angular signals with idiomatic React hooks
- Consolidate localStorage logic into type-safe custom hooks
- Better microphone device selection and error handling
- Comprehensive TypeScript types throughout
- Error boundaries for graceful failure handling
- Loading states and skeletons where appropriate
- Better code splitting and lazy loading

## Dark Theme & Styling

### Color Palette
```js
// Tailwind config colors
colors: {
  dark: {
    900: '#0B0E14',  // Darkest background
    800: '#151A23',  // Card background
    700: '#2A3441',  // Hover states
  },
  text: {
    primary: '#F1F5F9',
    secondary: '#94A3B8',
    muted: '#64748B',
  },
  accent: {
    blue: '#3B82F6',
    // ... other accent colors
  }
}
```

### Custom Animations
- `animate-enter` - Fade in with slide up
- `animate-enter-scale` - Scale up entrance
- `animate-celebrate` - Bounce for celebrations
- `btn-press` - Button press effect
- `hover-spring` - Smooth spring hover transition

### shadcn/ui Customization
- Override default theme to match dark aesthetic
- Custom Button variants: default, destructive, ghost
- Custom Card styles with border glow effects
- Slider with custom track and thumb styling
- Dialog/Modal with backdrop blur

## Feature Specifications

### 1. Home Page
**Route:** `/`

**Features:**
- Grid of 6 tool cards (2 columns on desktop, 1 on mobile)
- Each card shows:
  - Colored icon
  - Tool title
  - Description
  - Tags (AUDIO, TRIGGER, etc.)
  - Left accent border with gradient
- Staggered entrance animations (50ms delay per card)
- Hover effects: border glow, icon color change, slight scale
- Click navigates to tool route

**Components:**
- `<Home />` page component
- `<ToolCard />` reusable card component

### 2. Intervall Timer
**Route:** `/intervall`

**Features:**
- Interval adjustment (0.1s - 30s) with +/- buttons and direct input
- Optional auto-stop limit (seconds)
- Volume boost toggle (0.15 vs 0.8)
- Start/Stop button
- Plays beep at each interval using Web Audio API

**State:**
- `intervalSec` - number (persisted)
- `limitSec` - string (persisted)
- `volumeBoost` - boolean (persisted)
- `isRunning` - boolean

**Components:**
- `<Intervall />` page component

### 3. Farben (Stroop Effect Trainer)
**Route:** `/farben`

**Features:**
- **Two modes:**
  - Standard: Timed automatic color changes
  - Sound Control: Color changes on sound trigger
- Background color changes (white, red, blue, green, yellow)
- German color word overlay (optional)
- Microphone input with:
  - Device selection dropdown
  - Live audio level visualization
  - Threshold slider
  - Cooldown slider (100-2000ms)
- Sound counter overlay (large number display)
- Optional beep on color change
- Fullscreen mode
- "Waiting for first sound" overlay in sound mode

**State:**
- `intervalMs` - number (persisted)
- `limitSteps` - number (persisted)
- `playSound` - boolean (persisted)
- `soundControlMode` - boolean (persisted)
- `totalDurationSec` - number (persisted)
- `useSoundCounter` - boolean (persisted)
- `soundThreshold` - number (persisted)
- `soundCooldown` - number (persisted)
- `selectedDeviceId` - string (persisted)
- `currentColor` - ColorKey
- `soundCount` - number
- `currentSoundLevel` - number

**Components:**
- `<Farben />` page component with complex state machine

### 4. Kettenrechner (Chain Calculator)
**Route:** `/kettenrechner`

**Features:**
- Preset levels (e.g., Level 1: 5s speed, 5 steps)
- Manual configuration: speed (1-30s), steps (1+)
- Beep on step toggle
- Game flow:
  1. Config screen
  2. Countdown (3, 2, 1)
  3. Playing: Show operations (+5, -3, etc.)
  4. Pending: User inputs answer via numpad
  5. Result: Show correct answer, celebrate if correct
- Progress bar during game
- Font size adjustment (2-20rem)
- Confetti on correct answer
- Restart/Stop buttons

**State:**
- `speed` - number (persisted)
- `targetSteps` - number (persisted)
- `fontSize` - number (persisted)
- `playBeepOnStep` - boolean (persisted)
- `status` - 'config' | 'playing' | 'pending' | 'result'
- `total` - number
- `history` - string[]
- `userAnswer` - string

**Components:**
- `<Kettenrechner />` page component

**Dependencies:**
- `canvas-confetti` library

### 5. Timers
**Route:** `/timers`

**Features:**
- Two standard timer instances (Custom Timer, Presets)
- Create custom timer sequences with builder
- Save sequences to localStorage
- Each sequence card shows:
  - Title and color
  - Loop count
  - Play/pause/reset controls
  - Delete button
- Builder modal:
  - Add timer steps (duration, label)
  - Loop count setting
  - Save/Cancel
- Add new sequence card (dashed border)

**State:**
- `sequences` - array (persisted)
- `showBuilder` - boolean

**Components:**
- `<Timers />` page component
- `<TimerInstance />` - individual timer
- `<SequenceTimer />` - sequence player
- `<SequenceBuilder />` - modal builder

### 6. Sound Counter
**Route:** `/sound-counter`

**Features:**
- Real-time microphone level visualization
- Threshold slider (1-100)
- Cooldown slider (100-2000ms)
- Config mode: Shows live audio level bar with threshold marker
- Active mode:
  - Large counter display (8rem font)
  - Rate display (triggers/second)
  - Pulse animation on trigger
  - Mini visualizer bar
  - Fullscreen toggle
- Fullscreen mode: 25vw font size counter
- Reset and Stop buttons

**State:**
- `threshold` - number (persisted)
- `cooldown` - number (persisted)
- `status` - 'config' | 'active'
- `viewMode` - 'normal' | 'fullscreen'
- `currentLevel` - number (0-100)
- `count` - number
- `rate` - number (triggers per second)

**Components:**
- `<SoundCounter />` page component

### 7. Capitals Quiz
**Route:** `/capitals`

**Features:**
- Region selection: Europe (47), Asia (15), Americas (12), Africa (12), World Mix (38)
- Speed slider (1-10s per question)
- Steps slider (5-45 questions)
- Game flow:
  - Show country name
  - After speed/2 seconds, reveal capital (with beep)
  - After full speed seconds, next question
- Progress bar
- Step counter (1/10)
- Normal and fullscreen view modes
- Region badge display
- Completion celebration

**State:**
- `speed` - number (persisted)
- `steps` - number (persisted)
- `region` - RegionKey (persisted)
- `status` - 'config' | 'playing' | 'finished'
- `viewMode` - 'normal' | 'fullscreen'
- `currentStep` - number
- `showAnswer` - boolean

**Data:**
- Capitals data with country-capital pairs for each region
- Shuffle algorithm for randomization

**Components:**
- `<Capitals />` page component

## Common Patterns

### Persistence
All tools persist configuration to localStorage:
```ts
// Custom hook pattern
function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
```

### Audio Service
Web Audio API wrapper context:
```ts
interface AudioContextValue {
  playBeep: (freq: number, duration: number, volume?: number) => void;
  resumeContext: () => Promise<void>;
}
```

### Microphone Access
Reusable hook with device selection:
```ts
function useMicrophone() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [level, setLevel] = useState(0);
  const [error, setError] = useState('');

  // ... implementation

  return { devices, selectedDevice, setSelectedDevice, level, error, initAudio, stopAudio };
}
```

### Timer Management
Cleanup on unmount:
```ts
function useTimer(callback: () => void, delay: number | null) {
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(callback, delay);
    return () => clearInterval(id);
  }, [callback, delay]);
}
```

## Implementation Plan

### Phase 1: Project Setup
1. Initialize Vite + React + TypeScript project
2. Configure Tailwind with custom theme
3. Install and configure shadcn/ui (full install)
4. Set up React Router
5. Install dependencies: canvas-confetti, lucide-react
6. Create base project structure

### Phase 2: Shared Infrastructure
1. Create AudioContext and audio service
2. Build custom hooks (useLocalStorage, useMicrophone, useTimer)
3. Implement Layout component with navigation
4. Add custom Tailwind animations
5. Configure TypeScript types

### Phase 3: Home Page
1. Build Home page with tool grid
2. Create ToolCard component
3. Implement routing to all tools

### Phase 4: Tool Implementation (Sequential)
1. **Intervall** - Simple, good starting point
2. **Sound Counter** - Test microphone infrastructure
3. **Farben** - Complex state machine, microphone integration
4. **Capitals** - Data handling, fullscreen patterns
5. **Kettenrechner** - Game flow, confetti integration
6. **Timers** - Most complex, sequence builder

### Phase 5: Polish & Testing
1. Cross-browser testing
2. Mobile responsiveness
3. Accessibility improvements
4. Performance optimization
5. Error boundary implementation

## External Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.22.0",
    "canvas-confetti": "^1.9.2",
    "lucide-react": "^0.344.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.1.0",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35"
  }
}
```

## Migration Considerations

- **No backend required** - Fully client-side app
- **localStorage only** - All persistence is local
- **Web APIs:**
  - Web Audio API for beeps
  - MediaDevices API for microphone
  - Canvas API for confetti
- **Browser support:** Modern browsers with ES2020+ support
- **Mobile:** Touch-friendly, responsive design

## Success Criteria

- All 6 tools fully functional with original features
- Settings persist across sessions
- Audio/microphone features work in Chrome, Firefox, Safari
- Mobile-responsive (320px - 1920px+)
- Dark theme consistent across all pages
- Smooth animations and transitions
- Type-safe codebase with no `any` types
- Clean, maintainable code structure

---

**Next Steps:** Begin implementation with Phase 1 (Project Setup)
