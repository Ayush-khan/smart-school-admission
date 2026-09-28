import { useForm, useFieldArray } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useState } from 'react'
import ClassLayout from '../layouts/ClassLayout'
import { saveApplicationSection, getApplicationData } from '../utils/applicationData'
import ApplicationStepperLayout from '../layouts/ApplicationStepperLayout'

function ClassSiblingDetails() {
  const navigate = useNavigate()
  const { classId } = useParams()
  const savedData = getApplicationData(classId)
  const [hasSibling, setHasSibling] = useState(savedData.siblings?.hasSibling || false)

  const { register, control, handleSubmit } = useForm({
    defaultValues: {
      siblings: savedData.siblings?.list || [
        { name: '', className: '', section: '', admissionNumber: '', relationship: '' },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'siblings' })

  const inputClass =
    'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1'

    const onSubmit = (data) => {
    saveApplicationSection(classId, 'siblings', { hasSibling, list: hasSibling ? data.siblings : [] })
    toast.success('Sibling details saved')
    navigate(`/class/${classId}/application/academic`)
  }

  return (
    <ClassLayout>
      <ApplicationStepperLayout currentStep={4}>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-center text-teal-700 font-semibold mb-6 border-b border-slate-200 pb-3">
            👨‍👩‍👧 Sibling Information
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700">Sibling:</label>
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={hasSibling}
                onChange={(e) => setHasSibling(e.target.checked)}
              />
              <span className="text-sm text-slate-500">
                (If sibling is in the same school and of the same parent)
              </span>
            </div>

            {hasSibling && (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-sm font-semibold text-slate-700">Sibling {index + 1}</p>
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
                        <label className={labelClass}>Sibling Name</label>
                        <input className={inputClass} {...register(`siblings.${index}.name`)} />
                      </div>
                      <div>
                        <label className={labelClass}>Class</label>
                        <input className={inputClass} {...register(`siblings.${index}.className`)} />
                      </div>
                      <div>
                        <label className={labelClass}>Section</label>
                        <input className={inputClass} {...register(`siblings.${index}.section`)} />
                      </div>
                      <div>
                        <label className={labelClass}>Admission Number</label>
                        <input className={inputClass} {...register(`siblings.${index}.admissionNumber`)} />
                      </div>
                      <div>
                        <label className={labelClass}>Relationship</label>
                        <input className={inputClass} {...register(`siblings.${index}.relationship`)} />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    append({ name: '', className: '', section: '', admissionNumber: '', relationship: '' })
                  }
                  className="text-sm text-blue-700 font-medium hover:underline"
                >
                  + Add Sibling
                </button>
              </div>
            )}

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

export default ClassSiblingDetails