import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, OptionCard, Screen, StepHeader } from '@/components';
import { INTENT_COPY, USER_INTENTS, type UserIntent } from '@/constants/registration';
import { spacing } from '@/constants/theme';
import { useSignUp } from '@/features/signup/context';
import { SIGN_UP_STEPS, signUpProgress } from '@/features/signup/steps';

export default function ChooseAccountTypeScreen() {
  const router = useRouter();
  const { intent, setIntent } = useSignUp();
  const [selected, setSelected] = useState<UserIntent | null>(intent);
  const progress = signUpProgress(intent, SIGN_UP_STEPS.intent);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/login');
  };

  const handleContinue = () => {
    if (!selected) return;
    setIntent(selected);
    router.push('/sign-up/phone');
  };

  return (
    <Screen>
      <StepHeader
        title="How will you use Taka?"
        subtitle="Choose the account type that fits you. This decides what we ask for next."
        step={progress.step}
        totalSteps={progress.totalSteps}
        onBack={handleBack}
      />

      <View style={styles.options}>
        {USER_INTENTS.map((value) => (
          <OptionCard
            key={value}
            title={INTENT_COPY[value].title}
            description={INTENT_COPY[value].description}
            selected={selected === value}
            onPress={() => setSelected(value)}
          />
        ))}
      </View>

      <Button
        label="Continue"
        onPress={handleContinue}
        disabled={!selected}
        fullWidth
        size="lg"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  options: {
    gap: spacing.sm,
  },
});
