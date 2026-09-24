import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { UserIntent } from '@/constants/registration';
import { EMPTY_SIGN_UP_FORM, type SignUpForm } from '@/features/signup/types';

/**
 * Whether the wizard is creating an account or attaching a second role to one
 * that already exists.
 *
 * The screens are the same either way; the difference is that an add-role run
 * starts after the phone is already known and finishes without registering a new
 * account, so the intent, phone and verify steps are never visited.
 */
export type SignUpMode = 'signup' | 'addRole';

type SignUpState = {
  mode: SignUpMode;
  /** Account type chosen on the first step, or the role being attached. */
  intent: UserIntent | null;
  /** Verified number in E.164 form, e.g. `+255712345678`. */
  phone: string;
  phoneVerified: boolean;
  /** Short-lived token returned by the OTP verify endpoint, when provided. */
  verificationToken: string | null;
  form: SignUpForm;
};

const INITIAL_STATE: SignUpState = {
  mode: 'signup',
  intent: null,
  phone: '',
  phoneVerified: false,
  verificationToken: null,
  form: EMPTY_SIGN_UP_FORM,
};

type SignUpContextValue = SignUpState & {
  setIntent: (intent: UserIntent) => void;
  /** Stores a new number and invalidates any previous verification. */
  setPhone: (phone: string) => void;
  setVerified: (verificationToken?: string | null) => void;
  updateForm: (patch: Partial<SignUpForm>) => void;
  /**
   * Begins attaching a role to the signed-in account: the role is chosen for the
   * caller and the phone is already theirs, so the intent, phone and verify steps
   * are behind us before the first screen renders.
   */
  startAddRole: (intent: UserIntent, phone: string) => void;
  reset: () => void;
};

const SignUpContext = createContext<SignUpContextValue | null>(null);

export function SignUpProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SignUpState>(INITIAL_STATE);

  const setIntent = useCallback((intent: UserIntent) => {
    // Changing type starts a clean form so fields never leak between flows.
    setState((prev) => ({ ...prev, intent, form: EMPTY_SIGN_UP_FORM }));
  }, []);

  const setPhone = useCallback((phone: string) => {
    setState((prev) => ({ ...prev, phone, phoneVerified: false, verificationToken: null }));
  }, []);

  const setVerified = useCallback((verificationToken: string | null = null) => {
    setState((prev) => ({ ...prev, phoneVerified: true, verificationToken }));
  }, []);

  const updateForm = useCallback((patch: Partial<SignUpForm>) => {
    setState((prev) => ({ ...prev, form: { ...prev.form, ...patch } }));
  }, []);

  const startAddRole = useCallback((intent: UserIntent, phone: string) => {
    setState({
      mode: 'addRole',
      intent,
      phone,
      // The number belongs to the signed-in account, so it is taken as verified.
      // No verification token is carried: none was just issued, and the access
      // token is what authorises the call instead.
      phoneVerified: true,
      verificationToken: null,
      form: EMPTY_SIGN_UP_FORM,
    });
  }, []);

  const reset = useCallback(() => setState(INITIAL_STATE), []);

  const value = useMemo<SignUpContextValue>(
    () => ({ ...state, setIntent, setPhone, setVerified, updateForm, startAddRole, reset }),
    [state, setIntent, setPhone, setVerified, updateForm, startAddRole, reset]
  );

  return <SignUpContext.Provider value={value}>{children}</SignUpContext.Provider>;
}

export function useSignUp() {
  const context = useContext(SignUpContext);
  if (!context) {
    throw new Error('useSignUp must be used inside a <SignUpProvider>.');
  }
  return context;
}
