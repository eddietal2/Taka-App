import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { Button, Screen, TextField } from '@/components';
import { fontSize, getPalette, spacing } from '@/constants/theme';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const MIN_NAME_LENGTH = 2;

type FieldErrors = {
  fullName?: string;
  email?: string;
  password?: string;
};

export default function SignUpScreen() {
  const router = useRouter();
  const theme = getPalette(useColorScheme());
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/login');
  };

  const handleContinue = async () => {
    const nextErrors: FieldErrors = {};
    if (fullName.trim().length < MIN_NAME_LENGTH) {
      nextErrors.fullName = 'Enter your full name.';
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      // TODO: step 1 of the sign-up flow. Persist these values (a form store or
      // context) and advance to the next step, e.g.:
      //   router.push('/sign-up/verify');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <Pressable
        onPress={handleBack}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={spacing.sm}
        style={styles.back}>
        <Text style={[styles.backText, { color: theme.textMuted }]}>Back</Text>
      </Pressable>

      <View style={styles.header}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <Text style={[styles.eyebrow, { color: theme.primary }]}>STEP 1</Text>
        <Text style={[styles.title, { color: theme.text }]}>Create your account</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          Start with your details. You can personalise the rest later.
        </Text>
      </View>

      <View style={styles.form}>
        <TextField
          label="Full name"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Ada Lovelace"
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          error={errors.fullName}
        />

        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          error={errors.email}
        />

        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Create a password"
          password
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={handleContinue}
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
          error={errors.password}
        />

        <Button
          label="Continue"
          onPress={handleContinue}
          loading={submitting}
          fullWidth
          size="lg"
        />

        <Text style={[styles.terms, { color: theme.textMuted }]}>
          By continuing you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.textMuted }]}>
          {'Already have an account? '}
        </Text>
        <Link href="/login" asChild>
          <Pressable accessibilityRole="link" hitSlop={spacing.sm}>
            <Text style={[styles.link, { color: theme.primary }]}>Log in</Text>
          </Pressable>
        </Link>
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
    gap: spacing.sm,
  },
  logo: {
    width: 56,
    height: 56,
    marginBottom: spacing.xs,
  },
  eyebrow: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    letterSpacing: 1,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: fontSize.md,
  },
  form: {
    gap: spacing.md,
  },
  terms: {
    fontSize: fontSize.xs,
    textAlign: 'center',
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
