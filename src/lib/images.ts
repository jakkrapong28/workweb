export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const IMAGE_EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
} as const;

export type SupportedImageType = keyof typeof IMAGE_EXTENSIONS;

export function isSupportedImageType(type: string): type is SupportedImageType {
  return type in IMAGE_EXTENSIONS;
}

export function imageExtension(type: SupportedImageType): string {
  return IMAGE_EXTENSIONS[type];
}

/** Verify magic bytes instead of trusting the browser-provided MIME type. */
export function hasValidImageSignature(
  bytes: Uint8Array,
  type: SupportedImageType
): boolean {
  if (type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (type === "image/png") {
    const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return signature.every((value, index) => bytes[index] === value);
  }
  if (type === "image/gif") {
    const header = String.fromCharCode(...bytes.slice(0, 6));
    return header === "GIF87a" || header === "GIF89a";
  }

  return (
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  );
}
