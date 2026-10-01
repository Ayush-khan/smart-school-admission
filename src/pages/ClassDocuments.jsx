import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { saveApplicationSection, getApplicationData } from '../utils/applicationData'
import toast from 'react-hot-toast'
import ClassLayout from '../layouts/ClassLayout'
import ApplicationStepperLayout from '../layouts/ApplicationStepperLayout'
import { getDocumentTypes } from '../services/applicationService'
import { getErrorMessage } from '../services/apiHelpers'
import { getFormId } from '../utils/formId'
import { uploadDocument, getDocuments, deleteDocument } from '../services/documentService'

const MAX_FILE_SIZE_KB = 220
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_KB * 1024

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const isYes = (v) => v === true || v === 1 || ['Y', 'YES', 'TRUE', '1'].includes(String(v).toUpperCase())

// Turns the GET documents response into { [docCode]: { name, size, url } }.
// Uses data.documents — each item looks like:
// { doc_type: "BC", image_name: "...pdf", document_type: "Birth Certificate", uploaded: true, document_url: "https://..." }
// NOTE: doc_type is the code. document_type is the display NAME, so it must not be used as the code.
function normalizeSavedDocuments(result) {
  const payload = result?.data ?? result
  const items = Array.isArray(payload?.documents) ? payload.documents : []

  const saved = {}
  items.forEach((item) => {
    const code = item.doc_type
    const url = item.document_url ?? ''
    if (!code || !isYes(item.uploaded ?? Boolean(url))) return
    saved[code] = {
      name: item.image_name ?? url.split('/').pop() ?? 'Uploaded file',
      size: undefined,
      url,
    }
  })
  return saved
}

function DocumentUploadCard({ doc, file, busy, missing, onUpload, onRemove }) {
  const inputId = `file-${doc.code}`

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

    onUpload(doc.code, selected)
    e.target.value = '' // lets the same file be chosen again
  }

  return (
    <div className={`border rounded-lg p-4 ${missing ? 'border-red-500' : 'border-slate-200'}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-semibold text-slate-800">{doc.name}</p>
          <p className="text-xs text-slate-500">
            Accepted: PDF, JPG, JPEG, PNG · Max {MAX_FILE_SIZE_KB} KB
          </p>
        </div>

        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
            doc.required
              ? 'bg-red-100 text-red-700'
              : 'bg-slate-100 text-slate-600'
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
          {busy ? 'Uploading...' : '📤 Click to upload'}

          <input
            id={inputId}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            disabled={busy}
            onChange={handleChange}
          />
        </label>
      ) : (
        <div className="mt-2 flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-green-700">✓</span>

            <div className="overflow-hidden">
              <p className="text-xs font-medium text-slate-800 truncate">
                {file.name}
              </p>

              <p className="text-xs text-slate-500">
                {file.size ? `${formatSize(file.size)} · ` : ''}{busy ? 'Updating...' : 'Uploaded'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {file.url && (
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-700 font-medium hover:underline"
              >
                View
              </a>
            )}
            <label
              htmlFor={inputId}
              className="text-xs text-blue-700 font-medium hover:underline cursor-pointer"
            >
              Replace

              <input
                id={inputId}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                disabled={busy}
                onChange={handleChange}
              />
            </label>

            <button
              type="button"
              disabled={busy}
              onClick={() => onRemove(doc.code)}
              className="text-xs text-red-600 font-medium hover:underline disabled:opacity-50"
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
  const formId = getFormId(classId)
  // Documents already saved on the server: { [docCode]: { name, size, url } }
  const [files, setFiles] = useState({})
  const [busy, setBusy] = useState({})
  const [loadingSaved, setLoadingSaved] = useState(true)

  const [triedContinue, setTriedContinue] = useState(false)
  const [documentList, setDocumentList] = useState([])
  const [loadingDocTypes, setLoadingDocTypes] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadDocumentTypes() {
      try {
        const result = await getDocumentTypes()

        /*
         * Backend now returns:
         *
         * data.required_documents
         * data.optional_documents
         *
         * Combine both arrays so that all documents
         * are displayed on the admission form.
         */

        const requiredDocuments =
          result?.data?.required_documents ?? []

        const optionalDocuments =
          result?.data?.optional_documents ?? []

        const list = [
          ...requiredDocuments,
          ...optionalDocuments
        ]

        /*
         * Convert backend is_required value:
         *
         * Y = Required
         * N = Optional
         */

        const mapped = list.map((d) => ({
          code: d.code,
          name: d.name,
          required:
            String(d.is_required).toUpperCase() === 'Y',
        }))

        if (!cancelled) setDocumentList(mapped)
      } catch (err) {
        if (!cancelled) {
          toast.error(
            getErrorMessage(
              err,
              'Could not load document types.'
            )
          )
        }
      } finally {
        if (!cancelled) setLoadingDocTypes(false)
      }
    }

    loadDocumentTypes()

    return () => {
      cancelled = true
    }
  }, [])

  // Load documents already uploaded for this form, so they show again after coming back.
  const loadSavedDocuments = async () => {
    const result = await getDocuments(formId)
    return normalizeSavedDocuments(result)
  }

  useEffect(() => {
    if (!formId) {
      setLoadingSaved(false)
      return
    }
    let cancelled = false

    async function loadSaved() {
      try {
        const saved = await loadSavedDocuments()
        if (!cancelled) setFiles(saved)
      } catch (err) {
        if (!cancelled) toast.error(getErrorMessage(err, 'Could not load your uploaded documents.'))
      } finally {
        if (!cancelled) setLoadingSaved(false)
      }
    }

    loadSaved()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId])

  const setBusyFor = (code, value) => setBusy((prev) => ({ ...prev, [code]: value }))

  const handleUpload = async (code, file) => {
    if (!formId) {
      toast.error('Application not found. Please start from Student Details.')
      return
    }
    setBusyFor(code, true)
    try {
      // The backend refuses a second upload of the same document type,
      // so when replacing, delete the old one first.
      if (files[code]) {
        await deleteDocument(formId, code)
        setFiles((prev) => {
          const updated = { ...prev }
          delete updated[code]
          return updated
        })
      }
      await uploadDocument(formId, code, file)
      setFiles((prev) => ({ ...prev, [code]: { name: file.name, size: file.size, url: '' } }))
      toast.success(`${file.name} uploaded`)
      // Refresh so the saved file's link (View) is available.
      try {
        const fresh = await loadSavedDocuments()
        setFiles((prev) => ({ ...prev, ...fresh }))
      } catch {
        // The upload worked; the link will appear next time the page loads.
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not upload the document.'))
    } finally {
      setBusyFor(code, false)
    }
  }

  const handleRemove = async (code) => {
    if (!window.confirm('Remove this document?')) return
    setBusyFor(code, true)
    try {
      await deleteDocument(formId, code)
      setFiles((prev) => {
        const updated = { ...prev }
        delete updated[code]
        return updated
      })
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not remove the document.'))
    } finally {
      setBusyFor(code, false)
    }
  }

  const requiredDocs = documentList.filter(
    (d) => d.required
  )

  const missingRequired = requiredDocs.filter(
    (d) => !files[d.code]
  )

  const handleContinue = () => {
    setTriedContinue(true)
    if (missingRequired.length > 0) {
      alert(
        `Please upload: ${missingRequired
          .map((d) => d.name)
          .join(', ')}`
      )
      return
    }

    const fileMeta = Object.fromEntries(
      Object.entries(files).map(
        ([code, file]) => [
          code,
          {
            name: file.name,
            size: file.size ?? 0
          }
        ]
      )
    )

    saveApplicationSection(
      classId,
      'documents',
      fileMeta
    )

    toast.success(
      'Documents uploaded successfully'
    )

    navigate(
      `/class/${classId}/application/review`
    )
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

          {loadingDocTypes || loadingSaved ? (
            <p className="text-sm text-slate-500 text-center py-6">
              Loading documents...
            </p>
          ) : documentList.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">
              No document types configured.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {documentList.map((doc) => (
                <DocumentUploadCard
                  key={doc.code}
                  doc={doc}
                  file={files[doc.code]}
                  busy={Boolean(busy[doc.code])}
                  missing={triedContinue && doc.required && !files[doc.code]}
                  onUpload={handleUpload}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}

          <div className="text-xs text-slate-500 mt-6 text-left space-y-1">
            <p>
              Please ensure that your PDF file is less than {MAX_FILE_SIZE_KB}kb.{' '}
              <a
                href="https://www.ilovepdf.com/compress_pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 font-medium hover:underline"
              >
                Click here to compress your PDF
              </a>
            </p>

            <p>
              Please ensure that your image file is less than {MAX_FILE_SIZE_KB}kb.{' '}
              <a
                href="https://www.resizepixel.com/reduce-image-in-kb/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 font-medium hover:underline"
              >
                Click here to compress your Image
              </a>
            </p>
          </div>

          <div className="flex justify-between gap-3 pt-6 mt-6 border-t border-slate-200">

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/class/${classId}/application/additional`
                )
              }
              className="bg-slate-100 text-slate-700 text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-slate-200"
            >
              Previous
            </button>

            <button
              type="button"
              onClick={handleContinue}
              className="bg-navy text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-navy-light"
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