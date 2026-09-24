import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import type { SessionUser } from '@/api/auth';

const mockReplace = jest.fn();
const mockParams: Record<string, string> = {};

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: mockReplace,
    back: jest.fn(),
    canGoBack: () => true,
  }),
  useLocalSearchParams: () => mockParams,
  Redirect: () => null,
}));

jest.mock('@/features/i18n/context', () => ({
  useI18n: () => ({ t: (key: string) => key, language: 'en', setLanguage: jest.fn() }),
}));

jest.mock('@/features/auth/session', () => ({
  getToken: jest.fn(async () => 'access-token'),
  saveSessionUser: jest.fn(async () => undefined),
}));

jest.mock('@/api/profile', () => ({
  updateAccount: jest.fn(),
}));

import { updateAccount } from '@/api/profile';
import SwitchingRoleScreen from '@/app/switching-role';
import { saveSessionUser } from '@/features/auth/session';

const updateAccountMock = updateAccount as jest.MockedFunction<typeof updateAccount>;
// Reached through the module so the double is whatever the screen imported,
// rather than a spy that the mock factory had to reference before it existed.
const saveSessionUserMock = jest.mocked(saveSessionUser);

const SWITCHED: SessionUser = {
  id: 'user-1',
  phone: '+255712345678',
  intent: 'REPORTER',
  status: 'ACTIVE',
  first_name: 'Amina',
  last_name: 'Mwangi',
  roles: ['RESIDENT', 'REPORTER'],
};

beforeEach(() => {
  jest.clearAllMocks();
  for (const key of Object.keys(mockParams)) delete mockParams[key];
  mockParams.intent = 'REPORTER';
});

describe('SwitchingRoleScreen', () => {
  it('names the role it is moving to while the work happens', async () => {
    updateAccountMock.mockReturnValue(new Promise(() => undefined));

    const { getByText } = await render(<SwitchingRoleScreen />);

    expect(getByText('switchRole.title')).toBeTruthy();
    // The role name is resolved through the account-type copy, keyed by intent.
    expect(getByText('switchRole.message')).toBeTruthy();
  });

  it('asks the server for the new role and stores what comes back', async () => {
    updateAccountMock.mockResolvedValue({ status: 'ACTIVE', user: SWITCHED });

    await render(<SwitchingRoleScreen />);

    await waitFor(() =>
      expect(updateAccountMock).toHaveBeenCalledWith({ intent: 'REPORTER' }, 'access-token')
    );
    expect(saveSessionUserMock).toHaveBeenCalledWith(SWITCHED);
    expect(mockReplace).toHaveBeenCalledWith('/profile');
  });

  it('offers a retry when the switch cannot complete', async () => {
    updateAccountMock.mockRejectedValue(new Error('Could not reach Taka.'));

    const { getByText } = await render(<SwitchingRoleScreen />);

    await waitFor(() => expect(getByText('switchRole.failedTitle')).toBeTruthy());

    updateAccountMock.mockResolvedValue({ status: 'ACTIVE', user: SWITCHED });
    await fireEvent.press(getByText('switchRole.retry'));

    await waitFor(() => expect(updateAccountMock).toHaveBeenCalledTimes(2));
  });

  it('does not follow a stale link to an unknown role', async () => {
    mockParams.intent = 'NOT_A_ROLE';

    await render(<SwitchingRoleScreen />);

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/profile'));
    expect(updateAccountMock).not.toHaveBeenCalled();
  });
});
