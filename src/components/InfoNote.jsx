// Small centered instruction box shown under a section heading.
// Usage: <InfoNote>Upload clear scanned copies...</InfoNote>
// Pass className to adjust spacing, e.g. <InfoNote className="mt-3 mb-6">.
function InfoNote({ children, className = 'mb-6' }) {
  return (
    <div
      role="note"
      className={`flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-center text-sm font-medium text-blue-800 ${className}`}
    >
      <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4 flex-shrink-0 text-blue-600">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
      <span>{children}</span>
    </div>
  )
}

export default InfoNote
