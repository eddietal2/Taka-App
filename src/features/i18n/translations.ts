/**
 * Translation catalogue.
 *
 * English is the source of truth: `TranslationKey` is derived from it, and the
 * other languages are typed as a complete `Record` of those keys, so adding an
 * English string without translating it is a compile error rather than a blank
 * space at runtime.
 *
 * Values may contain `{placeholders}` — fill them via the second argument of
 * `t()`, e.g. `t('signUp.verify.subtitle', { digits, phone })`.
 */

export const LANGUAGES = ['en', 'sw'] as const;
export type Language = (typeof LANGUAGES)[number];

/** Language names are endonyms, so each stays legible to its own speakers. */
export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  sw: 'Kiswahili',
};

const en = {
  'common.continue': 'Continue',
  'common.done': 'Done',
  'common.uploaded': 'Uploaded',
  'common.select': 'Select',
  'common.selectPlaceholder': 'Select…',
  'common.back': 'Back',
  'common.goBack': 'Go back',
  'common.stepCounter': 'STEP {step} OF {total}',
  'common.ok': 'Ok',
  'common.cancel': 'Cancel',
  'common.invalidPhone': 'Enter a valid Tanzanian mobile number.',
  'login.languageLabel': 'Language',
  'login.themeDark': 'Switch to dark mode',
  'login.themeLight': 'Switch to light mode',
  'login.title': 'Welcome to the Taka App!',
  'login.subtitle': "Enter your phone number and we'll text you a code.",
  'login.phoneLabel': 'Phone number',
  'login.noAccount': "Don't have an account? ",
  'login.signUp': 'Sign up',

  'intent.resident.title': 'Resident',
  'intent.resident.description': 'A household using Taka for waste collection.',
  'intent.resident.imageLabel': 'Profile picture',
  'intent.reporter.title': 'Reporter',
  'intent.reporter.description': 'Report issues and illegal dumping in your area.',
  'intent.reporter.imageLabel': 'Profile picture',
  'intent.commercial.title': 'Commercial',
  'intent.commercial.description': 'A business or institution with scheduled collections.',
  'intent.commercial.imageLabel': 'Business logo',
  'wasteTier.highVolumeDaily': 'High volume — daily collection',

  'signUp.intent.title': 'How will you use Taka?',
  'signUp.intent.subtitle':
    'Choose the account type that fits you. This decides what we ask for next.',

  'signUp.phone.title': "What's your phone number?",
  'signUp.phone.subtitle':
    "We'll text a one-time code to verify it. Signing up as {intent}.",
  'signUp.phone.label': 'Phone number',
  'signUp.phone.note': 'You can also start with 0, e.g. 0712345678.',
  'signUp.phone.submit': 'Send code',
  'signUp.phone.failed': 'Could not send the code. Try again.',

  'signUp.verify.title': 'Enter your code',
  'signUp.verify.subtitle': 'We sent a {digits}-digit code to {phone}.',
  'signUp.verify.label': 'Verification code',
  'signUp.verify.submit': 'Verify',
  'signUp.verify.resend': 'Resend code',
  'signUp.verify.resending': 'Sending…',
  'signUp.verify.resent': 'A new code is on its way.',
  'signUp.verify.enterDigits': 'Enter the {digits}-digit code.',
  'signUp.verify.incorrect': 'That code did not work. Try again.',
  'signUp.verify.resendFailed': 'Could not resend the code.',

  'signUp.details.firstName': 'First name',
  'signUp.details.lastName': 'Last name',
  'signUp.details.ward': 'Ward / Kata',
  'signUp.details.street': 'Street / Mtaa',
  'signUp.details.unitNumber': 'Unit number',
  'signUp.details.unitHint': 'Optional — apartment, house or room.',
  'signUp.details.unitPlaceholder': 'Room 4',
  'signUp.details.businessName': 'Business name',
  'signUp.details.wasteTier': 'Waste tier',
  'signUp.details.wasteTierPlaceholder': 'Choose a tier',
  'signUp.details.taxId': 'TIN / Tax ID',
  'signUp.details.taxIdHint': 'Format: 123-456-789.',
  'signUp.details.firstNameError': 'Enter your first name.',
  'signUp.details.lastNameError': 'Enter your last name.',
  'signUp.details.wardError': 'Enter your ward (kata).',
  'signUp.details.streetError': 'Enter your street (mtaa).',
  'signUp.details.businessNameError': 'Enter the business name.',
  'signUp.details.wasteTierError': 'Choose a waste tier.',
  'signUp.details.taxIdError': 'Use the 123-456-789 format.',

  'signUp.resident.title': 'Your details',
  'signUp.resident.subtitle': 'Tell us who you are and where we should collect from.',
  'signUp.reporter.title': 'Your details',
  'signUp.reporter.subtitle':
    'Reporters help keep Dodoma clean by flagging issues in your area.',
  'signUp.commercial.title': 'Business details',
  'signUp.commercial.subtitle':
    'Tell us about the business and how much waste we should expect.',

  'signUp.luku.title': 'Your LUKU meter',
  'signUp.luku.subtitle':
    'We link your household to its meter so collections are billed to the right place.',
  'signUp.luku.label': 'LUKU meter number',
  'signUp.luku.hint': '11 digits, printed on your meter.',
  'signUp.luku.error': 'Enter the {digits}-digit number printed on your meter.',

  'signUp.location.title': 'Pin your location',
  'signUp.location.subtitleBusiness':
    'Drop a pin on your premises so we know where to collect.',
  'signUp.location.subtitleHome': 'Drop a pin on your address so we know where to collect.',
  'signUp.location.missing': 'Add your location to continue.',
  'signUp.location.captureLabel': 'Location',
  'signUp.location.empty': 'We use your location to route collections to your address.',
  'signUp.location.resolving': 'Finding the nearby address…',
  'signUp.location.capture': 'Use my current location',
  'signUp.location.update': 'Update location',
  'signUp.location.permission':
    'Location access is required. Enable it in Settings and try again.',
  'signUp.location.failed': 'Could not get your location. Make sure GPS is on and try again.',
  'signUp.location.mapTanzania': 'Map of Tanzania',
  'signUp.location.mapCentered': 'Map centred on {coordinates}',
  'signUp.location.mapUnavailable': 'The map is available in the mobile app.',
  'signUp.location.recentre': 'Recentre',
  'signUp.location.recentreLabel': 'Move the map back to your location',

  'signUp.photo.titleBusiness': 'Add your business logo',
  'signUp.photo.titleProfile': 'Add a profile picture',
  'signUp.photo.subtitleBusiness': 'This is what residents see on your listing.',
  'signUp.photo.subtitleProfile': 'This is how your community will recognise you.',
  'signUp.photo.missingBusiness': 'Add your business logo to continue.',
  'signUp.photo.missingProfile': 'Add a profile picture to continue.',
  'signUp.photo.choose': 'Choose photo',
  'signUp.photo.change': 'Change photo',
  'signUp.photo.take': 'Take photo',
  'signUp.photo.remove': 'Remove',
  'signUp.photo.skip': 'Skip',
  'signUp.photo.skipTitle': 'Skip without a photo?',
  'signUp.photo.skipMessage':
    'Your account will use a default image. You can add your own later.',
  'signUp.photo.cameraPermission':
    'Camera access is required. Enable it in Settings and try again.',
  'signUp.photo.libraryPermission':
    'Photo access is required. Enable it in Settings and try again.',
  'signUp.photo.uploadFailed': 'Upload failed. Please try again.',

  'signUp.review.title': 'Check everything',
  'signUp.review.subtitle': 'We use these details to set up your Taka account.',
  'signUp.review.accountType': 'Account type',
  'signUp.review.phone': 'Phone',
  'signUp.review.name': 'Name',
  'signUp.review.business': 'Business',
  'signUp.review.unit': 'Unit',
  'signUp.review.luku': 'LUKU meter',
  'signUp.review.location': 'Location',
  'signUp.review.logo': 'Logo',
  'signUp.review.termsPrefix': 'I agree to the ',
  'signUp.review.termsAnd': ' and ',
  'signUp.review.termsSuffix': '.',
  'signUp.review.termsError': 'Please accept the terms to continue.',
  'signUp.review.submit': 'Create account',
  'signUp.review.failed': 'Registration failed. Please try again.',

  'signUp.success.pendingTitle': 'Almost there',
  'signUp.success.title': 'You are all set',
  'signUp.success.pendingSubtitle':
    'We received your registration. Our team will review it and you will be notified once your account is approved.',
  'signUp.success.subtitle': 'Your Taka account has been created. Log in to get started.',

  'legal.termsTitle': 'Terms of Service',
  'legal.privacyTitle': 'Privacy Policy',
  'legal.updatedLabel': 'Last updated {date}',
  'legal.placeholderNotice':
    'Placeholder wording — replace with your reviewed legal copy before launch.',
} as const;

export type TranslationKey = keyof typeof en;

const sw: Record<TranslationKey, string> = {
  'common.continue': 'Endelea',
  'common.done': 'Maliza',
  'common.uploaded': 'Imepakiwa',
  'common.select': 'Chagua',
  'common.selectPlaceholder': 'Chagua…',
  'common.back': 'Rudi',
  'common.goBack': 'Rudi nyuma',
  'common.stepCounter': 'HATUA {step} YA {total}',
  'common.ok': 'Sawa',
  'common.cancel': 'Ghairi',
  'common.invalidPhone': 'Ingiza namba sahihi ya simu ya Tanzania.',
  'login.languageLabel': 'Lugha',
  'login.themeDark': 'Badilisha kwenda hali ya giza',
  'login.themeLight': 'Badilisha kwenda hali ya mwanga',
  'login.title': 'Karibu kwenye Taka App!',
  'login.subtitle': 'Ingiza namba yako ya simu na tutakutumia msimbo kwa SMS.',
  'login.phoneLabel': 'Namba ya simu',
  'login.noAccount': 'Hauna akaunti? ',
  'login.signUp': 'Jisajili',

  'intent.resident.title': 'Mkazi',
  'intent.resident.description': 'Kaya inayotumia Taka kukusanya taka.',
  'intent.resident.imageLabel': 'Picha ya wasifu',
  'intent.reporter.title': 'Mripoti',
  'intent.reporter.description': 'Ripoti matatizo na utupaji haramu katika eneo lako.',
  'intent.reporter.imageLabel': 'Picha ya wasifu',
  'intent.commercial.title': 'Biashara',
  'intent.commercial.description': 'Biashara au taasisi inayokusanyiwa taka kwa ratiba.',
  'intent.commercial.imageLabel': 'Nembo ya biashara',
  'wasteTier.highVolumeDaily': 'Kiasi kikubwa — ukusanyaji wa kila siku',

  'signUp.intent.title': 'Utatumia Taka vipi?',
  'signUp.intent.subtitle':
    'Chagua aina ya akaunti inayokufaa. Hii itaamua tunachokuuliza baada ya hapa.',

  'signUp.phone.title': 'Namba yako ya simu ni ipi?',
  'signUp.phone.subtitle':
    'Tutakutumia msimbo wa mara moja kwa SMS ili kuithibitisha. Unajisajili kama {intent}.',
  'signUp.phone.label': 'Namba ya simu',
  'signUp.phone.note': 'Unaweza pia kuanza na 0, mfano 0712345678.',
  'signUp.phone.submit': 'Tuma msimbo',
  'signUp.phone.failed': 'Imeshindwa kutuma msimbo. Jaribu tena.',

  'signUp.verify.title': 'Ingiza msimbo wako',
  'signUp.verify.subtitle': 'Tumetuma msimbo wa tarakimu {digits} kwa {phone}.',
  'signUp.verify.label': 'Msimbo wa uthibitisho',
  'signUp.verify.submit': 'Thibitisha',
  'signUp.verify.resend': 'Tuma msimbo tena',
  'signUp.verify.resending': 'Inatuma…',
  'signUp.verify.resent': 'Msimbo mpya unakuja.',
  'signUp.verify.enterDigits': 'Ingiza msimbo wa tarakimu {digits}.',
  'signUp.verify.incorrect': 'Msimbo huo haukufanya kazi. Jaribu tena.',
  'signUp.verify.resendFailed': 'Imeshindwa kutuma msimbo tena.',

  'signUp.details.firstName': 'Jina la kwanza',
  'signUp.details.lastName': 'Jina la mwisho',
  'signUp.details.ward': 'Kata',
  'signUp.details.street': 'Mtaa',
  'signUp.details.unitNumber': 'Namba ya chumba',
  'signUp.details.unitHint': 'Si lazima — nyumba, chumba au apartmenti.',
  'signUp.details.unitPlaceholder': 'Chumba 4',
  'signUp.details.businessName': 'Jina la biashara',
  'signUp.details.wasteTier': 'Aina ya taka',
  'signUp.details.wasteTierPlaceholder': 'Chagua aina',
  'signUp.details.taxId': 'TIN / Namba ya kodi',
  'signUp.details.taxIdHint': 'Muundo: 123-456-789.',
  'signUp.details.firstNameError': 'Ingiza jina lako la kwanza.',
  'signUp.details.lastNameError': 'Ingiza jina lako la mwisho.',
  'signUp.details.wardError': 'Ingiza kata yako.',
  'signUp.details.streetError': 'Ingiza mtaa wako.',
  'signUp.details.businessNameError': 'Ingiza jina la biashara.',
  'signUp.details.wasteTierError': 'Chagua aina ya taka.',
  'signUp.details.taxIdError': 'Tumia muundo 123-456-789.',

  'signUp.resident.title': 'Taarifa zako',
  'signUp.resident.subtitle': 'Tuambie wewe ni nani na tutakusanyie taka wapi.',
  'signUp.reporter.title': 'Taarifa zako',
  'signUp.reporter.subtitle':
    'Waripoti husaidia kuweka Dodoma safi kwa kuripoti matatizo katika eneo lako.',
  'signUp.commercial.title': 'Taarifa za biashara',
  'signUp.commercial.subtitle':
    'Tuambie kuhusu biashara na kiasi cha taka tunachotarajia.',

  'signUp.luku.title': 'Mita yako ya LUKU',
  'signUp.luku.subtitle':
    'Tunauunganisha mji wako na mita yake ili ukusanyaji ulipwe mahali sahihi.',
  'signUp.luku.label': 'Namba ya mita ya LUKU',
  'signUp.luku.hint': 'Tarakimu 11, zimeandikwa kwenye mita yako.',
  'signUp.luku.error': 'Ingiza namba ya tarakimu {digits} iliyoandikwa kwenye mita yako.',

  'signUp.location.title': 'Weka eneo lako',
  'signUp.location.subtitleBusiness':
    'Weka alama kwenye eneo lako ili tujue wapi pa kukusanya.',
  'signUp.location.subtitleHome': 'Weka alama kwenye anwani yako ili tujue wapi pa kukusanya.',
  'signUp.location.missing': 'Ongeza eneo lako ili kuendelea.',
  'signUp.location.captureLabel': 'Eneo',
  'signUp.location.empty': 'Tunatumia eneo lako kupanga ukusanyaji kwa anwani yako.',
  'signUp.location.resolving': 'Tunatafuta anwani ya karibu…',
  'signUp.location.capture': 'Tumia eneo lilipo sasa',
  'signUp.location.update': 'Sasisha eneo',
  'signUp.location.permission':
    'Ruhusa ya eneo inahitajika. Iwashe kwenye Mipangilio na ujaribu tena.',
  'signUp.location.failed':
    'Imeshindwa kupata eneo lako. Hakikisha GPS imewashwa na ujaribu tena.',
  'signUp.location.mapTanzania': 'Ramani ya Tanzania',
  'signUp.location.mapCentered': 'Ramani imeelekea {coordinates}',
  'signUp.location.mapUnavailable': 'Ramani inapatikana kwenye app ya simu.',
  'signUp.location.recentre': 'Weka katikati',
  'signUp.location.recentreLabel': 'Rudisha ramani kwenye eneo lako',

  'signUp.photo.titleBusiness': 'Ongeza nembo ya biashara',
  'signUp.photo.titleProfile': 'Ongeza picha ya wasifu',
  'signUp.photo.subtitleBusiness': 'Hivi ndivyo wakazi wanaona kwenye orodha yako.',
  'signUp.photo.subtitleProfile': 'Hivi ndivyo jamii yako itakavyokutambua.',
  'signUp.photo.missingBusiness': 'Ongeza nembo ya biashara ili kuendelea.',
  'signUp.photo.missingProfile': 'Ongeza picha ya wasifu ili kuendelea.',
  'signUp.photo.choose': 'Chagua picha',
  'signUp.photo.change': 'Badilisha picha',
  'signUp.photo.take': 'Piga picha',
  'signUp.photo.remove': 'Ondoa',
  'signUp.photo.skip': 'Ruka',
  'signUp.photo.skipTitle': 'Ruka bila picha?',
  'signUp.photo.skipMessage':
    'Akaunti yako itatumia picha ya kawaida. Unaweza kuongeza yako baadaye.',
  'signUp.photo.cameraPermission':
    'Ruhusa ya kamera inahitajika. Iwashe kwenye Mipangilio na ujaribu tena.',
  'signUp.photo.libraryPermission':
    'Ruhusa ya picha inahitajika. Iwashe kwenye Mipangilio na ujaribu tena.',
  'signUp.photo.uploadFailed': 'Upakiaji umeshindwa. Tafadhali jaribu tena.',

  'signUp.review.title': 'Angalia kila kitu',
  'signUp.review.subtitle': 'Tunatumia taarifa hizi kuanzisha akaunti yako ya Taka.',
  'signUp.review.accountType': 'Aina ya akaunti',
  'signUp.review.phone': 'Simu',
  'signUp.review.name': 'Jina',
  'signUp.review.business': 'Biashara',
  'signUp.review.unit': 'Chumba',
  'signUp.review.luku': 'Mita ya LUKU',
  'signUp.review.location': 'Eneo',
  'signUp.review.logo': 'Nembo',
  'signUp.review.termsPrefix': 'Nakubali ',
  'signUp.review.termsAnd': ' na ',
  'signUp.review.termsSuffix': '.',
  'signUp.review.termsError': 'Tafadhali kubali masharti ili kuendelea.',
  'signUp.review.submit': 'Fungua akaunti',
  'signUp.review.failed': 'Usajili umeshindwa. Tafadhali jaribu tena.',

  'signUp.success.pendingTitle': 'Karibu kumaliza',
  'signUp.success.title': 'Umekamilisha',
  'signUp.success.pendingSubtitle':
    'Tumepokea usajili wako. Timu yetu itauhakiki na utajulishwa mara akaunti yako itakapoidhinishwa.',
  'signUp.success.subtitle': 'Akaunti yako ya Taka imefunguliwa. Ingia ili kuanza.',

  'legal.termsTitle': 'Masharti ya Huduma',
  'legal.privacyTitle': 'Sera ya Faragha',
  'legal.updatedLabel': 'Imesasishwa {date}',
  'legal.placeholderNotice':
    'Maandishi ya muda. Yabadilishe na nakala yako ya kisheria kabla ya kuzindua.',
};

export const TRANSLATIONS: Record<Language, Record<TranslationKey, string>> = { en, sw };
