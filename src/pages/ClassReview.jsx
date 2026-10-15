import { useNavigate, useParams } from 'react-router-dom'
import ClassLayout from '../layouts/ClassLayout'
import ApplicationStepperLayout from '../layouts/ApplicationStepperLayout'
import { getApplicationData } from '../utils/applicationData'

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function ReviewSection({ title, editPath, navigate, children }) {
  return (
    <div className="border border-slate-200 rounded-lg p-5">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <button
          onClick={() => navigate(editPath)}
          className="text-xs text-blue-700 font-medium hover:underline"
        >
          Edit
        </button>
      </div>
      {children}
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm text-slate-800 font-medium">{value || '—'}</p>
    </div>
  )
}

function OptionalField({ label, value }) {
  if (value === undefined || value === null || String(value).trim() === '') return null
  return <Field label={label} value={Array.isArray(value) ? value.join(', ') : value} />
}

function ClassReview() {
  const navigate = useNavigate()
  const { classId } = useParams()
  const data = getApplicationData(classId)

  const student = data.student || {}
  const address = data.address || {}
  const parents = data.parents || {}
  const siblings = data.siblings || {}
  const additional = data.additional || {}
  const documents = data.documents || {}

  const base = `/class/${classId}/application`

  return (
    <ClassLayout>
      <ApplicationStepperLayout currentStep={7}>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-center text-teal-700 font-semibold mb-6 border-b border-slate-200 pb-3">
            📝 Review Your Application
          </h2>

          <div className="space-y-4">
            <ReviewSection title="Student Details" editPath={`${base}/student`} navigate={navigate}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Field label="First Name" value={student.firstName} />
                <Field label="Last Name" value={student.lastName} />
                <Field label="Date of Birth" value={student.dob} />
                <Field label="Gender" value={student.gender} />
                <Field label="Religion" value={student.religion} />
                <Field label="Category" value={student.category} />
                <Field label="Mother Tongue" value={student.motherTongue} />
                <Field label="Birth Place" value={student.birthPlace} />
                <OptionalField label="Middle Name" value={student.middleName} />
                <OptionalField label="Caste" value={student.caste} />
                <OptionalField label="Sub-caste" value={student.subCaste} />
              </div>
            </ReviewSection>

            <ReviewSection title="Address" editPath={`${base}/address`} navigate={navigate}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Field label="Present Address" value={address.presentAddress} />
                <Field label="City" value={address.presentCity} />
                <Field label="State" value={address.presentState} />
                <Field label="Pincode" value={address.presentPincode} />
                <Field label="Permanent Address" value={address.permanentAddress} />
                <Field label="Nationality" value={address.nationality} />
              </div>
            </ReviewSection>

            <ReviewSection title="Parent Information" editPath={`${base}/parents`} navigate={navigate}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Field label="Father's Name" value={parents.fatherName} />
                <Field label="Father Mobile" value={parents.fatherMobile} />
                <Field label="Mother's Name" value={parents.motherName} />
                <Field label="Mother Mobile" value={parents.motherMobile} />
                <OptionalField label="Father Occupation" value={parents.fatherOccupation} />
                <OptionalField label="Father Email" value={parents.fatherEmail} />
                <Field label="Father Aadhaar" value={parents.fatherAadhaar} />
                <Field label="Father Qualification" value={parents.fatherQualification} />
                <OptionalField label="Father Designation" value={parents.fatherDesignation} />
                <OptionalField label="Father Nature of Business" value={parents.fatherNatureOfBusiness} />
                <OptionalField label="Father Office Address" value={parents.fatherOfficeAddress} />
                <OptionalField label="Mother Occupation" value={parents.motherOccupation} />
                <OptionalField label="Mother Email" value={parents.motherEmail} />
                <Field label="Mother Aadhaar" value={parents.motherAadhaar} />
                <Field label="Mother Qualification" value={parents.motherQualification} />
                <OptionalField label="Mother Designation" value={parents.motherDesignation} />
                <OptionalField label="Mother Nature of Business" value={parents.motherNatureOfBusiness} />
                <OptionalField label="Mother Office Address" value={parents.motherOfficeAddress} />
                <Field
                  label="Areas to contribute"
                  value={Array.isArray(parents.contributionAreas) ? parents.contributionAreas.join(', ') : parents.contributionAreas}
                />
                <Field label="Other area" value={parents.otherAreaOfInterest} />
              </div>
            </ReviewSection>

            <ReviewSection title="Sibling Information" editPath={`${base}/siblings`} navigate={navigate}>
              {siblings.hasSibling && siblings.list?.length > 0 ? (
                <div className="space-y-2">
                  {siblings.list.map((s, i) => (
                    <div key={i} className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-slate-100 pb-2 last:border-0">
                      <Field label="Student Name" value={s.studentName ?? s.name ?? s.siblingStudentId} />
                      <Field label="Class" value={s.className} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No sibling in this school.</p>
              )}
            </ReviewSection>

            <ReviewSection title="Additional Information" editPath={`${base}/additional`} navigate={navigate}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <OptionalField label="Student Aadhaar Card No." value={additional.studAadhar} />
                <OptionalField label="Current School and Class" value={additional.currentSchoolClass} />
                <OptionalField label="Blood Group" value={additional.bloodGroup} />
                <OptionalField label="Achievements" value={additional.achievements} />
              </div>
            </ReviewSection>

            <ReviewSection title="Documents" editPath={`${base}/documents`} navigate={navigate}>
              {Object.keys(documents).length > 0 ? (
                <ul className="space-y-1">
                  {Object.entries(documents).map(([key, file]) => (
                    <li key={key} className="text-sm text-slate-700 flex justify-between">
                      <span>{file.name}</span>
                      <span className="text-slate-500">{formatSize(file.size)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No documents uploaded.</p>
              )}
            </ReviewSection>
          </div>

          <div className="flex justify-between gap-3 pt-6 mt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => navigate(`${base}/documents`)}
              className="bg-slate-100 text-slate-700 text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-slate-200"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => navigate(`${base}/declaration`)}
              className="bg-navy text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-navy-light"
            >
              Proceed to Declaration
            </button>
          </div>
        </div>
      </ApplicationStepperLayout>
    </ClassLayout>
  )
}

export default ClassReview