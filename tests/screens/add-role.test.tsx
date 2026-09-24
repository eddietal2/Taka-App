import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render, waitFor } from '@testing-library/react-native';

import type { SessionUser } from '@/api/auth';

const mockReplace = jest.fn();
const mockParams: Record<string, string> = {};
const mockStartAddRole = jest.fn();
const mockUpdateForm = jest.fn();
let mockUser: SessionUser | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: mockReplace,
    back: jest.fn(),
    canGoBack: () => true,
  }),
  useLocalSearchParams: () => mockParams,
  // Rendered as text so a redirect can be asserted on rather than swallowed.
  Redirect: ({ href }: { href: string }) => {
    const React = jest.requireActual<typeof import('react')>('react');
    const RN = jest.requireActual<typeof import('react-native')>('react-native');
    return React.createElement(RN.Text, null, `redirect:${href}`);
  },
}));

jest.mock('@/features/signup/context', () => ({
  useSignUp: () => ({ startAddRole: mockStartAddRole, updateForm: mockUpdateForm }),
}));

jest.mock('@/features/auth/session', () => ({
  getSessionUser: jest.fn(async () => mockUser),
}));

import AddRoleScreen from '@/app/(auth)/sign-up/add';

const RESIDENT: SessionUser = {
  id: 'user-1',
  phone: '+255712345678',
  intent: 'RESIDENT',
  status: 'ACTIVE',
  first_name: 'Amina',
  last_name: 'Mwangi',
  picture_url: 'https://cdn.example.com/amina.jpg',
  roles: ['RESIDENT'],
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUser = RESIDENT;
  for (const key of Object.keys(mockParams)) delete mockParams[key];
  mockParams.intent = 'REPORTER';
});

describe('AddRoleScreen', () => {
  it('seeds the wizard with the account it already has', async () => {
    await render(<AddRoleScreen />);

    // The number, name and picture belong to the account rather than to either
    // profile, so the new role starts from them instead of an empty form.
    await waitFor(() =>
      expect(mockStartAddRole).toHaveBeenCalledWith('REPORTER', '+255712345678')
    );
    expect(mockUpdateForm).toHaveBeenCalledWith({
      first_name: 'Amina',
      last_name: 'Mwangi',
      profile_picture: 'https://cdn.example.com/amina.jpg',
    });
  });

  it('opens the first step a reporter needs, which is the details form', async () => {
    await render(<AddRoleScreen />);

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/sign-up/reporter'));
  });

  it('sends a resident to the meter step instead', async () => {
    mockParams.intent = 'RESIDENT';
    mockUser = { ...RESIDENT, intent: 'REPORTER', roles: ['REPORTER'] };

    await render(<AddRoleScreen />);

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/sign-up/luku'));
  });

  it('does not start a run for a role the account already holds', async () => {
    mockUser = { ...RESIDENT, roles: ['RESIDENT', 'REPORTER'] };

    const { getByText } = await render(<AddRoleScreen />);

    await waitFor(() => expect(getByText('redirect:/profile')).toBeTruthy());
    expect(mockStartAddRole).not.toHaveBeenCalled();
  });

  it('does not start a run when the role is unknown', async () => {
    mockParams.intent = 'NOT_A_ROLE';

    const { getByText } = await render(<AddRoleScreen />);

    await waitFor(() => expect(getByText('redirect:/profile')).toBeTruthy());
    expect(mockStartAddRole).not.toHaveBeenCalled();
  });

  it('sends someone with no session to sign in', async () => {
    mockUser = null;

    const { getByText } = await render(<AddRoleScreen />);

    await waitFor(() => expect(getByText('redirect:/login')).toBeTruthy());
    expect(mockStartAddRole).not.toHaveBeenCalled();
  });
});
