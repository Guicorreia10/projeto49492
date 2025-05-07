// app/help/_layout.tsx
import { Stack } from 'expo-router';

export default function HelpLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // oculta o header se já estás a usar um custom na página
      }}
    />
  );
}
