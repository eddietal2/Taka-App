import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import type { SessionUser } from '@/api/auth';

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockAlert = jest.fn();
let mockUser: SessionUser | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: jest.fn(),
    canGoBack: () => true,
  }),
  useLocalSearchParams: () => ({}),
  Redirect: () => null,
  useFocusEffect: (callback: () => void) => {
    const React = jest.requireActual<typeof import('react')>('react');
    React.useEffect(callback, [callback]);
  },
}));

// Keys stand in for the copy, so these assertions do not depend on the wording.
jest.mock('@/features/i18n/context', () => ({
  useI18n: () => ({ t: (key: string) => key, language: 'en', setLanguage: jest.fn() }),
}));

jest.mock('@/features/auth/session', () => ({
  getToken: jest.fn(async () => 'access-token'),
  getSessionUser: jest.fn(async () => mockUser),
  saveSessionUser: jest.fn(async () => undefined),
  clearSession: jest.fn(async () => undefined),
}));

jest.mock('@/api/profile', () => ({
  fetchAccount: jest.fn(async () => ({ user: mockUser })),
  updateAccount: jest.fn(async () => ({ user: mockUser })),
  deleteAccount: jest.fn(async () => ({ deleted: true })),
}));

import ProfileScreen from '@/app/(tabs)/profile';

const RESIDENT_ONLY: SessionUser = {
  id: 'user-1',
  phone: '+255712345678',
  intent: 'RESIDENT',
  status: 'ACTIVE',
  first_name: 'Amina',
  last_name: 'Mwangi',
  ward_kata: 'Kata',
  luku_meter: '12345678901',
  roles: ['RESIDENT'],
};

const BOTH_ROLES: SessionUser = { ...RESIDENT_ONLY, roles: ['RESIDENT', 'REPORTER'] };

const REPORTER_ACTIVE: SessionUser = {
  ...RESIDENT_ONLY,
  intent: 'REPORTER',
  roles: ['RESIDENT', 'REPORTER'],
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUser = RESIDENT_ONLY;
});

describe('ProfileScreen role card', () => {
  it('marks the role the account is using', async () => {
    const { getByText, getAllByText } = await render(<ProfileScreen />);

    await waitFor(() => expect(getByText('profile.rolesLabel')).toBeTruthy());
    expect(getByText('profile.roleActive')).toBeTruthy();
    // The active role is named by its own copy, not as "Resident" literally, and
    // appears twice: in the card's header row and again as the active row.
    expect(getAllByText('intent.resident.title')).toHaveLength(2);
  });

  it('offers the other personal role when the account holds only one', async () => {
    const { getByText, queryByText } = await render(<ProfileScreen />);

    await waitFor(() => expect(getByText('profile.addReporter')).toBeTruthy());
    // Nothing to switch to yet, so no switch affordance is rendered.
    expect(queryByText('profile.switch')).toBeNull();
  });

  it('opens the add-role wizard for a role the account lacks', async () => {
    const { getByText } = await render(<ProfileScreen />);

    await waitFor(() => expect(getByText('profile.addReporter')).toBeTruthy());
    await fireEvent.press(getByText('profile.addReporter'));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/sign-up/add',
      params: { intent: 'REPORTER' },
    });
  });

  it('offers a switch once the account holds both roles', async () => {
    mockUser = BOTH_ROLES;

    const { getByText, queryByText } = await render(<ProfileScreen />);

    await waitFor(() => expect(getByText('profile.switch')).toBeTruthy());
    expect(queryByText('profile.addReporter')).toBeNull();
  });

  it('opens the switching screen for the role being moved to', async () => {
    mockUser = BOTH_ROLES;

    const { getByLabelText } = await render(<ProfileScreen />);

    const switchRow = await waitFor(() => getByLabelText('profile.switchToReporter'));
    await fireEvent.press(switchRow);

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/switching-role',
      params: { intent: 'REPORTER' },
    });
  });

  it('hides the service address for a reporter, who has none', async () => {
    mockUser = REPORTER_ACTIVE;

    const { queryByText, getByText } = await render(<ProfileScreen />);

    await waitFor(() => expect(getByText('profile.rolesLabel')).toBeTruthy());
    expect(queryByText('profile.addressLabel')).toBeNull();
  });

  it('shows the service address while the account is used as a resident', async () => {
    mockUser = BOTH_ROLES;

    const { getByText } = await render(<ProfileScreen />);

    await waitFor(() => expect(getByText('profile.addressLabel')).toBeTruthy());
  });
});
