# Micro-Habit-Tracker (Neo-Brutalism Edition)

Ein fokussierter, radikal reduzierter Micro-Habit-Tracker für iOS und Android (React Native mit Expo), konzipiert mit minimalistischer Neo-Brutalist-Ästhetik, klaren Konturen, Monospace-Zahlen und einem monatlichen Konsistenz-Score anstelle demoralisierender Streaks.

## User Review & Critical Decisions

> [!IMPORTANT]
> Basierend auf deinem Feedback wurden die folgenden Kernentscheidungen für die Applikation und das MVP festgelegt:

- **Confirmed Decision 1 (Tech-Stack & Plattform)**: React Native mit Expo für iOS & Android. Im Entwicklungs-Applet bauen wir eine vollwertige, interaktive mobile Simulationsumgebung (inklusive interaktivem Home-Screen-Widget-Simulator) sowie die produktionsreife modulare Code-Architektur für Expo (`expo-sqlite`, `expo-haptics`, `react-native-mmkv`).
- **Confirmed Decision 2 (Streak-Philosophie)**: Keine herkömmlichen Streaks und kein Reset auf 0. Stattdessen ein motivierender monatlicher Konsistenz-Score (z. B. "84% im Oktober" als 30-Tage-Dot-Matrix), der Verzeihlichkeit fördert und Reibung eliminiert.
- **Confirmed Decision 3 (Visueller Stil)**: Minimalistischer Neo-Brutalismus: Klare 2px-Konturen, markante Box-Schatten (`3px 3px 0px #000`), Monospace-Zahlen (`tabular-nums`), Cream-Canvas (`#F7F7F5`) und ein elektrisierender Akzent (z. B. Neon-Lime `#D6F32F` oder starkes Signal-Schwarz).

---

## 1. Overview & Core Concept

- **Was die App tut**: Nutzer verankern ultrakleine 60-Sekunden-Aktionen (z. B. *„1 Seite lesen“*, *„1 Glas Wasser trinken“*, *„1 Minute dehnen“*) ohne mentale Hürde im Alltag.
- **Zielgruppe**: Menschen mit hohem Fokusbedarf und wenig Zeit, die herkömmliche Habit-Tracker als überfrachtet, aufwendig oder frustrierend (durch abgebrochene Streaks) empfinden.
- **Kernwert**: 1-Tap-Completion in unter 1 Sekunde; zero friction; psychologisch motivierendes Konsistenz-Tracking statt Bestrafung.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Daily 1-Tap Flow (Haupt-Screen)**:
   - Der Nutzer sieht die aktive Liste des heutigen Tages (max. 3–5 Micro-Habits).
   - Ein einfacher Tap auf das markante Kontrollfeld markiert den Habit sofort als erledigt.
   - Haptisches Feedback (subtiles Klacken) + sofortige farbliche Invertierung der Checkbox.
   - Eine 4-Sekunden-Undo-Leiste erlaubt fehlerfreie Sofort-Korrektur ohne Bestätigungsdialoge.
2. **Monatlicher Konsistenz-Scan**:
   - Direkt über oder unter der Liste: Eine kompakte 30-Tage-Rastermatrix mit Monospace-Tageszahlen.
   - Der Konsistenz-Score (z. B. `26 / 31 Tage · 84%`) belohnt jede einzelne Ausführung, ohne dass ein vergessener Tag den Fortschritt zunichtemacht.
3. **Interaktives Widget (Home-Screen-Modus)**:
   - 2x2 oder 2x1 Widget-Ansicht: Direkte Toggles der Top-Habits mit Live-Sync zur Datenbank.

### Visuelle Identität & Neo-Brutalismus
- **Aesthetic Direction**: Neo-Brutalismus mit chirurgischer Präzision. Feste schwarze Borders (`border-2 border-black`), harte Schattenkanten (`shadow-[3px_3px_0px_#000]`), keine runden Pillen-Badges, kein transparenter Glassmorphism.
- **Farbpalette**:
  - Canvas: `#F4F4F0` (warmes Rohpapier / Off-White)
  - Surface: `#FFFFFF` (reines Weiß für Habit-Karten)
  - Borders & Text: `#121212` (Tiefschwarz für maximale Kontraste)
  - Akzent: `#D8F22A` (Neo-Lime) oder `#FF5C00` (Signal-Orange für aktive Check-States)
  - Muted: `#737373` für Kontextanker und sekundäre Monospace-Labels
- **Typografie & Zahlen**:
  - Headings & Titles: Markante Sans-Serif (`Plus Jakarta Sans` / `Inter Display`, 600–800 Weight)
  - Scores, Kalendertage & Zähler: Reines Monospace (`JetBrains Mono` / `font-mono tabular-nums`)
- **Micro-Interactions**:
  - Druck-Effekt: Bei Klick springt das Element um `translate-x-[2px] translate-y-[2px]` und verkleinert den harten Schatten auf `1px 1px 0px #000`.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Monatlicher Konsistenz-Score statt Daily Streaks**
  - *Gewählter Ansatz*: Ein relativer Monats-Prozentsatz + Tagesmatrix (z. B. 24/28 Tage aktiv = 86%).
  - *Warum*: Die Verhaltenspsychologie zeigt, dass ein Streak-Bruch (Reset auf 0) der Hauptgrund ist, warum Nutzer Habit-Tracker frustriert aufgeben ("What-the-hell-Effekt"). Ein monatlicher Score motiviert sofortiges Weitermachen.
  - *Alternative verworfen*: Klassische Flammen-Counter mit Reset auf 0.
- **Decision 2: Lokale Datenhaltung (Offline-First)**
  - *Gewählter Ansatz*: SQLite via `expo-sqlite` (Mobile) / IndexedDB / LocalStorage (Simulator).
  - *Warum*: 0ms Latenz, keine Netzwerkabhängigkeit, maximaler Datenschutz ohne Login-Zwang.
- **Decision 3: Max. 5 aktive Micro-Habits (Künstliche Verknappung)**
  - *Gewählter Ansatz*: Die App empfiehlt und limitiert auf maximal 5 zeitgleiche Gewohnheiten.
  - *Warum*: Micro-Habits funktionieren nur durch Fokussierung. Zu viele Habits führen zu Entscheidungsmüdigkeit.

---

## 4. Technical Architecture & Data Strategy

### System- & Komponenten-Architektur

```
┌──────────────────────────────────────────────────────────────┐
│                    User Interface Layer                      │
│                                                              │
│  ┌────────────────────────┐      ┌────────────────────────┐  │
│  │   Today's Habit List   │      │ Monthly Consistency    │  │
│  │ (1-Tap Neo-Checkboxes) │      │ Matrix & Mono-Score    │  │
│  └───────────┬────────────┘      └───────────┬────────────┘  │
│              │                               │               │
│              └───────────────┬───────────────┘               │
│                              │                               │
│  ┌───────────────────────────▼────────────────────────────┐  │
│  │      Interactive Widget Simulation / Native Widget     │  │
│  │           (Direct Tap / Quick Action Sync)             │  │
│  └───────────────────────────┬────────────────────────────┘  │
└──────────────────────────────┼───────────────────────────────┘
                               │ State Action (Toggle/Add)
┌──────────────────────────────▼───────────────────────────────┐
│                    Store & Business Logic                    │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ HabitStore (Zustand / Reactive State)                  │  │
│  │ - toggleCompletion(habitId, dateString)                │  │
│  │ - calculateMonthlyScore(monthKey): number              │  │
│  │ - undoLastAction()                                     │  │
│  └───────────────────────────┬────────────────────────────┘  │
└──────────────────────────────┼───────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────┐
│                   Storage & Persistence                      │
│                                                              │
│  [Mobile] expo-sqlite (Next API) / MMKV                      │
│  [Preview] IndexedDB / LocalStorage Repository               │
└──────────────────────────────────────────────────────────────┘
```

### Datenmodell

```typescript
// Definition eines Micro-Habits
interface MicroHabit {
  id: string;              // UUID
  title: string;           // z. B. "1 Seite lesen"
  cue: string;             // Trigger-Anker, z. B. "Nach dem Morgenkaffee"
  timeEstimate: string;    // z. B. "1 min"
  color: string;           // Akzentfarbe (Neo-Palette)
  archived: boolean;
  createdAt: string;       // ISO Timestamp
  orderIndex: number;
}

// Ausführungs-Log
interface HabitExecution {
  id: string;              // UUID
  habitId: string;         // Foreign Key -> MicroHabit.id
  date: string;            // Format: YYYY-MM-DD (zeitzonenfest)
  completedAt: string;     // ISO Timestamp
}

// Monatlicher Konsistenz-Status
interface MonthlyConsistency {
  month: string;           // Format: YYYY-MM
  activeHabitCount: number;
  totalPossibleExecutions: number;
  completedExecutions: number;
  scorePercentage: number; // z. B. 85.5
  dailyHeat: Record<string, number>; // date -> completed count
}
```

### Komponenten im interaktiven Workspace
1. **DeviceFrame & Platform Selector**: Ermöglicht nahtloses Umschalten zwischen Mobile-Ansicht (iPhone/Android Frame), Desktop-Ansicht und Widget-Homescreen-Modus.
2. **HabitList (Today View)**: Neo-Brutalist Cards mit großem Tap-Trigger, Aktions-Undo-Snackbar und Monospace-Zeitangaben.
3. **MonthlyScoreBoard**: Monatskalender-Matrix mit Tages-Punkten, Monospace-Zahlen und Konsistenz-Grad.
4. **Interactive Widget Showcase**: Simulation des Home-Screen-Widgets (2x2 und 2x1) mit echten Klick-Interaktionen.
5. **Code & Architecture Export**: Bereitgestellte, exportierbare React Native Expo-Quellcodedateien (`App.tsx`, `db/schema.ts`, `components/HabitCard.tsx`), damit der Code 1:1 in ein Expo-Projekt kopiert werden kann.
