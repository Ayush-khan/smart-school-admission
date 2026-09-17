// Lightweight localStorage-backed session helpers, in the same style as
// formId.js / applicationData.js already used in this project.

const KEYS = {
  narId: 'admission_nar_id',
  mode: 'admission_mode',
  contact: 'admission_contact',
  fullName: 'admission_full_name',
}

export function saveSessionInfo({ narId, mode, contact, fullName } = {}) {
  if (narId !== undefined) localStorage.setItem(KEYS.narId, narId ?? '')
  if (mode !== undefined) localStorage.setItem(KEYS.mode, mode ?? '')
  if (contact !== undefined) localStorage.setItem(KEYS.contact, contact ?? '')
  if (fullName !== undefined) localStorage.setItem(KEYS.fullName, fullName ?? '')
}

export function getSessionInfo() {
  return {
    narId: localStorage.getItem(KEYS.narId) || '',
    mode: localStorage.getItem(KEYS.mode) || 'mobile',
    contact: localStorage.getItem(KEYS.contact) || '',
    fullName: localStorage.getItem(KEYS.fullName) || '',
  }
}

export function getAccountStorageKey(prefix, classId) {
  const { narId } = getSessionInfo()
  return `${prefix}_${narId || 'anonymous'}_${classId}`
}

export function clearSession() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key))
  localStorage.removeItem('authToken')
}
