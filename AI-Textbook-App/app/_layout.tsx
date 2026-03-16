import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1C1C1E' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '600' },
        contentStyle: { backgroundColor: '#0F0F0F' },
      }}>
      <Stack.Screen name="login" options={{ headerShown: false }} />

      <Stack.Screen
        name="home"
        options={{
          title: 'Home',
          headerShown: false,
          headerLeft: () => null,
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="read/[id]"
        options={{
          headerStyle: { backgroundColor: '#1C1C1E' },
          headerTintColor: '#007AFF',
        }}
      />
    </Stack>
  );
}
