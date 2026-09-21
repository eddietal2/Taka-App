import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { TabBar } from '@/components';
import { TAB_ORDER, TABS } from '@/constants/tabs';
import { useI18n } from '@/features/i18n/context';

/** First tab to show when the group is entered without a target route. */
export const unstable_settings = {
  initialRouteName: 'home',
};

/**
 * The signed-in shell.
 *
 * The navigator's own bar is hidden and <TabBar /> draws it instead, so the bar
 * can be inset from the screen edges and rounded. Because that bar floats, it
 * reserves no layout space — screens must add `TAB_BAR_CLEARANCE` to their
 * bottom padding or their last element ends up underneath it.
 */
export default function TabsLayout() {
  const { t } = useI18n();

  return (
    <View style={styles.root}>
      <Tabs
        screenOptions={{
          headerShown: false,
          // `title` still labels the route for the web document title and for
          // assistive technology, even though the visible bar is ours.
          tabBarStyle: { display: 'none' },
        }}>
        {TAB_ORDER.map((name) => (
          <Tabs.Screen key={name} name={name} options={{ title: t(TABS[name].labelKey) }} />
        ))}
      </Tabs>
      <TabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
