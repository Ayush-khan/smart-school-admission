import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getApplicationData } from '../utils/applicationData'
import { getFormId } from '../utils/formId'
import { getClasses } from '../services/applicationService'
import ClassLayout from '../layouts/ClassLayout'

function ClassStatus() {
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

  if (loadingClass) return <ClassLayout><p className="text-center text-slate-500 py-10">Loading class details...</p></ClassLayout>
  if (!classData) return <ClassLayout><p className="text-center text-slate-600 py-10">Class not found.</p></ClassLayout>

  // Since this is a demo without a real backend, we treat reaching this page
  // (after payment) as confirmation that everything up to "Payment Completed" is done.
  const stages = [
    { label: 'Application Started', date: 'Completed', done: true },
    { label: 'Application Submitted', date: 'Completed', done: true },
    { label: 'Documents Uploaded', date: 'Completed', done: true },
    { label: 'Payment Completed', date: 'Completed', done: true },
    { label: 'Application Under Review', date: 'In Progress', done: false, current: true },
    { label: 'Documents Verified', date: 'Pending', done: false },
    { label: 'Selection Result', date: 'Pending', done: false },
    { label: 'Admission Confirmed', date: 'Pending', done: false },
  ]

  return (
    <ClassLayout>
      <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl mx-auto">
        <h2 className="text-center text-teal-700 font-semibold mb-1 border-b border-slate-200 pb-3">
          📍 Application Status
        </h2>
        <p className="text-sm text-slate-500 text-center mt-3 mb-1">
          {studentName} · {classData.label}
        </p>
        <p className="text-xs text-slate-400 text-center mb-8">Application No: {formId}</p>

        <div className="relative pl-8">
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200" />
          {stages.map((stage, i) => (
            <div key={i} className="relative pb-8 last:pb-0">
              <div
                className={`absolute -left-8 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  stage.done
                    ? 'bg-green-600 text-white'
                    : stage.current
                    ? 'bg-blue-900 text-white'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {stage.done ? '✓' : i + 1}
              </div>
              <p
                className={`text-sm font-semibold ${
                  stage.done || stage.current ? 'text-slate-800' : 'text-slate-400'
                }`}
              >
                {stage.label}
              </p>
              <p
                className={`text-xs ${
                  stage.current ? 'text-blue-700 font-medium' : 'text-slate-500'
                }`}
              >
                {stage.date}
              </p>
            </div>
          ))}
        </div>
      </div>
    </ClassLayout>
  )
}

export default ClassStatus