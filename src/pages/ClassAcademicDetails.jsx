import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import ClassLayout from '../layouts/ClassLayout'
import { saveApplicationSection, getApplicationData } from '../utils/applicationData'
import ApplicationStepperLayout from '../layouts/ApplicationStepperLayout'
import { saveAdmissionSection as saveAcademicToApi } from '../utils/saveAdmissionSection'
import { getErrorMessage } from '../services/apiHelpers'

const SCHOOL_REGEX = /^[\p{L}\p{N}][\p{L}\p{M}\p{N}\s.,'\u2019&()/-]*$/u
const CLASS_REGEX = /^[A-Za-z0-9][A-Za-z0-9 .-]*$/
const ACADEMIC_YEAR_MIN = 2000

const validateAcademicYear = (value) => {
  const year = (value || '').trim()
  if (!year) return true
  if (!/^\d{4}-\d{4}$/.test(year)) return 'Enter in the format 2024-2025.'
  const [start, end] = year.split('-').map(Number)
  if (end !== start + 1) return 'The second year must be one more than the first (e.g. 2024-2025).'
  if (start < ACADEMIC_YEAR_MIN) return `Year cannot be before ${ACADEMIC_YEAR_MIN}.`
  if (start > new Date().getFullYear()) return 'Academic year cannot be in the future.'
  return true
}

const validatePercentage = (value) => {
  const percentage = (value || '').trim()
  if (!percentage) return true
  if (/^\d{1,3}(\.\d{1,2})?\s?%?$/.test(percentage)) {
    return parseFloat(percentage) <= 100 || 'Percentage cannot be more than 100.'
  }
  if (/^[A-Ea-e][+-]?[1-2]?$/.test(percentage) || /^(NA|N\/A)$/i.test(percentage)) return true
  return 'Enter a percentage (e.g. 72.80%) or a grade (e.g. A+).'
}

function ClassAcademicDetails() {
  const navigate = useNavigate()
  const { classId } = useParams()
  const [saving, setSaving] = useState(false)
  const savedData = getApplicationData(classId)
  const savedRecords = savedData.academic?.length ? savedData.academic : [{}]

  const { register, control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      records: savedRecords.map((record) => ({
        schoolName: record.schoolName ?? record.previousSchool ?? '',
        board: record.board ?? '',
        previousClass: record.previousClass ?? '',
        academicYear: record.academicYear ?? '',
        percentage: record.percentage ?? record.previousPercentage ?? '',
        tcStatus: record.tcStatus ?? '',
      })),
    },
  })

  const { fields, remove } = useFieldArray({ control, name: 'records' })
  const inputClass =
    'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1'
  const errClass = 'text-xs text-red-600 mt-1'

  const onSubmit = async (data) => {
    const records = data.records.map((record) => ({
      schoolName: record.schoolName || '',
      board: record.board || '',
      previousClass: record.previousClass || '',
      academicYear: record.academicYear || '',
      percentage: record.percentage || '',
      tcStatus: record.tcStatus || '',
    }))
    const firstRecord = records[0] || {}

    setSaving(true)
    try {
      await saveAcademicToApi(classId, {
        previous_school: firstRecord.schoolName,
        board: firstRecord.board,
        previous_class: firstRecord.previousClass,
        academic_year: firstRecord.academicYear,
        previous_percentage: firstRecord.percentage,
        tc_status: firstRecord.tcStatus,
      })
      saveApplicationSection(classId, 'academic', records)
      toast.success('Academic details saved')
      navigate(`/class/${classId}/application/additional`)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not save academic details.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <ClassLayout>
      <ApplicationStepperLayout currentStep={5}>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-center text-teal-700 font-semibold mb-6 border-b border-slate-200 pb-3">
            📚 Academic Details
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-sm font-semibold text-slate-700">Academic Record {index + 1}</p>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-xs text-red-600 font-medium hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>Previous School Name</label>
                      <input
                        className={inputClass}
                        maxLength={100}
                        {...register(`records.${index}.schoolName`, {
                          pattern: { value: SCHOOL_REGEX, message: 'Enter a valid school name.' },
                        })}
                      />
                      {errors.records?.[index]?.schoolName && <p className={errClass}>{errors.records[index].schoolName.message}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Board</label>
                      <select className={inputClass} {...register(`records.${index}.board`)}>
                        <option value="">SELECT</option>
                        <option value="CBSE">CBSE</option>
                        <option value="ICSE">ICSE</option>
                        <option value="State Board">State Board</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Previous Class</label>
                      <input
                        className={inputClass}
                        maxLength={20}
                        {...register(`records.${index}.previousClass`, {
                          pattern: { value: CLASS_REGEX, message: 'Enter a valid class.' },
                        })}
                      />
                      {errors.records?.[index]?.previousClass && <p className={errClass}>{errors.records[index].previousClass.message}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Academic Year</label>
                      <input
                        className={inputClass}
                        placeholder="2025-2026"
                        maxLength={9}
                        {...register(`records.${index}.academicYear`, { validate: validateAcademicYear })}
                      />
                      {errors.records?.[index]?.academicYear && <p className={errClass}>{errors.records[index].academicYear.message}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Percentage / Grade</label>
                      <input
                        className={inputClass}
                        maxLength={7}
                        {...register(`records.${index}.percentage`, { validate: validatePercentage })}
                      />
                      {errors.records?.[index]?.percentage && <p className={errClass}>{errors.records[index].percentage.message}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Transfer Certificate Status</label>
                      <select className={inputClass} {...register(`records.${index}.tcStatus`)}>
                        <option value="">SELECT</option>
                        <option value="Submitted">Submitted</option>
                        <option value="Pending">Pending</option>
                        <option value="Not Applicable">Not Applicable</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate(`/class/${classId}/application/parents`)}
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

export default ClassAcademicDetails
