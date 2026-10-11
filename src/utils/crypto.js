/**
 * Simple XOR + Base64 encryption utility
 *
 * Secret key used for Hakim Group remote config:
 * HakimGroup2026SecretKey
 *
 * To re-encrypt a new URL:
 * encrypt('https://your-new-api-url.com/api', 'HakimGroup2026SecretKey')
 * Or run in Node.js:
 * const key = 'HakimGroup2026SecretKey';
 * const url = 'https://...';
 * const enc = Buffer.from(url.split('').map((c, i) => c.charCodeAt(0) ^ key.charCodeAt(i % key.length))).toString('base64');
 * console.log(enc);
 */

export const SECRET_KEY = 'HakimGroup2026SecretKey';

const B64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

// Cross-platform Base64 encoder (handles React Native, Web, Node)
function base64Encode(str) {
  if (typeof btoa === 'function') {
    try {
      return btoa(str);
    } catch (e) {
      // Fallback if btoa fails
    }
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'binary').toString('base64');
  }
  let output = '';
  for (let block = 0, charCode, idx = 0, map = B64_CHARS;
    str.charAt(idx | 0) || (map = '=', idx % 1);
    output += map.charAt(63 & block >> 8 - idx % 1 * 8)) {
    charCode = str.charCodeAt(idx += 3 / 4);
    if (charCode > 0xFF) {
      throw new Error('btoa failed: string contains character outside Latin1 range');
    }
    block = (block << 8) | charCode;
  }
  return output;
}

// Cross-platform Base64 decoder (handles React Native, Web, Node)
function base64Decode(str) {
  if (typeof atob === 'function') {
    try {
      return atob(str);
    } catch (e) {
      // Fallback if atob fails
    }
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'base64').toString('binary');
  }
  let cleanStr = String(str).replace(/[=]+$/, '');
  if (cleanStr.length % 4 === 1) {
    throw new Error('atob failed: string not correctly encoded');
  }
  let output = '';
  for (let bc = 0, bs = 0, buffer, idx = 0;
    (buffer = cleanStr.charAt(idx++));
    ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
      bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
  ) {
    buffer = B64_CHARS.indexOf(buffer);
  }
  return output;
}

/**
 * Encrypts plain text using XOR cipher with key and encodes to Base64
 * @param {string} text
 * @param {string} key
 * @returns {string} Base64 encoded payload
 */
export function encrypt(text, key = SECRET_KEY) {
  if (!text) return '';
  const cipherKey = key || SECRET_KEY;
  let xorChars = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i) ^ cipherKey.charCodeAt(i % cipherKey.length);
    xorChars += String.fromCharCode(code);
  }
  return base64Encode(xorChars);
}

/**
 * Decrypts Base64 payload and XOR decodes with key
 * @param {string} payload
 * @param {string} key
 * @returns {string} Plain text
 */
export function decrypt(payload, key = SECRET_KEY) {
  if (!payload) return '';
  const cipherKey = key || SECRET_KEY;
  const decodedChars = base64Decode(payload);
  let result = '';
  for (let i = 0; i < decodedChars.length; i++) {
    const code = decodedChars.charCodeAt(i) ^ cipherKey.charCodeAt(i % cipherKey.length);
    result += String.fromCharCode(code);
  }
  return result;
}

/**
 * Convenience function to decrypt payload using built-in secret key
 * @param {string} payload
 * @returns {string} Plain text
 */
export function decryptPayload(payload) {
  return decrypt(payload, SECRET_KEY);
}

export default {
  SECRET_KEY,
  encrypt,
  decrypt,
  decryptPayload,
};
