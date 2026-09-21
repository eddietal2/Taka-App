/**
 * Bottom tab definitions for the signed-in app.
 *
 * Held as one declarative map so the bar, the route layout and anything that
 * needs to jump between tabs all read the same source. Filtering the set per
 * account type — a reporter who never sees Recycle — is a matter of narrowing
 * `TAB_ORDER` rather than editing the layout.
 */

import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import { spacing } from '@/constants/theme';
import type { TranslationKey } from '@/features/i18n/translations';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export type TabDefinition = {
  /** Label under the icon. */
  labelKey: TranslationKey;
  /** Filled icon, shown while the tab is active. */
  icon: IoniconName;
  /** Outlined icon, shown while the tab is inactive. */
  iconOutline: IoniconName;
};

/**
 * Keyed by route name, which must match the file name inside the `(tabs)`
 * group — `home` resolves to `/home`.
 */
export const TABS = {
  home: { labelKey: 'tabs.home', icon: 'home', iconOutline: 'home-outline' },
  recycle: { labelKey: 'tabs.recycle', icon: 'leaf', iconOutline: 'leaf-outline' },
  profile: { labelKey: 'tabs.profile', icon: 'person', iconOutline: 'person-outline' },
} as const satisfies Record<string, TabDefinition>;

export type TabName = keyof typeof TABS;

/** Left-to-right order of the bar. */
export const TAB_ORDER = ['home', 'recycle', 'profile'] as const satisfies readonly TabName[];

/**
 * Bar geometry.
 *
 * The bar is deliberately compact and narrow: it floats over the page rather
 * than framing it, so it should read as a control you reach for rather than a
 * slab bolted to the bottom edge. These are the knobs to turn to grow it back.
 */

/** Height of the floating bar itself. */
export const TAB_BAR_HEIGHT = 52;

/** Horizontal inset from the screen edges. */
export const TAB_BAR_MARGIN = spacing.xl;

/** Icon size for a tab item. */
export const TAB_ICON_SIZE = 20;

/** Label size, below `fontSize.xs`, which is tuned for body copy. */
export const TAB_LABEL_SIZE = 10;

/** Padding between the bar's edge and the icon above its label. */
export const TAB_BAR_PADDING = 6;

/** Gap between the floating bar and the bottom edge. */
export const TAB_BAR_OFFSET = spacing.md;

/**
 * Bottom padding a scrolling screen needs so its last element is not hidden
 * behind the floating bar. Screens that manage their own insets should add
 * `insets.bottom` on top of this.
 */
export const TAB_BAR_CLEARANCE = TAB_BAR_HEIGHT + TAB_BAR_OFFSET + spacing.md;
