import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import ApplicationLayout from '../layouts/ApplicationLayout'

function ParentDetails() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = (data) => {
    console.log('Parent Details:', data)
    navigate('/application/siblings')
  }

  const inputClass =
    'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1'
  const errClass = 'text-xs text-red-600 mt-1'

  return (
    <ApplicationLayout currentStep={3}>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">Parent / Guardian Information</h2>
        <p className="text-sm text-slate-500 mb-6">Enter details for both parents or guardians.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Father */}
          <div>
            <h3 className="text-sm font-semibold text-slate-600 mb-3">Father / Guardian</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Full Name *</label>
                <input className={inputClass} {...register('fatherName', { required: 'Required' })} />
                {errors.fatherName && <p className={errClass}>{errors.fatherName.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Email *</label>
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
                <label className={labelClass}>Mobile Number *</label>
                <input
                  className={inputClass}
                  {...register('fatherMobile', {
                    required: 'Required',
                    pattern: { value: /^\d{10}$/, message: '10-digit number' },
                  })}
                />
                {errors.fatherMobile && <p className={errClass}>{errors.fatherMobile.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Occupation</label>
                <input className={inputClass} {...register('fatherOccupation')} />
              </div>
              <div>
                <label className={labelClass}>Aadhaar Number</label>
                <input className={inputClass} {...register('fatherAadhaar')} />
              </div>
              <div>
                <label className={labelClass}>Qualification</label>
                <input className={inputClass} {...register('fatherQualification')} />
              </div>
              <div className="sm:col-span-3">
                <label className={labelClass}>Area of Contribution</label>
                <input className={inputClass} {...register('fatherContribution')} />
              </div>
            </div>
          </div>

          {/* Mother */}
          <div>
            <h3 className="text-sm font-semibold text-slate-600 mb-3">Mother / Guardian</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Full Name *</label>
                <input className={inputClass} {...register('motherName', { required: 'Required' })} />
                {errors.motherName && <p className={errClass}>{errors.motherName.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Email *</label>
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
                <label className={labelClass}>Mobile Number *</label>
                <input
                  className={inputClass}
                  {...register('motherMobile', {
                    required: 'Required',
                    pattern: { value: /^\d{10}$/, message: '10-digit number' },
                  })}
                />
                {errors.motherMobile && <p className={errClass}>{errors.motherMobile.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Occupation</label>
                <input className={inputClass} {...register('motherOccupation')} />
              </div>
              <div>
                <label className={labelClass}>Aadhaar Number</label>
                <input className={inputClass} {...register('motherAadhaar')} />
              </div>
              <div>
                <label className={labelClass}>Qualification</label>
                <input className={inputClass} {...register('motherQualification')} />
              </div>
              <div className="sm:col-span-3">
                <label className={labelClass}>Area of Contribution</label>
                <input className={inputClass} {...register('motherContribution')} />
              </div>
            </div>
          </div>

          {/* Additional */}
          <div>
            <h3 className="text-sm font-semibold text-slate-600 mb-3">Additional Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Other Area of Interest</label>
                <input className={inputClass} {...register('otherInterest')} />
              </div>
              <div>
                <label className={labelClass}>Emergency Contact</label>
                <input className={inputClass} {...register('emergencyContact')} />
              </div>
              <div>
                <label className={labelClass}>Relationship</label>
                <input className={inputClass} {...register('emergencyRelationship')} />
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

export default ParentDetails