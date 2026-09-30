import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import jsPDF from 'jspdf'
import toast from 'react-hot-toast'
import { toPng } from 'html-to-image'
import { getApplicationData } from '../utils/applicationData'
import { getFormId } from '../utils/formId'
import { getAccountStorageKey } from '../utils/session'
import ClassLayout from '../layouts/ClassLayout'
import logo from '../assets/evolvu-logo.webp'
import { getClasses } from '../services/applicationService'
import { getPaymentStatus } from '../services/paymentService'

function ClassReceipt() {
  const navigate = useNavigate()
  const { classId } = useParams()
  const receiptRef = useRef(null)
  const [downloading, setDownloading] = useState(false)
  const [classData, setClassData] = useState(null)
  const [loadingClass, setLoadingClass] = useState(true)
  const appData = getApplicationData(classId)
  const formId = getFormId(classId)
  const [payment, setPayment] = useState(() => {
    try {
      const saved = localStorage.getItem(getAccountStorageKey('paymentOrderId', classId))
      return saved?.startsWith('{') ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    getClasses()
      .then((result) => {
        const selected = (result.data ?? result).find((item) => String(item.class_id ?? item.id) === String(classId))
        if (selected) setClassData({ label: selected.label ?? selected.class_name ?? selected.name })
      })
      .finally(() => setLoadingClass(false))
  }, [classId])

  useEffect(() => {
    const saved = localStorage.getItem(getAccountStorageKey('paymentOrderId', classId))
    const orderId = payment?.order_id ?? payment?.orderId ?? (saved?.startsWith('{') ? null : saved)
    if (!orderId) return undefined

    let active = true
    getPaymentStatus(orderId).then((result) => {
      if (active) setPayment(result?.data ?? result)
    }).catch(() => {})

    return () => { active = false }
  }, [classId, payment?.order_id, payment?.orderId])

  const student = appData.student || {}
  const studentName = [student.firstName, student.lastName].filter(Boolean).join(' ') || '—'
  const amount = Number(payment?.amount ?? 0)
  const receiptNumber = `RCPT-${(payment?.order_id ?? payment?.orderId ?? formId).toString().split('-').pop()}`
  const transactionId = payment?.transaction_reference ?? payment?.transaction_ref ?? payment?.rrn ?? '—'
  const paymentDate = payment?.payment_date
    ? new Date(payment.payment_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'
  const paymentStatus = payment?.status_description ?? payment?.status ?? 'Successful'

  if (loadingClass) return <ClassLayout><p className="text-center text-slate-500 py-10">Loading class details...</p></ClassLayout>
  if (!classData) return <ClassLayout><p className="text-center text-slate-600 py-10">Class not found.</p></ClassLayout>

  // Print: the header, tabs and buttons are hidden with print: classes,
  // so only the receipt is printed (see ClassLayout + index.css).
  const handlePrint = () => {
    window.print()
  }

  // Download: captures only the receipt block (no buttons) and places it on an A4 page.
  const handleDownload = async () => {
    const element = receiptRef.current
    if (!element || downloading) return
    setDownloading(true)
    try {
      const options = { pixelRatio: 3, backgroundColor: '#ffffff', cacheBust: true }
      // First call warms up fonts/images; on some mobile browsers the first capture comes out blank.
      await toPng(element, options)
      const imgData = await toPng(element, options)

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const margin = 15
      const maxWidth = pdf.internal.pageSize.getWidth() - margin * 2
      const maxHeight = pdf.internal.pageSize.getHeight() - margin * 2
      const ratio = element.offsetHeight / element.offsetWidth
      let width = maxWidth
      let height = width * ratio
      if (height > maxHeight) {
        height = maxHeight
        width = height / ratio
      }
      pdf.addImage(imgData, 'PNG', (pdf.internal.pageSize.getWidth() - width) / 2, margin, width, height)
      pdf.save(`Receipt-${receiptNumber}.pdf`)
    } catch {
      toast.error('Could not download the receipt. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <ClassLayout>
      <div className="bg-white rounded-xl shadow-sm p-5 sm:p-8 max-w-xl mx-auto print:shadow-none print:p-0 print:max-w-none">
        <div ref={receiptRef} className="bg-white">
        <div className="text-center mb-6 pb-6 border-b border-slate-200">
         <img src={logo} alt="Evolvu Smart School logo" className="w-14 h-14 bg-white rounded-full object-contain p-1 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-navy">Evolvu Smart School</h2>
          <p className="text-xs text-slate-500">Online Admission Portal — Payment Receipt</p>
        </div>

        <div className="grid grid-cols-2 gap-y-4 text-sm mb-6">
          <div>
            <p className="text-slate-500">Receipt Number</p>
            <p className="font-semibold text-slate-800">{receiptNumber}</p>
          </div>
          <div>
            <p className="text-slate-500">Application Number</p>
            <p className="font-semibold text-slate-800">{formId}</p>
          </div>
          <div>
            <p className="text-slate-500">Applicant Name</p>
            <p className="font-semibold text-slate-800">{studentName}</p>
          </div>
          <div>
            <p className="text-slate-500">Class</p>
            <p className="font-semibold text-slate-800">{classData.label}</p>
          </div>
          <div>
            <p className="text-slate-500">Payment Date</p>
            <p className="font-semibold text-slate-800">{paymentDate}</p>
          </div>
          <div>
            <p className="text-slate-500">Payment Method</p>
            <p className="font-semibold text-slate-800">UPI</p>
          </div>
          <div>
            <p className="text-slate-500">Transaction ID</p>
            <p className="font-semibold text-slate-800">{transactionId}</p>
          </div>
          <div>
            <p className="text-slate-500">Payment Status</p>
            <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">{paymentStatus}</span>
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 flex justify-between items-center">
          <span className="text-sm font-medium text-slate-700">Amount Paid</span>
          <span className="text-lg font-bold text-navy">Rs. {amount.toLocaleString()}/-</span>
        </div>
        </div>

        <div className="print:hidden">
        <div className="text-center mt-8 mb-4">
          <button
            onClick={() => navigate(`/class/${classId}/application/confirmation`)}
            className="text-sm text-blue-700 font-medium hover:underline"
          >
            View Confirmation Summary → 
          </button>
        </div>

         <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="bg-navy text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-navy-light disabled:opacity-60"
          >
            {downloading ? 'Preparing...' : '⬇️ Download Receipt'}
          </button>
          <button
            onClick={handlePrint}
            className="bg-slate-100 text-slate-700 text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-slate-200"
          >
            🖨️ Print Receipt
          </button>
          <button
            onClick={() => navigate(`/class/${classId}/status`)}
            className="bg-navy text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-navy-light"
          >
            Track Application
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-slate-100 text-slate-700 text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-slate-200"
          >
            Back to Dashboard
          </button>
        </div>
        </div>
      </div>
    </ClassLayout>
  )
}

export default ClassReceipt