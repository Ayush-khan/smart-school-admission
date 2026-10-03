import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { getClasses, getEnquiryClasses, getEnquiryGenders, submitEnquiry } from '../services/applicationService'
import { getErrorMessage } from '../services/apiHelpers'
import { nameRules, mobileRules, pincodeRules, addressRules, getDobBounds, checkDob, formatDMY } from '../utils/validators'
import { formatClassLabel } from '../utils/classLabel'
import DateInput from './DateInput'
import { getSessionInfo } from '../utils/session'

// ---- Validation rules (same rules as the application form) -------------------------------
const NAME_REGEX = nameRules('name').pattern.value // letters (any language) + spaces
const MOBILE_REGEX = mobileRules().pattern.value // 10 digits, starts with 6-9
const PINCODE_REGEX = pincodeRules().pattern.value // 6 digits, first digit 1-9
const ADDRESS_REGEX = addressRules('address').pattern.value
const EMAIL_REGEX = /^[A-Za-z0-9]+([._-][A-Za-z0-9]+)*@([A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/
const SCHOOL_REGEX = /^[\p{L}\p{N}][\p{L}\p{M}\p{N}\s.,'\u2019&()/-]*$/u

const LIMITS = { name: 100, parent: 100, email: 100, school: 100, address: 250, message: 500 }

const clean = (s) => s.trim().replace(/\s+/g, ' ')

const EMPTY = {
  firstName: '',
  middleName: '',
  lastName: '',
  dob: '',
  gender: '',
  classId: '',
  fatherName: '',
  motherName: '',
  contact: '',
  email: '',
  currentSchool: '',
  address: '',
  pincode: '',
  siblingInSchool: false,
  message: '',
}

// Returns { fieldName: 'message' } for every invalid field. Empty object = form is valid.
function validateEnquiry(v, dobText, dobBounds) {
  const e = {}
  const optionalName = (key, label) => {
    const val = clean(v[key])
    if (val && !NAME_REGEX.test(val)) e[key] = `Enter a valid ${label}.`
  }

  // Student name
  const first = clean(v.firstName)
  if (!first) e.firstName = 'Required'
  else if (!NAME_REGEX.test(first)) e.firstName = 'Enter a valid first name.'
  optionalName('middleName', 'middle name')
  optionalName('lastName', 'last name')

  // Date of birth
  if (!dobText) e.dob = 'Required'
  else if (!v.dob) e.dob = 'Enter a valid date of birth.'
  else {
    const dobErr = checkDob(v.dob, dobBounds)
    if (dobErr) e.dob = dobErr
  }

  if (!v.gender) e.gender = 'Required'
  if (!v.classId) e.classId = 'Required'

  // Parents: at least one name; any name that is filled must be valid
  const father = clean(v.fatherName)
  const mother = clean(v.motherName)
  if (!father && !mother) e.parents = "Please fill in either father's or mother's name."
  if (father && !NAME_REGEX.test(father)) e.fatherName = "Enter a valid father's name."
  if (mother && !NAME_REGEX.test(mother)) e.motherName = "Enter a valid mother's name."

  // Contact
  const contact = v.contact.trim()
  if (!contact) e.contact = 'Required'
  else if (!MOBILE_REGEX.test(contact)) e.contact = 'Enter a valid mobile number.'

  // Optional fields: validated only when filled
  const email = v.email.trim()
  if (email && !EMAIL_REGEX.test(email)) e.email = 'Enter a valid email address.'

  const school = clean(v.currentSchool)
  if (school && !SCHOOL_REGEX.test(school)) e.currentSchool = 'Enter a valid school name.'

  const address = clean(v.address)
  if (address && !ADDRESS_REGEX.test(address)) e.address = 'Enter a valid address.'

  const pin = v.pincode.trim()
  if (pin && !PINCODE_REGEX.test(pin)) e.pincode = 'Enter a valid 6-digit pincode.'

  return e
}

function EnquiryModal({ onClose, onSubmitted }) {
  const [v, setV] = useState(EMPTY)
  const [dobText, setDobText] = useState('')
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [classes, setClasses] = useState([])
  const [genders, setGenders] = useState([])
  const [mainClasses, setMainClasses] = useState([])
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false) // blocks a fast double-click before state updates
  const [show, setShow] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 20)
    return () => clearTimeout(t)
  }, [])

  const handleClose = () => {
    setShow(false)
    setTimeout(onClose, 250)
  }

  // Classes + genders from the server. A failure is shown to the user (with Retry).
  const loadOptions = async () => {
    setLoadError('')
    const [classRes, genderRes, mainRes] = await Promise.allSettled([getEnquiryClasses(), getEnquiryGenders(), getClasses()])

    if (classRes.status === 'fulfilled') {
      const list = classRes.value?.data?.classes ?? []
      setClasses(Array.isArray(list) ? list : [])
    }
    if (mainRes.status === 'fulfilled') {
      const list = mainRes.value?.data ?? mainRes.value
      setMainClasses(Array.isArray(list) ? list : [])
    }
    if (genderRes.status === 'fulfilled') {
      const list = genderRes.value?.data?.genders ?? []
      setGenders(Array.isArray(list) ? list : [])
    }
    if (classRes.status === 'rejected' || genderRes.status === 'rejected') {
      setLoadError('Could not load classes / genders. Please try again.')
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOptions()
  }, [])

  const set = (key, value) => setV((prev) => ({ ...prev, [key]: value }))
  const touch = (key) => setTouched((prev) => ({ ...prev, [key]: true }))

  // Typing helpers: no leading space, no double spaces
  const spaceSafe = (s) => s.replace(/^\s+/, '').replace(/\s{2,}/g, ' ')
  const textProps = (key, max, { digitsOnly = false, spaces = true } = {}) => ({
    value: v[key],
    maxLength: max,
    onChange: (e) => {
      let val = e.target.value
      if (digitsOnly) val = val.replace(/\D/g, '')
      else if (spaces) val = spaceSafe(val)
      set(key, val)
      setError('')
    },
    onBlur: () => touch(key),
  })

  // DOB window for the selected class. Uses the enquiry class's own dates if the API sends them,
  // otherwise the same class from the main classes API. Null dates fall back to defaults.
  const selectedClass = classes.find((c) => String(c.id ?? c.class_id) === String(v.classId))
  const selectedMain = mainClasses.find((c) => String(c.id ?? c.class_id) === String(v.classId))
  const dobBounds = getDobBounds({
    age_start_date: selectedClass?.age_start_date ?? selectedMain?.age_start_date,
    age_end_date: selectedClass?.age_end_date ?? selectedMain?.age_end_date,
  })

  const selectedMainFor = (c) => mainClasses.find((m) => String(m.id ?? m.class_id) === String(c.id ?? c.class_id)) ?? {}

  const errors = validateEnquiry(v, dobText, dobBounds)
  const showErr = (key) => (submitted || touched[key]) && errors[key]
  const parentsErr = (submitted || touched.fatherName || touched.motherName) && errors.parents

  const inputClass =
    'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1'
  const errClass = 'text-xs text-red-600 mt-1'
  const cls = (invalid) => (invalid ? inputClass.replace('border-slate-300', 'border-red-500') : inputClass)
  const star = <span className="text-red-500">*</span>

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submittingRef.current) return
    setSubmitted(true)

    const keys = Object.keys(errors)
    if (keys.length > 0) {
      const requiredMissing = keys.some((k) => errors[k] === 'Required')
      setError(
        requiredMissing
          ? 'Please fill in all required fields.'
          : errors.parents && keys.length === 1
            ? errors.parents
            : 'Please correct the highlighted fields.',
      )
      // bring the first problem into view
      setTimeout(() => document.querySelector('[data-invalid="true"]')?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 0)
      return
    }

    setError('')
    submittingRef.current = true
    setSubmitting(true)
    try {
      await submitEnquiry({
        first_name: clean(v.firstName),
        middle_name: clean(v.middleName),
        last_name: clean(v.lastName),
        dob: v.dob,
        gender: v.gender,
        class_id: v.classId,
        nar_id: getSessionInfo().narId,
        father_name: clean(v.fatherName),
        mother_name: clean(v.motherName),
        contact_no: v.contact.trim(),
        email: v.email.trim(),
        address: clean(v.address),
        pincode: v.pincode.trim(),
        sibling_in_school: v.siblingInSchool,
        documents_available: false, // no input on this form; kept for the API
        current_school: clean(v.currentSchool),
        message: v.message.trim(),
      })
      toast.success('Your Enquiry has been submitted. We will get back to you soon.')
      onSubmitted?.() // lets the Dashboard refresh its enquiry count and list
      handleClose()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not submit your enquiry.'))
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  const fieldError = (key) => showErr(key) && <p className={errClass}>{errors[key]}</p>

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto transition-all duration-300 ease-out motion-reduce:transition-none ${
        show ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/0'
      }`}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl p-6 max-w-md w-full my-auto transition-all duration-300 ease-out motion-reduce:transition-none ${
          show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Admission Enquiry</h2>
          <button onClick={handleClose} aria-label="Close" className="text-slate-400 hover:text-slate-600 text-xl leading-none">
            ✕
          </button>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Send us your enquiry and our admission team will get back to you.
        </p>

        {loadError && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
            <p className="text-xs text-red-700">{loadError}</p>
            <button type="button" onClick={loadOptions} className="text-xs font-medium text-blue-700 hover:underline flex-shrink-0">
              Retry
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <p className={labelClass}>Student Name</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>First Name {star}</label>
              <input className={cls(showErr('firstName'))} data-invalid={Boolean(showErr('firstName'))} {...textProps('firstName', LIMITS.name)} />
              {fieldError('firstName')}
            </div>
            <div>
              <label className={labelClass}>Middle Name</label>
              <input className={cls(showErr('middleName'))} data-invalid={Boolean(showErr('middleName'))} {...textProps('middleName', LIMITS.name)} />
              {fieldError('middleName')}
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input className={cls(showErr('lastName'))} data-invalid={Boolean(showErr('lastName'))} {...textProps('lastName', LIMITS.name)} />
              {fieldError('lastName')}
            </div>
          </div>

          <div data-invalid={Boolean(showErr('dob'))}>
            <label className={labelClass}>Date of Birth {star}</label>
            <DateInput
              className={cls(showErr('dob'))}
              value={v.dob}
              onChange={(iso, text) => {
                set('dob', iso)
                setDobText(text ?? '')
                // show the date error only once a full date is typed (or the box is cleared)
                if (!text || text.length === 10) touch('dob')
                setError('')
              }}
              min={dobBounds.min}
              max={dobBounds.max}
            />
            {v.classId && (
              <p className="text-xs text-slate-400 mt-1">
                Allowed: {formatDMY(dobBounds.min)} to {formatDMY(dobBounds.max)}
              </p>
            )}
            {fieldError('dob')}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Gender {star}</label>
              <select
                className={cls(showErr('gender'))}
                data-invalid={Boolean(showErr('gender'))}
                value={v.gender}
                onChange={(e) => {
                  set('gender', e.target.value)
                  setError('')
                }}
                onBlur={() => touch('gender')}
              >
                <option value="" disabled hidden>Select gender</option>
                {genders.map((g) => (
                  <option key={g.field_option_id} value={g.field_option_id}>
                    {g.option_value}
                  </option>
                ))}
              </select>
              {fieldError('gender')}
            </div>

            <div>
              <label className={labelClass}>Class {star}</label>
              <select
                className={cls(showErr('classId'))}
                data-invalid={Boolean(showErr('classId'))}
                value={v.classId}
                onChange={(e) => {
                  set('classId', e.target.value)
                  setError('')
                }}
                onBlur={() => touch('classId')}
              >
                <option value="">Select class</option>
                {classes.map((c) => (
                  <option key={c.id ?? c.class_id} value={c.id ?? c.class_id}>
                    {formatClassLabel({ ...selectedMainFor(c), ...c })}
                  </option>
                ))}
              </select>
              {fieldError('classId')}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Father's Name</label>
              <input
                className={cls(showErr('fatherName') || parentsErr)}
                data-invalid={Boolean(showErr('fatherName') || parentsErr)}
                {...textProps('fatherName', LIMITS.parent)}
              />
              {fieldError('fatherName')}
            </div>
            <div>
              <label className={labelClass}>Mother's Name</label>
              <input
                className={cls(showErr('motherName') || parentsErr)}
                data-invalid={Boolean(showErr('motherName') || parentsErr)}
                {...textProps('motherName', LIMITS.parent)}
              />
              {fieldError('motherName')}
            </div>
          </div>
          <p className={`text-xs -mt-2 ${parentsErr ? 'text-red-600' : 'text-slate-400'}`}>
            At least one parent's name is required.
          </p>

          <div>
            <label className={labelClass}>Contact No. {star}</label>
            <input
              inputMode="numeric"
              placeholder="10-digit mobile number"
              className={cls(showErr('contact'))}
              data-invalid={Boolean(showErr('contact'))}
              {...textProps('contact', 10, { digitsOnly: true })}
            />
            {fieldError('contact')}
          </div>

          <div>
            <label className={labelClass}>Email</label>
            <input
              type="text"
              inputMode="email"
              autoComplete="email"
              className={cls(showErr('email'))}
              data-invalid={Boolean(showErr('email'))}
              {...textProps('email', LIMITS.email, { spaces: false })}
              onChange={(e) => {
                set('email', e.target.value.replace(/\s/g, ''))
                setError('')
              }}
            />
            {fieldError('email')}
          </div>

          <div>
            <label className={labelClass}>Current School</label>
            <input className={cls(showErr('currentSchool'))} data-invalid={Boolean(showErr('currentSchool'))} {...textProps('currentSchool', LIMITS.school)} />
            {fieldError('currentSchool')}
          </div>

          <div>
            <label className={labelClass}>Address</label>
            <input className={cls(showErr('address'))} data-invalid={Boolean(showErr('address'))} {...textProps('address', LIMITS.address)} />
            {fieldError('address')}
          </div>

          <div>
            <label className={labelClass}>Pincode</label>
            <input
              inputMode="numeric"
              placeholder="6-digit pincode"
              className={cls(showErr('pincode'))}
              data-invalid={Boolean(showErr('pincode'))}
              {...textProps('pincode', 6, { digitsOnly: true })}
            />
            {fieldError('pincode')}
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={v.siblingInSchool}
              onChange={(e) => set('siblingInSchool', e.target.checked)}
            />
            Sibling is currently studying at this school
          </label>

          <div>
            <label className={labelClass}>Describe your query (Optional)</label>
            <textarea
              rows={3}
              maxLength={LIMITS.message}
              className={inputClass}
              value={v.message}
              onChange={(e) => set('message', e.target.value)}
              placeholder="Type your query here..."
            />
            <p className="text-xs text-slate-400 mt-1 text-right">
              {v.message.length}/{LIMITS.message}
            </p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-navy text-white text-sm font-medium py-2.5 rounded-lg hover:bg-navy-light disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : 'Submit Enquiry'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default EnquiryModal