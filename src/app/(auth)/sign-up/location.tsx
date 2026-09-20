import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { attachLukuLocation } from '@/api/luku';
import { Button, LocationCapture, LocationMap, Screen, StepHeader } from '@/components';
import { INTENT_COPY } from '@/constants/registration';
import { spacing } from '@/constants/theme';
import { useI18n } from '@/features/i18n/context';
import { useSignUp } from '@/features/signup/context';
import { resolveWard } from '@/features/signup/geocode';
import { detailsRouteFor, SIGN_UP_STEPS, signUpProgress } from '@/features/signup/steps';

/**
 * Third step of sign-up: the GPS point that is tied to the LUKU reference number
 * resolved on the previous step, so collections route to the address on file.
 *
 * When the meter already had a location, the previous step copies that point
 * into the form, so the map opens on it and the resident only has to confirm
 * rather than stand at the premises to capture it again.
 *
 * Reporters never pin a location, so this step is not part of their flow.
 */
export default function LocationScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { intent, phone, phoneVerified, verificationToken, form, updateForm } = useSignUp();
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  if (!intent || !phoneVerified) {
    return <Redirect href="/sign-up" />;
  }

  if (!INTENT_COPY[intent].needsLocation) {
    return <Redirect href="/sign-up/photo" />;
  }

  const progress = signUpProgress(intent, SIGN_UP_STEPS.location);
  const isCommercial = intent === 'COMMERCIAL';
  const nextRoute = detailsRouteFor(intent);

  const handleContinue = async () => {
    if (!form.location) {
      setError(t('signUp.location.missing'));
      return;
    }

    setError(undefined);
    setSaving(true);

    // Resolve the ward so it can be pre-filled on the details step. Best-effort:
    // the coordinates are still worth keeping when the geocoder has nothing.
    //
    // Only the ward is taken from the pin. A reverse-geocoded street is often
    // wrong — an unnamed road, a highway, or the ward's own name echoed back — so
    // the street is left for the resident to type. Both are written onto the
    // meter's record at registration, from those typed values.
    let wardKata = form.ward_kata;
    const resolvedWard = await resolveWard(form.location);
    if (wardKata.trim().length === 0 && resolvedWard) wardKata = resolvedWard;

    // The meter reference is what future collections are matched against, so the
    // point is persisted against it before the user moves on. A business may not
    // have a meter, in which case only the profile carries the location.
    if (form.luku_meter) {
      try {
        await attachLukuLocation(
          { phone, luku_meter: form.luku_meter, location: form.location },
          verificationToken
        );
      } catch (cause) {
        setSaving(false);
        // Server messages arrive in English; only the fallback is translated.
        setError(cause instanceof Error ? cause.message : t('signUp.location.attachFailed'));
        return;
      }
    }

    updateForm({ ward_kata: wardKata });
    setSaving(false);

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
        { text: t('common.ok'), onPress: () => router.push(nextRoute) },
      ]
    );
  };

  return (
    <Screen
      footer={
        <Button
          label={t('common.continue')}
          onPress={handleContinue}
          loading={saving}
          fullWidth
          size="lg"
        />
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
