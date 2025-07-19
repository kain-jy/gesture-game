/**
 * Random string generation utilities
 */

/**
 * Generate a random string with specified options
 * @param length - Length of the string to generate
 * @param options - Options for character sets to include
 * @returns Random string
 */
export function generateRandomString(
  length: number,
  options: {
    includeUppercase?: boolean;
    includeLowercase?: boolean;
    includeNumbers?: boolean;
    includeSymbols?: boolean;
  } = {}
): string {
  const {
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = false,
  } = options;

  let charset = '';
  
  if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (includeNumbers) charset += '0123456789';
  if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (charset === '') {
    throw new Error('At least one character set must be included');
  }

  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return result;
}

/**
 * Generate a random alphanumeric string
 * @param length - Length of the string to generate
 * @returns Random alphanumeric string
 */
export function generateAlphanumericString(length: number): string {
  return generateRandomString(length, {
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: false,
  });
}

/**
 * Generate a random numeric string
 * @param length - Length of the string to generate
 * @returns Random numeric string
 */
export function generateNumericString(length: number): string {
  return generateRandomString(length, {
    includeUppercase: false,
    includeLowercase: false,
    includeNumbers: true,
    includeSymbols: false,
  });
}

/**
 * Generate a random lowercase string
 * @param length - Length of the string to generate
 * @returns Random lowercase string
 */
export function generateLowercaseString(length: number): string {
  return generateRandomString(length, {
    includeUppercase: false,
    includeLowercase: true,
    includeNumbers: false,
    includeSymbols: false,
  });
}

/**
 * Generate a random uppercase string
 * @param length - Length of the string to generate
 * @returns Random uppercase string
 */
export function generateUppercaseString(length: number): string {
  return generateRandomString(length, {
    includeUppercase: true,
    includeLowercase: false,
    includeNumbers: false,
    includeSymbols: false,
  });
}

/**
 * Generate a random string with symbols
 * @param length - Length of the string to generate
 * @returns Random string with symbols
 */
export function generateStringWithSymbols(length: number): string {
  return generateRandomString(length, {
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
  });
}

/**
 * Generate a random UUID (version 4)
 * @returns Random UUID string
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generate a random hex string
 * @param length - Length of the hex string to generate
 * @returns Random hex string
 */
export function generateHexString(length: number): string {
  const hexChars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += hexChars.charAt(Math.floor(Math.random() * hexChars.length));
  }
  return result;
} 