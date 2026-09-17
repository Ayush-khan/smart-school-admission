import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useState } from 'react'
import ClassLayout from '../layouts/ClassLayout'
import { saveApplicationSection, getApplicationData } from '../utils/applicationData'
import ApplicationStepperLayout from '../layouts/ApplicationStepperLayout'

function ClassAddressDetails() {
  const navigate = useNavigate()
  const { classId } = useParams()
  const [sameAsPresent, setSameAsPresent] = useState(false)

    const savedData = getApplicationData(classId)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: savedData.address || {} })

  const presentAddress = watch('presentAddress')

  const handleSameAddress = (checked) => {
    setSameAsPresent(checked)
    if (checked) {
      setValue('permanentAddress', presentAddress)
    }
  }

      const onSubmit = (data) => {
    saveApplicationSection(classId, 'address', data)
    toast.success('Address details saved')
    navigate(`/class/${classId}/application/parents`)
  }

  const inputClass =
    'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  const disabledInputClass =
    'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-slate-100 text-slate-500'
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1'
  const reqStar = <span className="text-red-500">*</span>
  const errClass = 'text-xs text-red-600 mt-1'

  return (
    <ClassLayout>
      <ApplicationStepperLayout currentStep={2}>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-center text-teal-700 font-semibold mb-6 border-b border-slate-200 pb-3">
            🏠 Address Details
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>{reqStar} Present Address</label>
                <textarea
                  rows={2}
                  placeholder="Plot No. / Street name"
                  className={inputClass}
                  {...register('presentAddress', { required: 'Required' })}
                />
                {errors.presentAddress && <p className={errClass}>{errors.presentAddress.message}</p>}
              </div>
              <div>
                <label className={labelClass}>{reqStar} City</label>
                <input className={inputClass} {...register('presentCity', { required: 'Required' })} />
                {errors.presentCity && <p className={errClass}>{errors.presentCity.message}</p>}
              </div>
              <div>
                <label className={labelClass}>{reqStar} State</label>
                <input className={inputClass} {...register('presentState', { required: 'Required' })} />
                {errors.presentState && <p className={errClass}>{errors.presentState.message}</p>}
              </div>

              <div>
                <label className={labelClass}>{reqStar} Pincode</label>
                <input
                  className={inputClass}
                  {...register('presentPincode', {
                    required: 'Required',
                    pattern: { value: /^\d{6}$/, message: '6-digit pincode' },
                  })}
                />
                {errors.presentPincode && <p className={errClass}>{errors.presentPincode.message}</p>}
              </div>
              <div>
                <label className={labelClass}>{reqStar} Permanent Address</label>
                <textarea
                  rows={2}
                  disabled={sameAsPresent}
                  className={sameAsPresent ? disabledInputClass : inputClass}
                  {...register('permanentAddress', { required: 'Required' })}
                />
                {errors.permanentAddress && <p className={errClass}>{errors.permanentAddress.message}</p>}
              </div>
              <div>
                <label className={labelClass}>{reqStar} Nationality</label>
                <input className={inputClass} defaultValue="INDIAN" {...register('nationality', { required: true })} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sameAddress"
                checked={sameAsPresent}
                onChange={(e) => handleSameAddress(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="sameAddress" className="text-sm text-slate-700">
                Same as present address
              </label>
            </div>

            <div className="flex justify-between gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate(`/class/${classId}/application/student`)}
                className="bg-slate-100 text-slate-700 text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-slate-200"
              >
                Previous
              </button>
              <button
                type="submit"
                className="bg-blue-900 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-blue-800"
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

export default ClassAddressDetails