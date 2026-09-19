import { File, UploadType } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import { apiRequest } from '@/api/client';

export type UploadPurpose = 'profile_picture' | 'business_logo';

export type PresignResponse = {
  /** Presigned S3 URL accepting a single PUT of the image bytes. */
  uploadUrl: string;
  /** Public URL to store in the register payload. */
  publicUrl: string;
  /** Optional storage key, when the API returns one. */
  key?: string;
};

const IMAGE_CONTENT_TYPE = 'image/jpeg';
const MAX_IMAGE_WIDTH = 1280;
const JPEG_QUALITY = 0.8;

/** TODO: confirm the presign path and body with the backend. */
export function presignUpload(purpose: UploadPurpose, token?: string | null) {
  return apiRequest<PresignResponse>('/api/v1/uploads/presign', {
    method: 'POST',
    body: { purpose, content_type: IMAGE_CONTENT_TYPE },
    token,
  });
}

/**
 * Resizes and re-encodes the image so uploads stay small.
 *
 * `sourceWidth` is the source image's width when the caller knows it. Without
 * it the image is always scaled to `MAX_IMAGE_WIDTH`.
 */
export async function compressImage(uri: string, sourceWidth?: number): Promise<string> {
  const context = ImageManipulator.manipulate(uri);

  // Only ever shrink. `resize` sets the width unconditionally, so a logo that is
  // already smaller would be blown up — blurring it and making the upload
  // larger than the original file.
  if (sourceWidth === undefined || sourceWidth > MAX_IMAGE_WIDTH) {
    context.resize({ width: MAX_IMAGE_WIDTH });
  }

  const rendered = await context.renderAsync();
  const image = await rendered.saveAsync({ compress: JPEG_QUALITY, format: SaveFormat.JPEG });
  return image.uri;
}

/** PUTs the local file straight to S3 using the presigned URL. */
export async function putFileToS3(uploadUrl: string, fileUri: string): Promise<void> {
  const file = new File(fileUri);
  const result = await file.upload(uploadUrl, {
    httpMethod: 'PUT',
    uploadType: UploadType.BINARY_CONTENT,
    mimeType: IMAGE_CONTENT_TYPE,
    headers: { 'Content-Type': IMAGE_CONTENT_TYPE },
  });

  if (result.status < 200 || result.status >= 300) {
    throw new Error(`Upload failed with status ${result.status}.`);
  }
}

/**
 * Full pipeline: compress, presign, PUT to S3 and return the public URL that
 * belongs in `profile_picture` / `business_logo`.
 */
export async function uploadImage(
  uri: string,
  purpose: UploadPurpose,
  token?: string | null,
  sourceWidth?: number
): Promise<string> {
  const compressedUri = await compressImage(uri, sourceWidth);
  const { uploadUrl, publicUrl } = await presignUpload(purpose, token);
  await putFileToS3(uploadUrl, compressedUri);
  return publicUrl;
}
