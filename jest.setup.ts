import { jest } from '@jest/globals';

/**
 * Test environment setup shared by every suite.
 *
 * Expo's preset supplies the React Native and `expo-*` shims; the three below are
 * the ones it does not, and that the app imports on almost every screen, so they
 * are stubbed once here instead of being repeated in each test file.
 *
 * `jest` is imported rather than read as a global because this project's pnpm
 * layout does not expose `@types/jest` cleanly to the compiler.
 */

// SecureStore has no jest implementation. The double keeps values in a map
// instead of discarding them, so the session and preference stores can be
// exercised as a round trip rather than only one way.
jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();

  return {
    getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      store.delete(key);
    }),
    /** Test-only escape hatch for clearing state between suites. */
    __clear: () => store.clear(),
  };
});

// Every screen and the floating tab bar measure safe-area insets. A fixed zero
// inset keeps layout deterministic and removes the need for a provider wrapper.
jest.mock('react-native-safe-area-context', () => {
  const actual =
    jest.requireActual<typeof import('react-native-safe-area-context')>(
      'react-native-safe-area-context'
    );
  return {
    ...actual,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

// expo-image renders through a native view with no jest implementation. A plain
// View stands in, which is enough for anything not asserting on the decoded
// image itself.
jest.mock('expo-image', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return { Image: View };
});

// react-native-maps reaches for a native module the moment it is imported, and
// `@/components` pulls it in through the location map, so every screen test
// would fail before rendering. A View stands in for the map and its markers.
jest.mock('react-native-maps', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');

  const MapView = ({ children, ...props }: { children?: React.ReactNode }) =>
    React.createElement(View, props, children);

  return {
    __esModule: true,
    default: MapView,
    Marker: MapView,
    PROVIDER_GOOGLE: 'google',
  };
});

// expo-location has no jest implementation either, and is imported beside the
// map. Only the calls the app makes are stubbed.
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  getForegroundPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(async () => ({
    coords: { latitude: -6.8, longitude: 39.2 },
  })),
  reverseGeocodeAsync: jest.fn(async () => []),
  geocodeAsync: jest.fn(async () => []),
  Accuracy: { Lowest: 1, Balanced: 3, Highest: 6 },
}));
