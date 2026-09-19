import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, LocationCapture, PhotoPicker, Screen, StepHeader } from '@/components';
import { INTENT_COPY } from '@/constants/registration';
import { spacing } from '@/constants/theme';
import { useSignUp } from '@/features/signup/context';
import { SIGN_UP_STEPS, SIGN_UP_TOTAL_STEPS } from '@/features/signup/steps';

type Errors = Partial<Record<'location' | 'profile_picture' | 'business_logo', string>>;

export default function MediaScreen() {
  const router = useRouter();
  const { intent, phoneVerified, verificationToken, form, updateForm } = useSignUp();
  const [errors, setErrors] = useState<Errors>({});

  if (!intent || !phoneVerified) {
    return <Redirect href="/sign-up" />;
  }

  const copy = INTENT_COPY[intent];
  const isCommercial = intent === 'COMMERCIAL';

  const handleContinue = () => {
    const next: Errors = {};
    if (copy.needsLocation && !form.location) {
      next.location = 'Add your location to continue.';
    }
    if (isCommercial) {
      if (!form.business_logo) next.business_logo = 'Add your business logo to continue.';
    } else if (!form.profile_picture) {
      next.profile_picture = 'Add a profile picture to continue.';
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;
    router.push('/sign-up/review');
  };

  return (
    <Screen>
      <StepHeader
        title="Location & photo"
        subtitle={
          isCommercial
            ? 'Pin your premises and add your business logo.'
            : 'Pin your address and add a profile picture.'
        }
        step={SIGN_UP_STEPS.media}
        totalSteps={SIGN_UP_TOTAL_STEPS}
        onBack={() => router.back()}
      />

      <View style={styles.form}>
        {copy.needsLocation ? (
          <LocationCapture
            value={form.location}
            onChange={(location) => updateForm({ location })}
            error={errors.location}
          />
        ) : null}

        {isCommercial ? (
          <PhotoPicker
            label={copy.imageLabel}
            value={form.business_logo}
            onChange={(url) => updateForm({ business_logo: url })}
            purpose="business_logo"
            token={verificationToken}
            error={errors.business_logo}
          />
        ) : (
          <PhotoPicker
            label={copy.imageLabel}
            value={form.profile_picture}
            onChange={(url) => updateForm({ profile_picture: url })}
            purpose="profile_picture"
            token={verificationToken}
            error={errors.profile_picture}
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
