import { useState, useRef } from 'react'

// Shows dd/mm/yyyy (whatever the browser language is) with a calendar button.
// value / onChange use yyyy-mm-dd, so you can send the value to the API as it is.
const toDisplay = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '')
  return m ? `${m[3]}/${m[2]}/${m[1]}` : ''
}

const toIso = (text) => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text)
  if (!m) return ''
  const [, d, mo, y] = m
  const date = new Date(`${y}-${mo}-${d}T00:00:00`)
  const real = date.getFullYear() === +y && date.getMonth() + 1 === +mo && date.getDate() === +d
  return real ? `${y}-${mo}-${d}` : ''
}

const mask = (raw) => {
  const n = raw.replace(/\D/g, '').slice(0, 8)
  if (n.length <= 2) return n
  if (n.length <= 4) return `${n.slice(0, 2)}/${n.slice(2)}`
  return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4)}`
}

function DateInput({ value, onChange, min, max, className = '' }) {
  const [text, setText] = useState(toDisplay(value))
  const pickerRef = useRef(null)

  const handleType = (e) => {
    const masked = mask(e.target.value)
    setText(masked)
    onChange(toIso(masked), masked)
  }

  const handlePick = (e) => {
    const shown = toDisplay(e.target.value)
    setText(shown)
    onChange(e.target.value, shown)
  }

  return (
    <div className="relative">
      <input
        type="text"
        inputMode="numeric"
        maxLength={10}
        placeholder="dd/mm/yyyy"
        className={`${className} pr-11`}
        value={text}
        onChange={handleType}
      />
      <button
        type="button"
        aria-label="Open calendar"
        onClick={() => pickerRef.current?.showPicker()}
        className="absolute right-0 top-0 h-full w-11 text-lg"
      >
        📅
      </button>
      <input
        ref={pickerRef}
        type="date"
        tabIndex={-1}
        min={min}
        max={max}
        value={value || ''}
        onChange={handlePick}
        className="absolute right-0 top-0 h-full w-11 opacity-0 pointer-events-none"
      />
    </div>
  )
}

export default DateInput
