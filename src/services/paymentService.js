import apiClient from './apiClient'

export async function createPayment(formId) {
	const response = await apiClient.post('/api/admission/payment/create', {
		form_id: formId,
	})
	return response.data
}

export async function getPaymentStatus(orderId) {
	const response = await apiClient.get(`/api/admission/payment/${encodeURIComponent(orderId)}`)
	return response.data
}

// The callback is called server-to-server by Worldline. It must not be called
// from the browser.
