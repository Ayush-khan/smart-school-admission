import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import ClassLayout from '../layouts/ClassLayout'
import { getInstructions } from '../services/applicationService'
import { getErrorMessage } from '../services/apiHelpers'

// ---------------------------------------------------------------------------
// The guide describes the response only as "JSON containing title, dates,
// documents, age criteria, installments, notes, etc." with no exact field
// names. This adapter maps whatever the backend actually sends into the shape
// this page already renders, trying a few likely key spellings and falling
// back to sane empty defaults so the page never crashes on an unexpected
// shape. Once you can see a real response payload, tighten this up to match
// it exactly (and delete the fallbacks you no longer need).
// ---------------------------------------------------------------------------
function normalizeInstructions(raw, classId) {
  const d = raw?.data ?? raw ?? {}
  const ageCriteria = Array.isArray(d.age_criteria)
    ? d.age_criteria.map((item) => item.description).filter(Boolean).join(' ')
    : d.ageCriteria ?? d.age_criteria ?? ''
  const installments = d.feeStructure?.installments ?? d.fee_structure?.installments ?? d.installments ?? []
  return {
    label: d.label ?? d.class_name ?? d.className ?? classId,
    admissionTitle: d.admissionTitle ?? d.admission_title ?? d.title ?? '',
    subtitle: d.subtitle ?? '',
    procedureNote: d.procedureNote ?? d.procedure_note ?? d.procedure ?? d.instructions?.map((item) => item.instruction) ?? [],
    importantDates:
      d.importantDates ??
      d.dates ??
      (Array.isArray(d.important_dates)
        ? d.important_dates.map((item) => ({ date: item.event_date, time: item.event_time, description: item.description }))
        : []),
    requiredDocuments:
      d.requiredDocuments ??
      d.documents ??
      (Array.isArray(d.required_documents)
        ? d.required_documents.map((item) => ({ title: item.document_title, description: item.description }))
        : []),
    ageCriteria,
    feeStructure: {
      totalFee: Number(d.feeStructure?.totalFee ?? d.fee_structure?.total_annual_fee ?? d.total_fee ?? 0),
      installments: installments.flatMap((item) => {
        if (item.label || item.amount) return [{ label: item.label, amount: Number(item.amount), note: item.note }]
        return [
          { label: 'First Installment', amount: Number(item.first_installment), note: item.payment_instructions },
          { label: 'Second Installment', amount: Number(item.second_installment), note: item.payment_instructions },
          { label: 'Third Installment', amount: Number(item.third_installment), note: item.payment_instructions },
        ].filter((installment) => installment.amount > 0)
      }),
    },
    importantNotes:
      d.importantNotes ??
      d.important_notes ??
      d.notes?.map((item) => ({ title: item.note_title, text: item.note })) ??
      [],
    contact: {
      emails: d.contact?.emails ?? d.contact_emails ?? [],
      phones: d.contact?.phones ?? d.contact_phones ?? [],
      hours: d.contact?.hours ?? d.contact_hours ?? '',
      principal: d.contact?.principal ?? d.principal ?? d.final_sections?.principal_name ?? '',
    },
  }
}

function ClassInstructions() {
  const { classId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [classData, setClassData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setNotFound(false)
      try {
        const academicYr = location.state?.academicYr ?? '2026-2027'
        const raw = await getInstructions(classId, academicYr)
        if (!cancelled) setClassData(normalizeInstructions(raw, classId))
      } catch (err) {
        if (!cancelled) {
          if (err?.response?.status === 404) {
            setNotFound(true)
          } else {
            toast.error(getErrorMessage(err, 'Could not load admission instructions.'))
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [classId, location.state?.academicYr])

  if (loading) {
    return (
      <ClassLayout>
        <p className="text-center text-slate-500 py-10">Loading instructions...</p>
      </ClassLayout>
    )
  }

  if (notFound || !classData) {
    return (
      <ClassLayout>
        <p className="text-center text-slate-600 py-10">Class not found.</p>
      </ClassLayout>
    )
  }

  return (
    <ClassLayout>
      <div className="space-y-6">
        <div className="bg-teal-600 text-white text-sm px-4 py-3 rounded-lg space-y-1">
          <p className="font-semibold">{classData.admissionTitle}</p>
          {classData.subtitle && <p className="text-teal-50 text-xs">{classData.subtitle}</p>}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-bold text-slate-800 mb-3 underline text-center">
            Details, Instructions and Procedure for {classData.label} Admissions 2026-2027
          </h2>
          <ul className="list-disc list-outside pl-5 space-y-2 text-sm text-slate-700">
            {classData.procedureNote.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>

        <div>
          <div className="bg-teal-600 text-white text-sm font-semibold px-4 py-2 rounded-t-lg text-center">
            Important Dates & Deadlines
          </div>
          <div className="bg-white rounded-b-lg shadow-sm overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-200 text-slate-700">
                  <th className="py-2 px-4">Date</th>
                  <th className="py-2 px-4">Time</th>
                  <th className="py-2 px-4">Description</th>
                </tr>
              </thead>
              <tbody>
                {classData.importantDates.map((item, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 px-4 text-slate-700 font-medium">{item.date}</td>
                    <td className="py-2 px-4 text-slate-600">{item.time}</td>
                    <td className="py-2 px-4 text-slate-700">{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="bg-teal-600 text-white text-sm font-semibold px-4 py-2 rounded-t-lg">
            Documents Required to be Uploaded on the Online Portal
          </div>
          <div className="bg-white rounded-b-lg shadow-sm p-6 space-y-3">
            {classData.requiredDocuments.map((doc, i) => (
              <div key={i}>
                <p className="text-sm font-semibold text-slate-800 underline">
                  {i + 1}. {doc.title}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">{doc.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-indigo-900">Age Criteria</p>
          <p className="text-sm text-indigo-700">{classData.ageCriteria}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-3 underline">Fee Structure</h3>
          <p className="text-sm text-slate-700 mb-1">
            Total fee for the entire year — <span className="font-semibold">Rs. {classData.feeStructure.totalFee.toLocaleString()}/-</span>
          </p>
          <p className="text-sm text-slate-700 mb-4">
            This total fee can be paid in three installments, or in full as a{' '}
            <span className="font-semibold">one-time payment of Rs. {classData.feeStructure.totalFee.toLocaleString()}/-</span> during the admission itself.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {classData.feeStructure.installments.map((inst, i) => {
              const colors = ['bg-orange-100', 'bg-green-100', 'bg-purple-100']
              return (
                <div key={i} className={`${colors[i % 3]} rounded-lg p-4`}>
                  <p className="text-xs font-bold text-slate-700 underline">{inst.label}</p>
                  <p className="text-lg font-bold text-slate-800 mt-1">Rs. {inst.amount.toLocaleString()}/-</p>
                  <p className="text-xs text-slate-600 mt-1">{inst.note}</p>
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <div className="bg-teal-600 text-white text-sm font-semibold px-4 py-3 rounded-t-lg">
            Important Considerations to be Noted:
          </div>
          <div className="bg-gradient-to-b from-indigo-50 to-white rounded-b-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-200">
              <span className="bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-md">NOTE</span>
              <div>
                <p className="text-sm font-bold text-slate-800">Important Admission Notes</p>
                <p className="text-xs text-slate-500">Read carefully — limited seats & final decisions by the school management.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {classData.importantNotes.map((note, i) => {
                const colors = ['#F87171', '#FBBF24', '#34D399', '#60A5FA', '#C084FC', '#22D3EE', '#F472B6', '#A3E635']
                return (
                  <div key={i} className="flex gap-3">
                    <div
                      className="w-8 h-8 rounded-lg text-white text-sm font-bold flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: colors[i % colors.length] }}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{note.title}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{note.text}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-teal-600 text-white text-sm font-semibold px-4 py-2 rounded-t-lg">
            Contact Details
          </div>
          <div className="bg-white rounded-b-lg shadow-sm p-6 text-sm text-slate-700 space-y-1">
            <p>In case of any query, please mail to:</p>
            {classData.contact.emails.map((email) => (
              <p key={email} className="text-blue-700">{email}</p>
            ))}
            <p className="pt-2">Contact on: {classData.contact.phones.join(' / ')}</p>
            <p>{classData.contact.hours}</p>
            <p className="pt-3 font-semibold text-slate-800 text-center">{classData.contact.principal}</p>
            <p className="text-xs text-center text-slate-500 mb-4">Principal</p>
            <div className="text-center">
              <button
                onClick={() => navigate(`/class/${classId}/application/student`)}
                className="bg-navy text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-navy-light"
              >
                → Proceed to Application Form
              </button>
            </div>
          </div>
        </div>
      </div>
    </ClassLayout>
  )
}

export default ClassInstructions
