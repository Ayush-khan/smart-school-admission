import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import ApplicationLayout from '../layouts/ApplicationLayout'

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  dob: z.date({ required_error: 'Date of birth is required' }),
  birthPlace: z.string().optional(),
  gender: z.string().min(1, 'Gender is required'),
  religion: z.string().optional(),
  caste: z.string().optional(),
  subCaste: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  motherTongue: z.string().optional(),
  academicYear: z.string().min(1, 'Academic year is required'),
  applyingForClass: z.string().min(1, 'Class is required'),
  shift: z.string().optional(),
  previousSchool: z.string().optional(),
  currentClass: z.string().optional(),
})

function FieldError({ message }) {
  if (!message) return null
  return <p className="text-xs text-red-600 mt-1">{message}</p>
}

function StudentDetails() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = (data) => {
    console.log('Student Details:', data)
    navigate('/application/address')
  }

  const inputClass =
    'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1'

  return (
    <ApplicationLayout currentStep={1}>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">Student Details</h2>
        <p className="text-sm text-slate-500 mb-6">Enter the student's personal and admission information.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-600 mb-3">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>First Name *</label>
                <input className={inputClass} {...register('firstName')} />
                <FieldError message={errors.firstName?.message} />
              </div>
              <div>
                <label className={labelClass}>Middle Name</label>
                <input className={inputClass} {...register('middleName')} />
              </div>
              <div>
                <label className={labelClass}>Last Name *</label>
                <input className={inputClass} {...register('lastName')} />
                <FieldError message={errors.lastName?.message} />
              </div>

              <div>
                <label className={labelClass}>Date of Birth *</label>
                <Controller
                  control={control}
                  name="dob"
                  render={({ field }) => (
                    <DatePicker
                      className={inputClass}
                      placeholderText="Select date"
                      selected={field.value}
                      onChange={field.onChange}
                      dateFormat="dd/MM/yyyy"
                      maxDate={new Date()}
                    />
                  )}
                />
                <FieldError message={errors.dob?.message} />
              </div>
              <div>
                <label className={labelClass}>Birth Place</label>
                <input className={inputClass} {...register('birthPlace')} />
              </div>
              <div>
                <label className={labelClass}>Gender *</label>
                <select className={inputClass} {...register('gender')}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <FieldError message={errors.gender?.message} />
              </div>

              <div>
                <label className={labelClass}>Religion</label>
                <input className={inputClass} {...register('religion')} />
              </div>
              <div>
                <label className={labelClass}>Caste</label>
                <input className={inputClass} {...register('caste')} />
              </div>
              <div>
                <label className={labelClass}>Sub-Caste</label>
                <input className={inputClass} {...register('subCaste')} />
              </div>

              <div>
                <label className={labelClass}>Category *</label>
                <select className={inputClass} {...register('category')}>
                  <option value="">Select</option>
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="Other">Other</option>
                </select>
                <FieldError message={errors.category?.message} />
              </div>
              <div>
                <label className={labelClass}>Mother Tongue</label>
                <input className={inputClass} {...register('motherTongue')} />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-600 mb-3">Admission Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Academic Year *</label>
                <input className={inputClass} placeholder="2026-2027" {...register('academicYear')} />
                <FieldError message={errors.academicYear?.message} />
              </div>
              <div>
                <label className={labelClass}>Applying For Class *</label>
                <select className={inputClass} {...register('applyingForClass')}>
                  <option value="">Select</option>
                  <option value="Nursery">Nursery</option>
                  <option value="LKG">LKG</option>
                  <option value="UKG">UKG</option>
                  <option value="Class 1">Class 1</option>
                  <option value="Class 2">Class 2</option>
                </select>
                <FieldError message={errors.applyingForClass?.message} />
              </div>
              <div>
                <label className={labelClass}>Shift</label>
                <select className={inputClass} {...register('shift')}>
                  <option value="">Select</option>
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Previous School</label>
                <input className={inputClass} {...register('previousSchool')} />
              </div>
              <div>
                <label className={labelClass}>Current Class</label>
                <input className={inputClass} {...register('currentClass')} />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              className="bg-navy text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-navy-light"
            >
              Save & Continue
            </button>
          </div>
        </form>
      </div>
    </ApplicationLayout>
  )
}

export default StudentDetails