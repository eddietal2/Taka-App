import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
    TAB_BAR_HEIGHT,
    TAB_BAR_MARGIN,
    TAB_BAR_OFFSET,
    TAB_BAR_PADDING,
    TAB_ICON_SIZE,
    TAB_LABEL_SIZE,
    TAB_ORDER,
    TABS,
    type TabName,
} from '@/constants/tabs';
import { getPalette, radius } from '@/constants/theme';
import { useI18n } from '@/features/i18n/context';

/**
 * Route each tab opens. Written out rather than derived from the name so the
 * typed-route checker can see the literal paths.
 */
const TAB_ROUTES = {
  home: '/home',
  recycle: '/recycle',
  profile: '/profile',
} as const satisfies Record<TabName, string>;

/**
 * The app's bottom bar, drawn directly rather than by the `Tabs` navigator.
 *
 * The navigator's own bar always fills the full width of the viewport and its
 * items are laid out by React Navigation, so it can be neither inset from the
 * screen edges nor given a rounded pill shape without fighting its internals.
 * Drawing the bar here means the margins, the corner radius and the vertical
 * centring of each item are all explicit.
 *
 * This replaces only the bar, not the navigator: the `Tabs` layout still owns
 * the screens, so each tab keeps its own scroll position and history. Switching
 * goes through `router.navigate`, which is how a deep link would reach the same
 * screen.
 */
export function TabBar() {
  const theme = getPalette(useColorScheme());
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          // Clear the Android gesture bar / iPhone home indicator.
          bottom: insets.bottom + TAB_BAR_OFFSET,
        },
      ]}>
      {TAB_ORDER.map((name) => {
        const tab = TABS[name];
        const focused = pathname === TAB_ROUTES[name];
        const color = focused ? theme.primary : theme.textMuted;

        return (
          <Pressable
            key={name}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={t(tab.labelKey)}
            onPress={() => router.navigate(TAB_ROUTES[name])}
            style={styles.item}>
            <Ionicons name={focused ? tab.icon : tab.iconOutline} size={TAB_ICON_SIZE} color={color} />
            <Text style={[styles.label, { color }]}>{t(tab.labelKey)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: TAB_BAR_MARGIN,
    right: TAB_BAR_MARGIN,
    height: TAB_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: TAB_BAR_PADDING,
    // Lift the bar off the content it floats above.
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  /** Stretched to the bar's inner height so its contents centre within it. */
  item: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  label: {
    fontSize: TAB_LABEL_SIZE,
    fontWeight: '600',
  },
});
