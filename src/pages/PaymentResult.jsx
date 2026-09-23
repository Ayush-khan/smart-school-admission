import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import ClassLayout from '../layouts/ClassLayout'
import { getPaymentStatus } from '../services/paymentService'
import { getAccountStorageKey } from '../utils/session'

function getPaymentPayload(response) {
  return response?.data ?? response ?? {}
}

function getPaymentState(payment) {
  const value = String(payment?.status ?? '').toLowerCase()
  if (['s', 'success', 'successful', 'paid', 'completed'].includes(value)) return 'successful'
  if (['failed', 'failure', 'cancelled', 'canceled', 'declined', 'f'].includes(value)) return 'failed'
  return 'pending'
}

function PaymentResult() {
  const navigate = useNavigate()
  const { classId } = useParams()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order_id') || searchParams.get('orderId')
  const [status, setStatus] = useState(orderId ? 'processing' : 'failed')
  const [payment, setPayment] = useState(null)

  useEffect(() => {
    if (!orderId) return undefined

    let active = true
    getPaymentStatus(orderId)
      .then((response) => {
        if (!active) return
        const result = getPaymentPayload(response)
        setPayment(result)
        setStatus(getPaymentState(result))
        localStorage.setItem(getAccountStorageKey('paymentOrderId', classId), JSON.stringify(result))
        if (getPaymentState(result) === 'successful') toast.success('Payment successful')
      })
      .catch(() => {
        if (active) setStatus('failed')
      })

    return () => { active = false }
  }, [classId, orderId])

  const goToPayment = () => navigate(`/class/${classId}/application/payment`)
  const goToReceipt = () => navigate(`/class/${classId}/application/receipt`)

  return (
    <ClassLayout>
      <div className="bg-white rounded-xl shadow-sm p-6 max-w-xl mx-auto text-center">
        {status === 'processing' && (
          <div className="py-10">
            <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-slate-600">Verifying your payment...</p>
          </div>
        )}

        {status === 'successful' && (
          <div className="py-8">
            <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">✓</div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Payment Successful</h2>
            <p className="text-sm text-slate-500 mb-2">Your admission fee has been received.</p>
            <p className="text-xs text-slate-400 mb-6">Transaction reference: {payment?.transaction_reference || '—'}</p>
            <button onClick={goToReceipt} className="bg-navy text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-navy-light">
              View Receipt
            </button>
          </div>
        )}

        {status === 'pending' && (
          <div className="py-8">
            <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">!</div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Payment Pending</h2>
            <p className="text-sm text-slate-500 mb-6">Your payment is still being processed.</p>
            <button onClick={goToPayment} className="bg-navy text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-navy-light">
              Check Payment Status
            </button>
          </div>
        )}

        {status === 'failed' && (
          <div className="py-8">
            <div className="w-16 h-16 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">✕</div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Payment Failed</h2>
            <p className="text-sm text-slate-500 mb-6">We could not verify this payment. Please try again.</p>
            <button onClick={goToPayment} className="bg-navy text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-navy-light">
              Try Again
            </button>
          </div>
        )}
      </div>
    </ClassLayout>
  )
}

export default PaymentResult