import { useState, useRef, useEffect } from 'react'
import { Controller } from 'react-hook-form'
// This is the code
function CustomSelect({ control, name, rules, options, placeholder = 'SELECT' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <div className="relative" ref={ref}>
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="w-full flex items-center justify-between border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className={field.value ? 'text-slate-800' : 'text-slate-400'}>
              {field.value || placeholder}
            </span>
            <span className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
          </button>

          {open && (
            <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-50 max-h-56 overflow-y-auto">
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    field.onChange(opt)
                    setOpen(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 border-b border-slate-50 last:border-0"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    />
  )
}

export default CustomSelect