import { useState, useEffect } from "react";
import * as FileSystem from "expo-file-system";

export function useBase64ImageUri(raw: string | undefined | null): string | null {
  const [fileUri, setFileUri] = useState<string | null>(null);

  useEffect(() => {
    if (!raw) { setFileUri(null); return; }

    let cancelled = false;

    (async () => {
      try {
        const cleaned = raw.replace(/\s+/g, "");
        if (!cleaned) { setFileUri(null); return; }

        // Web fallback: FileSystem.cacheDirectory is null on web
        if (!FileSystem.cacheDirectory) {
          let mime = "image/jpeg";
          if (cleaned.startsWith("iVBOR")) mime = "image/png";
          else if (cleaned.startsWith("AAAA")) mime = "image/avif";
          if (!cancelled) setFileUri(`data:${mime};base64,${cleaned}`);
          return;
        }

        let ext = "jpg";
        if (cleaned.startsWith("iVBOR")) ext = "png";
        else if (cleaned.startsWith("AAAA")) ext = "avif";

        // Deterministic cache key from first 32 base64 chars — avoids re-writing the same file
        const key = cleaned.slice(0, 32).replace(/[+/=]/g, "-");
        const path = `${FileSystem.cacheDirectory}doctor_photo_${key}.${ext}`;

        const info = await FileSystem.getInfoAsync(path);
        if (info.exists) {
          if (!cancelled) setFileUri(path);
          return;
        }

        await FileSystem.writeAsStringAsync(path, cleaned, {
          encoding: FileSystem.EncodingType.Base64,
        });
        if (!cancelled) setFileUri(path);
      } catch {
        if (!cancelled) setFileUri(null);
      }
    })();

    return () => { cancelled = true; };
  }, [raw]);

  return fileUri;
}
