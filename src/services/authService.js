import apiClient from './apiClient'

// ---------------------------------------------------------------------------
// Step 2 (Frontend Flow): Create Registration
// POST /api/admission/registration
// This one was already wired correctly before this pass — kept as-is.
// ---------------------------------------------------------------------------
export async function createRegistration({ fullName, mode, contact }) {
  const body = { parent_name: fullName }
  if (mode === 'mobile') {
    body.phone_no = contact
  } else {
    body.email = contact
  }
  const response = await apiClient.post('/api/admission/registration', body)
  return response.data
}

// ---------------------------------------------------------------------------
// Get Registration Details
// GET /api/admission/registration/{narId}
// ---------------------------------------------------------------------------
export async function getRegistrationDetails(narId) {
  const response = await apiClient.get(`/api/admission/registration/${narId}`)
  return response.data
}

// ---------------------------------------------------------------------------
// Step 3: Send OTP
// POST /api/admission/send-otp
//
// ASSUMPTION: the guide only says "JSON body containing required mobile number" —
// it doesn't give exact field names. This mirrors the createRegistration
// convention (phone_no / email) plus the nar_id returned from registration.
// Verify against the real backend response/Swagger and adjust field names if needed.
// ---------------------------------------------------------------------------
export async function sendOtp({ narId, mode, contact }) {
  const body = { nar_id: narId }
  if (mode === 'mobile') {
    body.phone_no = contact
  } else {
    body.email = contact
  }
  const response = await apiClient.post('/api/admission/send-otp', body)
  return response.data
}

// ---------------------------------------------------------------------------
// Step 4: Verify OTP
// POST /api/admission/verify-otp
//
// ASSUMPTION: same caveat as sendOtp — field names not specified by the guide.
// ---------------------------------------------------------------------------
export async function verifyOtp({ narId, mode, contact, otp }) {
  const body = { nar_id: narId, otp }
  if (mode === 'mobile') {
    body.phone_no = contact
  } else {
    body.email = contact
  }
  const response = await apiClient.post('/api/admission/verify-otp', body)
  return response.data
}

// ---------------------------------------------------------------------------
// Resend OTP
// POST /api/admission/resend-otp
// ---------------------------------------------------------------------------
export async function resendOtp({ narId, mode, contact }) {
  const body = { nar_id: narId }
  if (mode === 'mobile') {
    body.phone_no = contact
  } else {
    body.email = contact
  }
  const response = await apiClient.post('/api/admission/resend-otp', body)
  return response.data
}
