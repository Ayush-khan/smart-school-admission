import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getClasses } from '../services/applicationService'

function InquiryModal({ onClose }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState('')
  const [classId, setClassId] = useState('')
  const [classes, setClasses] = useState([])
  const [fatherName, setFatherName] = useState('')
  const [motherName, setMotherName] = useState('')
  const [contact, setContact] = useState('')
  const [email, setEmail] = useState('')
  const [documentsAvailable, setDocumentsAvailable] = useState(false)
  const [currentSchool, setCurrentSchool] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

    useEffect(() => {
    let cancelled = false
    async function loadClasses() {
      try {
        const result = await getClasses()
        const list = result.data ?? result
        if (!cancelled) setClasses(Array.isArray(list) ? list : [])
      } catch {
        // Silently ignore — dropdown just stays empty if this fails.
      }
    }
    loadClasses()
    return () => {
      cancelled = true
    }
  }, [])

  const inputClass =
    'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1'

  const handleSubmit = (e) => {
    e.preventDefault()

      if (
      !firstName.trim() ||
      !lastName.trim() ||
      !dob ||
      !gender ||
      !classId ||
      !contact.trim()
    ) {
      setError('Please fill in all required fields.')
      return
    }

    if (!fatherName.trim() && !motherName.trim()) {
      setError("Please fill in either father's or mother's name.")
      return
    }

    setError('')
    toast.success('Your inquiry has been submitted. We will get back to you soon.')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full my-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Admission Inquiry</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">
            ✕
          </button>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Send us your inquiry and our admission team will get back to you.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
                    <p className={labelClass}>Student Name <span className="text-red-500">*</span></p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>First Name</label>
              <input className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Date of Birth <span className="text-red-500">*</span></label>
            <input type="date" className={inputClass} value={dob} onChange={(e) => setDob(e.target.value)} />
          </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Gender <span className="text-red-500">*</span></label>
              <select className={inputClass} value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Class <span className="text-red-500">*</span></label>
              <select className={inputClass} value={classId} onChange={(e) => setClassId(e.target.value)}>
                <option value="">Select class</option>
                {classes.map((c) => (
                  <option key={c.id ?? c.class_id} value={c.id ?? c.class_id}>
                    {c.label ?? c.class_name ?? c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Father's Name <span className="text-red-500">*</span></label>
              <input className={inputClass} value={fatherName} onChange={(e) => setFatherName(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Mother's Name <span className="text-red-500">*</span></label>
              <input className={inputClass} value={motherName} onChange={(e) => setMotherName(e.target.value)} />
            </div>
          </div>
          
          <p className="text-xs text-slate-400 -mt-2">At least one parent's name is required.</p>

          <div>
          <label className={labelClass}>Contact No. <span className="text-red-500">*</span></label>
            <input className={inputClass} value={contact} onChange={(e) => setContact(e.target.value)} />
          </div>

          <div>
            <label className={labelClass}>Email</label>
            <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div>
            <label className={labelClass}>Current School</label>
            <input className={inputClass} value={currentSchool} onChange={(e) => setCurrentSchool(e.target.value)} />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={documentsAvailable}
              onChange={(e) => setDocumentsAvailable(e.target.checked)}
            />
             All documents available
          </label>

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