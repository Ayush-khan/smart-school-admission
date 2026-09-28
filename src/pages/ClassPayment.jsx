import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getApplicationData } from '../utils/applicationData'
import { getFormId } from '../utils/formId'
import { getAccountStorageKey } from '../utils/session'
import ClassLayout from '../layouts/ClassLayout'
import { getClasses } from '../services/applicationService'
import { createPayment, getPaymentStatus } from '../services/paymentService'
import toast from 'react-hot-toast'

const PAYMENT_ORDER_KEY = 'paymentOrderId'

function getPaymentPayload(response) {
  return response?.data ?? response ?? {}
}

function getPaymentState(payment) {
  const value = String(payment?.status ?? '').toLowerCase()
  if (['s', 'success', 'successful', 'paid', 'completed'].includes(value)) return 'successful'
  if (['failed', 'failure', 'cancelled', 'canceled', 'declined'].includes(value)) return 'failed'
  return 'awaiting'
}

function getSavedOrderId(classId) {
  const savedPayment = localStorage.getItem(getAccountStorageKey(PAYMENT_ORDER_KEY, classId))
  if (!savedPayment) return null
  if (!savedPayment.startsWith('{')) return savedPayment

  try {
    const parsedPayment = JSON.parse(savedPayment)
    return parsedPayment.order_id ?? parsedPayment.orderId ?? null
  } catch {
    return null
  }
}

function ClassPayment() {
  const navigate = useNavigate()
  const { classId } = useParams()
  const [searchParams] = useSearchParams()
  const [classData, setClassData] = useState(null)
  const [loadingClass, setLoadingClass] = useState(true)
  const appData = getApplicationData(classId)
  const formId = getFormId(classId)

  const [payment, setPayment] = useState(null)
  const [status, setStatus] = useState(() => (
    searchParams.get('order_id') || searchParams.get('orderId') ? 'processing' : 'pending'
  ))
  const [errorMessage, setErrorMessage] = useState('')

  const savedOrderId = getSavedOrderId(classId)

  useEffect(() => {
    getClasses()
      .then((result) => {
        const selected = (result.data ?? result).find((item) => String(item.class_id ?? item.id) === String(classId))
        if (selected) {
          setClassData({
            id: String(selected.class_id ?? selected.id),
            label: selected.label ?? selected.class_name ?? selected.name ?? classId,
            feeStructure: { totalFee: Number(selected.application_form_fee ?? 0) },
          })
        }
      })
      .catch(() => setErrorMessage('Unable to load class details from the server.'))
      .finally(() => setLoadingClass(false))
  }, [classId])

  useEffect(() => {
    const orderId = searchParams.get('order_id') || searchParams.get('orderId')
    if (!orderId) return undefined

    let active = true
    getPaymentStatus(orderId)
      .then((result) => {
        if (!active) return
        const nextPayment = getPaymentPayload(result)
        setPayment(nextPayment)
        setStatus(getPaymentState(nextPayment))
        localStorage.setItem(getAccountStorageKey(PAYMENT_ORDER_KEY, classId), JSON.stringify(nextPayment))
        if (getPaymentState(nextPayment) === 'successful') toast.success('Payment successful')
      })
      .catch(() => {
        if (!active) return
        setStatus('failed')
        setErrorMessage('We could not verify this payment. Please try again.')
      })

    return () => { active = false }
  }, [classId, searchParams])

  if (loadingClass) return <ClassLayout><p className="text-center text-slate-500 py-10">Loading payment details...</p></ClassLayout>
  if (!classData) return <ClassLayout><p className="text-center text-slate-600 py-10">Class not found.</p></ClassLayout>

  const student = appData.student || {}
  const studentName = [student.firstName, student.lastName].filter(Boolean).join(' ') || '—'
  const amount = Number(payment?.amount ?? 0)
  const orderId = payment?.order_id ?? payment?.orderId ?? searchParams.get('order_id') ?? searchParams.get('orderId')

  const handlePay = async () => {
    setStatus('processing')
    setErrorMessage('')

    try {
      if (!formId) {
        throw new Error('Please save the student details before starting payment.')
      }
      const result = await createPayment(formId)
      const nextPayment = getPaymentPayload(result)
      const nextOrderId = nextPayment.order_id ?? nextPayment.orderId
      if (result?.success === false || nextPayment.success === false) {
        throw new Error(result.message || nextPayment.message || 'Payment cannot be started for this form.')
      }
      if (!nextOrderId || !nextPayment.bank_acs_url) {
        throw new Error('Payment gateway details are missing from the response.')
      }
      setPayment(nextPayment)
      localStorage.setItem(getAccountStorageKey(PAYMENT_ORDER_KEY, classId), nextOrderId)
      window.location.assign(nextPayment.bank_acs_url)
    } catch (error) {
      setStatus('failed')
      const message = error.response?.data?.message || error.message || 'Unable to start payment. Please try again.'
      setErrorMessage(message)
      toast.error(message)
    }
  }

  const goToReceipt = () => {
    navigate(`/class/${classId}/application/receipt`)
  }

  return (
    <ClassLayout>
      <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl mx-auto">
        <h2 className="text-center text-teal-700 font-semibold mb-6 border-b border-slate-200 pb-3">
          💳 Application Fee Payment
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 text-sm">
          <div>
            <p className="text-slate-500">Form ID</p>
            <p className="font-semibold text-slate-800">{formId}</p>
          </div>
          <div>
            <p className="text-slate-500">Student Name</p>
            <p className="font-semibold text-slate-800">{studentName}</p>
          </div>
          <div>
            <p className="text-slate-500">Class</p>
            <p className="font-semibold text-slate-800">{classData.label}</p>
          </div>
          <div>
            <p className="text-slate-500">Amount</p>
            <p className="font-semibold text-slate-800">
              {amount ? `Rs. ${amount.toLocaleString()}/-` : 'Calculated at checkout'}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Order ID</p>
            <p className="font-semibold text-slate-800">{orderId || 'Generated at checkout'}</p>
          </div>
        </div>

        {status === 'pending' && (
          <>
                        <p className="text-sm text-slate-600 mb-6">You will be redirected to a secure payment page to choose a payment method and complete the transaction.</p>
            <button
              onClick={handlePay}
              className="w-full bg-navy text-white text-sm font-medium py-3 rounded-lg hover:bg-navy-light"
            >
              Continue
            </button>
          </>
        )}

        {status === 'processing' && (
          <div className="text-center py-10">
            <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-slate-600">Verifying your payment...</p>
          </div>
        )}

        {status === 'awaiting' && (
          <div className="text-center py-8">
            <p className="text-lg font-semibold text-slate-800 mb-1">Payment Pending</p>
            <p className="text-sm text-slate-500 mb-6">The gateway has not returned a final result yet.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-navy text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-navy-light"
            >
              Check Status Again
            </button>
          </div>
        )}

        {status === 'successful' && (
          <div className="text-center py-8">
            <div className="w-14 h-14 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
              ✓
            </div>
            <p className="text-lg font-semibold text-slate-800 mb-1">Payment Successful</p>
            <p className="text-sm text-slate-500 mb-6">Your application fee has been received.</p>
            <button
              onClick={goToReceipt}
              className="bg-navy text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-navy-light"
            >
              View Receipt
            </button>
          </div>
        )}

        {status === 'failed' && (
          <div className="text-center py-8">
            <div className="w-14 h-14 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
              ✕
            </div>
            <p className="text-lg font-semibold text-slate-800 mb-1">Payment Failed</p>
            <p className="text-sm text-slate-500 mb-6">{errorMessage || 'Something went wrong. Please try again.'}</p>
            {savedOrderId && errorMessage.toLowerCase().includes('already') && (
              <button
                onClick={() => navigate(`/class/${classId}/application/payment-result?order_id=${encodeURIComponent(savedOrderId)}`)}
                className="bg-green-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-green-800 mr-2"
              >
                View Existing Payment
              </button>
            )}
            <button
              onClick={() => setStatus('pending')}
              className="bg-navy text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-navy-light"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </ClassLayout>
  )
}

export default ClassPayment