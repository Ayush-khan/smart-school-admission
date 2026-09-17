import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { saveApplicationSection, getApplicationData } from '../utils/applicationData'
import toast from 'react-hot-toast'
import ClassLayout from '../layouts/ClassLayout'
import ApplicationStepperLayout from '../layouts/ApplicationStepperLayout'

const documentList = [
  { key: 'birthCertificate', name: 'Birth Certificate', required: true },
  { key: 'studentPhoto', name: 'Student Photograph', required: true },
  { key: 'familyPhoto', name: 'Family Photograph', required: false },
  { key: 'aadhaarCard', name: 'Aadhaar Card', required: false },
  { key: 'casteCertificate', name: 'Caste Certificate', required: false },
  { key: 'previousAcademic', name: 'Previous Academic Records', required: false },
  { key: 'transferCertificate', name: 'Transfer Certificate', required: false },
  { key: 'otherDocuments', name: 'Other Documents', required: false },
]

const MAX_FILE_SIZE_KB = 220
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_KB * 1024

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function DocumentUploadCard({ doc, file, onUpload, onRemove }) {
  const inputId = `file-${doc.key}`

  const handleChange = (e) => {
    const selected = e.target.files[0]
    if (!selected) return

    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    if (!validTypes.includes(selected.type)) {
      alert('Only PDF, JPG, JPEG, or PNG files are allowed.')
      return
    }
    if (selected.size > MAX_FILE_SIZE_BYTES) {
      alert(`File size must be under ${MAX_FILE_SIZE_KB} KB. Please compress your file and try again.`)
      return
    }
    onUpload(doc.key, selected)
  }

  return (
    <div className="border border-slate-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-semibold text-slate-800">{doc.name}</p>
          <p className="text-xs text-slate-500">Accepted: PDF, JPG, JPEG, PNG · Max {MAX_FILE_SIZE_KB} KB</p>
        </div>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
            doc.required ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {doc.required ? 'Required' : 'Optional'}
        </span>
      </div>

      {!file ? (
        <label
          htmlFor={inputId}
          className="mt-2 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-lg py-4 text-sm text-slate-500 cursor-pointer hover:border-blue-400 hover:text-blue-600"
        >
          📤 Click to upload
          <input id={inputId} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleChange} />
        </label>
      ) : (
        <div className="mt-2 flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-green-700">✓</span>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-slate-800 truncate">{file.name}</p>
              <p className="text-xs text-slate-500">{formatSize(file.size)} · Uploaded</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <label htmlFor={inputId} className="text-xs text-blue-700 font-medium hover:underline cursor-pointer">
              Replace
              <input id={inputId} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleChange} />
            </label>
            <button
              type="button"
              onClick={() => onRemove(doc.key)}
              className="text-xs text-red-600 font-medium hover:underline"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ClassDocuments() {
  const navigate = useNavigate()
  const { classId } = useParams()
  const [files, setFiles] = useState({})

  const handleUpload = (key, file) => {
    setFiles((prev) => ({ ...prev, [key]: file }))
    toast.success(`${file.name} uploaded`)
  }

  const handleRemove = (key) => {
    setFiles((prev) => {
      const updated = { ...prev }
      delete updated[key]
      return updated
    })
  }

  const requiredDocs = documentList.filter((d) => d.required)
  const missingRequired = requiredDocs.filter((d) => !files[d.key])

  const handleContinue = () => {
    if (missingRequired.length > 0) {
      alert(`Please upload: ${missingRequired.map((d) => d.name).join(', ')}`)
      return
    }
    const fileMeta = Object.fromEntries(
      Object.entries(files).map(([key, file]) => [key, { name: file.name, size: file.size }])
    )
    saveApplicationSection(classId, 'documents', fileMeta)
    toast.success('Documents uploaded successfully')
    navigate(`/class/${classId}/application/review`)
  }

  return (
    <ClassLayout>
      <ApplicationStepperLayout currentStep={7}>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-center text-teal-700 font-semibold mb-1 border-b border-slate-200 pb-3">
            📄 Document Upload
          </h2>
          <p className="text-sm text-slate-500 text-center mt-3 mb-6">
            Upload clear scanned copies or photos of the following documents.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {documentList.map((doc) => (
              <DocumentUploadCard
                key={doc.key}
                doc={doc}
                file={files[doc.key]}
                onUpload={handleUpload}
                onRemove={handleRemove}
              />
            ))}
          </div>

                   <p className="text-xs text-slate-500 mt-6 text-left">
            Please ensure that your image/PDF file is less than {MAX_FILE_SIZE_KB}kb.{' '}
            
             <a href="https://www.ilovepdf.com/compress_pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 font-medium hover:underline"
            >
              Click here to compress your images
            </a>
          </p>

          <div className="flex justify-between gap-3 pt-6 mt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => navigate(`/class/${classId}/application/additional`)}
              className="bg-slate-100 text-slate-700 text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-slate-200"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={handleContinue}
              className="bg-blue-900 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-blue-800"
            >
              Save & Continue
            </button>
          </div>
        </div>
      </ApplicationStepperLayout>
    </ClassLayout>
  )
}

export default ClassDocuments