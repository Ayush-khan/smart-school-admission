// Letters (any language) and spaces only. No digits or special characters.
const NAME_REGEX = /^[\p{L}\p{M}\s]+$/u

export const nameRules = (required = false) => ({
  ...(required ? { required: 'Required' } : {}),
  pattern: { value: NAME_REGEX, message: 'Invalid characters.' },
})
