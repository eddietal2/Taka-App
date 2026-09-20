import { useI18n } from '@/features/i18n/context';
import { LEGAL_UPDATED, TERMS_SECTIONS } from '@/features/legal/content';
import { LegalPage } from '@/features/legal/legal-page';

/**
 * Terms of Service, mounted at `/terms` rather than under the sign-up group so
 * any screen in the app can link to it.
 */
export default function TermsScreen() {
  const { t } = useI18n();

  return (
    <LegalPage title={t('legal.termsTitle')} updated={LEGAL_UPDATED} sections={TERMS_SECTIONS} />
  );
}
