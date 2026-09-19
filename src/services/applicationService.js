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
