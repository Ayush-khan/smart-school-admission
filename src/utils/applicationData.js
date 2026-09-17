import { getAccountStorageKey } from './session'

const storageKey = (classId) => getAccountStorageKey('applicationData', classId)

export function getApplicationData(classId) {
  const raw = localStorage.getItem(storageKey(classId))
  return raw ? JSON.parse(raw) : {}
}

export function saveApplicationSection(classId, sectionKey, sectionData) {
  const current = getApplicationData(classId)
  const updated = { ...current, [sectionKey]: sectionData }
  localStorage.setItem(storageKey(classId), JSON.stringify(updated))
  return updated
}

export function isApplicationComplete(classId) {
  const data = getApplicationData(classId)
  const hasStudent = data.student && Object.keys(data.student).length > 0
  const hasAddress = data.address && Object.keys(data.address).length > 0
  const hasParents = data.parents && Object.keys(data.parents).length > 0
  const hasDocuments = data.documents && Object.keys(data.documents).length > 0
  return Boolean(hasStudent && hasAddress && hasParents && hasDocuments)
}