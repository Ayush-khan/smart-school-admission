import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import logo from '../assets/evolvu-logo.webp'
import { createRegistration, resendOtp } from '../services/authService'
import { getErrorMessage } from '../services/apiHelpers'
import { saveSessionInfo } from '../utils/session'

function Login() {
  const [mode, setMode] = useState('mobile') // 'mobile' or 'email'
  const [fullName, setFullName] = useState('')
  const [contact, setContact] = useState('')
  const [contactError, setContactError] = useState('')
  const [fullNameError, setFullNameError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [today, setToday] = useState('')

  useEffect(() => {
    setToday(new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))
  }, [])

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

       if (!fullName.trim()) {
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

  // Step 2 + Step 3 of the Frontend Flow: register, then send the OTP.
    // Shared lookup step: register (or find the existing account) and get narId.
    const lookupNarId = async () => {
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
        className="flex items-center justify-center px-4 py-10 bg-cover bg-center"
        style={{
          minHeight: 'calc(100vh - 52px)',
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.35), rgba(15,23,42,0.35)), url('https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1600&auto=format&fit=crop')",
        }}
      >
        <div className="flex flex-col lg:flex-row gap-6 max-w-4xl w-full">
          {/* Login card */}
          <div className="flex-1 bg-white/20 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/30">
            <h1 className="text-3xl font-bold text-slate-900 text-center mb-6">Admission Login</h1>

            <div className="flex rounded-full bg-white/40 p-1 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('mobile')
                  setContactError('')
                  setFullNameError('')
                }}
                className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition ${
                  mode === 'mobile' ? 'bg-orange-400 text-slate-900 shadow' : 'text-slate-700'
                }`}
              >
                Mobile Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('email')
                  setContactError('')
                  setFullNameError('')
                }}
                className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition ${
                  mode === 'email' ? 'bg-orange-400 text-slate-900 shadow' : 'text-slate-700'
                }`}
              >
                Email Login
              </button>
            </div>
            <form onSubmit={handleContinue} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  {mode === 'mobile' ? 'Mobile Number' : 'Email Address'}
                </label>
                <input
                  type={mode === 'mobile' ? 'tel' : 'email'}
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full bg-white/70 border-none rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
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
                  maxLength={100}
                  className="w-full bg-white/70 border-none rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Enter your full name"
                />
                {fullNameError && <p className="text-sm text-red-200 font-medium mt-1">{fullNameError}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-400 hover:bg-orange-500 disabled:opacity-60 text-slate-900 font-semibold py-3 rounded-full transition"
              >
                {loading ? 'Please wait...' : 'Use OTP / Password'}
              </button>
            </form>

            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="w-full mt-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-full transition"
            >
              Resend OTP to {mode === 'mobile' ? 'mobile number' : 'your email ID'}
            </button>
          </div>

          {/* Instructions card */}
          <div className="lg:w-80 bg-white/85 backdrop-blur-md rounded-2xl shadow-xl p-8 self-start">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Instructions</h2>
            <ul className="list-disc list-outside pl-5 space-y-4 text-sm text-slate-700">
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
