import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { saveApplicationSection, getApplicationData } from '../utils/applicationData'
import { getFormId, getFormIdFromResponse, saveFormId } from '../utils/formId'
import { getClasses, saveStudentDetails } from '../services/applicationService'
import { getErrorMessage } from '../services/apiHelpers'
import { getSessionInfo } from '../utils/session'
import toast from 'react-hot-toast'
import ClassLayout from '../layouts/ClassLayout'
import InfoNote from '../components/InfoNote'
import CustomSelect from '../components/CustomSelect'
import ApplicationStepperLayout from '../layouts/ApplicationStepperLayout'
import { nameRules, dobRulesFor, getDobBounds, formatDMY } from '../utils/validators'
import { formatClassLabel } from '../utils/classLabel'

function ClassStudentDetails() {
  const navigate = useNavigate()
  const { classId } = useParams()
  const [classData, setClassData] = useState(null)
  const [loadingClass, setLoadingClass] = useState(true)
  const savedData = getApplicationData(classId)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    // Additional-info fields used to be saved separately; keep showing drafts saved that way.
    defaultValues: {
      achievements: savedData.additional?.achievements || '',
      bloodGroup: savedData.additional?.bloodGroup || '',
      studAadhar: savedData.additional?.studAadhar || '',
      currentSchoolClass: savedData.additional?.currentSchoolClass || '',
      ...(savedData.student || {}),
    },
    mode: 'onChange',
  })

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getClasses()
      .then((result) => {
        const selected = (result.data ?? result).find((item) => String(item.class_id ?? item.id) === String(classId))
        if (selected) setClassData({ label: formatClassLabel(selected), dobBounds: getDobBounds(selected) })
      })
      .finally(() => setLoadingClass(false))
  }, [classId])

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      const payload = {
        first_name: data.firstName,
        mid_name: data.middleName,
        last_name: data.lastName,
        dob: data.dob,
        birth_place: data.birthPlace,
        mother_tongue: data.motherTongue,
        gender: data.gender,
        religion: data.religion,
        caste: data.caste,
        subcaste: data.subCaste,
        category: data.category,
        // Additional information (all optional)
        acheivements: data.achievements || '',
        blood_group: data.bloodGroup || undefined,
        stud_aadhar: data.studAadhar || '',
        current_school_class: data.currentSchoolClass || '',
        class_id: classId,
        nar_id: getSessionInfo().narId,
      }
      const existingFormId = getFormId(classId)
      if (existingFormId) payload.form_id = existingFormId

      const result = await saveStudentDetails(payload)
      const serverFormId = getFormIdFromResponse(result)
      if (!serverFormId) {
        throw new Error('Student details were saved, but the server did not return a form_id.')
      }

      saveFormId(classId, serverFormId)
      saveApplicationSection(classId, 'student', data)
      toast.success('Student details saved')
      navigate(`/class/${classId}/application/address`)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not save student details.'))
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  const disabledInputClass =
    'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-slate-100 text-slate-500'
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1'
  const reqStar = <span className="text-red-500">*</span>
  const errClass = 'text-xs text-red-600 mt-1'

  if (loadingClass) return <ClassLayout><p className="text-center text-slate-500 py-10">Loading class details...</p></ClassLayout>
  if (!classData) return <ClassLayout><p className="text-center text-slate-600 py-10">Class not found.</p></ClassLayout>

  return (
    <ClassLayout>
      <ApplicationStepperLayout currentStep={1}>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-center text-teal-700 font-semibold mb-6 border-b border-slate-200 pb-3">
            🎓 Student Details
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className={labelClass}>{reqStar} First Name</label>
                <input className={inputClass} {...register('firstName', nameRules('first name', true))} />
                {errors.firstName && <p className={errClass}>{errors.firstName.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Middle Name</label>
                <input className={inputClass} {...register('middleName', nameRules('middle name'))} />
                {errors.middleName && <p className={errClass}>{errors.middleName.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <input className={inputClass} {...register('lastName', nameRules('last name'))} />
                {errors.lastName && <p className={errClass}>{errors.lastName.message}</p>}
              </div>
              <div>
                <label className={labelClass}>{reqStar} Class</label>
                <input className={disabledInputClass} value={classData.label} disabled />
              </div>

              <div>
                <label className={labelClass}>{reqStar} Date of Birth</label>
                <input
                  type="date"
                  min={classData.dobBounds.min}
                  max={classData.dobBounds.max}
                  className={inputClass}
                  {...register('dob', dobRulesFor(classData.dobBounds))}
                />
                <p className="text-xs text-slate-400 mt-1">
                  Allowed: {formatDMY(classData.dobBounds.min)} to {formatDMY(classData.dobBounds.max)}
                </p>
                {errors.dob && <p className={errClass}>{errors.dob.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Birth Place</label>
                <input className={inputClass} {...register('birthPlace', nameRules('birth place'))} />
                {errors.birthPlace && <p className={errClass}>{errors.birthPlace.message}</p>}
              </div>
              <div>
                <label className={labelClass}>{reqStar} Mother Tongue</label>
                <input className={inputClass} {...register('motherTongue', nameRules('mother tongue', true))} />
                {errors.motherTongue && <p className={errClass}>{errors.motherTongue.message}</p>}
              </div>
              <div>
                <label className={labelClass}>{reqStar} Gender</label>
                <CustomSelect
                  control={control}
                  name="gender"
                  rules={{ required: 'Required' }}
                  options={['Male', 'Female', 'Other']}
                />
                {errors.gender && <p className={errClass}>{errors.gender.message}</p>}
              </div>

              <div>
                <label className={labelClass}>{reqStar} Religion</label>
                <CustomSelect
                  control={control}
                  name="religion"
                  rules={{ required: 'Required' }}
                  options={['Christian', 'Hindu', 'Muslim', 'Sikh', 'Other']}
                />
                {errors.religion && <p className={errClass}>{errors.religion.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Caste</label>
                <input className={inputClass} {...register('caste')} />
              </div>
              <div>
                <label className={labelClass}>Sub-caste</label>
                <input className={inputClass} {...register('subCaste')} />
              </div>
              <div>
                <label className={labelClass}>{reqStar} Category</label>
                <CustomSelect
                  control={control}
                  name="category"
                  rules={{ required: 'Required' }}
                  options={['General', 'OBC', 'SC', 'ST', 'Other']}
                />
                {errors.category && <p className={errClass}>{errors.category.message}</p>}
              </div>
            </div>

            <div className="pt-2">
              <h2 className="text-center text-teal-700 font-semibold mb-1 border-b border-slate-200 pb-3">
                ⭐ Additional Information
              </h2>
              <InfoNote className="mt-3 mb-6">All fields in this section are optional.</InfoNote>
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
                </div>
              </div>
              <div className="mt-4">
                <label className={labelClass}>Achievements (If Any)</label>
                <textarea
                  rows={3}
                  maxLength={500}
                  placeholder="Any notable achievements (academic, sports, cultural, etc.)"
                  className={inputClass}
                  {...register('achievements')}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
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

export default ClassStudentDetails