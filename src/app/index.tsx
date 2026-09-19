import { Redirect } from 'expo-router';

/**
 * App entry point.
 *
 * The app currently opens on the login screen. Once persisted session state
 * exists, branch here between the `(auth)` and authenticated groups instead of
 * always redirecting.
 */
export default function Index() {
  return <Redirect href="/login" />;
}
