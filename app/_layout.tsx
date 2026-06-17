import 'react-native-gesture-handler';

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { useDrillStore } from '@/stores/drillStore';
import { useHistoryStore } from '@/stores/historyStore';
import { generateFakeSessions } from '@/utils/fakeSessions';
import { AppBackground } from '@/components/common/AppBackground';

export default function RootLayout() {
  const { mode } = useTheme();
  const seedDrills = useDrillStore((s) => s.seedIfNeeded);
  const drills = useDrillStore((s) => s.drills);
  const hasSeededFake = useHistoryStore((s) => s.hasSeededFake);
  const setFakeSessions = useHistoryStore((s) => s.setFakeSessions);

  useEffect(() => {
    seedDrills();
  }, [seedDrills]);

  useEffect(() => {
    if (!hasSeededFake && drills.length > 0) {
      setFakeSessions(generateFakeSessions(drills, 32));
    }
  }, [hasSeededFake, drills, setFakeSessions]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={mode === 'light' ? 'dark' : 'light'} />
        <AppBackground>
          <View style={{ flex: 1 }}>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' },
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="session/active"
                options={{
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                  contentStyle: { backgroundColor: 'transparent' },
                }}
              />
              <Stack.Screen name="session/[id]" />
              <Stack.Screen name="drill/[id]" />
              <Stack.Screen name="drill/new" />
              <Stack.Screen name="developer" />
            </Stack>
          </View>
        </AppBackground>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
