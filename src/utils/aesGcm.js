// // // Text encoder/decoder
// // const encoder = new TextEncoder();
// // const decoder = new TextDecoder();

// // // Read AES key from .env
// // const SECRET_KEY_BASE64 = import.meta.env.VITE_AES_GCM_KEY_BASE64;
// // if (!SECRET_KEY_BASE64) {
// //   throw new Error("VITE_AES_GCM_KEY_BASE64 not set in environment variables");
// // }

// // /**
// //  * Import AES key (returns CryptoKey)
// //  */
// // export const getAesKey = async () => {
// //   const rawKey = Uint8Array.from(atob(SECRET_KEY_BASE64), (c) =>
// //     c.charCodeAt(0)
// //   );
// //   return await crypto.subtle.importKey(
// //     "raw",
// //     rawKey,
// //     "AES-GCM",
// //     false, // not extractable
// //     ["encrypt", "decrypt"]
// //   );
// // };

// // /**
// //  * Encrypt payload object
// //  * @param {Object} payload
// //  * @param {CryptoKey} key
// //  * @returns {Promise<{ct: string, iv: string}>}
// //  */
// // export const encryptPayload = async (payload, key) => {
// //   const iv = crypto.getRandomValues(new Uint8Array(12));
// //   const payloadStr = JSON.stringify(payload, null, 2); // preserve spaces/newlines

// //   const encryptedBuffer = await crypto.subtle.encrypt(
// //     { name: "AES-GCM", iv },
// //     key,
// //     encoder.encode(payloadStr)
// //   );

// //   const ctB64 = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));
// //   const ivB64 = btoa(String.fromCharCode(...iv));

// //   return { ct: ctB64, iv: ivB64 };
// // };

// // /**
// //  * Decrypt payload
// //  * @param {string} ctB64
// //  * @param {string} ivB64
// //  * @param {CryptoKey} key
// //  * @returns {Promise<Object>}
// //  */
// // export const decryptPayload = async (ctB64, ivB64, key) => {
// //   const ct = Uint8Array.from(atob(ctB64), (c) => c.charCodeAt(0));
// //   const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0));

// //   const decryptedBuffer = await crypto.subtle.decrypt(
// //     { name: "AES-GCM", iv },
// //     key,
// //     ct
// //   );

// //   return JSON.parse(decoder.decode(decryptedBuffer));
// // };

// // src/utils/encrypt.js
// // AES-256-GCM encryption/decryption for frontend

// // Text encoder/decoder
// const encoder = new TextEncoder();
// const decoder = new TextDecoder();

// // Read AES key from .env
// const SECRET_KEY_BASE64 = import.meta.env.VITE_AES_GCM_KEY_BASE64;
// if (!SECRET_KEY_BASE64) {
//   throw new Error("VITE_AES_GCM_KEY_BASE64 not set in environment variables");
// }

// /**
//  * Import AES key (returns CryptoKey)
//  */
// export const getAesKey = async () => {
//   const rawKey = Uint8Array.from(atob(SECRET_KEY_BASE64), (c) =>
//     c.charCodeAt(0)
//   );
//   return await crypto.subtle.importKey(
//     "raw",
//     rawKey,
//     "AES-GCM",
//     false, // not extractable
//     ["encrypt", "decrypt"]
//   );
// };

// /**
//  * Encrypt payload object
//  * @param {Object} payload
//  * @param {CryptoKey} key
//  * @returns {Promise<{ct: string, iv: string}>}
//  */
// export const encryptPayload = async (payload, key) => {
//   const iv = crypto.getRandomValues(new Uint8Array(12));
//   const payloadStr = JSON.stringify(payload, null, 2); // preserve spaces/newlines

//   const encryptedBuffer = await crypto.subtle.encrypt(
//     { name: "AES-GCM", iv },
//     key,
//     encoder.encode(payloadStr)
//   );

//   const ctB64 = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));
//   const ivB64 = btoa(String.fromCharCode(...iv));

//   return { ct: ctB64, iv: ivB64 };
// };

// /**
//  * Decrypt payload
//  * @param {string} ctB64
//  * @param {string} ivB64
//  * @param {CryptoKey} key
//  * @returns {Promise<Object>}
//  */
// export const decryptPayload = async (ctB64, ivB64, key) => {
//   const ct = Uint8Array.from(atob(ctB64), (c) => c.charCodeAt(0));
//   const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0));

//   const decryptedBuffer = await crypto.subtle.decrypt(
//     { name: "AES-GCM", iv },
//     key,
//     ct
//   );

//   return JSON.parse(decoder.decode(decryptedBuffer));
// };
