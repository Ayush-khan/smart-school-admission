import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import ClassLayout from '../layouts/ClassLayout'
import InfoNote from '../components/InfoNote'
import { saveApplicationSection, getApplicationData } from '../utils/applicationData'
import ApplicationStepperLayout from '../layouts/ApplicationStepperLayout'
import { saveAdmissionSection as saveToApi } from '../utils/saveAdmissionSection'
import { getClassesSectionsOfActiveAcademicYear, getStudentParentInformation } from '../services/applicationService'
import { getErrorMessage } from '../services/apiHelpers'
import { nameRules, occupationRules, mobileRules } from '../utils/validators'
import { mapParentFromApi, lockedFieldsFromApi, PARENT_LOOKUP_FIELDS } from '../utils/parentFromSibling'

const CONTRIBUTION_OPTIONS = ['Cultural', 'Medical', 'Media', 'Academic']

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

function MultiSelect({ value = [], onChange, options, placeholder, className }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const close = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const toggle = (option) => {
    onChange(value.includes(option) ? value.filter((item) => item !== option) : [...value, option])
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        className={`${className} flex items-center justify-between bg-white text-left min-h-[38px]`}
      >
        <span className={value.length ? 'text-slate-800' : 'text-slate-400'}>
          {value.length ? value.map((item) => item.toUpperCase()).join(', ') : placeholder}
        </span>
        <span className="text-slate-400 text-xs ml-2">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-slate-300 rounded-lg shadow-lg py-1">
          {options.map((option) => (
            <label key={option} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer">
              <input type="checkbox" checked={value.includes(option)} onChange={() => toggle(option)} />
              {option.toUpperCase()}
            </label>
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
  const [browsing, setBrowsing] = useState(false)
  const [loadingClasses, setLoadingClasses] = useState(true)
  const [classes, setClasses] = useState([])
  const savedData = getApplicationData(classId)
  const savedSibling = savedData.siblings?.list?.[0] || {}
  const [hasSibling, setHasSibling] = useState(Boolean(savedData.siblings?.hasSibling))

  const savedClassSelection = savedSibling.classSelection ?? savedSibling.siblingClassId ?? savedSibling.classId ?? ''
  const savedStudentName = savedSibling.studentName ?? savedSibling.name ?? savedSibling.siblingStudentId ?? savedSibling.studentId ?? ''

  // Result of the last successful Browse: the sibling it was done for and what the API returned.
  // Fields the API filled are read-only for as long as this is set.
  const [lookup, setLookup] = useState(
    savedData.siblings?.hasSibling && savedSibling.parentInfo?.parent
      ? { classValue: String(savedClassSelection), name: String(savedStudentName).trim(), info: savedSibling.parentInfo }
      : null,
  )
  const [lookupError, setLookupError] = useState('')
  // Class+name of the last Browse attempt. Used so Enter runs Browse once per sibling entry,
  // and a second Enter goes on to Save & Continue (even if Browse found nothing).
  const lastBrowseKey = useRef(
    lookup ? `${lookup.classValue}|${lookup.name}` : '',
  )
  const locked = hasSibling && lookup ? lockedFieldsFromApi(lookup.info?.parent) : {}

  const savedParents = { ...(savedData.parents || {}), ...locked }
  const savedContributionAreas = savedParents.contributionAreas
  const defaultContributionAreas = Array.isArray(savedContributionAreas)
    ? savedContributionAreas
    : typeof savedContributionAreas === 'string'
      ? savedContributionAreas.split(',').map((area) => area.trim()).filter(Boolean)
      : []

  const {
    register,
    control,
    handleSubmit,
    setValue,
    trigger,
    getValues,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: true,
    defaultValues: {
      ...savedParents,
      contributionAreas: defaultContributionAreas,
      siblingClassId: savedClassSelection,
      studentName: savedStudentName,
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

  // Parent details fetched for one sibling must not stay behind for another one.
  const dropLookup = () => {
    setLookup(null)
    PARENT_LOOKUP_FIELDS.forEach((field) => setValue(field, ''))
  }
  const handleSiblingEdited = ({ classValue, name }) => {
    setLookupError('')
    if (!lookup) return
    const sameClass = classValue === undefined || String(classValue) === lookup.classValue
    const sameName = name === undefined || name.trim() === lookup.name
    if (!sameClass || !sameName) dropLookup()
  }

  const handleBrowse = async () => {
    setLookupError('')
    const valid = await trigger(['siblingClassId', 'studentName'])
    if (!valid) return
    const values = getValues()
    const selectedClass = classes.find((item) => item.value === String(values.siblingClassId))
    const studentName = String(values.studentName).trim()
    lastBrowseKey.current = `${values.siblingClassId}|${studentName}`

    setBrowsing(true)
    try {
      const result = await getStudentParentInformation({
        classId: selectedClass?.classId,
        sectionId: selectedClass?.sectionId,
        studentName,
      })
      if (result?.success === false) {
        throw new Error(result.message || 'Could not find this student in the selected class.')
      }
      const found = result?.data ?? result
      if (!found?.parent || typeof found.parent !== 'object') {
        throw new Error(result?.message || 'No parent details were found for this student.')
      }
      Object.entries(mapParentFromApi(found.parent)).forEach(([field, value]) =>
        setValue(field, value, { shouldValidate: true, shouldDirty: true }),
      )
      setLookup({ classValue: String(values.siblingClassId), name: studentName, info: found })
      toast.success('Parent details fetched')
    } catch (error) {
      setLookup(null)
      setLookupError(getErrorMessage(error, 'Could not fetch the student details.'))
    } finally {
      setBrowsing(false)
    }
  }

  // Enter: 1st press runs Browse (sibling ticked + class and name filled), 2nd press submits.
  const handleFormKeyDown = (event) => {
    if (event.key !== 'Enter') return
    if (event.target.tagName === 'BUTTON') return // buttons keep their normal Enter behaviour
    if (!hasSibling) return

    const { siblingClassId, studentName } = getValues()
    const name = String(studentName || '').trim()
    if (!siblingClassId || !name) return

    if (browsing) {
      event.preventDefault() // ignore Enter while the lookup is running
      return
    }
    const alreadyBrowsed = Boolean(lookup) || lastBrowseKey.current === `${siblingClassId}|${name}`
    if (!alreadyBrowsed) {
      event.preventDefault()
      handleBrowse()
    }
  }

  const siblingInputClass = (error) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      error ? 'border-red-500' : 'border-slate-300'
    }`
  const inputClass = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1'
  const lockedClass = ' bg-slate-100 text-slate-500 cursor-not-allowed'
  const lockProps = (field) => (locked[field] ? { readOnly: true, title: 'Fetched from school records' } : {})
  const cls = (field) => `${inputClass}${locked[field] ? lockedClass : ''}`
  const reqStar = <span className="text-red-500">*</span>
  const errClass = 'text-xs text-red-600 mt-1'

  const onSubmit = async (data) => {
    // Sibling fields and parent fields live in one form; split them for saving.
    const { siblingClassId, studentName, ...parentFields } = data
    const contributionAreas = Array.isArray(parentFields.contributionAreas) ? parentFields.contributionAreas : []
    const parentData = { ...parentFields, contributionAreas }

    const selectedClass = classes.find((item) => item.value === String(siblingClassId))
    const sibling = {
      siblingClassId: hasSibling ? selectedClass?.classId || '' : '',
      classSelection: hasSibling ? siblingClassId : '',
      sectionId: hasSibling ? selectedClass?.sectionId || '' : '',
      className: hasSibling ? selectedClass?.label || '' : '',
      studentName: hasSibling ? studentName : '',
      siblingStudentId: hasSibling ? studentName : '',
    }
    if (hasSibling && lookup) sibling.parentInfo = lookup.info

    setSaving(true)
    try {
      await saveToApi(classId, {
        sibling: hasSibling ? 'Yes' : 'No',
        sibling_class_id: hasSibling ? `${sibling.siblingClassId}^${sibling.sectionId}` : '',
        sibling_section_id: sibling.sectionId,
        sibling_student_id: sibling.siblingStudentId,
        father_name: parentData.fatherName || '',
        father_mobile: parentData.fatherMobile || '',
        father_email: parentData.fatherEmail || '',
        father_occupation: parentData.fatherOccupation || '',
        father_qualification: parentData.fatherQualification || '',
        father_aadhaar: parentData.fatherAadhaar || '',
        mother_name: parentData.motherName || '',
        mother_mobile: parentData.motherMobile || '',
        mother_email: parentData.motherEmail || '',
        mother_occupation: parentData.motherOccupation || '',
        mother_qualification: parentData.motherQualification || '',
        mother_aadhaar: parentData.motherAadhaar || '',
        area_in_which_parent_can_contribute: contributionAreas.join(', '),
        other_area: parentData.otherAreaOfInterest || '',
        // SMS number follows the father/mother choice.
        sms_sending_phone_no:
          parentData.smsContact === 'father'
            ? parentData.fatherMobile || ''
            : parentData.smsContact === 'mother'
              ? parentData.motherMobile || ''
              : '',
      })
      saveApplicationSection(classId, 'siblings', {
        hasSibling,
        list: hasSibling ? [sibling] : [],
      })
      saveApplicationSection(classId, 'parents', parentData)
      toast.success('Sibling and parent details saved')
      navigate(`/class/${classId}/application/documents`)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not save sibling and parent details.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <ClassLayout>
      <ApplicationStepperLayout currentStep={3}>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-center text-teal-700 font-semibold mb-6 border-b border-slate-200 pb-3">
            👨‍👩‍👧 Sibling Information
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleFormKeyDown} className="space-y-6">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700">Sibling:</label>
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={hasSibling}
                onChange={(event) => {
                  setHasSibling(event.target.checked)
                  if (!event.target.checked && lookup) dropLookup()
                }}
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
                        onChange={(value) => {
                          field.onChange(value)
                          handleSiblingEdited({ classValue: value })
                        }}
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
                  <div className="flex gap-2">
                    <input
                      className={siblingInputClass(errors.studentName || lookupError)}
                      maxLength={100}
                      placeholder="Enter full name as per School Records"
                      {...register('studentName', {
                        ...nameRules("sibling's name", true),
                        onChange: (event) => handleSiblingEdited({ name: event.target.value }),
                      })}
                    />
                    <button
                      type="button"
                      onClick={handleBrowse}
                      disabled={browsing || loadingClasses}
                      className="bg-navy text-white text-sm font-medium px-4 rounded-lg hover:bg-navy-light disabled:opacity-60 whitespace-nowrap"
                    >
                      {browsing ? 'Searching...' : 'Browse'}
                    </button>
                  </div>
                  {errors.studentName && <p className={errClass}>{errors.studentName.message}</p>}
                  {lookupError && <p className={errClass}>{lookupError}</p>}
                  {!lookupError && !errors.studentName && (
                    <p className="text-xs text-slate-400 mt-1">Click Browse to fill the parent details below from school records.</p>
                  )}
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-slate-200">
              <h2 className="text-center text-teal-700 font-semibold mb-6 border-b border-slate-200 pb-3">
                👤 Parent's Information
              </h2>
              <InfoNote>
                Kindly ensure your contact details are true and correct. This number will be used for all further communication
              </InfoNote>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className={labelClass}>{reqStar} Father's Name</label>
                <input className={cls('fatherName')} {...lockProps('fatherName')} {...register('fatherName', nameRules("father's name", true))} />
                {errors.fatherName && <p className={errClass}>{errors.fatherName.message}</p>}
              </div>
              <div>
                <label className={labelClass}>{reqStar} Email Id</label>
                <input
                  className={cls('fatherEmail')}
                  {...lockProps('fatherEmail')}
                  {...register('fatherEmail', {
                    required: 'Required',
                    pattern: { value: /^[A-Za-z0-9]+([._-][A-Za-z0-9]+)*@([A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/, message: 'Invalid email' },
                  })}
                />
                {errors.fatherEmail && <p className={errClass}>{errors.fatherEmail.message}</p>}
              </div>
              <div>
                <label className={labelClass}>{reqStar} Mobile Number</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">+91</span>
                  <input className={cls('fatherMobile')} {...lockProps('fatherMobile')} {...register('fatherMobile', mobileRules(true))} />
                </div>
                {errors.fatherMobile && <p className={errClass}>{errors.fatherMobile.message}</p>}
                <label className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                  <input type="radio" value="father" {...register('smsContact', { required: 'Please select where to receive SMS' })} />
                  Set to receive SMS at this no
                </label>
              </div>
              <div>
                <label className={labelClass}>{reqStar} Father Occupation</label>
                <input className={inputClass} {...register('fatherOccupation', occupationRules('father occupation', true))} />
                {errors.fatherOccupation && <p className={errClass}>{errors.fatherOccupation.message}</p>}
              </div>

              <div>
                <label className={labelClass}>{reqStar} Mother's Name</label>
                <input className={cls('motherName')} {...lockProps('motherName')} {...register('motherName', nameRules("mother's name", true))} />
                {errors.motherName && <p className={errClass}>{errors.motherName.message}</p>}
              </div>
              <div>
                <label className={labelClass}>{reqStar} Email Id</label>
                <input
                  className={cls('motherEmail')}
                  {...lockProps('motherEmail')}
                  {...register('motherEmail', {
                    required: 'Required',
                    pattern: { value: /^[A-Za-z0-9]+([._-][A-Za-z0-9]+)*@([A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/, message: 'Invalid email' },
                  })}
                />
                {errors.motherEmail && <p className={errClass}>{errors.motherEmail.message}</p>}
              </div>
              <div>
                <label className={labelClass}>{reqStar} Mobile Number</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">+91</span>
                  <input className={cls('motherMobile')} {...lockProps('motherMobile')} {...register('motherMobile', mobileRules(true))} />
                </div>
                {errors.motherMobile && <p className={errClass}>{errors.motherMobile.message}</p>}
                <label className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                  <input type="radio" value="mother" {...register('smsContact', { required: 'Please select where to receive SMS' })} />
                  Set to receive SMS at this no
                </label>
                {errors.smsContact && <p className={errClass}>{errors.smsContact.message}</p>}
              </div>
              <div>
                <label className={labelClass}>{reqStar} Mother Occupation</label>
                <input className={inputClass} {...register('motherOccupation', occupationRules('mother occupation', true))} />
                {errors.motherOccupation && <p className={errClass}>{errors.motherOccupation.message}</p>}
              </div>

              <div>
                <label className={labelClass}>Mother Aadhaar Card No.</label>
                <input
                  className={inputClass}
                  inputMode="numeric"
                  maxLength={12}
                  {...register('motherAadhaar', {
                    pattern: { value: /^\d{12}$/, message: 'Enter a valid Aadhar No.' },
                    onChange: (event) => { event.target.value = event.target.value.replace(/\D/g, '') },
                  })}
                />
                {errors.motherAadhaar && <p className={errClass}>{errors.motherAadhaar.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Father Aadhaar Card No.</label>
                <input
                  className={inputClass}
                  inputMode="numeric"
                  maxLength={12}
                  {...register('fatherAadhaar', {
                    pattern: { value: /^\d{12}$/, message: 'Enter a valid Aadhar No.' },
                    onChange: (event) => { event.target.value = event.target.value.replace(/\D/g, '') },
                  })}
                />
                {errors.fatherAadhaar && <p className={errClass}>{errors.fatherAadhaar.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Mother Qualification</label>
                <input
                  className={inputClass}
                  maxLength={50}
                  {...register('motherQualification', {
                    pattern: {
                      value: /^[A-Za-z0-9][A-Za-z0-9 .&-]*$/,
                      message: 'Only letters, numbers, spaces and . & - are allowed',
                    },
                    validate: (value) => !/^\d+$/.test(value || '') || /^\d{1,2}$/.test(value) || 'Number can be maximum 2 digits',
                  })}
                />
                {errors.motherQualification && <p className={errClass}>{errors.motherQualification.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Father Qualification</label>
                <input
                  className={inputClass}
                  maxLength={50}
                  {...register('fatherQualification', {
                    pattern: {
                      value: /^[A-Za-z0-9][A-Za-z0-9 .&-]*$/,
                      message: 'Only letters, numbers, spaces and . & - are allowed',
                    },
                    validate: (value) => !/^\d+$/.test(value || '') || /^\d{1,2}$/.test(value) || 'Number can be maximum 2 digits',
                  })}
                />
                {errors.fatherQualification && <p className={errClass}>{errors.fatherQualification.message}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Areas in which parent can contribute</label>
                <Controller
                  name="contributionAreas"
                  control={control}
                  render={({ field }) => (
                    <MultiSelect
                      value={Array.isArray(field.value) ? field.value : []}
                      onChange={field.onChange}
                      options={CONTRIBUTION_OPTIONS}
                      placeholder="Select one or more"
                      className={inputClass}
                    />
                  )}
                />
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
