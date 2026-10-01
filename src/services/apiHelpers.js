// Small shared helper for pulling a readable error message off an axios error,
// since the backend's error shape isn't documented in the API guide.
export function getErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  // Laravel validation errors: show every message instead of "(and 1 more error)".
  const errors = err?.response?.data?.errors
  if (errors && typeof errors === 'object') {
    const messages = Object.values(errors).flat().filter(Boolean)
    if (messages.length) return messages.join(' ')
  }
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    (typeof err?.response?.data === 'string' ? err.response.data : null) ||
    err?.message ||
    fallback
  )
}
