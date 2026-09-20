/**
 * Terms of Service and Privacy Policy copy.
 *
 * TODO: this is placeholder wording written to give the screens a real shape —
 * it is not legal advice. Replace both documents with the text approved by your
 * legal team before launch, and bump `LEGAL_UPDATED` at the same time.
 */

export type LegalSection = {
  heading: string;
  body: string;
};

/** Revision date shown on both documents. */
export const LEGAL_UPDATED = '2026-09-20';

export const TERMS_SECTIONS: readonly LegalSection[] = [
  {
    heading: 'Using Taka',
    body: 'Taka connects households, businesses and reporters in Dodoma with waste collection services. Residents and commercial accounts arrange scheduled collections; reporters flag issues such as illegal dumping in their area.',
  },
  {
    heading: 'Your account',
    body: 'You agree to give accurate details when you register and to keep your phone number up to date, because we reach you by SMS. You are responsible for activity that happens through your account.',
  },
  {
    heading: 'Collections and payments',
    body: 'Collection schedules and any fees are shown in the app. If a collection is missed, report it in the app and we will arrange another visit. Fees that stay unpaid may lead to collections being paused.',
  },
  {
    heading: 'Acceptable use',
    body: 'Do not misuse the service: no false reports, no impersonating another household or business, and no attempt to disrupt or gain unauthorised access to our systems.',
  },
  {
    heading: 'Content you give us',
    body: 'Your details, location pins and photos remain yours. By uploading them you allow us to store and use them to provide the service — for example, sharing your address with the crew assigned to your collection.',
  },
  {
    heading: 'Ending your account',
    body: 'You can stop using Taka at any time. We may suspend or close an account that breaches these terms, or that we are required to act on by law.',
  },
  {
    heading: 'Changes to these terms',
    body: 'We may update these terms as the service develops. The revision date above shows the current version, and continuing to use Taka after a change means you accept it.',
  },
  {
    heading: 'Contact us',
    body: 'Questions about these terms? Reach us through the support option in the app.',
  },
];

export const PRIVACY_SECTIONS: readonly LegalSection[] = [
  {
    heading: 'What we collect',
    body: 'Your phone number, your name or business name, your ward and street, your LUKU meter number (residents) or TIN (commercial accounts), the location you pin, and the profile picture or logo you upload.',
  },
  {
    heading: 'Why we collect it',
    body: 'To create your account, confirm your number by SMS, route collections to the right address, bill the right meter or business, and respond when you report a problem.',
  },
  {
    heading: 'Location',
    body: 'We read your location only when you tap the button on the location step — never in the background. The pin is stored on your account and used to route collections.',
  },
  {
    heading: 'Photos',
    body: 'Profile pictures and logos are uploaded to our storage and shown wherever the app displays your account. You can replace or remove them from your profile.',
  },
  {
    heading: 'Sharing',
    body: 'We share what is needed with the collection partners and service providers who deliver the service, such as our SMS provider and our image storage. We never sell your personal information.',
  },
  {
    heading: 'How long we keep it',
    body: 'We keep your details while your account is active and for a reasonable period afterwards, so we can meet our accounting and legal obligations.',
  },
  {
    heading: 'Your choices',
    body: 'You can ask to see, correct or delete the information we hold about you, and you can withdraw permission for location access in your device settings.',
  },
  {
    heading: 'Contact us',
    body: 'For any privacy question or request, reach us through the support option in the app.',
  },
];
