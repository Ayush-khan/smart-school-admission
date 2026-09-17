import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getApplicationData } from '../utils/applicationData'
import { getFormId } from '../utils/formId'
import { getClasses } from '../services/applicationService'
import ClassLayout from '../layouts/ClassLayout'

function ClassConfirmation() {
  const navigate = useNavigate()
  const { classId } = useParams()
  const [classData, setClassData] = useState(null)
  const [loadingClass, setLoadingClass] = useState(true)
  const appData = getApplicationData(classId)
  const formId = getFormId(classId)

  useEffect(() => {
    getClasses()
      .then((result) => {
        const selected = (result.data ?? result).find((item) => String(item.class_id ?? item.id) === String(classId))
        if (selected) setClassData({ label: selected.label ?? selected.class_name ?? selected.name })
      })
      .finally(() => setLoadingClass(false))
  }, [classId])

  const student = appData.student || {}
  const studentName = [student.firstName, student.lastName].filter(Boolean).join(' ') || '—'
  const submissionDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

  if (loadingClass) return <ClassLayout><p className="text-center text-slate-500 py-10">Loading class details...</p></ClassLayout>
  if (!classData) return <ClassLayout><p className="text-center text-slate-600 py-10">Class not found.</p></ClassLayout>

  return (
    <ClassLayout>
      <div className="bg-white rounded-xl shadow-sm p-8 max-w-xl mx-auto text-center">
        <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
          ✓
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-1">Application Submitted Successfully</h2>
        <p className="text-sm text-slate-500 mb-6">
          Thank you for applying to Evolvu Smart School. Here's a summary of your submission.
        </p>

        <div className="bg-slate-50 rounded-lg p-4 mb-6">
          <p className="text-xs text-slate-500">Application Number</p>
          <p className="text-lg font-bold text-blue-900">{formId}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-left mb-8">
          <div>
            <p className="text-slate-500">Submission Date</p>
            <p className="font-semibold text-slate-800">{submissionDate}</p>
          </div>
          <div>
            <p className="text-slate-500">Student Name</p>
            <p className="font-semibold text-slate-800">{studentName}</p>
          </div>
          <div>
            <p className="text-slate-500">Class</p>
            <p className="font-semibold text-slate-800">{classData.label}</p>
          </div>
          <div>
            <p className="text-slate-500">Payment Status</p>
            <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              Completed
            </span>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left mb-8">
          <p className="text-sm font-semibold text-amber-900 mb-1">Next Steps</p>
          <ul className="text-xs text-amber-800 list-disc list-inside space-y-1">
            <li>Your application will now be reviewed and documents verified.</li>
            <li>Selected candidates will be announced on the dates listed in the Instructions tab.</li>
            <li>Keep your Application Number handy for any future reference.</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={() => navigate(`/class/${classId}/application/review`)}
            className="bg-slate-100 text-slate-700 text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-slate-200"
          >
            View Application
          </button>
          <button
            onClick={() => navigate(`/class/${classId}/application/receipt`)}
            className="bg-slate-100 text-slate-700 text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-slate-200"
          >
            Download Receipt
          </button>
          <button
            onClick={() => navigate(`/class/${classId}/status`)}
            className="bg-blue-900 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-blue-800"
          >
            Track Application
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-slate-100 text-slate-700 text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-slate-200"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </ClassLayout>
  )
}

export default ClassConfirmation