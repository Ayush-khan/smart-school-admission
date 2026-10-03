// Class name + shift, both from the backend (GET /api/admission/classes).
// The backend sends the shift in the "type" field (e.g. "shift 1").
export const getClassName = (c) => c?.label ?? c?.class_name ?? c?.name ?? ''
export const getClassShift = (c) => {
  const value = c?.shift ?? c?.type
  return value ? String(value).trim() : ''
}

// "Nursery (Shift 1)" - used wherever a plain text label is needed.
export const formatClassLabel = (c) => {
  const name = getClassName(c)
  const shift = getClassShift(c)
  if (!shift) return name
  const pretty = shift.charAt(0).toUpperCase() + shift.slice(1)
  return `${name} (${pretty})`
}