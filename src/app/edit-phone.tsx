import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { requestOtp, verifyOtp, type SessionUser } from '@/api/auth';
import { changePhone } from '@/api/profile';
import { Button, Screen, TextField } from '@/components';
import {
  isValidTanzanianNumber,
  TANZANIA_COUNTRY_CODE,
  TANZANIA_MAX_NATIONAL_DIGITS,
  toE164,
} from '@/constants/phone';
import { fontSize, getPalette, radius, spacing } from '@/constants/theme';
import { getSessionUser, getToken, saveSessionUser } from '@/features/auth/session';
import { useI18n } from '@/features/i18n/context';

const CODE_LENGTH = 6;

/**
 * Moves the account onto a different phone number.
 *
 * A number is only allowed onto an account once it has been shown to be
 * reachable, so the change is two steps: send a code to the new number, then
 * prove it. Only after `otp/verify` returns its short-lived verification token
 * is the number handed to the account endpoint — the server reads the number
 * from that token, so the app cannot move an account onto a number it has not
 * just verified.
 *
 * Sits outside the `(tabs)` group like the photo and name screens, so it opens
 * over the tab bar as a focused task and returns to the profile when done.
 */
export default function EditPhoneScreen() {
  const router = useRouter();
  const theme = getPalette(useColorScheme());
  const { t } = useI18n();
  const [session, setSession] = useState<{
    token: string | null;
    user: SessionUser | null;
  } | null>(null);
  /** Which half of the flow is on screen. */
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  /** Digits only, so `maxLength` counts the digits that matter. */
  const [value, setValue] = useState('');
  const [code, setCode] = useState('');
  /**
   * E.164 of the number the code was sent to. Held rather than re-read from the
   * field so the code step cannot be retargeted by editing the number behind it.
   */
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void Promise.all([getToken(), getSessionUser()]).then(([token, user]) => {
      if (!cancelled) setSession({ token, user });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Nothing stored, or the session was cleared: back to sign in.
  if (session && (!session.token || !session.user)) {
    return <Redirect href="/login" />;
  }

  const currentPhone = session?.user?.phone;

  /** Step one: get a code sent to the number the account is moving to. */
  const handleSendCode = async () => {
    if (!isValidTanzanianNumber(value)) {
      setError(t('common.invalidPhone'));
      return;
    }

    const next = toE164(value);
    // Rewriting the same number would prove nothing and burn a code.
    if (next === currentPhone) {
      setError(t('editPhone.sameNumber'));
      return;
    }

    setError(undefined);
    setMessage(null);
    setSubmitting(true);

    try {
      const response = await requestOtp(next);

      // The code was sent, but the number already has an account and a second
      // one cannot share it, so the change is refused before the code step.
      if (response.registered) {
        setError(t('editPhone.registeredBody', { phone: next }));
        return;
      }

      setPendingPhone(next);
      setCode('');
      setStep('code');
    } catch (cause) {
      // Server messages arrive in English; only the fallback is translated.
      setError(cause instanceof Error ? cause.message : t('editPhone.sendFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  /** Step two: trade the verified number for a saved one. */
  const handleVerify = async () => {
    const token = session?.token;
    if (!token || !pendingPhone) return;

    if (code.length !== CODE_LENGTH) {
      setError(t('editPhone.codeLength', { digits: CODE_LENGTH }));
      return;
    }

    setError(undefined);
    setMessage(null);
    setSubmitting(true);

    try {
      const verification = await verifyOtp(pendingPhone, code);
      const verificationToken = verification.verification_token;
      if (!verificationToken) {
        setError(t('editPhone.codeRejected'));
        return;
      }

      const response = await changePhone(pendingPhone, verificationToken, token);

      // The server is the authority on what it stored; fall back to the number
      // we verified only if it returned no record.
      const user = session?.user;
      if (response.user) {
        await saveSessionUser(response.user);
      } else if (user) {
        await saveSessionUser({ ...user, phone: pendingPhone });
      }

      router.back();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('editPhone.saveFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!pendingPhone) return;

    setError(undefined);
    setMessage(null);
    setResending(true);

    try {
      await requestOtp(pendingPhone);
      setMessage(t('editPhone.resent'));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('editPhone.resendFailed'));
    } finally {
      setResending(false);
    }
  };

  const onCodeStep = step === 'code';

  return (
    <Screen
      footer={
        <Button
          label={onCodeStep ? t('editPhone.verify') : t('editPhone.send')}
          onPress={onCodeStep ? handleVerify : handleSendCode}
          loading={submitting}
          fullWidth
          size="lg"
        />
      }>
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel={t('common.goBack')}
        hitSlop={spacing.sm}
        style={styles.back}>
        <Text style={[styles.backText, { color: theme.textMuted }]}>{t('common.back')}</Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          {onCodeStep ? t('editPhone.codeTitle') : t('editPhone.title')}
        </Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          {onCodeStep
            ? t('editPhone.codeSubtitle', { digits: CODE_LENGTH, phone: pendingPhone ?? '' })
            : t('editPhone.subtitle')}
        </Text>
      </View>

      {/* The number the account is on now, shown plainly so it is obvious what
          is being changed — and so the code step still shows where the account
          started from. */}
      {currentPhone ? (
        <View
          style={[
            styles.currentCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}>
          <Text style={[styles.currentLabel, { color: theme.textMuted }]}>
            {t('editPhone.currentLabel')}
          </Text>
          <Text style={[styles.currentValue, { color: theme.text }]}>{currentPhone}</Text>
        </View>
      ) : null}

      {onCodeStep ? (
        <View style={styles.form}>
          <TextField
            label={t('editPhone.codeLabel')}
            value={code}
            onChangeText={(next) => {
              setError(undefined);
              setCode(next.replace(/\D/g, ''));
            }}
            placeholder="000000"
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            maxLength={CODE_LENGTH}
            returnKeyType="done"
            onSubmitEditing={handleVerify}
            error={error}
          />

          {message ? (
            <Text style={[styles.message, { color: theme.textMuted }]}>{message}</Text>
          ) : null}

          <Pressable
            onPress={handleResend}
            disabled={resending}
            accessibilityRole="button"
            hitSlop={spacing.sm}
            style={styles.resend}>
            <Text style={[styles.resendText, { color: theme.primary }]}>
              {resending ? t('editPhone.resending') : t('editPhone.resend')}
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.form}>
          <TextField
            label={t('editPhone.phoneLabel')}
            value={value}
            onChangeText={(next) => {
              setError(undefined);
              setValue(next.replace(/\D/g, ''));
            }}
            prefix={TANZANIA_COUNTRY_CODE}
            placeholder="712345678"
            maxLength={TANZANIA_MAX_NATIONAL_DIGITS}
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
            returnKeyType="done"
            onSubmitEditing={handleSendCode}
            error={error}
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: fontSize.sm,
  },
  /** Shows the number currently on the account, above the change form. */
  currentCard: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  currentLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  currentValue: {
    fontSize: fontSize.md,
  },
  form: {
    gap: spacing.md,
  },
  message: {
    fontSize: fontSize.sm,
  },
  resend: {
    alignSelf: 'center',
  },
  resendText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});
