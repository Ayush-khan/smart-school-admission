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

function ClassReview() {
  const navigate = useNavigate()
  const { classId } = useParams()
  const data = getApplicationData(classId)

  const student = data.student || {}
  const address = data.address || {}
  const parents = data.parents || {}
  const siblings = data.siblings || {}
  const academic = data.academic || []
  const additional = data.additional || {}
  const documents = data.documents || {}

  const base = `/class/${classId}/application`

  return (
    <ClassLayout>
      <ApplicationStepperLayout currentStep={8}>
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
                <Field label="Father Email" value={parents.fatherEmail} />
                <Field label="Father Mobile" value={parents.fatherMobile} />
                <Field label="Father Occupation" value={parents.fatherOccupation} />
                <Field label="Mother's Name" value={parents.motherName} />
                <Field label="Mother Email" value={parents.motherEmail} />
                <Field label="Mother Mobile" value={parents.motherMobile} />
                <Field label="Mother Occupation" value={parents.motherOccupation} />
              </div>
            </ReviewSection>

            <ReviewSection title="Sibling Information" editPath={`${base}/siblings`} navigate={navigate}>
              {siblings.hasSibling && siblings.list?.length > 0 ? (
                <div className="space-y-2">
                  {siblings.list.map((s, i) => (
                    <div key={i} className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-slate-100 pb-2 last:border-0">
                      <Field label="Name" value={s.name} />
                      <Field label="Class" value={s.className} />
                      <Field label="Section" value={s.section} />
                      <Field label="Relationship" value={s.relationship} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No sibling in this school.</p>
              )}
            </ReviewSection>

            <ReviewSection title="Academic Details" editPath={`${base}/academic`} navigate={navigate}>
              {academic.length > 0 ? (
                <div className="space-y-2">
                  {academic.map((rec, i) => (
                    <div key={i} className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-slate-100 pb-2 last:border-0">
                      <Field label="Previous School" value={rec.schoolName} />
                      <Field label="Board" value={rec.board} />
                      <Field label="Previous Class" value={rec.previousClass} />
                      <Field label="Percentage" value={rec.percentage} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No academic records added.</p>
              )}
            </ReviewSection>

            <ReviewSection title="Additional Information" editPath={`${base}/additional`} navigate={navigate}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Achievements" value={additional.achievements} />
                <Field label="Extracurricular Activities" value={additional.extracurricular} />
                <Field label="Sports" value={additional.sports} />
                <Field label="Areas of Interest" value={additional.areasOfInterest} />
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
              className="bg-blue-900 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-blue-800"
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