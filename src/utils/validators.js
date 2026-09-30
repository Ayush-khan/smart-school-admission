// Letters (any language) and spaces only. No digits or special characters.
const NAME_REGEX = /^[\p{L}\p{M}\s]+$/u

// label -> message becomes "Enter a valid <label>."
export const nameRules = (label, required = false) => ({
  ...(required ? { required: 'Required' } : {}),
  pattern: { value: NAME_REGEX, message: `Enter a valid ${label}.` },
})
