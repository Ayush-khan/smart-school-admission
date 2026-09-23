import { useForm, useFieldArray } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import ClassLayout from '../layouts/ClassLayout'
import { saveApplicationSection, getApplicationData } from '../utils/applicationData'
import toast from 'react-hot-toast'
import ApplicationStepperLayout from '../layouts/ApplicationStepperLayout'

function ClassAcademicDetails() {
  const navigate = useNavigate()
  const { classId } = useParams()

    const savedData = getApplicationData(classId)

  const { register, control, handleSubmit } = useForm({
    defaultValues: {
      records: savedData.academic || [
        { schoolName: '', board: '', previousClass: '', academicYear: '', percentage: '', tcStatus: '' },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'records' })

  const inputClass =
    'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1'

    const onSubmit = (data) => {
    saveApplicationSection(classId, 'academic', data.records)
    toast.success('Academic details saved')
    navigate(`/class/${classId}/application/additional`)
  }

  return (
    <ClassLayout>
      <ApplicationStepperLayout currentStep={5}>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-center text-teal-700 font-semibold mb-6 border-b border-slate-200 pb-3">
            📚 Academic Details
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-sm font-semibold text-slate-700">Academic Record {index + 1}</p>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-xs text-red-600 font-medium hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>Previous School Name</label>
                      <input className={inputClass} {...register(`records.${index}.schoolName`)} />
                    </div>
                    <div>
                      <label className={labelClass}>Board</label>
                      <select className={inputClass} {...register(`records.${index}.board`)}>
                        <option value="">SELECT</option>
                        <option value="CBSE">CBSE</option>
                        <option value="ICSE">ICSE</option>
                        <option value="State Board">State Board</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Previous Class</label>
                      <input className={inputClass} {...register(`records.${index}.previousClass`)} />
                    </div>
                    <div>
                      <label className={labelClass}>Academic Year</label>
                      <input className={inputClass} placeholder="2025-2026" {...register(`records.${index}.academicYear`)} />
                    </div>
                    <div>
                      <label className={labelClass}>Percentage / Grade</label>
                      <input className={inputClass} {...register(`records.${index}.percentage`)} />
                    </div>
                    <div>
                      <label className={labelClass}>Transfer Certificate Status</label>
                      <select className={inputClass} {...register(`records.${index}.tcStatus`)}>
                        <option value="">SELECT</option>
                        <option value="Submitted">Submitted</option>
                        <option value="Pending">Pending</option>
                        <option value="Not Applicable">Not Applicable</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  append({ schoolName: '', board: '', previousClass: '', academicYear: '', percentage: '', tcStatus: '' })
                }
                className="text-sm text-blue-700 font-medium hover:underline"
              >
                + Add Academic Record
              </button>
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

export default ClassAcademicDetails