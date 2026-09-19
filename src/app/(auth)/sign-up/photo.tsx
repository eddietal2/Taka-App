import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, PhotoPicker, Screen, StepHeader } from '@/components';
import { INTENT_COPY } from '@/constants/registration';
import { spacing } from '@/constants/theme';
import { useSignUp } from '@/features/signup/context';
import { SIGN_UP_STEPS, signUpProgress } from '@/features/signup/steps';

export default function PhotoScreen() {
  const router = useRouter();
  const { intent, phoneVerified, verificationToken, form, updateForm } = useSignUp();
  const [error, setError] = useState<string | undefined>();

  if (!intent || !phoneVerified) {
    return <Redirect href="/sign-up" />;
  }

  const copy = INTENT_COPY[intent];
  const isCommercial = intent === 'COMMERCIAL';
  const progress = signUpProgress(intent, SIGN_UP_STEPS.photo);

  const handleContinue = () => {
    const image = isCommercial ? form.business_logo : form.profile_picture;
    const missingMessage = isCommercial
      ? 'Add your business logo to continue.'
      : 'Add a profile picture to continue.';

    if (!image) {
      setError(missingMessage);
      return;
    }

    setError(undefined);
    router.push('/sign-up/review');
  };

  return (
    <Screen>
      <StepHeader
        title={isCommercial ? 'Add your business logo' : 'Add a profile picture'}
        subtitle={
          isCommercial
            ? 'This is what residents see on your listing.'
            : 'This is how your community will recognise you.'
        }
        step={progress.step}
        totalSteps={progress.totalSteps}
        onBack={() => router.back()}
      />

      <View style={styles.form}>
        {isCommercial ? (
          <PhotoPicker
            label={copy.imageLabel}
            value={form.business_logo}
            onChange={(url) => {
              setError(undefined);
              updateForm({ business_logo: url });
            }}
            purpose="business_logo"
            token={verificationToken}
            error={error}
          />
        ) : (
          <PhotoPicker
            label={copy.imageLabel}
            value={form.profile_picture}
            onChange={(url) => {
              setError(undefined);
              updateForm({ profile_picture: url });
            }}
            purpose="profile_picture"
            token={verificationToken}
            error={error}
          />
        )}

        <Button label="Continue" onPress={handleContinue} fullWidth size="lg" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.lg,
  },
});
