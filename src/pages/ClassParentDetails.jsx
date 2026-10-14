import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import ClassLayout from '../layouts/ClassLayout'
import { saveApplicationSection, getApplicationData } from '../utils/applicationData'
import ApplicationStepperLayout from '../layouts/ApplicationStepperLayout'
import { nameRules, occupationRules, mobileRules } from '../utils/validators'
import { saveAdmissionSection as saveParentsToApi } from '../utils/saveAdmissionSection'
import { getErrorMessage } from '../services/apiHelpers'

const CONTRIBUTION_OPTIONS = ['Cultural', 'Medical', 'Media', 'Academic']

function MultiSelect({ value = [], onChange, options, placeholder, className }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const close = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const toggle = (option) => {
    onChange(value.includes(option) ? value.filter((item) => item !== option) : [...value, option])
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        className={`${className} flex items-center justify-between bg-white text-left min-h-[38px]`}
      >
        <span className={value.length ? 'text-slate-800' : 'text-slate-400'}>
          {value.length ? value.map((item) => item.toUpperCase()).join(', ') : placeholder}
        </span>
        <span className="text-slate-400 text-xs ml-2">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-slate-300 rounded-lg shadow-lg py-1">
          {options.map((option) => (
            <label key={option} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer">
              <input type="checkbox" checked={value.includes(option)} onChange={() => toggle(option)} />
              {option.toUpperCase()}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

function ClassParentDetails() {
  const navigate = useNavigate()
  const { classId } = useParams()
  const [saving, setSaving] = useState(false)
  const savedData = getApplicationData(classId)
  const savedParents = savedData.parents || {}
  const savedContributionAreas = savedParents.contributionAreas
  const defaultContributionAreas = Array.isArray(savedContributionAreas)
    ? savedContributionAreas
    : typeof savedContributionAreas === 'string'
      ? savedContributionAreas.split(',').map((area) => area.trim()).filter(Boolean)
      : []

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      ...savedParents,
      contributionAreas: defaultContributionAreas,
    },
    mode: 'onChange',
  })

  const onSubmit = async (data) => {
    const contributionAreas = Array.isArray(data.contributionAreas) ? data.contributionAreas : []
    const parentData = { ...data, contributionAreas }

    setSaving(true)
    try {
      await saveParentsToApi(classId, {
        father_name: data.fatherName || '',
        father_mobile: data.fatherMobile || '',
        father_email: data.fatherEmail || '',
        father_occupation: data.fatherOccupation || '',
        mother_name: data.motherName || '',
        mother_mobile: data.motherMobile || '',
        mother_email: data.motherEmail || '',
        mother_occupation: data.motherOccupation || '',
        other_area: data.otherAreaOfInterest || '',
      })
      saveApplicationSection(classId, 'parents', parentData)
      toast.success('Parent details saved')
      navigate(`/class/${classId}/application/siblings`)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not save parent details.'))
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1'
  const reqStar = <span className="text-red-500">*</span>
  const errClass = 'text-xs text-red-600 mt-1'

  return (
    <ClassLayout>
      <ApplicationStepperLayout currentStep={3}>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-center text-teal-700 font-semibold mb-6 border-b border-slate-200 pb-3">
            👤 Parent's Information
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className={labelClass}>{reqStar} Father's Name</label>
                <input className={inputClass} {...register('fatherName', nameRules("father's name", true))} />
                {errors.fatherName && <p className={errClass}>{errors.fatherName.message}</p>}
              </div>
              <div>
                <label className={labelClass}>{reqStar} Email Id</label>
                <input
                  className={inputClass}
                  {...register('fatherEmail', {
                    required: 'Required',
                    pattern: { value: /^[A-Za-z0-9]+([._-][A-Za-z0-9]+)*@([A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/, message: 'Invalid email' },
                  })}
                />
                {errors.fatherEmail && <p className={errClass}>{errors.fatherEmail.message}</p>}
              </div>
              <div>
                <label className={labelClass}>{reqStar} Mobile Number</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">+91</span>
                  <input className={inputClass} {...register('fatherMobile', mobileRules(true))} />
                </div>
                {errors.fatherMobile && <p className={errClass}>{errors.fatherMobile.message}</p>}
                <label className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                  <input type="radio" value="father" {...register('smsContact', { required: 'Please select where to receive SMS' })} />
                  Set to receive SMS at this no
                </label>
              </div>
              <div>
                <label className={labelClass}>{reqStar} Father Occupation</label>
                <input className={inputClass} {...register('fatherOccupation', occupationRules('father occupation', true))} />
                {errors.fatherOccupation && <p className={errClass}>{errors.fatherOccupation.message}</p>}
              </div>

              <div>
                <label className={labelClass}>{reqStar} Mother's Name</label>
                <input className={inputClass} {...register('motherName', nameRules("mother's name", true))} />
                {errors.motherName && <p className={errClass}>{errors.motherName.message}</p>}
              </div>
              <div>
                <label className={labelClass}>{reqStar} Email Id</label>
                <input
                  className={inputClass}
                  {...register('motherEmail', {
                    required: 'Required',
                    pattern: { value: /^[A-Za-z0-9]+([._-][A-Za-z0-9]+)*@([A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/, message: 'Invalid email' },
                  })}
                />
                {errors.motherEmail && <p className={errClass}>{errors.motherEmail.message}</p>}
              </div>
              <div>
                <label className={labelClass}>{reqStar} Mobile Number</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">+91</span>
                  <input className={inputClass} {...register('motherMobile', mobileRules(true))} />
                </div>
                {errors.motherMobile && <p className={errClass}>{errors.motherMobile.message}</p>}
                <label className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                  <input type="radio" value="mother" {...register('smsContact', { required: 'Please select where to receive SMS' })} />
                  Set to receive SMS at this no
                </label>
                {errors.smsContact && <p className={errClass}>{errors.smsContact.message}</p>}
              </div>
              <div>
                <label className={labelClass}>{reqStar} Mother Occupation</label>
                <input className={inputClass} {...register('motherOccupation', occupationRules('mother occupation', true))} />
                {errors.motherOccupation && <p className={errClass}>{errors.motherOccupation.message}</p>}
              </div>

              <div>
                <label className={labelClass}>Mother Aadhaar Card No.</label>
                <input
                  className={inputClass}
                  inputMode="numeric"
                  maxLength={12}
                  {...register('motherAadhaar', {
                    pattern: { value: /^\d{12}$/, message: 'Enter a valid Aadhar No.' },
                    onChange: (event) => { event.target.value = event.target.value.replace(/\D/g, '') },
                  })}
                />
                {errors.motherAadhaar && <p className={errClass}>{errors.motherAadhaar.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Father Aadhaar Card No.</label>
                <input
                  className={inputClass}
                  inputMode="numeric"
                  maxLength={12}
                  {...register('fatherAadhaar', {
                    pattern: { value: /^\d{12}$/, message: 'Enter a valid Aadhar No.' },
                    onChange: (event) => { event.target.value = event.target.value.replace(/\D/g, '') },
                  })}
                />
                {errors.fatherAadhaar && <p className={errClass}>{errors.fatherAadhaar.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Mother Qualification</label>
                <input
                  className={inputClass}
                  maxLength={50}
                  {...register('motherQualification', {
                    pattern: {
                      value: /^[A-Za-z0-9][A-Za-z0-9 .&-]*$/,
                      message: 'Only letters, numbers, spaces and . & - are allowed',
                    },
                    validate: (value) => !/^\d+$/.test(value || '') || /^\d{1,2}$/.test(value) || 'Number can be maximum 2 digits',
                  })}
                />
                {errors.motherQualification && <p className={errClass}>{errors.motherQualification.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Father Qualification</label>
                <input
                  className={inputClass}
                  maxLength={50}
                  {...register('fatherQualification', {
                    pattern: {
                      value: /^[A-Za-z0-9][A-Za-z0-9 .&-]*$/,
                      message: 'Only letters, numbers, spaces and . & - are allowed',
                    },
                    validate: (value) => !/^\d+$/.test(value || '') || /^\d{1,2}$/.test(value) || 'Number can be maximum 2 digits',
                  })}
                />
                {errors.fatherQualification && <p className={errClass}>{errors.fatherQualification.message}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Areas in which parent can contribute</label>
                <Controller
                  name="contributionAreas"
                  control={control}
                  render={({ field }) => (
                    <MultiSelect
                      value={Array.isArray(field.value) ? field.value : []}
                      onChange={field.onChange}
                      options={CONTRIBUTION_OPTIONS}
                      placeholder="Select one or more"
                      className={inputClass}
                    />
                  )}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Other area of interest</label>
                <input
                  className={inputClass}
                  placeholder="Other area of interest"
                  {...register('otherAreaOfInterest')}
                />
              </div>
            </div>

            <div className="flex justify-between gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate(`/class/${classId}/application/address`)}
                className="bg-slate-100 text-slate-700 text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-slate-200"
              >
                Previous
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-navy text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-navy-light disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save & Continue'}
              </button>
            </div>
          </form>
        </div>
      </ApplicationStepperLayout>
    </ClassLayout>
  )
}

export default ClassParentDetails
