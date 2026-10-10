/** Normalize a phone number to WhatsApp's digits-only international format.
 * GrowCRM's member phone fields default to Uruguay; accept local or +country input.
 */
export function normalizeWhatsAppPhone(value: string): string | null {
  const trimmed = value.trim()
  let digits = trimmed.replace(/\D/g, "")

  if (trimmed.startsWith("+")) return digits.length >= 8 && digits.length <= 15 ? digits : null
  if (digits.startsWith("598")) return digits.length >= 11 && digits.length <= 15 ? digits : null

  if (digits.startsWith("0")) digits = digits.slice(1)
  return digits.length >= 7 && digits.length <= 9 ? `598${digits}` : null
}
