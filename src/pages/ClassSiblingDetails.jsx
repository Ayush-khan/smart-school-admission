import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import ClassLayout from '../layouts/ClassLayout'
import { saveApplicationSection, getApplicationData } from '../utils/applicationData'
import ApplicationStepperLayout from '../layouts/ApplicationStepperLayout'
import { saveAdmissionSection as saveSiblingToApi } from '../utils/saveAdmissionSection'
import { getClassesSectionsOfActiveAcademicYear } from '../services/applicationService'
import { getErrorMessage } from '../services/apiHelpers'
import { nameRules } from '../utils/validators'

function getClassOptions(response) {
  const payload = response?.data ?? response
  const classes = Array.isArray(payload) ? payload : payload?.data ?? payload?.classes
  if (!Array.isArray(classes)) {
    throw new Error('The classes endpoint returned an unexpected response.')
  }

  return classes.flatMap((item) => {
    const classId = item.class_id ?? item.id
    const className = item.class_name ?? item.className ?? item.name ?? item.label
    if (classId === undefined || classId === null || !className) {
      throw new Error('The classes endpoint returned a class without an ID or name.')
    }

    if (Array.isArray(item.sections) && item.sections.length > 0) {
      return item.sections.map((section) => {
        const sectionId = section.section_id ?? section.id
        const sectionName = section.section_name ?? section.name ?? section.label
        if (sectionId === undefined || sectionId === null || !sectionName) {
          throw new Error('The classes endpoint returned a section without an ID or name.')
        }
        return {
          value: `${classId}:${sectionId}`,
          classId: String(classId),
          sectionId: String(sectionId),
          label: `${className} ${sectionName}`,
        }
      })
    }

    return [{
      value: String(classId),
      classId: String(classId),
      sectionId: '',
      label: String(className),
    }]
  })
}

function ClassDropdown({ value, onChange, options, disabled, hasError }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const selectedOption = options.find((option) => option.value === value)

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  return (
    <div className="relative w-full" ref={rootRef}>
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => setOpen((isOpen) => !isOpen)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false)
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setOpen(true)
          }
        }}
        className={`w-full min-h-[42px] border rounded-lg px-3 py-2 text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400 ${
          hasError ? 'border-red-500' : 'border-slate-300'
        }`}
      >
        <span className={selectedOption ? 'text-slate-800' : 'text-slate-400'}>
          {selectedOption?.label || (disabled ? 'Loading classes...' : 'Select class')}
        </span>
        <span className="ml-3 text-slate-500" aria-hidden="true">{open ? '▲' : '▼'}</span>
      </button>
      {open && !disabled && (
        <div
          role="listbox"
          aria-label="Classes and sections"
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          {options.map((option) => (
            <button
              type="button"
              role="option"
              aria-selected={option.value === value}
              key={option.value}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
              className={`block w-full px-3 py-2 text-left text-sm hover:bg-slate-100 ${
                option.value === value ? 'bg-blue-50 text-blue-800' : 'text-slate-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ClassSiblingDetails() {
  const navigate = useNavigate()
  const { classId } = useParams()
  const [saving, setSaving] = useState(false)
  const [loadingClasses, setLoadingClasses] = useState(true)
  const [classes, setClasses] = useState([])
  const savedData = getApplicationData(classId)
  const savedSibling = savedData.siblings?.list?.[0] || {}
  const [hasSibling, setHasSibling] = useState(Boolean(savedData.siblings?.hasSibling))

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: true,
    defaultValues: {
      siblingClassId: savedSibling.classSelection ?? savedSibling.siblingClassId ?? savedSibling.classId ?? '',
      studentName: savedSibling.studentName ?? savedSibling.name ?? savedSibling.siblingStudentId ?? savedSibling.studentId ?? '',
    },
  })

  useEffect(() => {
    let cancelled = false
    getClassesSectionsOfActiveAcademicYear()
      .then((response) => {
        const options = getClassOptions(response)
        if (!cancelled) setClasses(options)
      })
      .catch((error) => {
        if (!cancelled) toast.error(getErrorMessage(error, 'Could not load classes.'))
      })
      .finally(() => {
        if (!cancelled) setLoadingClasses(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const inputClass = (error) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      error ? 'border-red-500' : 'border-slate-300'
    }`
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1'
  const reqStar = <span className="text-red-500">*</span>
  const errClass = 'text-xs text-red-600 mt-1'

  const onSubmit = async (data) => {
    const selectedClass = classes.find((item) => item.value === String(data.siblingClassId))
    const sibling = {
      siblingClassId: hasSibling ? selectedClass?.classId || '' : '',
      classSelection: hasSibling ? data.siblingClassId : '',
      sectionId: hasSibling ? selectedClass?.sectionId || '' : '',
      className: hasSibling ? selectedClass?.label || '' : '',
      studentName: hasSibling ? data.studentName : '',
      siblingStudentId: hasSibling ? data.studentName : '',
    }
    setSaving(true)
    try {
      await saveSiblingToApi(classId, {
        sibling: hasSibling ? 'Yes' : 'No',
        sibling_class_id: hasSibling
          ? `${sibling.siblingClassId}^${sibling.sectionId}`
          : '',
        sibling_section_id: sibling.sectionId,
        sibling_student_id: sibling.siblingStudentId,
      })
      saveApplicationSection(classId, 'siblings', {
        hasSibling,
        list: hasSibling ? [sibling] : [],
      })
      toast.success('Sibling details saved')
      navigate(`/class/${classId}/application/additional`)
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
                onChange={(event) => setHasSibling(event.target.checked)}
              />
              <span className="text-sm text-slate-500">
                (If sibling is in the same school and of the same parent)
              </span>
            </div>

            {hasSibling && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{reqStar} Class</label>
                  <Controller
                    name="siblingClassId"
                    control={control}
                    rules={{ required: 'Please select a class.' }}
                    render={({ field }) => (
                      <ClassDropdown
                        value={field.value}
                        onChange={field.onChange}
                        options={classes}
                        disabled={loadingClasses || classes.length === 0}
                        hasError={Boolean(errors.siblingClassId)}
                      />
                    )}
                  />
                  {errors.siblingClassId && <p className={errClass}>{errors.siblingClassId.message}</p>}
                  {!loadingClasses && classes.length === 0 && (
                    <p className={errClass}>No classes are available for the active academic year.</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>{reqStar} Student Name</label>
                  <input
                    className={inputClass(errors.studentName)}
                    maxLength={100}
                    {...register('studentName', nameRules("sibling's name", true))}
                  />
                  {errors.studentName && <p className={errClass}>{errors.studentName.message}</p>}
                </div>
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
                disabled={saving || (hasSibling && loadingClasses)}
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
