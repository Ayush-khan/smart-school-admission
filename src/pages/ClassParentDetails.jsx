import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import ClassLayout from '../layouts/ClassLayout'
import { saveApplicationSection, getApplicationData } from '../utils/applicationData'
import ApplicationStepperLayout from '../layouts/ApplicationStepperLayout'
import { nameRules, mobileRules } from '../utils/validators'
import { saveAdmissionSection as saveParentsToApi } from '../utils/saveAdmissionSection'
import { getErrorMessage } from '../services/apiHelpers'
import { useState } from 'react'

function ClassParentDetails() {
  const navigate = useNavigate()
  const { classId } = useParams()
  const [saving, setSaving] = useState(false)
  const savedData = getApplicationData(classId)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: savedData.parents || {}, mode: 'onChange' })

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      await saveParentsToApi(classId, {
        father_name: data.fatherName,
        father_mobile: data.fatherMobile,
        mother_name: data.motherName,
        mother_mobile: data.motherMobile,
      })
      saveApplicationSection(classId, 'parents', data)
      toast.success('Parent details saved')
      navigate(`/class/${classId}/application/siblings`)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not save parent details.'))
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{reqStar} Father's Name</label>
                <input className={inputClass} {...register('fatherName', nameRules("father's name", true))} />
                {errors.fatherName && <p className={errClass}>{errors.fatherName.message}</p>}
              </div>
              <div>
                <label className={labelClass}>{reqStar} Father's Mobile Number</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">+91</span>
                  <input className={inputClass} {...register('fatherMobile', mobileRules(true))} />
                </div>
                {errors.fatherMobile && <p className={errClass}>{errors.fatherMobile.message}</p>}
              </div>
              <div>
                <label className={labelClass}>{reqStar} Mother's Name</label>
                <input className={inputClass} {...register('motherName', nameRules("mother's name", true))} />
                {errors.motherName && <p className={errClass}>{errors.motherName.message}</p>}
              </div>
              <div>
                <label className={labelClass}>{reqStar} Mother's Mobile Number</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">+91</span>
                  <input className={inputClass} {...register('motherMobile', mobileRules(true))} />
                </div>
                {errors.motherMobile && <p className={errClass}>{errors.motherMobile.message}</p>}
              </div>
            </div>

            <fieldset>
              <legend className="text-sm font-medium text-slate-700 mb-2">Number to receive SMS</legend>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="radio" value="father" {...register('smsContact', { required: 'Please select a number' })} />
                  Father's mobile
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="radio" value="mother" {...register('smsContact', { required: 'Please select a number' })} />
                  Mother's mobile
                </label>
              </div>
              {errors.smsContact && <p className={errClass}>{errors.smsContact.message}</p>}
            </fieldset>

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
