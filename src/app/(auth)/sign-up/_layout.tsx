import { Stack } from 'expo-router';

import { SignUpProvider } from '@/features/signup/context';

export default function SignUpLayout() {
  return (
    <SignUpProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SignUpProvider>
  );
}
