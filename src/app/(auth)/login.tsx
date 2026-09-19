import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { Button, Screen, TextField } from '@/components';
import { isValidTanzanianNumber, TANZANIA_COUNTRY_CODE } from '@/constants/phone';
import { fontSize, getPalette, spacing } from '@/constants/theme';

type FieldErrors = {
  phone?: string;
};

export default function LoginScreen() {
  const theme = getPalette(useColorScheme());
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const nextErrors: FieldErrors = {};
    if (!isValidTanzanianNumber(phone)) {
      nextErrors.phone = 'Enter a valid Tanzanian mobile number.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      // TODO: send a one-time code to the number in E.164 form, then route to the
      // verification step: router.push('/verify').
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen centered>
      <View style={styles.header}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <Text style={[styles.title, { color: theme.text }]}>Welcome to the Taka App!</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          {"Enter your phone number and we'll text you a code."}
        </Text>
      </View>

      <View style={styles.form}>
        <TextField
          label="Phone number"
          value={phone}
          onChangeText={setPhone}
          prefix={TANZANIA_COUNTRY_CODE}
          placeholder="712 345 678"
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          error={errors.phone}
        />

        <Button
          label="Continue"
          onPress={handleSubmit}
          loading={submitting}
          fullWidth
          size="lg"
        />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.textMuted }]}>
          {"Don't have an account? "}
        </Text>
        <Link href="/sign-up" asChild>
          <Pressable accessibilityRole="link" hitSlop={spacing.sm}>
            <Text style={[styles.link, { color: theme.primary }]}>Sign up</Text>
          </Pressable>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  form: {
    gap: spacing.md,
  },
  link: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: fontSize.sm,
  },
});
