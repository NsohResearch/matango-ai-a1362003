import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * Upload a file and create a media_objects record.
 * Returns the media_object row — NEVER a signed URL.
 */
export function useUploadMedia() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      bucket = "content",
      folder = "uploads",
    }: {
      file: File;
      bucket?: string;
      folder?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const ext = file.name.split(".").pop() || "bin";
      const objectKey = `${folder}/${user.id}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(objectKey, file, { contentType: file.type });
      if (uploadError) throw uploadError;

      const { data, error } = await supabase
        .from("media_objects")
        .insert({
          user_id: user.id,
          bucket,
          object_key: objectKey,
          mime_type: file.type,
          size_bytes: file.size,
          type: file.type.startsWith("video/") ? "video" : file.type.startsWith("image/") ? "image" : "file",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["media-objects"] }),
  });
}

/**
 * Generate a signed URL on-demand from a media_object id.
 * TTL 15 min, auto-refresh at 14 min.
 */
export function useSignedUrl(mediaObjectId: string | null) {
  return useQuery({
    queryKey: ["signed-url", mediaObjectId],
    enabled: !!mediaObjectId,
    staleTime: 10 * 60 * 1000, // 10 min
    refetchInterval: 14 * 60 * 1000, // 14 min — refresh before 15-min expiry
    queryFn: async () => {
      const { data: mo, error } = await supabase
        .from("media_objects")
        .select("bucket, object_key")
        .eq("id", mediaObjectId!)
        .single();
      if (error || !mo) throw error || new Error("Media object not found");

      const { data: signed, error: signError } = await supabase.storage
        .from(mo.bucket)
        .createSignedUrl(mo.object_key, 900); // 15-min TTL
      if (signError || !signed) throw signError || new Error("Failed to create signed URL");
      return signed.signedUrl;
    },
  });
}

/**
 * Batch-resolve signed URLs for multiple media_object ids.
 */
export function useSignedUrlBatch(mediaObjectIds: string[]) {
  const filtered = mediaObjectIds.filter(Boolean);
  return useQuery({
    queryKey: ["signed-url-batch", ...filtered],
    enabled: filtered.length > 0,
    staleTime: 10 * 60 * 1000,
    refetchInterval: 14 * 60 * 1000,
    queryFn: async () => {
      const { data: mos, error } = await supabase
        .from("media_objects")
        .select("id, bucket, object_key")
        .in("id", filtered);
      if (error) throw error;

      const entries = await Promise.all(
        (mos || []).map(async (mo) => {
          const { data: signed } = await supabase.storage
            .from(mo.bucket)
            .createSignedUrl(mo.object_key, 900);
          return [mo.id, signed?.signedUrl || ""] as const;
        })
      );
      return new Map(entries);
    },
  });
}
