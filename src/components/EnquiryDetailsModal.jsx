import { useState, useEffect } from 'react'
import { formatDMY } from '../utils/validators'

// Read-only popup with the details of one enquiry (opened from the Enquiries tab).
// Only fields that the enquiries API actually sends are shown; empty ones are hidden,
// so it works with whatever the backend returns. Add a row below if the API sends more.
const pick = (e, ...keys) => {
  for (const k of keys) {
    const v = e?.[k]
    if (v !== undefined && v !== null && String(v).trim() !== '') return v
  }
  return ''
}

function EnquiryDetailsModal({ enquiry, classLabel, academicYear, onClose }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 20)
    return () => clearTimeout(t)
  }, [])

  const handleClose = () => {
    setShow(false)
    setTimeout(onClose, 250)
  }

  const studentName =
    [enquiry.first_name, enquiry.middle_name, enquiry.last_name].filter(Boolean).join(' ') ||
    enquiry.student_name ||
    ''
  const dobRaw = pick(enquiry, 'dob', 'date_of_birth')
  const sibling = pick(enquiry, 'sibling_in_school')
  const siblingText =
    sibling === '' ? '' : sibling === true || sibling === 1 || sibling === '1' || sibling === 'Y' || sibling === 'Yes' ? 'Yes' : 'No'

  const rows = [
    ['Enquiry No', pick(enquiry, 'enquiry_number', 'enquiry_id', 'id')],
    ['Status', pick(enquiry, 'status', 'enquiry_status')],
    ['Student Name', studentName],
    ['Date of Birth', formatDMY(dobRaw) || dobRaw],
    ['Gender', pick(enquiry, 'gender_name', 'gender')],
    ['Class', classLabel],
    ['Academic Year', academicYear && academicYear !== '—' ? academicYear : ''],
    ["Father's Name", pick(enquiry, 'father_name')],
    ["Mother's Name", pick(enquiry, 'mother_name')],
    ['Contact No.', pick(enquiry, 'contact_no', 'contact', 'mobile')],
    ['Email', pick(enquiry, 'email')],
    ['Current School', pick(enquiry, 'current_school')],
    ['Address', pick(enquiry, 'address')],
    ['Pincode', pick(enquiry, 'pincode')],
    ['Sibling in this school', siblingText],
    ['Query', pick(enquiry, 'message', 'query')],
    ['Submitted On', formatDMY(pick(enquiry, 'created_at', 'enquiry_date')) || ''],
  ].filter(([, value]) => value !== '' && value !== undefined && value !== null)

  return (
    <div
      onClick={handleClose}
      className={`fixed inset-0 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto transition-all duration-300 ease-out motion-reduce:transition-none ${
        show ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/0'
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white rounded-xl shadow-2xl p-6 max-w-md w-full my-auto transition-all duration-300 ease-out motion-reduce:transition-none ${
          show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Enquiry Details</h2>
          <button onClick={handleClose} aria-label="Close" className="text-slate-400 hover:text-slate-600 text-xl leading-none">
            ✕
          </button>
        </div>

        <dl className="divide-y divide-slate-100">
          {rows.map(([label, value]) => (
            <div key={label} className="py-2 grid grid-cols-3 gap-3">
              <dt className="text-sm font-medium text-slate-500">{label}</dt>
              <dd className="col-span-2 text-sm text-slate-800 break-words whitespace-pre-line">{String(value)}</dd>
            </div>
          ))}
        </dl>

        <button
          type="button"
          onClick={handleClose}
          className="mt-5 w-full bg-navy text-white text-sm font-medium py-2.5 rounded-lg hover:bg-navy-light"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default EnquiryDetailsModal
