// server.ts
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = process.env.PORT || 3e3;
app.use(express.json());
var FALLBACK_HABITS = [
  {
    title: "1 Glas stilles Wasser trinken",
    cue: "Direkt nach dem ersten Weckerklingeln",
    timeEstimate: "30 Sek",
    category: "Vitalit\xE4t & K\xF6rper",
    color: "#38BDF8",
    icon: "droplet",
    rationale: "Rehydriert deinen Organismus sofort nach dem Schlaf und bringt den Stoffwechsel in Schwung, bevor du zum Koffein greifst.",
    missingDomain: "Hydration & Morgenenergie",
    timeWindow: "morning"
  },
  {
    title: "3 tiefe Bauchatemz\xFCge nehmen",
    cue: "Sobald ich mich an den Schreibtisch setze",
    timeEstimate: "45 Sek",
    category: "Ruhe & Gelassenheit",
    color: "#A78BFA",
    icon: "feather",
    rationale: "Aktiviert den Parasympathikus und senkt die Cortisol-Reaktion, bevor der Arbeitsfokus beginnt.",
    missingDomain: "Stressreduktion & Achtsamkeit",
    timeWindow: "midday"
  },
  {
    title: "Schreibtisch von 1 Sache befreien",
    cue: "Vor dem Zuklappen des Laptops am Abend",
    timeEstimate: "1 Min",
    category: "Alltag & Ordnung",
    color: "#D8F22A",
    icon: "zap",
    rationale: "Schafft einen klaren visuellen Abschluss des Arbeitstages und minimiert morgendlichen mentalen Widerstand.",
    missingDomain: "Fokusumgebung & Klarheit",
    timeWindow: "evening"
  },
  {
    title: "1 Sache notieren, die heute gut war",
    cue: "Nach dem Z\xE4hneputzen vor dem Schlafen",
    timeEstimate: "1 Min",
    category: "Klarheit & Geist",
    color: "#FB923C",
    icon: "smile",
    rationale: "Trainiert das Gehirn auf positive Selbstwirksamkeit und schlie\xDFt den Tag mit mentaler Zufriedenheit ab.",
    missingDomain: "Dankbarkeit & Mindset",
    timeWindow: "evening"
  },
  {
    title: "Kurze Waden- & Nackendehnung",
    cue: "W\xE4hrend die Kaffeemaschine oder der Wasserkocher l\xE4uft",
    timeEstimate: "1 Min",
    category: "Vitalit\xE4t & K\xF6rper",
    color: "#4ADE80",
    icon: "activity",
    rationale: "Nutzt ungenutzte Wartezeiten f\xFCr sanfte k\xF6rperliche Entlastung ohne jeglichen zus\xE4tzlichen Zeitaufwand.",
    missingDomain: "K\xF6rperausgleich & Haltung",
    timeWindow: "midday"
  }
];
app.post("/api/suggest-habit", async (req, res) => {
  const { currentHabits = [] } = req.body;
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY not configured, using smart fallback catalog");
      const pick = getSmartFallback(currentHabits);
      return res.json({ suggestion: pick, source: "curated_fallback" });
    }
    const ai = new GoogleGenAI({});
    const existingTitles = currentHabits.map((h) => `\u2022 "${h.title}" (Kopplung: "${h.cue || "keine"}", Zeitfenster: "${h.timeWindow || "flexibel"}")`).join("\n") || "Noch keine Habits hinterlegt.";
    const prompt = `Du bist ein weltklasse Verhaltenspsychologe und Experte f\xFCr "Atomic Habits" (James Clear / BJ Fogg).
Der Nutzer nutzt eine radikal minimalistische Micro-Habit App.

Aktuell vorhandene Gewohnheiten des Nutzers:
${existingTitles}

AUFGABE:
Analysiere die bestehenden Habits und finde eine komplement\xE4re L\xFCcke (z. B. wenn Bewegung und Lesen schon da sind, fehlt oft Hydration, Atem\xFCbung, Schreibtisch-Reset oder Dankbarkeit).
Schlage GENAU EINEN hochspezifischen, ultrakompakten Micro-Habit vor:
- Dauer MUSS strikt unter 2 Minuten sein (optimal 30 Sekunden bis 1 Minute). Keine Ausreden m\xF6glich!
- Physischer Trigger / Anker (Habit-Stacking Formel: "Direkt nachdem / sobald ich X tue...").
- Knackige Begr\xFCndung, warum dies das bestehende Habit-Set optimal erg\xE4nzt.
- Passender Neo-Brutalist Farbcode (#D8F22A, #FF5C00, #38BDF8, #A78BFA, #4ADE80 oder #FB923C).
- Passendes Icon (droplet, book-open, activity, zap, feather, coffee, smile, sun, moon).
- Passendes Zeitfenster im Tagesverlauf (morning = Morgens, midday = Mittags, evening = Abends, anytime = Flexibel).`;
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Knapper, aktiver Titel, z. B. 1 Glas Wasser vor dem Kaffee" },
            cue: { type: Type.STRING, description: "Physischer Anker/Trigger nach der Wenn-Dann-Formel" },
            timeEstimate: { type: Type.STRING, description: "z. B. 30 Sek oder 1 Min" },
            category: { type: Type.STRING, description: "z. B. Vitalit\xE4t & K\xF6rper, Klarheit & Geist, Ruhe & Balance, Alltag & Ordnung" },
            color: { type: Type.STRING, description: "Hexadezimaler Farbakzent" },
            icon: { type: Type.STRING, description: "Icon-Name aus der erlaubten Liste" },
            rationale: { type: Type.STRING, description: "1-2 S\xE4tze, warum dieser Habit die bestehende Routine st\xE4rkt" },
            missingDomain: { type: Type.STRING, description: "Erkannter Lebensbereich / L\xFCcke" },
            timeWindow: {
              type: Type.STRING,
              enum: ["morning", "midday", "evening", "anytime"],
              description: "Empfohlenes Zeitfenster im Tagesverlauf"
            }
          },
          required: ["title", "cue", "timeEstimate", "category", "color", "icon", "rationale", "missingDomain", "timeWindow"]
        }
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    if (!parsed.title || !parsed.cue) {
      throw new Error("Incomplete JSON response from Gemini");
    }
    return res.json({ suggestion: parsed, source: "gemini-3.8-flash" });
  } catch (error) {
    console.error("Error generating AI habit suggestion:", error?.message || error);
    const fallback = getSmartFallback(currentHabits);
    return res.json({ suggestion: fallback, source: "fallback_on_error", error: error?.message });
  }
});
function getSmartFallback(currentHabits) {
  const currentText = (currentHabits || []).map((h) => (h.title + " " + (h.cue || "")).toLowerCase()).join(" ");
  const available = FALLBACK_HABITS.filter((f) => {
    const keyWord = f.title.split(" ")[2]?.toLowerCase() || "";
    return !currentText.includes(keyWord);
  });
  const pool = available.length > 0 ? available : FALLBACK_HABITS;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}
startServer();
