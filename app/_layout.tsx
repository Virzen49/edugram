import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AppProvider } from '@/contexts/AppContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AppProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
<<<<<<< HEAD
        <Stack.Screen name="(teacher)" options={{ headerShown: false }} />
=======
        <Stack.Screen name="lecture" options={{ headerShown: false }} />
>>>>>>> 0be7283ee1b214438a4e8831077e20f5f9800bb4
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </AppProvider>
  );
}