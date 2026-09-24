import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockParams: Record<string, string> = {};

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
    canGoBack: () => true,
  }),
  useLocalSearchParams: () => mockParams,
  Redirect: () => null,
  Link: ({ children }: { children: unknown }) => children,
  useFocusEffect: (callback: () => void) => {
    const React = jest.requireActual<typeof import('react')>('react');
    React.useEffect(callback, [callback]);
  },
}));

// Assertions read the translation keys themselves, so they do not depend on the
// active language or on the copy staying word-for-word identical.
jest.mock('@/features/i18n/context', () => ({
  useI18n: () => ({ t: (key: string) => key, language: 'en', setLanguage: jest.fn() }),
}));

jest.mock('@/api/auth', () => ({
  requestOtp: jest.fn(async () => ({})),
}));

import { requestOtp } from '@/api/auth';
import LoginScreen from '@/app/(auth)/login';

const requestOtpMock = requestOtp as jest.MockedFunction<typeof requestOtp>;

beforeEach(() => {
  jest.clearAllMocks();
  for (const key of Object.keys(mockParams)) delete mockParams[key];
  requestOtpMock.mockResolvedValue({});
});

describe('LoginScreen', () => {
  it('reports an invalid number without asking the server for a code', async () => {
    const { getByText, getByLabelText } = await render(<LoginScreen />);

    await fireEvent.changeText(getByLabelText('login.phoneLabel'), '123');
    await fireEvent.press(getByText('common.continue'));

    await waitFor(() => expect(getByText('common.invalidPhone')).toBeTruthy());
    expect(requestOtpMock).not.toHaveBeenCalled();
  });

  it('sends a code and hands off to the verify step for a valid number', async () => {
    const { getByText, getByLabelText } = await render(<LoginScreen />);

    await fireEvent.changeText(getByLabelText('login.phoneLabel'), '712345678');
    await fireEvent.press(getByText('common.continue'));

    await waitFor(() =>
      expect(requestOtpMock).toHaveBeenCalledWith('+255712345678')
    );
    // The verify screen owns the sign-in itself; it needs the number to send the
    // code to and to identify the account afterwards.
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/verify',
      params: { phone: '+255712345678' },
    });
  });

  it('pre-fills the number sign-up handed over', async () => {
    mockParams.phone = '+255700000000';

    const { getByDisplayValue } = await render(<LoginScreen />);

    // The national part only; the country code is the field's fixed prefix.
    expect(getByDisplayValue('700000000')).toBeTruthy();
  });

  it('reports a failure to send the code', async () => {
    requestOtpMock.mockRejectedValue(new Error('Could not reach Taka.'));

    const { getByText, getByLabelText } = await render(<LoginScreen />);
    await fireEvent.changeText(getByLabelText('login.phoneLabel'), '712345678');
    await fireEvent.press(getByText('common.continue'));

    await waitFor(() => expect(getByText('Could not reach Taka.')).toBeTruthy());
    expect(mockPush).not.toHaveBeenCalled();
  });
});
