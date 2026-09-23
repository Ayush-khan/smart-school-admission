import { useParams } from 'react-router-dom'
import { getFormId } from '../utils/formId'

const steps = [
  'Student Details',
  'Address',
  'Parent Details',
  'Sibling Details',
  'Academic Details',
  'Additional Info',
  'Documents',
  'Review',
  'Declaration',
]

function ApplicationStepperLayout({ currentStep, children }) {
  const { classId } = useParams()
  const formId = getFormId(classId)

  return (
    <div>
      <div className="mb-3">
        <span className="inline-block bg-teal-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full">
          FORM ID: {formId || 'Assigned after saving student details'}
        </span>
      </div>
      {/* Desktop stepper */}
      <div className="hidden sm:block bg-white rounded-xl shadow-sm mb-6 px-4 py-3 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {steps.map((step, index) => {
            const stepNumber = index + 1
            const isActive = stepNumber === currentStep
            const isDone = stepNumber < currentStep
            return (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                    isActive
                      ? 'bg-navy text-white'
                      : isDone
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isDone ? '✓' : stepNumber}
                </div>
                <span
                  className={`text-xs whitespace-nowrap ${
                    isActive ? 'text-navy font-medium' : 'text-slate-500'
                  }`}
                >
                  {step}
                </span>
                {index < steps.length - 1 && <div className="w-6 h-px bg-slate-300 mx-1" />}
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile compact progress */}
      <div className="sm:hidden bg-white rounded-xl shadow-sm mb-6 px-4 py-3">
        <p className="text-xs text-slate-500 mb-1">
          Step {currentStep} of {steps.length}: <span className="font-medium text-navy">{steps[currentStep - 1]}</span>
        </p>
        <div className="w-full bg-slate-200 rounded-full h-1.5">
          <div
            className="bg-navy h-1.5 rounded-full transition-all"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {children}
    </div>
  )
}

export default ApplicationStepperLayout