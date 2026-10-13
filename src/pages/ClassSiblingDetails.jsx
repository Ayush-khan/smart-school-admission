import { useForm, useFieldArray } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useState } from 'react'
import ClassLayout from '../layouts/ClassLayout'
import { saveApplicationSection, getApplicationData } from '../utils/applicationData'
import ApplicationStepperLayout from '../layouts/ApplicationStepperLayout'
import { nameRules } from '../utils/validators'
import { saveAdmissionSection as saveSiblingToApi } from '../utils/saveAdmissionSection'
import { getErrorMessage } from '../services/apiHelpers'

function ClassSiblingDetails() {
  const navigate = useNavigate()
  const { classId } = useParams()
  const [saving, setSaving] = useState(false)
  const savedData = getApplicationData(classId)
  const [hasSibling, setHasSibling] = useState(savedData.siblings?.hasSibling || false)

  const { register, control, handleSubmit, formState: { errors } } = useForm({
    mode: 'onChange',
    defaultValues: {
      siblings: [
        {
          name: savedData.siblings?.list?.[0]?.name || '',
          className: savedData.siblings?.list?.[0]?.className || '',
          section: savedData.siblings?.list?.[0]?.section || '',
          admissionNumber: savedData.siblings?.list?.[0]?.admissionNumber || '',
          relationship: savedData.siblings?.list?.[0]?.relationship || '',
          siblingClassId: savedData.siblings?.list?.[0]?.siblingClassId
            ?? savedData.siblings?.list?.[0]?.classId
            ?? '',
          siblingStudentId: savedData.siblings?.list?.[0]?.siblingStudentId
            ?? savedData.siblings?.list?.[0]?.studentId
            ?? savedData.siblings?.list?.[0]?.admissionNumber
            ?? '',
        },
      ],
    },
  })

  const { fields } = useFieldArray({ control, name: 'siblings' })

  const inputClass =
    'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1'
  const reqStar = <span className="text-red-500">*</span>
  const errClass = 'text-xs text-red-600 mt-1'
  const inputCls = (err) => (err ? `${inputClass} !border-red-500` : inputClass)

  const onSubmit = async (data) => {
    const sibling = data.siblings[0]
    const savedSiblings = {
      hasSibling,
      list: hasSibling ? [sibling] : [],
    }
    setSaving(true)
    try {
      await saveSiblingToApi(classId, {
        sibling: hasSibling ? 'Yes' : 'No',
        sibling_class_id: hasSibling ? sibling.siblingClassId : '',
        sibling_student_id: hasSibling ? sibling.siblingStudentId : '',
        sibling_name: hasSibling ? sibling.name : '',
        sibling_class: hasSibling ? sibling.className : '',
        sibling_section: hasSibling ? sibling.section : '',
        sibling_admission_number: hasSibling ? sibling.admissionNumber : '',
        sibling_relationship: hasSibling ? sibling.relationship : '',
      })
      saveApplicationSection(classId, 'siblings', savedSiblings)
      toast.success('Sibling details saved')
      navigate(`/class/${classId}/application/academic`)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not save sibling details.'))
    } finally {
      setSaving(false)
    }
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
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className={labelClass}>{reqStar} Sibling Name</label>
                        <input
                          className={inputCls(errors.siblings?.[index]?.name)}
                          maxLength={100}
                          {...register(`siblings.${index}.name`, nameRules("sibling's name", true))}
                        />
                        {errors.siblings?.[index]?.name && <p className={errClass}>{errors.siblings[index].name.message}</p>}
                      </div>
                      <div>
                        <label className={labelClass}>{reqStar} Class</label>
                        <input
                          className={inputCls(errors.siblings?.[index]?.className)}
                          maxLength={20}
                          {...register(`siblings.${index}.className`, {
                            required: 'Required',
                            pattern: { value: /^[A-Za-z0-9][A-Za-z0-9 -]*$/, message: 'Enter a valid class.' },
                          })}
                        />
                        {errors.siblings?.[index]?.className && <p className={errClass}>{errors.siblings[index].className.message}</p>}
                      </div>
                      <div>
                        <label className={labelClass}>Section</label>
                        <input
                          className={inputCls(errors.siblings?.[index]?.section)}
                          maxLength={3}
                          {...register(`siblings.${index}.section`, {
                            pattern: { value: /^[A-Za-z0-9]{1,3}$/, message: 'Enter a valid section (e.g. A).' },
                          })}
                        />
                        {errors.siblings?.[index]?.section && <p className={errClass}>{errors.siblings[index].section.message}</p>}
                      </div>
                      <div>
                        <label className={labelClass}>Admission Number</label>
                        <input
                          className={inputCls(errors.siblings?.[index]?.admissionNumber)}
                          inputMode="numeric"
                          maxLength={20}
                          {...register(`siblings.${index}.admissionNumber`, {
                            pattern: { value: /^\d+$/, message: 'Only numbers are allowed.' },
                            onChange: (event) => { event.target.value = event.target.value.replace(/\D/g, '') },
                          })}
                        />
                        {errors.siblings?.[index]?.admissionNumber && <p className={errClass}>{errors.siblings[index].admissionNumber.message}</p>}
                      </div>
                      <div>
                        <label className={labelClass}>{reqStar} Relationship</label>
                        <input
                          className={inputCls(errors.siblings?.[index]?.relationship)}
                          maxLength={30}
                          {...register(`siblings.${index}.relationship`, nameRules('relationship', true))}
                        />
                        {errors.siblings?.[index]?.relationship && <p className={errClass}>{errors.siblings[index].relationship.message}</p>}
                      </div>
                      <div>
                        <label className={labelClass}>{reqStar} Sibling Class ID</label>
                        <input
                          className={inputCls(errors.siblings?.[index]?.siblingClassId)}
                          maxLength={10}
                          {...register(`siblings.${index}.siblingClassId`, {
                            required: 'Required',
                            pattern: { value: /^\d+$/, message: 'Enter a valid class ID.' },
                          })}
                        />
                        {errors.siblings?.[index]?.siblingClassId && <p className={errClass}>{errors.siblings[index].siblingClassId.message}</p>}
                      </div>
                      <div>
                        <label className={labelClass}>{reqStar} Sibling Student ID</label>
                        <input
                          className={inputCls(errors.siblings?.[index]?.siblingStudentId)}
                          inputMode="numeric"
                          maxLength={100}
                          {...register(`siblings.${index}.siblingStudentId`, {
                            required: 'Required',
                            pattern: { value: /^\d+$/, message: 'Enter a valid student ID.' },
                            onChange: (e) => { e.target.value = e.target.value.replace(/\D/g, '') },
                          })}
                        />
                        {errors.siblings?.[index]?.siblingStudentId && <p className={errClass}>{errors.siblings[index].siblingStudentId.message}</p>}
                      </div>
                    </div>
                  </div>
                ))}
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

export default ClassSiblingDetails