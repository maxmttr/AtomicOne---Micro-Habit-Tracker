# KI-basierte Micro-Habit-Empfehlungen (Entdecken-Bereich)

Fokussierte, intelligente Micro-Habit-Vorschläge auf Basis deiner bestehenden Gewohnheiten und Lebensbereiche mit nahtloser 1-Klick-Übernahme direkt im Dashboard.

## User Review & Critical Decisions

> [!IMPORTANT]
> Basierend auf deinen Antworten im Klärungsdialog wurden folgende Kernentscheidungen für die Implementierung getroffen:

- **Analyse-Basis (Bestätigt)**: Die KI analysiert deine aktuell aktiven Habits (Kategorien, Zeiten, Auslöser) und identifiziert unausgewogene Lebensbereiche oder synergistische Ergänzungen.
- **Platzierung im Interface (Bestätigt)**: Eigener Neo-Brutalist „KI-Entdecken“-Bereich direkt im Dashboard (Heute-Ansicht) unterhalb der Progress-Bar bzw. in der rechten Sidebar.
- **Umfang der Generierung (Bestätigt)**: 1 hochpräzise, fokussierte Empfehlung mit Begründung („Warum das zu dir passt“), Auslöser-Kopplung und direktem 1-Klick-Übernahme-Button (kein Entscheidungsstress).
- **Gemini-Architektur**: Verwendung von `gemini-3.8-flash` über einen Server-Side Proxy-Endpoint (`/api/suggest-habit`) mit strukturiertem JSON-Schema und robuster Offline-Fallback-Logik.

---

## 1. Overview & Core Concept

- **Was es macht**: Das System analysiert das bestehende Habit-Set des Nutzers (z. B. bestehende Habits in den Bereichen Körper, Fokus, Achtsamkeit) und nutzt `gemini-3.8-flash`, um genau **einen** maßgeschneiderten Micro-Habit (Dauer ≤ 1–2 Minuten) mit konkretem physischem Trigger (Habit-Stacking nach James Clear) vorzuschlagen.
- **Zielgruppe**: Nutzer, die ihre Routine erweitern wollen, ohne sich mit langen Katalogen oder komplexen Routinen zu überfordern.
- **Kernwert**: Minimalste kognitive Hürde – die Empfehlung schließt blinde Flecken in den Lebensbereichen und kann mit einem einzigen Klick sofort aktiv geschaltet und heute noch geloggt werden.

---

## 2. User Experience & Visual Design

### User Flow
1. **Sichtbarkeit**: Auf dem Dashboard (Heute-Tab) erscheint die Karte **„⚡ KI-Impuls: Dein nächster Micro-Habit“**.
2. **Kontextuelle Analyse**: Die Karte zeigt an, worauf die Empfehlung basiert (z. B. *„Basiert auf deinen 3 Habits in Fokus & Körper – Ergänzung für mentale Regeneration“*).
3. **Fokussierte Empfehlung**:
   - **Titel**: z. B. „1 Glas Wasser vor dem Kaffee“
   - **1-Minuten-Aktion**: z. B. „Trinke direkt nach dem Aufstehen 250ml stilles Wasser.“
   - **Physischer Trigger (Anker)**: „Sobald die Kaffeemaschine piept.“
   - **Lebensbereich**: Badge `Gesundheit & Energie`
   - **Begründung**: Kurze, prägnante 1-Satz-Erklärung, warum dieser Habit die bestehende Routine stärkt.
4. **Interaktion**:
   - **Button 1**: „⚡ Mit 1 Klick übernehmen“ (fügt den Habit sofort lokal hinzu, löst haptisches Feedback aus und aktualisiert das Dashboard).
   - **Button 2**: „Anderen Impuls anfordern 🎲“ (generiert blitzschnell eine alternative Facette).
5. **Empty / Added State**: Wurde der Habit übernommen, bestätigt eine Neo-Brutalist Erfolgsanimation die Übernahme und bietet an, einen weiteren Impuls zu laden.

### Visuelle Identität (Neo-Brutalismus)
- **Rahmen & Schatten**: 2px/3px solide schwarze Konturen (`border-zinc-900`), tiefe Offset-Schatten (`shadow-[4px_4px_0px_#141414]`).
- **Akzentfarben**: Auffälliges Neo-Lime (`#D8F22A`) für Übernahme-Buttons und KI-Badge (`#A78BFA` Soft-Violett / `#D8F22A` Kontrast).
- **Typografie**: Monospace-Metriken (`font-mono-numbers`) für Zeitschätzungen und Kategorien; fette serifenlose Headlines (`font-black tracking-tight`).
- **Dark Mode**: Nahtlose Umschaltung mit tiefdunklem Hintergrund (`#121212`), Zink-Konturen und neongelber Hervorhebung.

---

## 3. Key Product Decisions & Trade-Offs

- **Entscheidung 1: Server-Side Gemini API via Express (`server.ts`)**
  - *Gewählter Ansatz*: Umstellung auf Full-Stack mit `server.ts` (Express + Vite Middleware im Entwicklungsmodus) und dem `@google/genai` TypeScript SDK.
  - *Warum*: Konform mit den Sicherheits- und Architekturrichtlinien von AI Studio Build; kein API-Key im Browser; serverseitiges Caching & Validierung.
  - *Alternativen verworfen*: Client-seitiger API-Aufruf (unsicher, widerspricht den Systemrichtlinien).

- **Entscheidung 2: Streng typisierte JSON-Antworten (Structured Output)**
  - *Gewählter Ansatz*: Die Gemini API wird mit `responseMimeType: "application/json"` und einem `responseSchema` aufgerufen.
  - *Warum*: Garantiert fehlerfreies Parsing der Felder `title`, `description`, `trigger`, `category`, `timeEstimateMinutes` und `rationale`.

- **Entscheidung 3: Intelligente Offline- / Fallback-Heuristik**
  - *Gewählter Ansatz*: Falls der Gemini-Aufruf aufgrund von Netzwerkausfall verzögert wird oder fehlschlägt, springt sofort ein kuratierter Heuristik-Generator ein, der die Lebensbereiche vergleicht.
  - *Warum*: Zero-Latency und 100% Verfügbarkeit für den Endnutzer.

---

## 4. Technical Architecture & Data Strategy

### System- & Datenfluss-Diagramm

```
┌─────────────────────────────────────────────────────────────┐
│                       Client (React)                        │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  Today Dashboard (activeTab === 'today')            │   │
│   │  ┌───────────────────────────────────────────────┐  │   │
│   │  │  <AiHabitSuggestionCard />                    │  │   │
│   │  │  - Aktuelle Habits Context                    │  │   │
│   │  │  - 1-Klick Übernahme Action                   │  │   │
│   │  │  - "Neu generieren" Trigger                   │  │   │
│   │  └───────────────────────┬───────────────────────┘  │   │
│   └──────────────────────────┼──────────────────────────┘   │
└──────────────────────────────┼──────────────────────────────┘
                               │ POST /api/suggest-habit
                               │ Body: { activeHabits, categories }
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Server (Express / Vite)                  │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  server.ts: /api/suggest-habit                      │   │
│   │  - System Prompt: James Clear Micro-Habit Formel    │   │
│   │  - Gemini 3.8 Flash mit JSON Schema                 │   │
│   │  - Fallback-Heuristik bei Netzwerkunterbrechung     │   │
│   └──────────────────────────┬──────────────────────────┘   │
└──────────────────────────────┼──────────────────────────────┘
                               │
                               ▼
               ┌───────────────────────────────┐
               │  @google/genai SDK            │
               │  Model: gemini-3.8-flash      │
               └───────────────────────────────┘
```

### Komponenten- und Datenmapping
1. `server.ts`:
   - Express Server mit Port 3000 und Vite Middleware
   - POST `/api/suggest-habit`: Verarbeitet Habit-Kontext und liefert den nächsten Micro-Habit zurück
2. `src/types/habit.ts`:
   - Neuer Typ `AiHabitSuggestion` (`title`, `microAction`, `trigger`, `category`, `whyRecommendation`)
3. `src/components/AiHabitSuggestionCard.tsx`:
   - Interaktive Karte im Neo-Brutalist-Stil
   - Ladezustand mit animiertem Skelett / Pulsschlag
   - 1-Klick-Übernahme-Funktion mit Haptik und Erfolgs-Toast
4. `src/App.tsx`:
   - Integration im Dashboard der Heute-Ansicht
   - Automatische Neugenerierung oder Vorschau passender Habits
