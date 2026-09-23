import apiClient from './apiClient'

// ---------------------------------------------------------------------------
// Get Classes — GET /api/admission/classes
// "Do not hardcode class names in frontend." (per guide)
// ---------------------------------------------------------------------------
export async function getClasses() {
  const response = await apiClient.get('/api/admission/classes')
  return response.data
}

// ---------------------------------------------------------------------------
// Get Form Fee — GET /api/admission/form-fee
// ---------------------------------------------------------------------------
export async function getFormFee(params = {}) {
  const response = await apiClient.get('/api/admission/form-fee', { params })
  return response.data
}

// ---------------------------------------------------------------------------
// Get Dashboard — GET /api/admission/dashboard
// ---------------------------------------------------------------------------
export async function getDashboard(narId) {
  const response = await apiClient.get('/api/admission/dashboard', {
    params: { nar_id: narId },
  })
  return response.data
}

// ---------------------------------------------------------------------------
// Get Admission Instructions — GET /api/admission/instructions/{classId}?academic_yr=
// ---------------------------------------------------------------------------
export async function getInstructions(classId, academicYr) {
  const response = await apiClient.get(`/api/admission/instructions/${classId}`, {
    params: academicYr ? { academic_yr: academicYr } : {},
  })
  return response.data
}

// ---------------------------------------------------------------------------
// Save Admission Instructions (admin) — POST /api/admission/admin/instructions
// ---------------------------------------------------------------------------
export async function saveInstructions(payload) {
  const response = await apiClient.post('/api/admission/admin/instructions', payload)
  return response.data
}

// ---------------------------------------------------------------------------
// Get Admission Form Details — GET /api/admission/form/{formId}
// Used to prefill an existing application.
// ---------------------------------------------------------------------------
export async function getFormDetails(formId) {
  const response = await apiClient.get(`/api/admission/form/${formId}`)
  return response.data
}

// ---------------------------------------------------------------------------
// Get Form Field Options — GET /api/admission/form-field-options
// Used to populate dropdown/radio/select options dynamically (do not hardcode).
// ---------------------------------------------------------------------------
export async function getFormFieldOptions(params = {}) {
  const response = await apiClient.get('/api/admission/form-field-options', { params })
  return response.data
}

// ---------------------------------------------------------------------------
// Save Student Details — POST /api/admission/student-details
// Body must contain form_id, academic_yr, class_id + student fields.
// ---------------------------------------------------------------------------
export async function saveStudentDetails(payload) {
  const response = await apiClient.post('/api/admission/student-details', payload)
  return response.data
}

// ---------------------------------------------------------------------------
// List Online Admission Forms — GET /api/admission/online-forms
// ---------------------------------------------------------------------------
export async function listOnlineForms(params = {}) {
  const response = await apiClient.get('/api/admission/online-forms', { params })
  return response.data
}

// ---------------------------------------------------------------------------
// Show Admission Form — GET /api/admission/form/{formId}
// ---------------------------------------------------------------------------
export async function getOnlineForm(formId) {
  const response = await apiClient.get(`/api/admission/form/${formId}`)
  return response.data
}

// ---------------------------------------------------------------------------
// Update Admission Form — PUT /api/admission/form/{formId}
// ---------------------------------------------------------------------------
export async function updateOnlineForm(formId, payload) {
  const response = await apiClient.put(`/api/admission/form/${formId}`, payload)
  return response.data
}

// ---------------------------------------------------------------------------
// Delete Admission Form — DELETE /api/admission/form/{formId}
// Guide: "Show confirmation before delete."
// ---------------------------------------------------------------------------
export async function deleteOnlineForm(formId) {
  const response = await apiClient.delete(`/api/admission/form/${formId}`)
  return response.data
}

// ---------------------------------------------------------------------------
// Download Admission Form PDF — GET /api/admission/online-form/{formId}/download
// ---------------------------------------------------------------------------
export async function downloadOnlineFormPdf(formId, narId) {
  const response = await apiClient.get(`/api/admission/online-form/${formId}/download`, {
    params: { nar_id: narId },
    responseType: 'blob',
  })

  const contentType = response.headers['content-type'] || ''
  if (!contentType.includes('application/pdf')) {
    // Backend didn't return a real PDF — most likely a JSON error response.
    const text = await response.data.text()
    let message = 'Could not download the form.'
    try {
      const parsed = JSON.parse(text)
      message = parsed.message || message
    } catch {
      // Not JSON either — keep the default message.
    }
    throw new Error(message)
  }

  return response.data
}

// ---------------------------------------------------------------------------
// Create Admission Enquiry — POST /api/admission/enquiries
// ASSUMPTION: field names below match this project's existing snake_case
// convention but are NOT confirmed by backend — verify against the real
// AdmissionEnquiryController validation rules before trusting this.
// ---------------------------------------------------------------------------
export async function submitEnquiry(payload) {
  const response = await apiClient.post('/api/admission/enquiries', payload)
  return response.data
}

// ---------------------------------------------------------------------------
// Get Admission Document Types — GET /api/admission/document-types
// ---------------------------------------------------------------------------
export async function getDocumentTypes() {
  const response = await apiClient.get('/api/admission/document-types')
  return response.data
}

// ---------------------------------------------------------------------------
// Get Classes for Enquiry Dropdown — GET /api/admission/enquiry/classes
// ---------------------------------------------------------------------------
export async function getEnquiryClasses() {
  const response = await apiClient.get('/api/admission/enquiry/classes')
  return response.data
}

// ---------------------------------------------------------------------------
// Get Genders for Enquiry Dropdown — GET /api/admission/enquiry/genders
// ---------------------------------------------------------------------------
export async function getEnquiryGenders() {
  const response = await apiClient.get('/api/admission/enquiry/genders')
  return response.data
}

// ---------------------------------------------------------------------------
// List Admission Enquiries — GET /api/admission/enquiries
// ASSUMPTION: documented as an admin-wide listing — passing nar_id/contact as
// filters is UNCONFIRMED. Verify via Network tab that this actually restricts
// results to the logged-in user before trusting it anywhere user-facing.
// ---------------------------------------------------------------------------
export async function listAdmissionEnquiries(params = {}) {
  const response = await apiClient.get('/api/admission/enquiries', { params })
  return response.data
}

// ---------------------------------------------------------------------------
// Save Admission Signature — POST /api/admission/signature
// ---------------------------------------------------------------------------
export async function saveAdmissionSignature({
  formId,
  signatureType,
  signatureName,
  signatureFile,
  declarationConfirmed,
  termsAccepted,
  privacyAccepted,
}) {
  const formData = new FormData()
  formData.append('form_id', formId)
  formData.append('signature_type', signatureType)
  if (signatureType === 'typed') {
    formData.append('signature_name', signatureName)
  }
  if (signatureType === 'pdf' && signatureFile) {
    formData.append('signature_file', signatureFile)
  }
  formData.append('declaration_confirmed', declarationConfirmed ? 'Y' : 'N')
  formData.append('terms_accepted', termsAccepted ? 'Y' : 'N')
  formData.append('privacy_accepted', privacyAccepted ? 'Y' : 'N')

  const response = await apiClient.post('/api/admission/signature', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}