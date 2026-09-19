import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';

import { uploadImage, type UploadPurpose } from '@/api/uploads';
import { fontSize, getPalette, radius, spacing } from '@/constants/theme';
import { useI18n } from '@/features/i18n/context';

/**
 * A profile picture and a business logo are both avatars, so the editor is
 * locked to a square. iOS always crops square; Android honours `aspect`.
 */
const CROP_ASPECT: [number, number] = [1, 1];

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: CROP_ASPECT,
  quality: 1,
};

export type PhotoPickerProps = {
  label: string;
  /** Public URL of the uploaded image, or null when nothing is chosen yet. */
  value: string | null;
  onChange: (url: string | null) => void;
  purpose: UploadPurpose;
  /** Verification token from the OTP step, when the API requires one. */
  token?: string | null;
  error?: string;
};

/**
 * Picks or captures an image, hands it to the OS editor to be cropped square,
 * then compresses it, uploads to S3 and reports the public URL.
 */
export function PhotoPicker({ label, value, onChange, purpose, token, error }: PhotoPickerProps) {
  const theme = getPalette(useColorScheme());
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const pick = async (source: 'library' | 'camera') => {
    setLocalError(null);

    try {
      const permission =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setLocalError(
          source === 'camera'
            ? t('signUp.photo.cameraPermission')
            : t('signUp.photo.libraryPermission')
        );
        return;
      }

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(PICKER_OPTIONS)
          : await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);

      const asset = result.canceled ? undefined : result.assets[0];
      if (!asset) return;

      setBusy(true);
      // The picked width lets the compressor skip upscaling a small image.
      const publicUrl = await uploadImage(asset.uri, purpose, token, asset.width);
      onChange(publicUrl);
    } catch (cause) {
      setLocalError(cause instanceof Error ? cause.message : t('signUp.photo.uploadFailed'));
    } finally {
      setBusy(false);
    }
  };

  const message = localError ?? error;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>

      <View style={styles.previewRow}>
        <View
          style={[styles.preview, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          {value ? (
            <Image source={{ uri: value }} style={styles.previewImage} contentFit="cover" />
          ) : (
            <Text style={[styles.placeholder, { color: theme.textMuted }]}>
              {t('signUp.photo.noImage')}
            </Text>
          )}

          {busy ? (
            <View style={styles.busyOverlay}>
              <ActivityIndicator color={theme.primary} />
            </View>
          ) : null}
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() => pick('library')}
            disabled={busy}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.action,
              { borderColor: theme.border },
              pressed && styles.pressed,
              busy && styles.disabled,
            ]}>
            <Text style={[styles.actionText, { color: theme.text }]}>
              {value ? t('signUp.photo.change') : t('signUp.photo.choose')}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => pick('camera')}
            disabled={busy}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.action,
              { borderColor: theme.border },
              pressed && styles.pressed,
              busy && styles.disabled,
            ]}>
            <Text style={[styles.actionText, { color: theme.text }]}>
              {t('signUp.photo.take')}
            </Text>
          </Pressable>

          {value ? (
            <Pressable
              onPress={() => onChange(null)}
              disabled={busy}
              accessibilityRole="button"
              style={({ pressed }) => [styles.removeAction, pressed && styles.pressed]}>
              <Text style={[styles.actionText, { color: theme.danger }]}>
                {t('signUp.photo.remove')}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {message ? <Text style={[styles.helper, { color: theme.danger }]}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  previewRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  preview: {
    width: 96,
    height: 96,
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  busyOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  placeholder: {
    fontSize: fontSize.xs,
  },
  actions: {
    flex: 1,
    gap: spacing.sm,
  },
  action: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeAction: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  helper: {
    fontSize: fontSize.xs,
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.5,
  },
});
