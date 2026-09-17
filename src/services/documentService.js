import apiClient from './apiClient'

// ---------------------------------------------------------------------------
// Upload Admission Document — POST /api/admission/online-form/{formId}/documents
// multipart/form-data, NOT raw JSON (per guide).
//
// ASSUMPTION: field names "document" / "document_type" are not specified by the
// guide beyond "document file and required document type" — confirm against
// backend and rename if needed.
// ---------------------------------------------------------------------------
export async function uploadDocument(formId, docType, file) {
  const formData = new FormData()
  formData.append('document', file)
  formData.append('document_type', docType)

  const response = await apiClient.post(
    `/api/admission/online-form/${formId}/documents`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return response.data
}

// ---------------------------------------------------------------------------
// Get Admission Documents — GET /api/admission/online-form/{formId}/documents
// ---------------------------------------------------------------------------
export async function getDocuments(formId) {
  const response = await apiClient.get(`/api/admission/online-form/${formId}/documents`)
  return response.data
}

// ---------------------------------------------------------------------------
// View Admission Document — GET /api/admission/online-form/{formId}/documents/{docType}
// ---------------------------------------------------------------------------
export async function viewDocument(formId, docType) {
  const response = await apiClient.get(`/api/admission/online-form/${formId}/documents/${docType}`)
  return response.data
}

// ---------------------------------------------------------------------------
// Delete Admission Document — DELETE /api/admission/online-form/{formId}/documents/{docType}
// Guide: "Confirm before deleting."
// ---------------------------------------------------------------------------
export async function deleteDocument(formId, docType) {
  const response = await apiClient.delete(`/api/admission/online-form/${formId}/documents/${docType}`)
  return response.data
}
