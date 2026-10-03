// Every text rule must START with a letter (or digit for addresses), so a value
// made only of spaces or symbols is rejected.
// Names: letters (any language) and spaces only. No digits or special characters.
const NAME_REGEX = /^\p{L}[\p{L}\p{M}\s]*$/u
// Occupation: letters, spaces and . , - / & ( ) — no digits.
const OCCUPATION_REGEX = /^\p{L}[\p{L}\p{M}\s.,\-/&()]*$/u
// Address: letters, digits, spaces and . , - / # ( ) & ' :
const ADDRESS_REGEX = /^[\p{L}\p{N}][\p{L}\p{M}\p{N}\s.,\-/#()&':]*$/u
// Indian pincode: 6 digits, first digit 1-9.
const PINCODE_REGEX = /^[1-9]\d{5}$/
// Indian mobile: 10 digits, starting with 6-9.
const MOBILE_REGEX = /^[6-9]\d{9}$/

// label -> message becomes "Enter a valid <label>."
export const nameRules = (label, required = false) => ({
  ...(required ? { required: 'Required' } : {}),
  pattern: { value: NAME_REGEX, message: `Enter a valid ${label}.` },
})

export const occupationRules = (label, required = false) => ({
  ...(required ? { required: 'Required' } : {}),
  pattern: { value: OCCUPATION_REGEX, message: `Enter a valid ${label}.` },
})

export const addressRules = (label, required = false) => ({
  ...(required ? { required: 'Required' } : {}),
  pattern: { value: ADDRESS_REGEX, message: `Enter a valid ${label}.` },
})

export const pincodeRules = (required = false) => ({
  ...(required ? { required: 'Required' } : {}),
  pattern: { value: PINCODE_REGEX, message: 'Enter a valid 6-digit pincode.' },
})

export const mobileRules = (required = false) => ({
  ...(required ? { required: 'Required' } : {}),
  pattern: { value: MOBILE_REGEX, message: 'Enter a valid mobile number.' },
})

// Date of birth window comes from the backend per class (age_start_date / age_end_date).
// If either one is null, fall back to the old default window: 2 to 16 years old.
export const todayISO = () => new Date().toISOString().split('T')[0]

const pad = (n) => String(n).padStart(2, '0')
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const yearsAgoISO = (n) => {
  const d = new Date()
  d.setFullYear(d.getFullYear() - n)
  return toISO(d)
}
const isoOrEmpty = (v) => /^(\d{4}-\d{2}-\d{2})/.exec(v || '')?.[1] ?? ''

export function getDobBounds(cls) {
  const today = toISO(new Date())
  const min = isoOrEmpty(cls?.age_start_date) || yearsAgoISO(16)
  let max = isoOrEmpty(cls?.age_end_date) || yearsAgoISO(2)
  if (max > today) max = today // a birth date can never be in the future
  return { min, max }
}

export const formatDMY = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '')
  return m ? `${m[3]}/${m[2]}/${m[1]}` : ''
}

// Returns '' when valid, otherwise the error message.
export function checkDob(value, { min, max }) {
  const date = new Date(value)
  if (!value || Number.isNaN(date.getTime())) return 'Enter a valid date of birth.'
  if (value > toISO(new Date())) return 'Date of birth cannot be in the future.'
  if (value < min || value > max) {
    return `Date of birth must be between ${formatDMY(min)} and ${formatDMY(max)} for this class.`
  }
  return ''
}

export const dobRulesFor = (bounds) => ({
  required: 'Required',
  validate: (value) => checkDob(value, bounds) || true,
})