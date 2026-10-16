import { getAccountStorageKey } from './session'
import { getFormId } from './formId'

// Saved data is kept per FORM (account + class + form id), not just per class,
// so two forms in the same class (e.g. twins) never share data.
// Before the first save there is no form id yet; that draft lives under "new".
const keyFor = (classId, formId) => getAccountStorageKey('applicationData', `${classId}_${formId || 'new'}`)
const storageKey = (classId) => keyFor(classId, getFormId(classId))

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

// Wipes the saved data of the form currently selected for this class.
// Called right after clearFormId, it clears only the empty "new" draft, never an older form.
export function clearApplicationData(classId) {
  localStorage.removeItem(storageKey(classId))
}

// Where "Edit" should reopen a form: the first section not saved yet,
// or Review when everything is filled (or nothing is saved in this browser).
export function getResumePath(classId) {
  const data = getApplicationData(classId)
  const base = `/class/${classId}/application`
  const has = (section) => Boolean(section && Object.keys(section).length > 0)
  if (!has(data.student)) return `${base}/review`
  const sections = [
    ['address', has(data.address)],
    ['siblings', data.siblings !== undefined && data.siblings !== null],
    ['parents', has(data.parents)],
    ['additional', has(data.additional)],
    ['documents', has(data.documents)],
  ]
  const next = sections.find(([, done]) => !done)
  return next ? `${base}/${next[0]}` : `${base}/review`
}

// Pass formId to check one specific form (e.g. a row on the Dashboard);
// without it, the form currently selected for this class is checked.
export function isApplicationComplete(classId, formId) {
  const raw = formId ? localStorage.getItem(keyFor(classId, formId)) : localStorage.getItem(storageKey(classId))
  const data = raw ? JSON.parse(raw) : {}
  const hasStudent = data.student && Object.keys(data.student).length > 0
  const hasAddress = data.address && Object.keys(data.address).length > 0
  const hasParents = data.parents && Object.keys(data.parents).length > 0
  const hasDocuments = data.documents && Object.keys(data.documents).length > 0
  // Set only after the Declaration page is submitted successfully.
  const hasDeclaration = data.declaration?.completed === true
  return Boolean(hasStudent && hasAddress && hasParents && hasDocuments && hasDeclaration)
}