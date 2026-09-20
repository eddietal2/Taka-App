import { useI18n } from '@/features/i18n/context';
import { LEGAL_UPDATED, PRIVACY_SECTIONS } from '@/features/legal/content';
import { LegalPage } from '@/features/legal/legal-page';

/**
 * Privacy Policy, mounted at `/privacy` rather than under the sign-up group so
 * any screen in the app can link to it.
 */
export default function PrivacyScreen() {
  const { t } = useI18n();

  return (
    <LegalPage title={t('legal.privacyTitle')} updated={LEGAL_UPDATED} sections={PRIVACY_SECTIONS} />
  );
}
