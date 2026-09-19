import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import InquiryModal from '../components/InquiryModal'
import logo from '../assets/evolvu-logo.webp'
import { getClasses, getDashboard, listOnlineForms, downloadOnlineFormPdf } from '../services/applicationService'
import { getErrorMessage } from '../services/apiHelpers'
import { getSessionInfo, clearSession } from '../utils/session'
import { clearFormId, saveFormId } from '../utils/formId'

function Dashboard() {
  const navigate = useNavigate()
  const [showInquiry, setShowInquiry] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const { fullName, narId } = getSessionInfo()

  const [classes, setClasses] = useState([])
  const [loadingClasses, setLoadingClasses] = useState(true)

  // ASSUMPTION: the dashboard response shape isn't specified beyond "dashboard
  // data/status" — adjust the field names below (totalFormsRegistered / amountPaid)
  // once you can see the real payload.
   const [summary, setSummary] = useState({ totalFormsRegistered: 0, amountPaid: 0 })
  const [loadingSummary, setLoadingSummary] = useState(true)

  // ASSUMPTION: field names in each form row aren't documented yet — adjust
  // the mapping in the table below once you see the real payload.
  const [forms, setForms] = useState([])
  const [loadingForms, setLoadingForms] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadClasses() {
      try {
        const result = await getClasses()
        const list = result.data ?? result
        if (!cancelled) setClasses(Array.isArray(list) ? list : [])
      } catch (err) {
        if (!cancelled) toast.error(getErrorMessage(err, 'Could not load classes.'))
      } finally {
        if (!cancelled) setLoadingClasses(false)
      }
    }

    async function loadSummary() {
      try {
        if (!narId) {
          throw new Error('Your session has expired. Please log in again.')
        }
        const result = await getDashboard(narId)
        const data = result.data ?? result
        if (!cancelled && data) {
          setSummary({
            totalFormsRegistered: data.totalFormsRegistered ?? data.total_forms_registered ?? 0,
            amountPaid: data.amountPaid ?? data.amount_paid ?? 0,
          })
        }
      } catch (err) {
        if (!cancelled) toast.error(getErrorMessage(err, 'Could not load dashboard summary.'))
      } finally {
        if (!cancelled) setLoadingSummary(false)
      }
    }

        async function loadForms() {
      try {
        if (!narId) return
        const result = await listOnlineForms({ nar_id: narId })
        const list = result.data ?? result
        if (!cancelled) setForms(Array.isArray(list) ? list : [])
      } catch (err) {
        if (!cancelled) toast.error(getErrorMessage(err, 'Could not load your applications.'))
      } finally {
        if (!cancelled) setLoadingForms(false)
      }
    }

    loadClasses()
    loadSummary()
    loadForms()
    return () => {
      cancelled = true
    }
  }, [narId])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleClassSelect = (selectedClass) => {
    setDropdownOpen(false)
    const classId = selectedClass.id ?? selectedClass.class_id
    clearFormId(classId)
    navigate(`/class/${classId}/instructions`, {
      state: { academicYr: selectedClass.academic_yr ?? selectedClass.academicYear },
    })
  }

    const handleLogout = () => {
    clearSession()
    navigate('/login')
  }

        const handleEditForm = (form) => {
    saveFormId(form.class_id, form.form_id)
    navigate(`/class/${form.class_id}/application/review`)
  }

    const handlePayForm = (form) => {
    saveFormId(form.class_id, form.form_id)
    navigate(`/class/${form.class_id}/application/payment`)
  }

  const handleDownloadForm = async (form) => {
    try {
      const blob = await downloadOnlineFormPdf(form.form_id, narId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${form.form_id}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not download the form.'))
    }
  }

  const getClassLabel = (classId) => {
    const match = classes.find((c) => String(c.id ?? c.class_id) === String(classId))
    return match?.label ?? match?.class_name ?? match?.name ?? classId
  }

   const getFullName = (form) => {
    return [form.first_name, form.mid_name, form.last_name].filter(Boolean).join(' ')
  }

  const isPaid = (form) => {
    const status = (form.payment_status ?? '').toString().toLowerCase()
    return status === 'success'
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-blue-900 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-1.5 flex flex-col sm:flex-row items-center justify-between gap-1">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Evolvu Smart School logo" className="w-9 h-9 bg-white rounded-full object-contain p-0.5 flex-shrink-0" />
            <div className="text-center sm:text-left leading-tight">
              <h1 className="text-sm sm:text-base font-bold text-white">Evolvu Smart School</h1>
              <p className="text-[10px] text-blue-200">Online Admission Portal</p>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-xs sm:text-sm text-white">Welcome, {fullName || 'Applicant'}</p>
            <button
              onClick={handleLogout}
              className="mt-1 text-xs bg-teal-500 text-white font-medium px-3 py-1.5 rounded hover:bg-teal-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Create New Form card */}
          <div className="bg-gradient-to-br from-indigo-600 to-blue-400 rounded-xl shadow-md p-6 text-white relative" ref={dropdownRef}>
            <h2 className="text-lg font-semibold mb-4 text-center">Create New Form</h2>

            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              disabled={loadingClasses}
              className="w-full flex items-center justify-between rounded-lg px-3 py-2 bg-white text-slate-800 text-sm font-medium disabled:opacity-60"
            >
              {loadingClasses ? 'Loading classes...' : 'SELECT CLASS'}
              <span className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}>▾</span>
            </button>

            {dropdownOpen && (
              <div className="absolute left-6 right-6 mt-1 bg-white rounded-lg shadow-lg overflow-hidden z-50 text-slate-800">
                {classes.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-slate-500">No classes available.</p>
                ) : (
                  classes.map((c) => (
                    <button
                      key={c.id ?? c.class_id}
                      type="button"
                      onClick={() => handleClassSelect(c)}
                      className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-slate-100 border-b border-slate-100 last:border-0"
                    >
                      {c.label ?? c.class_name ?? c.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Forms card */}
          <div className="bg-gradient-to-br from-amber-400 to-orange-300 rounded-xl shadow-md p-6 text-center">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Forms</h2>
            <p className="text-3xl font-bold text-slate-800">{loadingSummary ? '—' : summary.totalFormsRegistered}</p>
            <p className="text-xs text-slate-700 mt-1">Total admission form registered</p>
          </div>

          {/* Form Fee card */}
          <div className="bg-gradient-to-br from-emerald-400 to-teal-200 rounded-xl shadow-md p-6 text-center">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Form Fee</h2>
            <p className="text-2xl font-bold text-slate-800">{loadingSummary ? '—' : `INR ${summary.amountPaid}`}</p>
            <p className="text-xs text-slate-700 mt-1">Amount Paid</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md mt-8 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-400 text-white">
              <tr>
                <th className="px-4 py-3 font-semibold">Form No</th>
                <th className="px-4 py-3 font-semibold">Full Name</th>
                <th className="px-4 py-3 font-semibold">Class</th>
                <th className="px-4 py-3 font-semibold">Application Status</th>
                <th className="px-4 py-3 font-semibold">Interview Date</th>
                <th className="px-4 py-3 font-semibold">Payment Status</th>
                <th className="px-4 py-3 font-semibold">Payment</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {loadingForms ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-slate-500">
                    Loading applications...
                  </td>
                </tr>
              ) : forms.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-slate-500">
                    No admission forms yet.
                  </td>
                </tr>
              ) : (
                  forms.map((form) => (
                  <tr key={form.form_id} className="border-t border-slate-100">
                    <td className="px-4 py-3">{form.form_id}</td>
                    <td className="px-4 py-3">{getFullName(form)}</td>
                    <td className="px-4 py-3">{getClassLabel(form.class_id)}</td>
                    <td className="px-4 py-3">{form.admission_form_status}</td>
                    <td className="px-4 py-3">{form.interview_date ?? 'No interview scheduled.'}</td>
                    <td className="px-4 py-3">{form.payment_status ?? '—'}</td>
                    <td className="px-4 py-3">
                      {!isPaid(form) && (
                        <button onClick={() => handlePayForm(form)} className="text-teal-600 hover:text-teal-800" title="Payment">
                          💳
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isPaid(form) ? (
                        <button onClick={() => handleDownloadForm(form)} className="text-slate-600 hover:text-slate-800" title="Download">
                          ⬇️
                        </button>
                      ) : (
                        <button onClick={() => handleEditForm(form)} className="text-blue-600 hover:text-blue-800" title="Edit">
                          ✏️
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => setShowInquiry(true)}
            className="bg-teal-600 text-white text-sm font-medium px-5 py-3 rounded-full shadow-lg hover:bg-teal-700 flex items-center gap-2"
          >
            💬 Admission Inquiry
          </button>
        </div>
      </main>

      {showInquiry && <InquiryModal onClose={() => setShowInquiry(false)} />}
    </div>
  )
}

export default Dashboard
