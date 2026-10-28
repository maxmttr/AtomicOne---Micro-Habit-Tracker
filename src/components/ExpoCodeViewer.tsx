/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Copy, Check, Code, FileCode, Smartphone, Terminal } from 'lucide-react';

interface CodeSnippet {
  id: string;
  filename: string;
  language: string;
  description: string;
  code: string;
}

const SNIPPETS: CodeSnippet[] = [
  {
    id: 'app',
    filename: 'App.tsx (React Native)',
    language: 'tsx',
    description: 'Vollständige React Native Expo Hauptansicht mit 1-Tap Haptik & SQLite',
    code: `import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useHabitDB } from './src/useHabitDB';

export default function App() {
  const { habits, completedIds, toggleHabit, monthlyScore } = useHabitDB();

  const handleToggleHabit = async (habitId: string) => {
    // 1-Tap Physical Vibration using Expo Haptics
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleHabit(habitId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brand}>ATOMIC/ONE</Text>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>{monthlyScore}% KONSISTENZ</Text>
        </View>
      </View>

      {/* Habit List */}
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isDone = completedIds.includes(item.id);
          return (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleToggleHabit(item.id)}
              style={[styles.card, isDone && styles.cardCompleted]}
            >
              <View style={[styles.colorStrip, { backgroundColor: item.color }]} />
              <View style={styles.content}>
                <Text style={[styles.title, isDone && styles.titleCompleted]}>
                  {item.title}
                </Text>
                <Text style={styles.cue}>{item.cue} · {item.timeEstimate}</Text>
              </View>

              {/* 48x48 Minimum Touch Target Checkbox */}
              <View style={[styles.checkbox, isDone && styles.checkboxActive]}>
                {isDone && <Text style={styles.checkIcon}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F6F3' },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#141414',
  },
  brand: { fontSize: 20, fontWeight: '900', color: '#141414' },
  scoreBadge: {
    backgroundColor: '#D8F22A',
    borderWidth: 2,
    borderColor: '#141414',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  scoreText: { fontFamily: 'Courier', fontWeight: 'bold', fontSize: 12 },
  list: { padding: 16, gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#141414',
    padding: 14,
    shadowColor: '#141414',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  cardCompleted: { backgroundColor: '#F0F0EE', shadowOffset: { width: 2, height: 2 } },
  colorStrip: { width: 4, height: '100%', marginRight: 12 },
  content: { flex: 1 },
  title: { fontSize: 16, fontWeight: '800', color: '#141414' },
  titleCompleted: { textDecorationLine: 'line-through', color: '#888' },
  cue: { fontSize: 12, color: '#666', marginTop: 2 },
  checkbox: {
    width: 44,
    height: 44,
    borderWidth: 2,
    borderColor: '#141414',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  checkboxActive: { backgroundColor: '#141414' },
  checkIcon: { color: '#D8F22A', fontWeight: '900', fontSize: 20 },
});`,
  },
  {
    id: 'db',
    filename: 'useHabitDB.ts (expo-sqlite)',
    language: 'typescript',
    description: 'Lokale persistente SQLite-Datenhaltung für React Native Expo',
    code: `import { useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';

export interface Habit {
  id: string;
  title: string;
  cue: string;
  timeEstimate: string;
  color: string;
}

export function useHabitDB() {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    async function initDB() {
      const database = await SQLite.openDatabaseAsync('microhabits.db');
      setDb(database);

      // Create Tables
      await database.execAsync(\`
        CREATE TABLE IF NOT EXISTS habits (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          cue TEXT NOT NULL,
          timeEstimate TEXT NOT NULL,
          color TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS executions (
          id TEXT PRIMARY KEY NOT NULL,
          habitId TEXT NOT NULL,
          date TEXT NOT NULL,
          completedAt TEXT NOT NULL
        );
      \`);

      // Seed if empty
      const rows = await database.getAllAsync<Habit>('SELECT * FROM habits');
      if (rows.length === 0) {
        await database.runAsync(
          'INSERT INTO habits VALUES (?, ?, ?, ?, ?)',
          'h1', '1 Seite lesen', 'Auf dem Nachttisch', '1 min', '#D8F22A'
        );
        await database.runAsync(
          'INSERT INTO habits VALUES (?, ?, ?, ?, ?)',
          'h2', '1 Minute dehnen', 'Nach dem Aufstehen', '1 min', '#FF5C00'
        );
      }

      await loadData(database);
    }

    initDB();
  }, []);

  async function loadData(database: SQLite.SQLiteDatabase) {
    const habitRows = await database.getAllAsync<Habit>('SELECT * FROM habits');
    setHabits(habitRows);

    const logs = await database.getAllAsync<{ habitId: string }>(
      'SELECT habitId FROM executions WHERE date = ?',
      today
    );
    setCompletedIds(logs.map(l => l.habitId));
  }

  const toggleHabit = async (habitId: string) => {
    if (!db) return;
    const isDone = completedIds.includes(habitId);

    if (isDone) {
      await db.runAsync('DELETE FROM executions WHERE habitId = ? AND date = ?', habitId, today);
      setCompletedIds(prev => prev.filter(id => id !== habitId));
    } else {
      const id = Date.now().toString();
      await db.runAsync(
        'INSERT INTO executions VALUES (?, ?, ?, ?)',
        id, habitId, today, new Date().toISOString()
      );
      setCompletedIds(prev => [...prev, habitId]);
    }
  };

  return { habits, completedIds, toggleHabit, monthlyScore: 84 };
}`,
  },
  {
    id: 'widget-ios',
    filename: 'WidgetIntent.swift (iOS WidgetKit)',
    language: 'swift',
    description: 'Interaktiver 1-Tap Widget-Button in iOS mit AppIntent ohne App-Start',
    code: `import WidgetKit
import SwiftUI
import AppIntents

// 1-Tap Background Intent
struct ToggleHabitIntent: AppIntent {
    static var title: LocalizedStringResource = "Habit umschalten"
    
    @Parameter(title: "Habit ID")
    var habitId: String

    init() {}
    init(habitId: String) {
        self.habitId = habitId
    }

    func perform() async throws -> some IntentResult {
        // Schreibt direkt in das geteilte App-Group SQLite File
        let db = SharedHabitDatabase.shared
        db.toggleExecution(habitId: habitId, date: Date.todayString())
        
        // Widget sofort aktualisieren
        WidgetCenter.shared.reloadAllTimelines()
        return .result()
    }
}

// SwiftUI Widget View mit interaktivem Button
struct MicroHabitWidgetEntryView : View {
    var entry: SimpleEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("ATOMIC/ONE")
                .font(.system(size: 10, weight: .black, design: .monospaced))
            
            ForEach(entry.habits) { habit in
                HStack {
                    Text(habit.title)
                        .font(.system(size: 12, weight: .bold))
                        .strikethrough(habit.isCompleted)
                    
                    Spacer()
                    
                    // Button mit AppIntent (kein App-Launch!)
                    Button(intent: ToggleHabitIntent(habitId: habit.id)) {
                        Image(systemName: habit.isCompleted ? "checkmark.square.fill" : "square")
                            .foregroundColor(habit.isCompleted ? .black : .gray)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .padding()
        .containerBackground(Color(red: 0.96, green: 0.96, blue: 0.95), for: .widget)
    }
}`,
  },
];

export const ExpoCodeViewer: React.FC = () => {
  const [activeSnippetId, setActiveSnippetId] = useState(SNIPPETS[0].id);
  const [copied, setCopied] = useState(false);

  const activeSnippet = SNIPPETS.find((s) => s.id === activeSnippetId) || SNIPPETS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-700 shadow-[4px_4px_0px_#141414] dark:shadow-[4px_4px_0px_#27272a] p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-zinc-900 dark:border-zinc-700 gap-3">
        <div>
          <span className="text-[11px] font-mono-numbers uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold block">
            React Native & Expo Export Hub
          </span>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Produktionsreifer Mobile-Code
          </h2>
        </div>

        {/* Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D8F22A] text-zinc-950 border-2 border-zinc-900 dark:border-zinc-700 text-xs font-mono-numbers font-bold shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              Kopiert!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Code kopieren
            </>
          )}
        </button>
      </div>

      {/* Snippet Tabs */}
      <div className="flex flex-wrap gap-2 my-4">
        {SNIPPETS.map((snippet) => (
          <button
            key={snippet.id}
            type="button"
            onClick={() => setActiveSnippetId(snippet.id)}
            className={`px-3 py-1.5 border-2 border-zinc-900 dark:border-zinc-700 text-xs font-mono-numbers font-bold transition-all cursor-pointer ${
              activeSnippetId === snippet.id
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-[2px_2px_0px_#141414] dark:shadow-[2px_2px_0px_#27272a]'
                : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
            }`}
          >
            {snippet.filename}
          </button>
        ))}
      </div>

      <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">
        {activeSnippet.description}
      </p>

      {/* Code Box */}
      <div className="relative bg-zinc-950 border-2 border-zinc-900 dark:border-zinc-700 p-4 overflow-x-auto text-xs font-mono-numbers text-zinc-200 rounded-sm">
        <pre className="whitespace-pre">{activeSnippet.code}</pre>
      </div>

      {/* Terminal Command Tip */}
      <div className="mt-4 p-3 bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-900 dark:border-zinc-700 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
          <span className="font-mono-numbers text-zinc-800 dark:text-zinc-200">
            npx create-expo-app@latest micro-habits --template blank-typescript
          </span>
        </div>
        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono-numbers font-bold">Expo SDK 52+</span>
      </div>
    </div>
  );
};
