// ============================================================
// ALIAS GENERATOR — Creates anonymous aliases for users
// Format: "Vendor-K7f3" or "Buyer-M2x9"
// Uses nanoid for cryptographically secure generation
// ============================================================

import { nanoid, customAlphabet } from 'nanoid'

// Custom alphabet: alphanumeric, no ambiguous chars (0,O,I,l)
const aliasChars = customAlphabet(
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz',
  4
)

/**
 * Generate a unique alias for a user based on their role.
 * Format: "Vendor-K7f3" or "Buyer-M2x9"
 *
 * @param role - 'buyer' or 'vendor'
 * @returns A formatted alias string
 */
export function generateAlias(role: 'buyer' | 'vendor'): string {
  const prefix = role === 'vendor' ? 'Vendor' : 'Buyer'
  const suffix = aliasChars()
  return `${prefix}-${suffix}`
}

/**
 * Validate if a string is a properly formatted alias.
 *
 * @param alias - The string to validate
 * @returns true if the alias matches the expected format
 */
export function isValidAlias(alias: string): boolean {
  const aliasPattern = /^(Vendor|Buyer)-[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz]{4}$/
  return aliasPattern.test(alias)
}

/**
 * Extract the role from an alias string.
 *
 * @param alias - A valid alias string
 * @returns 'buyer' | 'vendor' | null
 */
export function getRoleFromAlias(alias: string): 'buyer' | 'vendor' | null {
  if (!isValidAlias(alias)) return null
  return alias.startsWith('Vendor') ? 'vendor' : 'buyer'
}
