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
      achievements: savedData.additional?.achievements || '',
      bloodGroup: savedData.additional?.bloodGroup || '',
      // Student Aadhaar and Current School Class used to be on the Student Details page,
      // so fall back to anything the user already typed there.
      studAadhar: savedData.additional?.studAadhar || savedData.student?.studAadhar || '',
      currentSchoolClass: savedData.additional?.currentSchoolClass || savedData.student?.currentSchoolClass || '',
    },
  })

  const onSubmit = async (data) => {
    // No textbox for the SMS number any more: it follows the father/mother choice made on the Parents page.
    const additional = {
      achievements: data.achievements,
      bloodGroup: data.bloodGroup,
      studAadhar: data.studAadhar,
      currentSchoolClass: data.currentSchoolClass,
      smsSendingPhoneNo: selectedSmsPhone || '',
    }
    setSaving(true)
    try {
      await saveAdditionalToApi(classId, {
        acheivements: data.achievements || '',
        blood_group: data.bloodGroup || undefined,
        stud_aadhar: data.studAadhar || '',
        current_school_class: data.currentSchoolClass || '',
        sms_sending_phone_no: selectedSmsPhone || '',
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
      <ApplicationStepperLayout currentStep={5}>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-center text-teal-700 font-semibold mb-1 border-b border-slate-200 pb-3">
            ⭐ Additional Information
          </h2>
          <p className="text-sm text-slate-500 mt-3 mb-6 text-center">
            All fields on this page are optional.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Student Aadhaar Card No.</label>
                <input
                  className={inputClass}
                  inputMode="numeric"
                  maxLength={12}
                  {...register('studAadhar', {
                    onChange: (event) => {
                      event.target.value = event.target.value.replace(/\D/g, '').slice(0, 12)
                    },
                    validate: (value) => !value || /^\d{12}$/.test(value) || 'Enter a valid student Aadhaar number.',
                  })}
                />
                {errors.studAadhar && <p className={errClass}>{errors.studAadhar.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Current School and Class</label>
                <input className={inputClass} maxLength={50} {...register('currentSchoolClass')} />
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
              <label className={labelClass}>Achievements (If Any)</label>
              <textarea
                rows={3}
                maxLength={500}
                placeholder="Any notable achievements (academic, sports, cultural, etc.)"
                className={inputClass}
                {...register('achievements')}
              />
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

export default ClassAdditionalInfo
