import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import logo from '../assets/evolvu-logo.webp'
import { checkExistingUser, createRegistration, resendOtp } from '../services/authService'
import { getErrorMessage } from '../services/apiHelpers'
import { saveSessionInfo } from '../utils/session'
import loginVideo from '../assets/Login_video_Students.mp4'

function Login() {
  const [mode, setMode] = useState('mobile') // 'mobile' or 'email'
  const [fullName, setFullName] = useState('')
  const [contact, setContact] = useState('')
  const [contactError, setContactError] = useState('')
  const [fullNameError, setFullNameError] = useState('')
  const [loading, setLoading] = useState(false)
  const [nameLocked, setNameLocked] = useState(false)
  const [existingNarId, setExistingNarId] = useState(null)
  const navigate = useNavigate()
  const [today, setToday] = useState('')

  useEffect(() => {
    setToday(new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))
  }, [])

  // Clears the auto-filled name when the contact or mode changes
  const resetExistingUser = () => {
    if (nameLocked) setFullName('')
    setNameLocked(false)
    setExistingNarId(null)
  }

  // Check Existing User: runs once the contact looks valid (read-only lookup)
  useEffect(() => {
    const valid = mode === 'mobile' ? /^\d{10}$/.test(contact) : /^\S+@\S+\.\S+$/.test(contact)
    if (!valid) return

    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        const res = await checkExistingUser({ mode, contact })
        if (cancelled) return
        const d = res?.data ?? res
        const exists = [true, 1, '1', 'true'].includes(d?.exists ?? res?.exists)
        if (exists && d?.parent_name) {
          setFullName(d.parent_name)
          setFullNameError('')
          setNameLocked(true)
          setExistingNarId(d.nar_id ?? d.narId ?? null)
        }
      } catch (err) {
        console.warn('check-user failed, continuing as new user', err)
      }
    }, 500)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [contact, mode])

  const validate = () => {
    let valid = true

    if (!contact.trim()) {
      setContactError(mode === 'mobile' ? 'Mobile number is required' : 'Email is required')
      valid = false
    } else if (mode === 'mobile' && !/^\d{10}$/.test(contact)) {
      setContactError('Enter a valid 10-digit mobile number')
      valid = false
    } else if (mode === 'email' && !/^\S+@\S+\.\S+$/.test(contact)) {
      setContactError('Enter a valid email address')
      valid = false
    } else {
      setContactError('')
    }

    if (nameLocked) {
      setFullNameError('')
    } else if (!fullName.trim()) {
      setFullNameError('Full name is required')
      valid = false
    } else if (fullName.trim().length > 100) {
      setFullNameError('Full name must be under 100 characters')
      valid = false
    } else if (!/^[A-Za-z\s.'-]+$/.test(fullName.trim())) {
      setFullNameError('Enter a valid name')
      valid = false
    } else {
      setFullNameError('')
    }

    return valid
  }

  // Shared lookup step: reuse the existing account, otherwise register.
  const lookupNarId = async () => {
    // Existing user (found by the check-user lookup above)
    if (existingNarId) {
      saveSessionInfo({ narId: existingNarId, mode, contact, fullName })
      return existingNarId
    }

    // New user: Start registration
    const result = await createRegistration({ fullName, mode, contact })
    if (result.success === false) {
      setContactError(result.message || 'Registration failed. Please try again.')
      return null
    }
    const narId = result.data?.nar_id ?? result.data?.narId ?? result.nar_id ?? result.narId
    if (!narId) {
      setContactError('Registration succeeded, but the admission ID was not returned. Please contact the school.')
      return null
    }
    saveSessionInfo({ narId, mode, contact, fullName })
    return narId
  }

  // "Use OTP / Password" — for logging in with an OTP the user already has.
  // Does NOT trigger a new OTP send.
  const submitLogin = async () => {
    if (!validate()) return
    setLoading(true)
    setContactError('')
    setFullNameError('')
    try {
      const narId = await lookupNarId()
      if (!narId) return
      navigate('/verify-otp', { state: { contact, mode, narId } })
    } catch (err) {
      setContactError(getErrorMessage(err, 'Registration failed. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  // "Resend OTP" — explicitly requests a brand-new OTP.
  const submitResendOtp = async () => {
    if (!validate()) return
    setLoading(true)
    setContactError('')
    setFullNameError('')
    try {
      const narId = await lookupNarId()
      if (!narId) return
      try {
        await resendOtp({ narId, mode, contact })
      } catch (otpErr) {
        setContactError(getErrorMessage(otpErr, 'Could not send OTP. Please try again.'))
        return
      }
      toast.success(mode === 'mobile' ? 'New OTP sent to your mobile number' : 'New OTP sent to your email')
      navigate('/verify-otp', { state: { contact, mode, narId, justResent: true } })
    } catch (err) {
      setContactError(getErrorMessage(err, 'Registration failed. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = (e) => {
    e.preventDefault()
    submitLogin()
  }

  const handleResend = () => {
    submitResendOtp()
  }

  return (
    <div className="min-h-screen">
      <header className="bg-navy sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Evolvu Smart School logo" className="w-10 h-10 bg-white rounded-full object-contain p-0.5 flex-shrink-0" />
            <div className="leading-tight">
              <h1 className="text-sm sm:text-base font-bold text-white">Evolvu Smart School</h1>
              <p className="text-[10px] text-blue-200">Online Admission Portal</p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-blue-100 hidden sm:block">{today}</p>
        </div>
      </header>

      <div
        className="relative flex items-center justify-center px-4 py-8 sm:py-10 overflow-hidden bg-slate-800"
        style={{ minHeight: 'calc(100dvh - 52px)' }}
      >
        <video
          src={loginVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
        <div className="absolute inset-0 bg-slate-900/10" />

        <div className="relative flex flex-col lg:flex-row gap-5 max-w-3xl w-full">
          {/* Login card */}
          <div className="flex-1 bg-white/20 backdrop-blur-md rounded-2xl shadow-xl p-5 sm:p-6 border border-white/30">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-4">Admission Login</h1>

            <div className="flex rounded-full bg-white/40 p-1 mb-4">
              <button
                type="button"
                onClick={() => {
                  resetExistingUser()
                  setMode('mobile')
                  setContactError('')
                  setFullNameError('')
                }}
                className={`flex-1 py-2 rounded-full text-sm font-semibold transition ${
                  mode === 'mobile' ? 'bg-orange-400 text-slate-900 shadow' : 'text-slate-700'
                }`}
              >
                Mobile Login
              </button>
              <button
                type="button"
                onClick={() => {
                  resetExistingUser()
                  setMode('email')
                  setContactError('')
                  setFullNameError('')
                }}
                className={`flex-1 py-2 rounded-full text-sm font-semibold transition ${
                  mode === 'email' ? 'bg-orange-400 text-slate-900 shadow' : 'text-slate-700'
                }`}
              >
                Email Login
              </button>
            </div>

            <form onSubmit={handleContinue} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  {mode === 'mobile' ? 'Mobile Number' : 'Email Address'}
                </label>
                <input
                  type={mode === 'mobile' ? 'tel' : 'email'}
                  value={contact}
                  onChange={(e) => {
                    setContact(e.target.value)
                    resetExistingUser()
                  }}
                  className="w-full bg-white/70 border-none rounded-lg px-4 py-2.5 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder={mode === 'mobile' ? '10-digit mobile number' : 'you@example.com'}
                />
                {contactError && <p className="text-sm text-red-200 font-medium mt-1">{contactError}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  readOnly={nameLocked}
                  maxLength={100}
                  className={`w-full border-none rounded-lg px-4 py-2.5 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                    nameLocked ? 'bg-white/40 text-slate-700 cursor-not-allowed' : 'bg-white/70'
                  }`}
                  placeholder="Enter your full name"
                />
                {nameLocked && (
                  <p className="text-xs text-white/90 mt-1">Existing account found. Name is filled from your registration.</p>
                )}
                {fullNameError && <p className="text-sm text-red-200 font-medium mt-1">{fullNameError}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-400 disabled:opacity-60 text-slate-900 font-semibold py-2.5 rounded-full btn-sweep [--sweep-color:#0F172A] [--sweep-text:#fff]"
              >
                {loading ? 'Please wait...' : 'Use OTP / Password'}
              </button>
            </form>

            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="w-full mt-3 bg-blue-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-full btn-sweep [--sweep-color:#fff] [--sweep-text:#2563eb]"
            >
              Resend OTP to {mode === 'mobile' ? 'mobile number' : 'your email ID'}
            </button>
          </div>

          {/* Instructions card */}
          <div className="lg:w-75 bg-white/85 backdrop-blur-md rounded-2xl shadow-xl p-5 self-start">
            <h2 className="text-xl font-bold text-slate-900 mb-3">Instructions</h2>
            <ul className="list-disc list-outside pl-5 space-y-3 text-sm text-slate-700">
              <li>The OTP you receive during your first login will become your password.</li>
              <li>Please keep this OTP safe for future logins.</li>
              <li>Every time you log in, you can use this first OTP as your password.</li>
              <li>If you forget your password, you can click "Resend OTP" to receive a new OTP.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
