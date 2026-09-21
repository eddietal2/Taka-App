import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { login, requestOtp, verifyOtp } from '@/api/auth';
import { ApiError } from '@/api/client';
import { Button, Screen, TextField } from '@/components';
import { fontSize, getPalette, spacing } from '@/constants/theme';
import { saveSessionUser, saveToken } from '@/features/auth/session';
import { useI18n } from '@/features/i18n/context';
import { useAdoptAccountPreferences } from '@/features/preferences/use-adopt-preferences';

const CODE_LENGTH = 6;

/**
 * Sign-in step: proves the number belongs to the caller, then trades that proof
 * for a session. Reached from the login screen, which passes the verified-format
 * number in E.164 form.
 */
export default function LoginVerifyScreen() {
  const router = useRouter();
  const theme = getPalette(useColorScheme());
  const { t } = useI18n();
  const adoptAccountPreferences = useAdoptAccountPreferences();
  const params = useLocalSearchParams<{ phone?: string }>();
  const phone = typeof params.phone === 'string' ? params.phone : undefined;

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  if (!phone) {
    return <Redirect href="/login" />;
  }

  const handleVerify = async () => {
    if (code.length !== CODE_LENGTH) {
      setError(t('login.codeLength', { digits: CODE_LENGTH }));
      return;
    }

    setError(undefined);
    setMessage(null);
    setSubmitting(true);

    try {
      const verification = await verifyOtp(phone, code);
      const verificationToken = verification.verification_token;
      if (!verificationToken) {
        setError(t('login.codeRejected'));
        return;
      }

      const session = await login(verificationToken);

      // No token means the account verified its number but is not approved yet.
      if (!session.token) {
        setError(t('login.pendingApproval'));
        return;
      }

      await saveToken(session.token);
      if (session.user) {
        await saveSessionUser(session.user);
        // The account's stored preferences win; an account that has none adopts
        // whatever this device was already showing.
        await adoptAccountPreferences(session.user, session.token);
      }

      router.replace('/home');
    } catch (cause) {
      // 404 is the server telling us this number has no account behind it.
      if (cause instanceof ApiError && cause.status === 404) {
        setError(t('login.notRegistered'));
      } else {
        setError(cause instanceof Error ? cause.message : t('login.codeRejected'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError(undefined);
    setMessage(null);
    setResending(true);

    try {
      await requestOtp(phone);
      setMessage(t('login.resent'));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('login.resendFailed'));
    } finally {
      setResending(false);
    }
  };

  return (
    <Screen>
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel={t('common.goBack')}
        hitSlop={spacing.sm}
        style={styles.back}>
        <Text style={[styles.backText, { color: theme.textMuted }]}>{t('common.back')}</Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{t('login.codeTitle')}</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          {t('login.codeSubtitle', { digits: CODE_LENGTH, phone })}
        </Text>
      </View>

      <View style={styles.form}>
        <TextField
          label={t('login.codeLabel')}
          value={code}
          onChangeText={(value) => {
            setError(undefined);
            setCode(value.replace(/\D/g, ''));
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

        <Button
          label={t('login.verify')}
          onPress={handleVerify}
          loading={submitting}
          fullWidth
          size="lg"
        />

        <Pressable
          onPress={handleResend}
          disabled={resending}
          accessibilityRole="button"
          hitSlop={spacing.sm}
          style={styles.resend}>
          <Text style={[styles.resendText, { color: theme.primary }]}>
            {resending ? t('login.resending') : t('login.resend')}
          </Text>
        </Pressable>
      </View>
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
