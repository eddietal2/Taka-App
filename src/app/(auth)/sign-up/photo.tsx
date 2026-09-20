import { Redirect, useRouter } from 'expo-router';
import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, PhotoPicker, Screen, StepHeader, type PhotoPickerHandle } from '@/components';
import { INTENT_COPY } from '@/constants/registration';
import { spacing } from '@/constants/theme';
import { useI18n } from '@/features/i18n/context';
import { businessInitialsLogo } from '@/features/signup/business-logo';
import { useSignUp } from '@/features/signup/context';
import { SIGN_UP_STEPS, signUpProgress } from '@/features/signup/steps';

export default function PhotoScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { intent, phoneVerified, verificationToken, form, updateForm } = useSignUp();
  const picker = useRef<PhotoPickerHandle>(null);

  if (!intent || !phoneVerified) {
    return <Redirect href="/sign-up" />;
  }

  const copy = INTENT_COPY[intent];
  const isCommercial = intent === 'COMMERCIAL';
  const progress = signUpProgress(intent, SIGN_UP_STEPS.photo);

  const goToReview = () => router.push('/sign-up/review');

  const handleContinue = () => {
    const image = isCommercial ? form.business_logo : form.profile_picture;

    // With nothing chosen, Continue does exactly what Skip does: warn the user,
    // store the stand-in image, then move on. The flow lives in the picker, so
    // this just runs it rather than duplicating the dialog and upload here.
    if (!image) {
      picker.current?.skip();
      return;
    }

    goToReview();
  };

  return (
    <Screen
      footer={
        <Button label={t('common.continue')} onPress={handleContinue} fullWidth size="lg" />
      }>
      <StepHeader
        title={isCommercial ? t('signUp.photo.titleBusiness') : t('signUp.photo.titleProfile')}
        subtitle={
          isCommercial
            ? t('signUp.photo.subtitleBusiness')
            : t('signUp.photo.subtitleProfile')
        }
        step={progress.step}
        totalSteps={progress.totalSteps}
        onBack={() => router.back()}
      />

      <View style={styles.form}>
        {isCommercial ? (
          <PhotoPicker
            ref={picker}
            label={t(copy.imageLabelKey)}
            value={form.business_logo}
            onChange={(url) => updateForm({ business_logo: url })}
            purpose="business_logo"
            token={verificationToken}
            fallback={businessInitialsLogo(form.business_name)}
            onSkip={goToReview}
          />
        ) : (
          <PhotoPicker
            ref={picker}
            label={t(copy.imageLabelKey)}
            value={form.profile_picture}
            onChange={(url) => updateForm({ profile_picture: url })}
            purpose="profile_picture"
            token={verificationToken}
            onSkip={goToReview}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.lg,
  },
});
