/**
 * Storage helpers for resolving object paths to signed URLs on-demand.
 * CRITICAL: Never store signed URLs in the database. Store only bucket + object_key.
 * Signed URLs are generated dynamically with short TTLs.
 */
import { supabase } from "@/integrations/supabase/client";

const SIGNED_URL_TTL = 60 * 60; // 1 hour

/** Cache signed URLs in memory to avoid re-signing on every render */
const urlCache = new Map<string, { url: string; expiresAt: number }>();

/**
 * Get a signed URL for a private storage path.
 * Uses in-memory cache to avoid re-signing on every render.
 */
export async function getSignedUrl(bucket: string, path: string): Promise<string | null> {
  const cacheKey = `${bucket}/${path}`;
  const cached = urlCache.get(cacheKey);
  const now = Date.now();

  // Return cached if still valid (with 5 min buffer)
  if (cached && cached.expiresAt > now + 5 * 60 * 1000) {
    return cached.url;
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, SIGNED_URL_TTL);

  if (error || !data?.signedUrl) {
    console.error(`Failed to sign URL for ${bucket}/${path}:`, error);
    return null;
  }

  urlCache.set(cacheKey, {
    url: data.signedUrl,
    expiresAt: now + SIGNED_URL_TTL * 1000,
  });

  return data.signedUrl;
}

/**
 * Get a public URL for a public bucket (avatars, content, videos, brand-assets).
 */
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Get a download URL (signed URL with content-disposition header).
 */
export async function getDownloadUrl(bucket: string, path: string, filename?: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, SIGNED_URL_TTL, {
      download: filename || path.split("/").pop() || "download",
    });

  if (error || !data?.signedUrl) {
    console.error(`Failed to create download URL for ${bucket}/${path}:`, error);
    return null;
  }

  return data.signedUrl;
}

/**
 * Upload a file to storage and return the object path (NOT a signed URL).
 * This is the correct pattern: store the path, resolve URLs on-demand.
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob,
  options?: { contentType?: string }
): Promise<{ path: string; error: string | null }> {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: options?.contentType || file.type });

  if (error) {
    return { path: "", error: error.message };
  }

  return { path, error: null };
}

/**
 * Resolve a URL field that might be:
 * 1. A storage path (e.g., "training/abc/image.jpg") — needs signing
 * 2. A full URL (https://...) — return as-is
 * 3. A base64 data URL — return as-is
 * 4. null/undefined — return null
 *
 * For private buckets, generates a signed URL.
 * For public buckets, returns the public URL.
 */
export async function resolveAssetUrl(
  urlOrPath: string | null | undefined,
  bucket: string = "content",
  isPublicBucket: boolean = true
): Promise<string | null> {
  if (!urlOrPath) return null;

  // Already a full URL or data URI
  if (urlOrPath.startsWith("http://") || urlOrPath.startsWith("https://") || urlOrPath.startsWith("data:")) {
    return urlOrPath;
  }

  // It's a storage path — resolve it
  if (isPublicBucket) {
    return getPublicUrl(bucket, urlOrPath);
  }

  return getSignedUrl(bucket, urlOrPath);
}

/**
 * Batch resolve multiple asset URLs.
 */
export async function resolveAssetUrls(
  items: { urlOrPath: string | null | undefined; bucket?: string; isPublic?: boolean }[]
): Promise<(string | null)[]> {
  return Promise.all(
    items.map((item) =>
      resolveAssetUrl(item.urlOrPath, item.bucket || "content", item.isPublic ?? true)
    )
  );
}
