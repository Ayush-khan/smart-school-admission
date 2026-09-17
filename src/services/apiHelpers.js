// Small shared helper for pulling a readable error message off an axios error,
// since the backend's error shape isn't documented in the API guide.
export function getErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    (typeof err?.response?.data === 'string' ? err.response.data : null) ||
    err?.message ||
    fallback
  )
}
