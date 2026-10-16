// Maps the `data.parent` object from GET /api/get_student_parent_information
// onto the field names used by the Parent Details form.
// When the API returns a key, its value replaces whatever was typed before
// (an empty/null value clears the field), so the form shows the sibling's parents only.
// Fields the API never returns are left untouched.
const FIELD_KEYS = {
  fatherName: 'father_name',
  fatherMobile: 'f_mobile',
  fatherEmail: 'f_email',
  fatherOccupation: 'father_occupation',
  fatherQualification: 'f_qualification',
  fatherAadhaar: 'parent_adhar_no',
  motherName: 'mother_name',
  motherMobile: 'm_mobile',
  motherEmail: 'm_emailid',
  motherOccupation: 'mother_occupation',
  motherQualification: 'm_qualification',
  motherAadhaar: 'm_adhar_no',
}

export const PARENT_LOOKUP_FIELDS = Object.keys(FIELD_KEYS)

const clean = (field, value) => {
  const text = String(value ?? '').trim()
  if (!text) return ''
  if (field.endsWith('Mobile')) return text.replace(/\D/g, '').slice(-10)
  if (field.endsWith('Aadhaar')) return text.replace(/\D/g, '').slice(0, 12)
  return text
}

export function mapParentFromApi(parent) {
  if (!parent || typeof parent !== 'object') return {}
  const result = {}
  for (const [field, key] of Object.entries(FIELD_KEYS)) {
    if (key in parent) result[field] = clean(field, parent[key])
  }
  return result
}

// Fields that become read-only on Parent Details when the sibling lookup supplied a value.
// A value that fails the form's own validation is NOT locked, so the user can still fix it.
const EMAIL_REGEX = /^[A-Za-z0-9]+([._-][A-Za-z0-9]+)*@([A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/
const MOBILE_REGEX = /^[6-9]\d{9}$/
const NAME_REGEX = /^\p{L}[\p{L}\p{M}\s]*$/u
const LOCK_RULES = {
  fatherName: (v) => NAME_REGEX.test(v),
  motherName: (v) => NAME_REGEX.test(v),
  fatherEmail: (v) => EMAIL_REGEX.test(v),
  fatherMobile: (v) => MOBILE_REGEX.test(v),
  motherEmail: (v) => EMAIL_REGEX.test(v),
  motherMobile: (v) => MOBILE_REGEX.test(v),
}

export function lockedFieldsFromApi(parent) {
  const mapped = mapParentFromApi(parent)
  const locked = {}
  for (const [field, isValid] of Object.entries(LOCK_RULES)) {
    if (mapped[field] && isValid(mapped[field])) locked[field] = mapped[field]
  }
  return locked
}
