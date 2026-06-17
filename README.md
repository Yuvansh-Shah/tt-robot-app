# TT Robot App

A mobile app for controlling a table-tennis training robot — building drills, running live sessions, and tracking practice. This is the Phase 1 build: the full UI and app logic running against a simulated robot, set up for real hardware to drop in.

## What it does

The app covers the whole training loop:

- Home: quick start, weekly stats, recent drills.
- Drills: a searchable library plus a builder for static drills (fixed ball settings) and sequence drills (multi-shot patterns).
- Session: a live session screen with pause/resume and on-the-fly parameter changes.
- History: stats — a heatmap, top drills, weekly volume, and streaks.
- Settings: theme, units, haptics, defaults, and pairing.

State is kept in Zustand stores persisted to device storage, and the app seeds preset drills and sample sessions on first launch so the stats screens have data.

The robot itself is a swappable mock service that simulates connecting, ball cadence, sequence drills, and error conditions. The architecture is set up so a real Bluetooth (BLE) implementation can replace one file without touching the rest of the app.

## Built with

- Expo (SDK 55) and Expo Router
- React Native, TypeScript
- Zustand (persisted to AsyncStorage)
- react-native-ble-plx, reanimated, react-native-svg

## Running it

```
npm install
npx expo start
```

Type-check with `npm run typecheck`.
