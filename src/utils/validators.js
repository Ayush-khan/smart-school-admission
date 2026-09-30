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

// Date of birth: real date, not in the future, not before DOB_MIN_YEAR.
export const DOB_MIN_YEAR = 2000
export const todayISO = () => new Date().toISOString().split('T')[0]

export const dobRules = {
  required: 'Required',
  validate: (value) => {
    const date = new Date(value)
    const valid =
      !Number.isNaN(date.getTime()) &&
      date <= new Date() &&
      date.getFullYear() >= DOB_MIN_YEAR
    return valid || 'Enter a valid date of birth.'
  },
}
