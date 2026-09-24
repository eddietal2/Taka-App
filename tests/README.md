# Tests

Three layers, all living under `tests/`:

| Directory          | What it covers                                            | Runner     |
| ------------------ | --------------------------------------------------------- | ---------- |
| `tests/unit`       | Pure logic: helpers, schemas, payload builders, storage    | jest       |
| `tests/components` | The shared UI components, rendered                         | jest       |
| `tests/screens`    | Whole screens with their navigation and API calls doubled  | jest       |
| `tests/e2e`        | Real flows through the web build in a browser              | Playwright |

## Running the jest suites

```bash
pnpm test            # everything under tests/unit, tests/components, tests/screens
pnpm test:watch      # the same, re-running on change
pnpm test:coverage   # with a coverage report
```

A single suite or file:

```bash
pnpm test tests/unit/phone.test.ts
pnpm test tests/screens
```

## Running the web e2e suite

```bash
pnpm e2e             # playwright test
pnpm e2e:report      # the HTML report from the last run
```

This drives the app through `expo start --web` on port 19006 — deliberately not
Expo's usual 8081, which is often already taken, and Expo answers a busy port with
a prompt a test run cannot answer. The viewport is a phone, because the layout
under test is a phone layout.

The API is stubbed per test in [`fake-api.ts`](e2e/fake-api.ts), so the suite is
hermetic: no server, no OTP, no database. The stub is a mutable object, so a flow
can sign in, attach a role and switch it, with each request seeing what the
previous ones changed. `signIn` and `openProfile` reuse the real screens, and the
language control is tapped using its endonym ("English") so specs read in English
regardless of the app's default.

> **Verified blocker on this machine.** The web build does not currently bundle
> here. Both `npx expo start --web` and `npx expo export --platform web` fail
> inside Metro with `Unable to resolve module
> c:\C:\Users\...\src\app\(auth)\_layout.tsx` — note the doubled drive letter.
> Metro is joining the already-absolute route path onto a root of `c:\`, so every
> file under `src/app` is unresolvable and the dev server answers 500. Nothing in
> this suite causes it: it reproduces with no test involved. Fixing it is a
> Metro/Expo Router path issue to be resolved separately — running the project
> from a path without the OneDrive folder and the space in `Web Projects`, or
> bumping `@expo/cli` / `expo-router`, are the places to look. Once the web build
> bundles, `pnpm e2e` runs as written.

## How the doubles work

`jest.setup.ts` stubs the three things Expo's preset leaves native, so screens can
be rendered at all:

- **expo-secure-store** — an in-memory map that actually round-trips, so the
  session and preference stores can be tested as a real save/read, and the
  corrupt-value paths can be exercised by writing junk under a known key.
- **react-native-safe-area-context** — fixed zero insets, so layout is
  deterministic and no provider wrapper is needed.
- **expo-image, react-native-maps, expo-location** — plain views, because
  `@/components` pulls them in through the location map and they reach for a
  native module the moment they are imported.

Screen tests mock `expo-router` (navigation only, no real router) and the API
modules they touch, and replace `useI18n` with an identity translator so
assertions read translation *keys* rather than copy. That keeps them independent
of the active language and of wording changes.

Two consequences of the versions pinned here:

- `@jest/globals` is imported in every test rather than relying on ambient
  globals, because this pnpm layout does not expose `@types/jest` to the
  compiler.
- `@testing-library/react-native` v14 renders asynchronously, so `render` and any
  `fireEvent` that triggers a re-render must be awaited.

## What the suites cover

- **unit** — phone normalisation and validation, TIN formatting, the account-type
  and waste-tier maps, both palettes, the generated business logo, the API
  schemas (including the phone-less add-role payload), the API client's error and
  field-error mapping, role derivation, sign-up step numbering for both a normal
  run and an add-role run, the payload builders, preference resolution, device
  preference storage, session storage, and translation-catalogue parity between
  English and Kiswahili.
- **components** — Button, TextField, SegmentedControl, Checkbox, StepHeader,
  OptionCard, Toast and ThemeToggle.
- **screens** — login (validation, handoff, failure), the profile role card
  (active marker, switch and add rows, address row hidden for a reporter), the
  switching screen (success, failure with retry, stale link) and the add-role
  bootstrap (seeding the account's number, name and picture, plus every redirect).
- **web e2e** — sign-in (invalid number, success, rejected code), attaching a
  Reporter role through the wizard, switching that role both ways with the
  address row appearing and disappearing, and the language preference.
