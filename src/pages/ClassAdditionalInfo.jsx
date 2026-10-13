import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import ClassLayout from '../layouts/ClassLayout'
import CustomSelect from '../components/CustomSelect'
import { saveApplicationSection, getApplicationData } from '../utils/applicationData'
import ApplicationStepperLayout from '../layouts/ApplicationStepperLayout'
import { saveAdmissionSection as saveAdditionalToApi } from '../utils/saveAdmissionSection'
import { getErrorMessage } from '../services/apiHelpers'

function ClassAdditionalInfo() {
  const navigate = useNavigate()
  const { classId } = useParams()
  const [saving, setSaving] = useState(false)
  const savedData = getApplicationData(classId)
  const parents = savedData.parents || {}
  const selectedSmsPhone =
    parents.smsContact === 'father'
      ? parents.fatherMobile
      : parents.smsContact === 'mother'
        ? parents.motherMobile
        : ''

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      ...(savedData.additional || {}),
      identificationMark: savedData.additional?.identificationMark || '',
      medicalInformation: savedData.additional?.medicalInformation || '',
      smsSendingPhoneNo: savedData.additional?.smsSendingPhoneNo || selectedSmsPhone || '',
    },
  })

  const onSubmit = async (data) => {
    const additional = {
      achievements: data.achievements,
      extracurricular: data.extracurricular,
      sports: data.sports,
      areasOfInterest: data.areasOfInterest,
      bloodGroup: data.bloodGroup,
      identificationMark: data.identificationMark,
      medicalInformation: data.medicalInformation,
      specialSkills: data.specialSkills,
      smsSendingPhoneNo: data.smsSendingPhoneNo,
    }
    setSaving(true)
    try {
      await saveAdditionalToApi(classId, {
        acheivements: data.achievements || '',
        blood_group: data.bloodGroup,
        sms_sending_phone_no: data.smsSendingPhoneNo,
      })
      saveApplicationSection(classId, 'additional', additional)
      toast.success('Additional information saved')
      navigate(`/class/${classId}/application/documents`)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not save additional information.'))
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
      <ApplicationStepperLayout currentStep={6}>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-center text-teal-700 font-semibold mb-1 border-b border-slate-200 pb-3">
            ⭐ Additional Information
          </h2>
          <p className="text-sm text-slate-500 mt-3 mb-6 text-center">
            All fields on this page are optional.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className={labelClass}>Achievements</label>
              <textarea
                rows={2}
                placeholder="Any notable achievements (academic, sports, cultural, etc.)"
                className={inputClass}
                {...register('achievements')}
              />
            </div>

            <div>
              <label className={labelClass}>Extracurricular Activities</label>
              <textarea
                rows={2}
                placeholder="Dance, music, art, clubs, etc."
                className={inputClass}
                {...register('extracurricular')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Sports</label>
                <input
                  className={inputClass}
                  placeholder="e.g. Football, Swimming"
                  {...register('sports')}
                />
              </div>
              <div>
                <label className={labelClass}>Areas of Interest</label>
                <input
                  className={inputClass}
                  placeholder="e.g. Science, Reading, Robotics"
                  {...register('areasOfInterest')}
                />
              </div>
              <div>
                <label className={labelClass}>Blood Group</label>
                <CustomSelect
                  control={control}
                  name="bloodGroup"
                  options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']}
                />
                {errors.bloodGroup && <p className={errClass}>{errors.bloodGroup.message}</p>}
              </div>
            </div>

            <div>
              <label className={labelClass}>Special Skills</label>
              <input
                className={inputClass}
                placeholder="Any special skills or talents"
                {...register('specialSkills')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* TODO: Send these only after the backend confirms their request keys. */}
              <div>
                <label className={labelClass}>Identification Mark</label>
                <input className={inputClass} maxLength={100} {...register('identificationMark')} />
              </div>
              <div>
                <label className={labelClass}>Medical / Accessibility Information (optional)</label>
                <textarea
                  rows={2}
                  placeholder="Any information the school should be aware of (allergies, accommodations, etc.)"
                  className={inputClass}
                  maxLength={500}
                  {...register('medicalInformation')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>SMS Contact Mobile Number</label>
                <input
                  className={inputClass}
                  inputMode="numeric"
                  maxLength={10}
                  {...register('smsSendingPhoneNo', {
                    pattern: {
                      value: /^\d{10}$/,
                      message: 'Enter a valid 10-digit mobile number.',
                    },
                  })}
                />
                {errors.smsSendingPhoneNo && <p className={errClass}>{errors.smsSendingPhoneNo.message}</p>}
              </div>
            </div>

            <div className="flex justify-between gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate(`/class/${classId}/application/academic`)}
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

export default ClassAdditionalInfo
