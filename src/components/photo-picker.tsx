import { Asset } from 'expo-asset';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';

import { uploadImage, type UploadPurpose } from '@/api/uploads';
import { fontSize, getPalette, radius, spacing } from '@/constants/theme';
import { useI18n } from '@/features/i18n/context';

/**
 * Stands in for the picture while nothing is chosen, and is what gets uploaded
 * when the user skips so the payload always carries a real image URL.
 */
const DEFAULT_AVATAR = require('@/assets/images/default-avatar.png');

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
 * then compresses it, uploads to S3 and reports the public URL. The preview sits
 * on its own row at the full width of the parent, square so it matches the crop.
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

  /**
   * Accepts the default avatar as the picture. It goes through the normal upload
   * path so the stored value is a real URL; the bundled asset has to be
   * downloaded to the cache first because in development Metro serves it over
   * HTTP, which the uploader cannot read.
   */
  const skip = async () => {
    setLocalError(null);
    setBusy(true);

    try {
      const asset = Asset.fromModule(DEFAULT_AVATAR);
      await asset.downloadAsync();
      const publicUrl = await uploadImage(asset.localUri ?? asset.uri, purpose, token);
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

      <View
        style={[styles.preview, { borderColor: theme.border, backgroundColor: theme.surface }]}>
        {value ? (
          <Image source={{ uri: value }} style={styles.image} contentFit="cover" />
        ) : (
          <Image source={DEFAULT_AVATAR} style={styles.defaultIcon} contentFit="contain" />
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
            style={({ pressed }) => [styles.plainAction, pressed && styles.pressed]}>
            <Text style={[styles.actionText, { color: theme.danger }]}>
              {t('signUp.photo.remove')}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={skip}
            disabled={busy}
            accessibilityRole="button"
            style={({ pressed }) => [styles.plainAction, pressed && styles.pressed]}>
            <Text style={[styles.actionText, { color: theme.textMuted }]}>
              {t('signUp.photo.skip')}
            </Text>
          </Pressable>
        )}
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
  /** Own row, edge to edge, square to match the 1:1 crop the editor applies. */
  preview: {
    width: '100%',
    aspectRatio: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  defaultIcon: {
    width: '45%',
    height: '45%',
    opacity: 0.6,
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
  actions: {
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
  plainAction: {
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
