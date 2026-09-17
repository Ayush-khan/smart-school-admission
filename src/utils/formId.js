import { getAccountStorageKey } from './session'

export function getFormIdFromResponse(response) {
  const payload = response?.data ?? response
  const data = payload?.data ?? payload
  return data?.form_id ?? data?.formId ?? data?.application_number ?? data?.applicationNumber ?? ''
}

export function getFormId(classId) {
  const storageKey = getAccountStorageKey('formId', classId)
  return localStorage.getItem(storageKey) || ''
}

export function saveFormId(classId, formId) {
  if (!formId) return
  localStorage.setItem(getAccountStorageKey('formId', classId), String(formId))
}

export function clearFormId(classId) {
  localStorage.removeItem(getAccountStorageKey('formId', classId))
}