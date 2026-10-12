const toSnakeCase = (value) => {
  if (Array.isArray(value)) return value.map(toSnakeCase)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`),
        toSnakeCase(item),
      ])
    )
  }
  return value
}

export function buildApplicationSubmissionPayload({ application, classId, formId, narId }) {
  const student = application.student || {}
  const address = application.address || {}
  const parents = application.parents || {}
  const siblings = application.siblings || {}

  const smsPhone =
    parents.smsContact === 'father'
      ? parents.fatherMobile
      : parents.smsContact === 'mother'
        ? parents.motherMobile
        : ''

  return {
    first_name: student.firstName,
    mid_name: student.middleName,
    last_name: student.lastName,
    dob: student.dob,
    birth_place: student.birthPlace,
    mother_tongue: student.motherTongue,
    gender: student.gender,
    religion: student.religion,
    caste: student.caste,
    subcaste: student.subCaste,
    category: student.category,
    class_id: classId,
    academic_yr: '2026-27',
    nar_id: narId,
    form_id: formId,
    locality: address.presentAddress,
    city: address.presentCity,
    state: address.presentState,
    pincode: address.presentPincode,
    perm_address: address.permanentAddress,
    nationality: address.nationality,
    sibling: siblings.hasSibling ? 'Y' : 'N',
    sms_sending_phone_no: smsPhone,
    address: toSnakeCase(address),
    parents: toSnakeCase(parents),
    siblings: toSnakeCase(siblings),
    academic: toSnakeCase(application.academic || []),
    additional: toSnakeCase(application.additional || {}),
  }
}
