import type { SessionUser } from '@/api/auth';
import { apiRequest } from '@/api/client';

export type UpdateProfileImageResponse = {
  /** Present when the API returns the account's approval state. */
  status?: string;
  /** The stored account, which is the authority on the image URL. */
  user?: SessionUser;
};

/**
 * Points the account's image at an object that is already uploaded.
 *
 * The bytes reach storage through `POST /uploads/presign` and are PUT straight
 * there, so this request carries no image — only which object is now current.
 * That is why it needs the access token rather than the verification token the
 * presign route also accepts: by this point sign-up is long over.
 */
export function updateProfileImage(pictureUrl: string, token: string) {
  return apiRequest<UpdateProfileImageResponse>('/api/v1/users/me', {
    method: 'PATCH',
    body: { picture_url: pictureUrl },
    token,
  });
}
