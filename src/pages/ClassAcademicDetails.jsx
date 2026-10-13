import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import ClassLayout from '../layouts/ClassLayout'
import { saveApplicationSection, getApplicationData } from '../utils/applicationData'
import ApplicationStepperLayout from '../layouts/ApplicationStepperLayout'
import { saveAdmissionSection as saveAcademicToApi } from '../utils/saveAdmissionSection'
import { getErrorMessage } from '../services/apiHelpers'

function ClassAcademicDetails() {
  const navigate = useNavigate()
  const { classId } = useParams()
  const [saving, setSaving] = useState(false)
  const savedData = getApplicationData(classId)
  const previousRecord = savedData.academic?.[0] || {}
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      previousSchool: previousRecord.previousSchool ?? previousRecord.schoolName ?? '',
      previousClass: previousRecord.previousClass ?? '',
      previousPercentage: previousRecord.previousPercentage ?? previousRecord.percentage ?? '',
    },
  })

  const onSubmit = async (data) => {
    const academicRecord = {
      previousSchool: data.previousSchool,
      previousClass: data.previousClass,
      previousPercentage: Number.isFinite(data.previousPercentage) ? data.previousPercentage : '',
    }
    setSaving(true)
    try {
      const payload = {
        previous_school: data.previousSchool,
        previous_class: data.previousClass,
      }
      if (Number.isFinite(data.previousPercentage)) {
        payload.previous_percentage = data.previousPercentage
      }
      await saveAcademicToApi(classId, payload)
      saveApplicationSection(classId, 'academic', [academicRecord])
      toast.success('Academic details saved')
      navigate(`/class/${classId}/application/additional`)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not save academic details.'))
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1'
  const errClass = 'text-xs text-red-600 mt-1'

  return (
    <ClassLayout>
      <ApplicationStepperLayout currentStep={5}>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-center text-teal-700 font-semibold mb-6 border-b border-slate-200 pb-3">
            📚 Academic Details
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Previous School</label>
                <input
                  className={inputClass}
                  maxLength={100}
                  {...register('previousSchool')}
                />
              </div>
              <div>
                <label className={labelClass}>Previous Class</label>
                <input
                  className={inputClass}
                  maxLength={30}
                  {...register('previousClass')}
                />
              </div>
              <div>
                <label className={labelClass}>Previous Percentage</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  className={inputClass}
                  {...register('previousPercentage', {
                    valueAsNumber: true,
                    validate: (value) =>
                      value === undefined || Number.isNaN(value) || (value >= 0 && value <= 100) ||
                      'Enter a percentage from 0 to 100.',
                  })}
                />
                {errors.previousPercentage && <p className={errClass}>{errors.previousPercentage.message}</p>}
              </div>
            </div>

            <div className="flex justify-between gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate(`/class/${classId}/application/siblings`)}
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
