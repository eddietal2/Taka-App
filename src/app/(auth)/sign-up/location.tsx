import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { Button, LocationCapture, LocationMap, Screen, StepHeader } from '@/components';
import { INTENT_COPY } from '@/constants/registration';
import { spacing } from '@/constants/theme';
import { useI18n } from '@/features/i18n/context';
import { useSignUp } from '@/features/signup/context';
import { SIGN_UP_STEPS, signUpProgress } from '@/features/signup/steps';

export default function LocationScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { intent, phoneVerified, form, updateForm } = useSignUp();
  const [error, setError] = useState<string | undefined>();

  if (!intent || !phoneVerified) {
    return <Redirect href="/sign-up" />;
  }

  // Reporters never pin a location, so this step is not part of their flow.
  if (!INTENT_COPY[intent].needsLocation) {
    return <Redirect href="/sign-up/photo" />;
  }

  const progress = signUpProgress(intent, SIGN_UP_STEPS.location);
  const isCommercial = intent === 'COMMERCIAL';

  const goToPhoto = () => router.push('/sign-up/photo');

  const handleContinue = () => {
    if (!form.location) {
      setError(t('signUp.location.missing'));
      return;
    }

    setError(undefined);

    // The pin is whatever the device reported, which may be somewhere the user
    // happens to be rather than the address collections should go to, so make
    // them confirm it. The copy differs for a household and a business.
    Alert.alert(
      t(isCommercial ? 'signUp.location.confirmTitleBusiness' : 'signUp.location.confirmTitleHome'),
      t(
        isCommercial
          ? 'signUp.location.confirmMessageBusiness'
          : 'signUp.location.confirmMessageHome'
      ),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.ok'), onPress: goToPhoto },
      ]
    );
  };

  return (
    <Screen
      footer={
        <Button label={t('common.continue')} onPress={handleContinue} fullWidth size="lg" />
      }>
      <StepHeader
        title={t('signUp.location.title')}
        subtitle={
          isCommercial
            ? t('signUp.location.subtitleBusiness')
            : t('signUp.location.subtitleHome')
        }
        step={progress.step}
        totalSteps={progress.totalSteps}
        onBack={() => router.back()}
      />

      <View style={styles.form}>
        <LocationMap value={form.location} error={Boolean(error)} style={styles.map} />

        <LocationCapture
          value={form.location}
          onChange={(location) => {
            setError(undefined);
            updateForm({ location });
          }}
          error={error}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    flexGrow: 1,
    gap: spacing.lg,
  },
  map: {
    // Takes the height the capture card leaves over, but never shrinks below
    // its default — the page scrolls instead.
    flexGrow: 1,
    flexShrink: 0,
  },
});
