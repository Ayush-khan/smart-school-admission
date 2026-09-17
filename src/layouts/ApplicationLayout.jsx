import { useNavigate } from 'react-router-dom'

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
  'Payment',
]

function ApplicationLayout({ currentStep, children }) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-blue-900">Arnolds School — Application Form</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-slate-600 font-medium hover:underline"
          >
            Save & Exit
          </button>
        </div>
      </header>

      {/* Desktop stepper */}
      <div className="hidden sm:block bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-3 overflow-x-auto">
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
                        ? 'bg-blue-900 text-white'
                        : isDone
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isDone ? '✓' : stepNumber}
                  </div>
                  <span
                    className={`text-xs whitespace-nowrap ${
                      isActive ? 'text-blue-900 font-medium' : 'text-slate-500'
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
      </div>

      {/* Mobile compact progress */}
      <div className="sm:hidden bg-white border-b border-slate-200 px-4 py-3">
        <p className="text-xs text-slate-500 mb-1">
          Step {currentStep} of {steps.length}: <span className="font-medium text-blue-900">{steps[currentStep - 1]}</span>
        </p>
        <div className="w-full bg-slate-200 rounded-full h-1.5">
          <div
            className="bg-blue-900 h-1.5 rounded-full transition-all"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}

export default ApplicationLayout