import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import ClassLayout from '../layouts/ClassLayout'
import { saveApplicationSection, getApplicationData } from '../utils/applicationData'
import ApplicationStepperLayout from '../layouts/ApplicationStepperLayout'

function ClassParentDetails() {
  const navigate = useNavigate()
  const { classId } = useParams()

    const savedData = getApplicationData(classId)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: savedData.parents || {} })

    const onSubmit = (data) => {
    saveApplicationSection(classId, 'parents', data)
    toast.success('Parent details saved')
    navigate(`/class/${classId}/application/siblings`)
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
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className={labelClass}>{reqStar} Father's Name</label>
                <input className={inputClass} {...register('fatherName', { required: 'Required' })} />
                {errors.fatherName && <p className={errClass}>{errors.fatherName.message}</p>}
              </div>
              <div>
                <label className={labelClass}>{reqStar} Email Id</label>
                <input
                  className={inputClass}
                  {...register('fatherEmail', {
                    required: 'Required',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
                  })}
                />
                {errors.fatherEmail && <p className={errClass}>{errors.fatherEmail.message}</p>}
              </div>
              <div>
                <label className={labelClass}>{reqStar} Mobile Number</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">+91</span>
                  <input
                    className={inputClass}
                    {...register('fatherMobile', {
                      required: 'Required',
                      pattern: { value: /^\d{10}$/, message: '10 digits' },
                    })}
                  />
                </div>
                {errors.fatherMobile && <p className={errClass}>{errors.fatherMobile.message}</p>}
                                <label className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                  <input type="radio" value="father" {...register('smsContact', { required: 'Please select where to receive SMS' })} />
                  Set to receive SMS at this no
                </label>
              </div>
              <div>
                <label className={labelClass}>{reqStar} Father Occupation</label>
                <input className={inputClass} {...register('fatherOccupation', { required: 'Required' })} />
                {errors.fatherOccupation && <p className={errClass}>{errors.fatherOccupation.message}</p>}
              </div>

              <div>
                <label className={labelClass}>{reqStar} Mother's Name</label>
                <input className={inputClass} {...register('motherName', { required: 'Required' })} />
                {errors.motherName && <p className={errClass}>{errors.motherName.message}</p>}
              </div>
              <div>
                <label className={labelClass}>{reqStar} Email Id</label>
                <input
                  className={inputClass}
                  {...register('motherEmail', {
                    required: 'Required',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
                  })}
                />
                {errors.motherEmail && <p className={errClass}>{errors.motherEmail.message}</p>}
              </div>
              <div>
                <label className={labelClass}>{reqStar} Mobile Number</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">+91</span>
                  <input
                    className={inputClass}
                    {...register('motherMobile', {
                      required: 'Required',
                      pattern: { value: /^\d{10}$/, message: '10 digits' },
                    })}
                  />
                </div>
                {errors.motherMobile && <p className={errClass}>{errors.motherMobile.message}</p>}
                                <label className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                  <input type="radio" value="mother" {...register('smsContact', { required: 'Please select where to receive SMS' })} />
                  Set to receive SMS at this no
                </label>
                {errors.smsContact && <p className="text-xs text-red-600 mt-1">{errors.smsContact.message}</p>}
              </div>
              <div>
                <label className={labelClass}>{reqStar} Mother Occupation</label>
                <input className={inputClass} {...register('motherOccupation', { required: 'Required' })} />
                {errors.motherOccupation && <p className={errClass}>{errors.motherOccupation.message}</p>}
              </div>

              <div>
                <label className={labelClass}>Mother Aadhaar Card No.</label>
                <input className={inputClass} {...register('motherAadhaar')} />
              </div>
              <div>
                <label className={labelClass}>Father Aadhaar Card No.</label>
                <input className={inputClass} {...register('fatherAadhaar')} />
              </div>
              <div>
                <label className={labelClass}>Mother Qualification</label>
                <input className={inputClass} {...register('motherQualification')} />
              </div>
              <div>
                <label className={labelClass}>Father Qualification</label>
                <input className={inputClass} {...register('fatherQualification')} />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Areas in which parent can contribute</label>
                <select multiple className={`${inputClass} h-28`} {...register('contributionAreas')}>
                  <option value="Cultural">CULTURAL</option>
                  <option value="Medical">MEDICAL</option>
                  <option value="Media">MEDIA</option>
                  <option value="Academic">ACADEMIC</option>
                </select>
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
                className="bg-navy text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-navy-light"
              >
                Save & Continue
              </button>
            </div>
          </form>
        </div>
      </ApplicationStepperLayout>
    </ClassLayout>
  )
}

export default ClassParentDetails