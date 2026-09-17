import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import logo from '../assets/evolvu-logo.webp'
import { verifyOtp, resendOtp } from '../services/authService'
import { getErrorMessage } from '../services/apiHelpers'
import { getSessionInfo, saveSessionInfo } from '../utils/session'

function VerifyOtp() {
  const navigate = useNavigate()
  const location = useLocation()

  // Prefer router state (fresh from Login); fall back to persisted session
  // so a page refresh on this screen doesn't lose the in-progress OTP flow.
  const session = getSessionInfo()
  const narId = location.state?.narId ?? session.narId
  const contact = location.state?.contact ?? session.contact
  const mode = location.state?.mode ?? session.mode

  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [timer, setTimer] = useState(30)
  const [today, setToday] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)

  useEffect(() => {
    setToday(new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))
  }, [])

  useEffect(() => {
    if (timer === 0) return
    const interval = setInterval(() => setTimer((t) => t - 1), 1000)
    return () => clearInterval(interval)
  }, [timer])

  // Step 4: Verify OTP
  const handleVerify = async () => {
    if (!otp.trim()) {
      setError('Please enter the OTP')
      return
    }
    if (!narId) {
      setError('Your session has expired. Please log in again.')
      return
    }

    setVerifying(true)
    setError('')
    try {
      const result = await verifyOtp({ narId, mode, contact, otp })
      if (result.success === false) {
        setError(result.message || 'Incorrect OTP. Please try again.')
        return
      }

      // ASSUMPTION: token is returned as result.data.token / result.token —
      // adjust to match whatever field the real verify-otp response uses.
      const token = result.data?.token ?? result.token
      if (token) {
        localStorage.setItem('authToken', token)
      }

      navigate('/dashboard')
    } catch (err) {
      setError(getErrorMessage(err, 'Incorrect OTP. Please try again.'))
    } finally {
      setVerifying(false)
    }
  }

  const handleResend = async () => {
    if (!narId) {
      setError('Your session has expired. Please log in again.')
      return
    }
    setResending(true)
    setError('')
    try {
      await resendOtp({ narId, mode, contact })
      saveSessionInfo({ narId, mode, contact })
      setTimer(30)
      setOtp('')
      toast.success('OTP resent')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not resend OTP. Please try again.'))
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen">
      <header className="bg-blue-900 sticky top-0 z-40">
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
        <div className="max-w-md w-full space-y-4">
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-6 text-center">
          <p className="text-blue-700 font-semibold text-lg leading-snug">
            We already sent OTP earlier. Please use the same OTP as password.
          </p>
          <p className="text-slate-800 text-sm mt-3">
            {mode === 'mobile' ? 'OTP sent to mobile' : 'Email sent to'}: <span className="font-medium">{contact || '—'}</span>
          </p>
        </div>

        <div className="bg-white/20 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/30 text-center">
          <h1 className="text-3xl font-bold text-white mb-6">Verify OTP</h1>

          <div className="text-left mb-4">
            <label className="block text-sm font-medium text-white mb-1">Enter OTP</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, ''))
                setError('')
              }}
              className="w-full bg-white/70 border-none rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Enter the 5-digit OTP"
            />
            {error && <p className="text-sm text-red-200 font-medium mt-2">{error}</p>}
          </div>

          <button
            onClick={handleVerify}
            disabled={verifying}
            className="w-full bg-orange-400 hover:bg-orange-500 disabled:opacity-60 text-slate-900 font-semibold py-3 rounded-full transition mb-4"
          >
            {verifying ? 'Verifying...' : 'Verify'}
          </button>

          <div className="text-sm text-white">
            {timer > 0 ? (
              <p>Resend OTP in {timer}s</p>
            ) : (
              <button onClick={handleResend} disabled={resending} className="text-orange-300 font-medium hover:underline disabled:opacity-60">
                {resending ? 'Resending...' : 'Resend OTP'}
              </button>
            )}
          </div>

          <button
          onClick={() => navigate('/login')}
            className="text-sm text-white/70 mt-4 hover:underline"
            >
            Change mobile/email
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyOtp
