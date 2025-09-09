import { Stack } from 'expo-router';

export default function TeacherLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="classes" />
      <Stack.Screen name="analytics" />
      <Stack.Screen name="content" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}


