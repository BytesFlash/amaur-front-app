/**
 * Formats a Chilean RUT string.
 * Input: "123456789" or "12345678-9"  →  Output: "12.345.678-9"
 */
export function formatRut(rut: string | null | undefined): string {
  if (!rut) return '—'
  const clean = rut.replace(/[^0-9kK]/g, '').toUpperCase()
  if (clean.length < 2) return clean

  const dv = clean.slice(-1)
  const body = clean.slice(0, -1)

  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${formatted}-${dv}`
}

/**
 * Strips formatting from a RUT string.
 * Input: "12.345.678-9"  →  Output: "12345678-9"
 */
export function normalizeRut(rut: string): string {
  const clean = rut.replace(/[^0-9kK]/g, '').toUpperCase()
  if (clean.length < 2) return clean
  return `${clean.slice(0, -1)}-${clean.slice(-1)}`
}

/**
 * Validates a Chilean RUT checksum.
 */
export function validateRut(rut: string): boolean {
  const clean = rut.replace(/[^0-9kK]/g, '').toUpperCase()
  if (clean.length < 2) return false

  const digits = clean.slice(0, -1)
  const dv = clean.slice(-1)

  let sum = 0
  let multiplier = 2
  for (let i = digits.length - 1; i >= 0; i--) {
    sum += parseInt(digits[i]) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }

  const remainder = 11 - (sum % 11)
  const expected = remainder === 11 ? '0' : remainder === 10 ? 'K' : String(remainder)

  return dv === expected
}
