import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { USER_INTENTS, type UserIntent } from '@/constants/registration';
import { hasRole } from '@/features/auth/roles';
import { getSessionUser } from '@/features/auth/session';
import { useSignUp } from '@/features/signup/context';
import { postVerifyRouteFor } from '@/features/signup/steps';

/**
 * Bootstraps an add-role run.
 *
 * The Profile tab links here naming the role to attach. This screen only checks
 * that the signed-in account can still take it on, seeds the wizard with the
 * account's own phone number and hands over to the first screen that role needs —
 * the meter step for a resident, the details form for a reporter. It renders
 * nothing of its own: the route is a doorway, not a page.
 */
export default function AddRoleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ intent?: string }>();
  const { startAddRole, updateForm } = useSignUp();
  const [redirect, setRedirect] = useState<'/profile' | '/login' | null>(null);

  const intent: UserIntent | undefined = USER_INTENTS.find((value) => value === params.intent);

  useEffect(() => {
    let cancelled = false;

    void getSessionUser().then((user) => {
      if (cancelled) return;

      if (!user) {
        setRedirect('/login');
        return;
      }

      // Nothing to do if the role is unknown or already held — that is a stale
      // link rather than an error worth a screen of its own.
      if (!intent || hasRole(user, intent)) {
        setRedirect('/profile');
        return;
      }

      startAddRole(intent, user.phone);
      // The name and picture belong to the account rather than to either profile,
      // so the new role starts from what is already on file: the details form is
      // pre-filled and the photo step opens on the existing picture instead of an
      // empty frame.
      updateForm({
        first_name: user.first_name ?? '',
        last_name: user.last_name ?? '',
        profile_picture: user.picture_url ?? null,
      });
      router.replace(postVerifyRouteFor(intent));
    });

    return () => {
      cancelled = true;
    };
  }, [intent, router, startAddRole, updateForm]);

  if (redirect) return <Redirect href={redirect} />;

  return null;
}
