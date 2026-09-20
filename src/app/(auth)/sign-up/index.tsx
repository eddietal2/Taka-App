import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, OptionCard, Screen, StepHeader } from '@/components';
import { INTENT_COPY, USER_INTENTS, type UserIntent } from '@/constants/registration';
import { spacing } from '@/constants/theme';
import { useI18n } from '@/features/i18n/context';
import { useSignUp } from '@/features/signup/context';
import { SIGN_UP_STEPS, signUpProgress } from '@/features/signup/steps';

export default function ChooseAccountTypeScreen() {
  const router = useRouter();
  const { t } = useI18n();
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
    <Screen
      footer={
        <Button
          label={t('common.continue')}
          onPress={handleContinue}
          disabled={!selected}
          fullWidth
          size="lg"
        />
      }>
      <StepHeader
        title={t('signUp.intent.title')}
        subtitle={t('signUp.intent.subtitle')}
        step={progress.step}
        totalSteps={progress.totalSteps}
        onBack={handleBack}
      />

      <View style={styles.options}>
        {USER_INTENTS.map((value) => (
          <OptionCard
            key={value}
            title={t(INTENT_COPY[value].titleKey)}
            description={t(INTENT_COPY[value].descriptionKey)}
            selected={selected === value}
            onPress={() => setSelected(value)}
          />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  options: {
    gap: spacing.sm,
  },
});
