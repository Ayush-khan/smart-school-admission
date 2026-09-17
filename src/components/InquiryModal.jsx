import { useState } from 'react'
import toast from 'react-hot-toast'

function InquiryModal({ onClose }) {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const inputClass =
    'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !contact.trim() || !message.trim()) {
      setError('Please fill in all fields.')
      return
    }
    setError('')
    toast.success('Your inquiry has been submitted. We will get back to you soon.')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Have a Question?</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">
            ✕
          </button>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Send us your inquiry and our admission team will get back to you.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Your Name</label>
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Email or Mobile Number</label>
            <input className={inputClass} value={contact} onChange={(e) => setContact(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Your Question</label>
            <textarea
              rows={3}
              className={inputClass}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your question here..."
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-blue-800"
          >
            Submit Inquiry
          </button>
        </form>
      </div>
    </div>
  )
}

export default InquiryModal