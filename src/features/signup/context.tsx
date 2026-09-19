import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { UserIntent } from '@/constants/registration';
import { EMPTY_SIGN_UP_FORM, type SignUpForm } from '@/features/signup/types';

type SignUpState = {
  /** Account type chosen on the first step. */
  intent: UserIntent | null;
  /** Verified number in E.164 form, e.g. `+255712345678`. */
  phone: string;
  phoneVerified: boolean;
  /** Short-lived token returned by the OTP verify endpoint, when provided. */
  verificationToken: string | null;
  form: SignUpForm;
};

const INITIAL_STATE: SignUpState = {
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

  const reset = useCallback(() => setState(INITIAL_STATE), []);

  const value = useMemo<SignUpContextValue>(
    () => ({ ...state, setIntent, setPhone, setVerified, updateForm, reset }),
    [state, setIntent, setPhone, setVerified, updateForm, reset]
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
