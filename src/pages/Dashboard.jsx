import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import InquiryModal from '../components/InquiryModal'
import logo from '../assets/evolvu-logo.webp'
import { getClasses, getDashboard } from '../services/applicationService'
import { getErrorMessage } from '../services/apiHelpers'
import { getSessionInfo, clearSession } from '../utils/session'
import { clearFormId } from '../utils/formId'

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

    loadClasses()
    loadSummary()
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

        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => setShowInquiry(true)}
            className="bg-teal-600 text-white text-sm font-medium px-5 py-3 rounded-full shadow-lg hover:bg-teal-700 flex items-center gap-2"
          >
            💬 Have a Question?
          </button>
        </div>
      </main>

      {showInquiry && <InquiryModal onClose={() => setShowInquiry(false)} />}
    </div>
  )
}

export default Dashboard
