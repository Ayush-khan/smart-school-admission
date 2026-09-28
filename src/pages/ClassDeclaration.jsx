import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import ClassLayout from '../layouts/ClassLayout'
import ApplicationStepperLayout from '../layouts/ApplicationStepperLayout'
import { saveAdmissionSignature } from '../services/applicationService'
import { getErrorMessage } from '../services/apiHelpers'
import { getFormId } from '../utils/formId'

function ClassDeclaration() {
  const navigate = useNavigate()
  const { classId } = useParams()

  const [confirmChecked, setConfirmChecked] = useState(false)
  const [termsChecked, setTermsChecked] = useState(false)
  const [privacyChecked, setPrivacyChecked] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [signatureMode, setSignatureMode] = useState('type') // 'type' or 'upload'
  const [typedName, setTypedName] = useState('')
  const [signatureConfirmed, setSignatureConfirmed] = useState(false)
  const [uploadedSignature, setUploadedSignature] = useState(null)

  const handleSignatureFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file for the signature.')
      return
    }
    setUploadedSignature(file)
    toast.success('Signature PDF uploaded')
  }

  const removeUploadedSignature = () => {
    setUploadedSignature(null)
  }

  const handleSubmitClick = () => {
    if (!confirmChecked || !termsChecked || !privacyChecked) {
      setError('Please accept all three declarations before submitting.')
      return
    }

    if (signatureMode === 'type' && (!typedName.trim() || !signatureConfirmed)) {
      setError('Please type your name and confirm it as your digital signature.')
      return
    }
    if (signatureMode === 'upload' && !uploadedSignature) {
      setError('Please upload your signature as a PDF before submitting.')
      return
    }

    setError('')
    setShowModal(true)
  }

    const confirmSubmit = async () => {
    setShowModal(false)
    setSubmitting(true)
    try {
      const formId = getFormId(classId)
      if (!formId) {
        toast.error('Could not find your application. Please go back and try again.')
        return
      }
      await saveAdmissionSignature({
        formId,
        signatureType: signatureMode === 'type' ? 'typed' : 'pdf',
        signatureName: typedName.trim(),
        signatureFile: uploadedSignature,
        declarationConfirmed: confirmChecked,
        termsAccepted: termsChecked,
        privacyAccepted: privacyChecked,
      })
      toast.success('Application submitted successfully')
      navigate(`/class/${classId}/application/payment`)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not save your signature. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ClassLayout>
      <ApplicationStepperLayout currentStep={9}>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-center text-teal-700 font-semibold mb-6 border-b border-slate-200 pb-3">
            ✍️ Declaration
          </h2>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-700 leading-relaxed mb-6">
            I/We hereby declare that the information provided in this application form is true and
            correct to the best of my/our knowledge and belief. I/We understand that any false
            information may lead to cancellation of admission at any stage. I/We have read and
            understood the admission procedure, fee structure, and important notes for this class.
          </div>

          <div className="space-y-3 mb-6">
            <label className="flex items-start gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4 mt-0.5"
                checked={confirmChecked}
                onChange={(e) => setConfirmChecked(e.target.checked)}
              />
              I confirm that the information provided above is accurate and complete.
            </label>
            <label className="flex items-start gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4 mt-0.5"
                checked={termsChecked}
                onChange={(e) => setTermsChecked(e.target.checked)}
              />
              I have read and agree to the school's Terms and Conditions.
            </label>
            <label className="flex items-start gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4 mt-0.5"
                checked={privacyChecked}
                onChange={(e) => setPrivacyChecked(e.target.checked)}
              />
              I acknowledge the school's Privacy Policy regarding use of the submitted information.
            </label>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Digital Signature</label>

            <div className="flex flex-wrap gap-2 mb-3">
              <button
                type="button"
                onClick={() => setSignatureMode('type')}
                className={`text-xs font-medium px-4 py-1.5 rounded-full border-2 transition ${
                  signatureMode === 'type'
                    ? 'border-blue-900 bg-blue-50 text-navy'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                ✍️ Type Signature
              </button>
              <button
                type="button"
                onClick={() => setSignatureMode('upload')}
                className={`text-xs font-medium px-4 py-1.5 rounded-full border-2 transition ${
                  signatureMode === 'upload'
                    ? 'border-blue-900 bg-blue-50 text-navy'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                📄 Upload Signature (PDF)
              </button>
            </div>

            {signatureMode === 'type' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Full Name (as signature)</label>
                  <input
                    type="text"
                    value={typedName}
                    onChange={(e) => setTypedName(e.target.value)}
                    placeholder="Type your full name"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <label className="flex items-start gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 mt-0.5"
                    checked={signatureConfirmed}
                    onChange={(e) => setSignatureConfirmed(e.target.checked)}
                  />
                  I agree that typing my name above serves as my digital signature and confirms this declaration.
                </label>
              </div>
            ) : (
              <div>
                {!uploadedSignature ? (
                  <label
                    htmlFor="signatureUpload"
                    className="flex items-center justify-center border-2 border-dashed border-slate-300 rounded-lg py-6 text-sm text-slate-500 cursor-pointer hover:border-blue-400 hover:text-blue-600"
                  >
                    📤 Click to upload signature PDF
                    <input
                      id="signatureUpload"
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleSignatureFileChange}
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-green-700">✓</span>
                      <p className="text-xs font-medium text-slate-800">{uploadedSignature.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={removeUploadedSignature}
                      className="text-xs text-red-600 font-medium hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

          <div className="flex justify-between gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => navigate(`/class/${classId}/application/review`)}
              className="bg-slate-100 text-slate-700 text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-slate-200"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={handleSubmitClick}
              className="bg-navy text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-navy-light"
            >
              Submit Application
            </button>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full text-center">
              <p className="text-slate-800 font-medium mb-6">
                Are you sure you want to submit your application?
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-slate-100 text-slate-700 text-sm font-medium px-5 py-2 rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                                <button
                  onClick={confirmSubmit}
                  disabled={submitting}
                  className="bg-navy text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-navy-light disabled:opacity-60"
                >
                  {submitting ? 'Submitting...' : 'Yes, Submit'}
                </button>
              </div>
            </div>
          </div>
        )}
      </ApplicationStepperLayout>
    </ClassLayout>
  )
}

export default ClassDeclaration