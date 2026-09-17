import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { isApplicationComplete } from '../utils/applicationData'
import { getSessionInfo, clearSession } from '../utils/session'
import logo from '../assets/evolvu-logo.webp'

function ClassLayout({ children }) {
  const navigate = useNavigate()
  const { classId } = useParams()
  const location = useLocation()
  const { fullName } = getSessionInfo()

  // Individual pages (e.g. ClassInstructions) are responsible for fetching
  // their own class/instructions data via the real API and showing a
  // "not found" state if the class doesn't exist — this shell no longer
  // depends on mock data just to render the tab bar.
  const paymentUnlocked = isApplicationComplete(classId)

  const tabs = [
    { key: 'instructions', label: 'Instructions', path: `/class/${classId}/instructions`, locked: false },
    { key: 'application', label: 'Application Form', path: `/class/${classId}/application/student`, locked: false },
    { key: 'payment', label: 'Payment', path: `/class/${classId}/application/payment`, locked: !paymentUnlocked },
  ]

  const handleTabClick = (tab) => {
    if (tab.locked) return
    navigate(tab.path)
  }

  const handleLogout = () => {
    clearSession()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-blue-900 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <img
              src={logo}
              alt="Evolvu Smart School logo"
              className="w-8 h-8 sm:w-9 sm:h-9 bg-white rounded-full object-contain p-0.5 flex-shrink-0"
            />
            <div className="leading-tight">
              <h1 className="text-sm sm:text-base font-bold text-white">Evolvu Smart School</h1>
              <p className="text-[10px] text-blue-200">Online Admission Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-white hidden sm:block truncate max-w-[160px]">
              Welcome, {fullName || 'Applicant'}
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-xs bg-slate-100 text-slate-800 font-medium px-2.5 py-1 rounded hover:bg-slate-200 whitespace-nowrap"
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="text-xs bg-teal-500 text-white font-medium px-2.5 py-1 rounded hover:bg-teal-600 whitespace-nowrap"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="bg-gradient-to-r from-indigo-700 to-purple-600 py-2 sticky top-[52px] sm:top-[52px] z-30">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path
            return (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab)}
                disabled={tab.locked}
                title={tab.locked ? 'Complete Student, Address, Parent details and upload Documents first' : ''}
                className={`text-xs sm:text-sm font-medium px-3 sm:px-5 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 transition ${
                  tab.locked
                    ? 'bg-white/10 text-white/40 cursor-not-allowed'
                    : isActive
                    ? 'bg-white text-indigo-800'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {tab.label} {tab.locked ? '🔒' : ''}
              </button>
            )
          })}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}

export default ClassLayout
