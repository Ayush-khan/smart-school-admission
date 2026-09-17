import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import ApplicationLayout from '../layouts/ApplicationLayout'

function AddressDetails() {
  const navigate = useNavigate()
  const [sameAsPresent, setSameAsPresent] = useState(false)
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm()

  const presentValues = watch(['presentAddress', 'presentCity', 'presentState', 'presentPincode', 'presentCountry'])

  const handleSameAddress = (checked) => {
    setSameAsPresent(checked)
    if (checked) {
      setValue('permanentAddress', presentValues[0])
      setValue('permanentCity', presentValues[1])
      setValue('permanentState', presentValues[2])
      setValue('permanentPincode', presentValues[3])
      setValue('permanentCountry', presentValues[4])
    }
  }

  const onSubmit = (data) => {
    console.log('Address Details:', data)
    navigate('/application/parents')
  }

  const inputClass =
    'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1'

  return (
    <ApplicationLayout currentStep={2}>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">Address Details</h2>
        <p className="text-sm text-slate-500 mb-6">Enter present and permanent address information.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-600 mb-3">Present Address</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Address Line *</label>
                <input className={inputClass} {...register('presentAddress', { required: 'Address is required' })} />
                {errors.presentAddress && <p className="text-xs text-red-600 mt-1">{errors.presentAddress.message}</p>}
              </div>
              <div>
                <label className={labelClass}>City *</label>
                <input className={inputClass} {...register('presentCity', { required: 'City is required' })} />
                {errors.presentCity && <p className="text-xs text-red-600 mt-1">{errors.presentCity.message}</p>}
              </div>
              <div>
                <label className={labelClass}>State *</label>
                <input className={inputClass} {...register('presentState', { required: 'State is required' })} />
                {errors.presentState && <p className="text-xs text-red-600 mt-1">{errors.presentState.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Pincode *</label>
                <input
                  className={inputClass}
                  {...register('presentPincode', {
                    required: 'Pincode is required',
                    pattern: { value: /^\d{6}$/, message: 'Enter a valid 6-digit pincode' },
                  })}
                />
                {errors.presentPincode && <p className="text-xs text-red-600 mt-1">{errors.presentPincode.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Country *</label>
                <input className={inputClass} defaultValue="India" {...register('presentCountry', { required: true })} />
              </div>
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
              Same as Present Address
            </label>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-600 mb-3">Permanent Address</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Address Line *</label>
                <input
                  className={inputClass}
                  disabled={sameAsPresent}
                  {...register('permanentAddress', { required: 'Address is required' })}
                />
                {errors.permanentAddress && <p className="text-xs text-red-600 mt-1">{errors.permanentAddress.message}</p>}
              </div>
              <div>
                <label className={labelClass}>City *</label>
                <input
                  className={inputClass}
                  disabled={sameAsPresent}
                  {...register('permanentCity', { required: 'City is required' })}
                />
                {errors.permanentCity && <p className="text-xs text-red-600 mt-1">{errors.permanentCity.message}</p>}
              </div>
              <div>
                <label className={labelClass}>State *</label>
                <input
                  className={inputClass}
                  disabled={sameAsPresent}
                  {...register('permanentState', { required: 'State is required' })}
                />
                {errors.permanentState && <p className="text-xs text-red-600 mt-1">{errors.permanentState.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Pincode *</label>
                <input
                  className={inputClass}
                  disabled={sameAsPresent}
                  {...register('permanentPincode', {
                    required: 'Pincode is required',
                    pattern: { value: /^\d{6}$/, message: 'Enter a valid 6-digit pincode' },
                  })}
                />
                {errors.permanentPincode && <p className="text-xs text-red-600 mt-1">{errors.permanentPincode.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Country *</label>
                <input
                  className={inputClass}
                  disabled={sameAsPresent}
                  defaultValue="India"
                  {...register('permanentCountry', { required: true })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              className="bg-blue-900 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-blue-800"
            >
              Save & Continue
            </button>
          </div>
        </form>
      </div>
    </ApplicationLayout>
  )
}

export default AddressDetails