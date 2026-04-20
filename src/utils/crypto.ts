// src/utils/crypto.ts

import { encode, decode } from "base-64";

// ✅ ENCRYPT
export const encrypt = (text: string | number) => {
  try {
    return encode(String(text));
  } catch (e) {
    console.log("Encrypt error:", e);
    return "";
  }
};

// ✅ DECRYPT
export const decrypt = (text: string) => {
  try {
    return decode(text);
  } catch (e) {
    console.log("Decrypt error:", e);
    return null;
  }
};