import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import EnquiryModal from '../components/EnquiryModal'
import logo from '../assets/evolvu-logo.webp'
import { getClasses, getClassesForUser, getEnquiryClasses, getDashboard, listOnlineForms, downloadOnlineFormPdf, listAdmissionEnquiries } from '../services/applicationService'
import { getSessionInfo, clearSession } from '../utils/session'
import { clearFormId, saveFormId } from '../utils/formId'
import { formatClassLabel } from '../utils/classLabel'

function Dashboard() {
  const navigate = useNavigate()
  const [showEnquiry, setShowEnquiry] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const [activeTab, setActiveTab] = useState('applications')

  const { fullName, narId, contact } = getSessionInfo()

  const [classes, setClasses] = useState([])
  const [loadingClasses, setLoadingClasses] = useState(true)

  const [userClasses, setUserClasses] = useState([])
  const [loadingUserClasses, setLoadingUserClasses] = useState(true)

  const [summary, setSummary] = useState({ totalFormsRegistered: 0, amountPaid: 0 })
  const [loadingSummary, setLoadingSummary] = useState(true)

  const [forms, setForms] = useState([])
  const [loadingForms, setLoadingForms] = useState(true)
  const [applications, setApplications] = useState([])

  // ASSUMPTION: no confirmed way to scope this to just the logged-in user's
  // own enquiries — see note in applicationService.js. Must be confirmed with
  // backend before this is trusted in production.
  const [enquiries, setEnquiries] = useState([])
  const [loadingEnquiries, setLoadingEnquiries] = useState(true)
  const [enquiryClasses, setEnquiryClasses] = useState([])

  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const loadClasses = useCallback(async () => {
    try {
      const result = await getClasses()
      const list = result.data ?? result
      if (mountedRef.current) setClasses(Array.isArray(list) ? list : [])
    } catch (err) {
      if (mountedRef.current) toast.error(getErrorMessage(err, 'Could not load classes.'))
    } finally {
      if (mountedRef.current) setLoadingClasses(false)
    }
  }, [])

    const loadUserClasses = useCallback(async () => {
    try {
      if (!narId) {
        throw new Error('Your session has expired. Please log in again.')
      }
      const result = await getClassesForUser(narId)
      const list = result.data ?? result
      if (mountedRef.current) setUserClasses(Array.isArray(list) ? list : [])
    } catch (err) {
      if (mountedRef.current) toast.error(getErrorMessage(err, 'Could not load classes.'))
    } finally {
      if (mountedRef.current) setLoadingUserClasses(false)
    }
  }, [narId])

  // silent = true on refreshes, so no error toast and no loading flicker
  const loadSummary = useCallback(async (silent = false) => {
    try {
      if (!narId) {
        throw new Error('Your session has expired. Please log in again.')
      }
      const result = await getDashboard(narId)
      const data = result.data ?? result
            if (mountedRef.current && data) {
        setSummary({
          totalFormsRegistered: data.forms_count ?? 0,
          amountPaid: data.amount_paid ?? 0,
        })
        setApplications(Array.isArray(data.applications) ? data.applications : [])
      }
      
    } catch (err) {
      if (mountedRef.current && !silent) toast.error(getErrorMessage(err, 'Could not load dashboard summary.'))
    } finally {
      if (mountedRef.current) setLoadingSummary(false)
    }
  }, [narId])

  const loadForms = useCallback(async (silent = false) => {
    try {
      if (!narId) return
      const result = await listOnlineForms({ nar_id: narId })
      const list = result.data ?? result
      
      if (mountedRef.current) setForms(Array.isArray(list) ? list : [])
    } catch (err) {
      if (mountedRef.current && !silent) toast.error(getErrorMessage(err, 'Could not load your applications.'))
    } finally {
      if (mountedRef.current) setLoadingForms(false)
    }
  }, [narId])

  const loadEnquiries = useCallback(async (silent = false) => {
    try {
      // ASSUMPTION: passing nar_id/contact as filters — UNCONFIRMED whether
      // backend actually honors these. Verify via Network tab.
      const result = await listAdmissionEnquiries({ nar_id: narId, contact })
      const d = result?.data
      const list = Array.isArray(d) ? d : d?.enquiries ?? d?.data ?? []
      if (mountedRef.current) setEnquiries(Array.isArray(list) ? list : [])
    } catch (err) {
      if (mountedRef.current && !silent) toast.error(getErrorMessage(err, 'Could not load enquiries.'))
    } finally {
      if (mountedRef.current) setLoadingEnquiries(false)
    }
  }, [narId, contact])

  const refreshCounts = useCallback(
    (silent = false) => {
      loadSummary(silent)
      loadForms(silent)
      loadEnquiries(silent)
    },
    [loadSummary, loadForms, loadEnquiries],
  )

  // First load
    useEffect(() => {
    loadClasses()
    loadUserClasses()
    refreshCounts(false)
    getEnquiryClasses()
      .then((r) => {
        const list = r?.data?.classes ?? []
        if (mountedRef.current) setEnquiryClasses(Array.isArray(list) ? list : [])
      })
      .catch(() => {})
  }, [loadClasses, loadUserClasses, refreshCounts])

  // Refresh counts when the user comes back to this tab
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') refreshCounts(true)
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [refreshCounts])

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
    return match ? formatClassLabel(match) : classId
  }

  // The enquiries API returns the class NAME in "class" (e.g. "1", "Nursery"),
  // not an id. If a class_id is ever sent, match it; otherwise show the name as is.
  const getEnquiryClassLabel = (enquiry) => {
    if (enquiry.class_id) {
      const sameId = (c) => String(c.id ?? c.class_id) === String(enquiry.class_id)
      const match = classes.find(sameId) ?? enquiryClasses.find(sameId)
      if (match) return formatClassLabel(match)
    }
    return enquiry.class_name ?? enquiry.class ?? '—'
  }

  const getFullName = (form) => {
    return [form.first_name, form.mid_name, form.last_name].filter(Boolean).join(' ')
  }

  // ASSUMPTION: field names for an enquiry row are unconfirmed — verify via
  // Network tab once you have real enquiry data and correct these.
  const getEnquiryStudentName = (enquiry) => {
    return (
      [enquiry.first_name, enquiry.middle_name, enquiry.last_name].filter(Boolean).join(' ') ||
      enquiry.student_name ||
      '—'
    )
  }

    // Payment info comes from the dashboard API (applications[]), matched by form_id.
  const getAppInfo = (form) => applications.find((a) => String(a.form_id) === String(form.form_id))

  const getPaymentStatus = (form) =>
    getAppInfo(form)?.payment_status ?? form.payment_status ?? form.paymentStatus ?? null

  const isPaid = (form) => {
    const info = getAppInfo(form)
    const db = (info?.payment_db_status ?? '').toString().trim().toLowerCase()
    const status = (getPaymentStatus(form) ?? '').toString().trim().toLowerCase()
    return db === 's' || status === 'success'
  }

  const getPaymentLabel = (form) => getPaymentStatus(form) ?? '—'

  return (
    <div className="min-h-screen bg-page">
      <header className="bg-navy sticky top-0 z-40">
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
          {/* Apply for New Admission card */}
          <div className="bg-gradient-to-br from-navy to-navy-light rounded-xl shadow-xl p-6 text-white relative z-30 border-t-4 border-brass transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1] hover:shadow-2xl hover:shadow-navy/50 hover:ring-2 hover:ring-brass" ref={dropdownRef}>
            <h2 className="text-lg font-semibold mb-4 text-center tracking-tight">Apply For New Admission</h2>

            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              disabled={loadingUserClasses}
              aria-expanded={dropdownOpen}
              className={`w-full flex items-center justify-between rounded-lg px-3 py-2 bg-white text-navy text-sm font-medium transition-all duration-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brass disabled:opacity-60 ${
                dropdownOpen ? 'ring-2 ring-brass' : ''
              }`}
            >
              {loadingUserClasses ? 'Loading classes...' : 'SELECT CLASS'}
              <span className={`text-brass transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`}>▾</span>
            </button>

            <div
              className={`absolute left-6 right-6 mt-2 bg-white rounded-lg shadow-2xl ring-1 ring-black/5 overflow-hidden z-50 text-slate-800 origin-top transition-all duration-200 ease-out motion-reduce:transition-none ${
                dropdownOpen
                  ? 'opacity-100 translate-y-0 scale-100 visible'
                  : 'opacity-0 -translate-y-2 scale-95 invisible pointer-events-none'
              }`}
            >
              {userClasses.length === 0 ? (
                <p className="px-4 py-3 text-sm text-slate-500">No classes available.</p>
              ) : (
                userClasses.map((c, i) => (
                  <div
                    key={c.id ?? c.class_id}
                    className={`transition-all duration-300 ease-out motion-reduce:transition-none ${
                      dropdownOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                    }`}
                    style={{ transitionDelay: dropdownOpen ? `${80 + i * 45}ms` : '0ms' }}
                  >
                    <button
                      type="button"
                      onClick={() => handleClassSelect(c)}
                      className="group relative w-full text-left px-4 py-3 text-sm font-medium border-b border-slate-100 transition-all duration-200 hover:bg-slate-50 hover:pl-6 hover:text-navy"
                    >
                      <span className="absolute left-0 top-0 h-full w-1 bg-brass scale-y-0 group-hover:scale-y-100 transition-transform duration-200" />
                      {formatClassLabel(c)}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Forms + Enquiries count card */}
          <div className="bg-white rounded-xl shadow-xl p-6 text-center border-t-4 border-brass transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1] hover:shadow-2xl hover:shadow-navy/30 hover:ring-2 hover:ring-brass">
            <h2 className="text-lg font-semibold text-navy mb-3">Forms</h2>
            <div className="flex items-center justify-center gap-6">
              <div>
                <p className="text-3xl font-bold text-brass">{loadingSummary ? '—' : summary.totalFormsRegistered}</p>
                <p className="text-xs text-slate-500 mt-1">Admission Forms</p>
              </div>
              <div className="w-px h-10 bg-slate-200" />
              <div>
                <p className="text-3xl font-bold text-brass">{loadingEnquiries ? '—' : enquiries.length}</p>
                <p className="text-xs text-slate-500 mt-1">Enquiries</p>
              </div>
            </div>
          </div>

          {/* Admission Enquiry card (replaces Form Fee) */}
          <div className="bg-white rounded-xl shadow-xl p-6 text-center flex flex-col items-center justify-center border-t-4 border-brass transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1] hover:shadow-2xl hover:shadow-navy/30 hover:ring-2 hover:ring-brass">
            <h2 className="text-lg font-semibold text-navy mb-3">For Admission Request</h2>
            <button
              type="button"
              onClick={() => setShowEnquiry(true)}
              className="bg-navy text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-[#1E3A5F]"
            >
              💬 Admission Enquiry
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-8">
          <button
            type="button"
            onClick={() => setActiveTab('applications')}
            className={`px-5 py-2 text-sm font-semibold rounded-t-lg border-t-4 transition-all duration-200 ${
              activeTab === 'applications'
                ? 'bg-white text-navy shadow border-brass'
                : 'bg-slate-100 text-slate-500 border-transparent hover:bg-white/70 hover:text-navy'
            }`}
          >
            Admission Applications
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('enquiries')}
            className={`px-5 py-2 text-sm font-semibold rounded-t-lg border-t-4 transition-all duration-200 ${
              activeTab === 'enquiries'
                ? 'bg-white text-navy shadow border-brass'
                : 'bg-slate-100 text-slate-500 border-transparent hover:bg-white/70 hover:text-navy'
            }`}
          >
            Enquiries
          </button>
        </div>

        {activeTab === 'applications' && (
          <div
            className="bg-white rounded-xl shadow-md overflow-auto table-scroll tab-panel"
            style={{ maxHeight: 'max(16rem, calc(100dvh - 24rem))' }}
          >
            <table className="w-full text-sm text-left">
              <thead className="bg-navy text-white sticky top-0 z-10">
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
                      No admission forms have been submitted yet.
                    </td>
                  </tr>
                ) : (
                  forms.map((form, i) => (
                    <tr
                      key={form.form_id}
                      className="border-t border-slate-100 row-in hover:bg-slate-50 transition-colors"
                      style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                    >
                      <td className="px-4 py-3">{form.form_id}</td>
                      <td className="px-4 py-3">{getFullName(form)}</td>
                      <td className="px-4 py-3">{getClassLabel(form.class_id)}</td>
                      <td className="px-4 py-3">{form.admission_form_status}</td>
                      <td className="px-4 py-3">{form.interview_date ?? 'No interview scheduled.'}</td>
                      <td className="px-4 py-3">{getPaymentLabel(form)}</td>
                      <td className="px-4 py-3">
                      {isPaid(form) ? (
                        <span className="inline-flex items-center text-green-600" title="Payment completed" aria-label="Payment completed">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.6 7.7 9.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </span>
                      ) : (
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
        )}

        {activeTab === 'enquiries' && (
          <div
            className="bg-white rounded-xl shadow-md overflow-auto table-scroll tab-panel"
            style={{ maxHeight: 'max(16rem, calc(100dvh - 24rem))' }}
          >
            <table className="w-full text-sm text-left">
              <thead className="bg-navy text-white sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 font-semibold">Enquiry No</th>
                  <th className="px-4 py-3 font-semibold">Student Name</th>
                  <th className="px-4 py-3 font-semibold">Class</th>
                  <th className="px-4 py-3 font-semibold">Enquiry Status</th>
                </tr>
              </thead>
              <tbody>
                {loadingEnquiries ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                      Loading enquiries...
                    </td>
                  </tr>
                ) : enquiries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                     No enquiries have been submitted yet.
                    </td>
                  </tr>
                ) : (
                  enquiries.map((enquiry, i) => (
                    <tr
                      key={enquiry.enquiry_id ?? enquiry.id}
                      className="border-t border-slate-100 row-in hover:bg-slate-50 transition-colors"
                      style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                    >
                      <td className="px-4 py-3">{enquiry.enquiry_number ?? enquiry.enquiry_id ?? enquiry.id}</td>
                      <td className="px-4 py-3">{getEnquiryStudentName(enquiry)}</td>
                      <td className="px-4 py-3">{getEnquiryClassLabel(enquiry)}</td>
                      <td className="px-4 py-3">{enquiry.status ?? enquiry.enquiry_status ?? '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showEnquiry && (
        <EnquiryModal
          onClose={() => setShowEnquiry(false)}
          onSubmitted={() => loadEnquiries(true)}
        />
      )}
    </div>
  )
}

export default Dashboard