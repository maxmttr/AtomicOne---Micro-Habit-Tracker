import { MicroHabit, AiHabitSuggestion } from '../types/habit';

const LOCAL_FALLBACKS: AiHabitSuggestion[] = [
  {
    title: '1 Glas stilles Wasser trinken',
    cue: 'Direkt nach dem ersten Weckerklingeln',
    timeEstimate: '30 Sek',
    category: 'Vitalität & Körper',
    color: '#38BDF8',
    icon: 'droplet',
    rationale: 'Rehydriert deinen Organismus sofort nach dem Schlaf und bringt den Stoffwechsel in Schwung, bevor du zum Koffein greifst.',
    missingDomain: 'Hydration & Morgenenergie',
  },
  {
    title: '3 tiefe Bauchatemzüge nehmen',
    cue: 'Sobald ich mich an den Schreibtisch setze',
    timeEstimate: '45 Sek',
    category: 'Ruhe & Balance',
    color: '#A78BFA',
    icon: 'feather',
    rationale: 'Aktiviert den Parasympathikus und senkt die Cortisol-Reaktion, bevor der Arbeitsfokus beginnt.',
    missingDomain: 'Stressreduktion & Achtsamkeit',
  },
  {
    title: 'Schreibtisch von 1 Sache befreien',
    cue: 'Vor dem Zuklappen des Laptops am Abend',
    timeEstimate: '1 Min',
    category: 'Alltag & Ordnung',
    color: '#D8F22A',
    icon: 'zap',
    rationale: 'Schafft einen klaren visuellen Abschluss des Arbeitstages und minimiert morgendlichen mentalen Widerstand.',
    missingDomain: 'Fokusumgebung & Klarheit',
  },
  {
    title: '1 Sache notieren, die heute gut war',
    cue: 'Nach dem Zähneputzen vor dem Schlafen',
    timeEstimate: '1 Min',
    category: 'Klarheit & Geist',
    color: '#FB923C',
    icon: 'smile',
    rationale: 'Trainiert das Gehirn auf positive Selbstwirksamkeit und schließt den Tag mit mentaler Zufriedenheit ab.',
    missingDomain: 'Dankbarkeit & Mindset',
  },
  {
    title: 'Kurze Waden- & Nackendehnung',
    cue: 'Während die Kaffeemaschine oder der Wasserkocher läuft',
    timeEstimate: '1 Min',
    category: 'Vitalität & Körper',
    color: '#4ADE80',
    icon: 'activity',
    rationale: 'Nutzt ungenutzte Wartezeiten für sanfte körperliche Entlastung ohne jeglichen zusätzlichen Zeitaufwand.',
    missingDomain: 'Körperausgleich & Haltung',
  },
];

export async function fetchAiHabitSuggestion(currentHabits: MicroHabit[]): Promise<{ suggestion: AiHabitSuggestion; source: string }> {
  try {
    const payload = {
      currentHabits: currentHabits.map((h) => ({
        title: h.title,
        cue: h.cue,
        timeEstimate: h.timeEstimate,
      })),
    };

    const res = await fetch('/api/suggest-habit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    if (data.suggestion) {
      return {
        suggestion: data.suggestion,
        source: data.source || 'gemini-3.8-flash',
      };
    }
    throw new Error('No suggestion returned');
  } catch (err) {
    console.warn('Using client-side fallback suggestion:', err);
    // Pick an unused local fallback
    const titles = currentHabits.map((h) => h.title.toLowerCase());
    const candidates = LOCAL_FALLBACKS.filter((f) => !titles.some((t) => t.includes(f.title.toLowerCase().slice(0, 8))));
    const pool = candidates.length > 0 ? candidates : LOCAL_FALLBACKS;
    const randomPick = pool[Math.floor(Math.random() * pool.length)];

    return {
      suggestion: randomPick,
      source: 'offline_fallback',
    };
  }
}
