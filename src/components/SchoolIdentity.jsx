import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import logo from '../assets/evolvu-logo.webp'
import { getErrorMessage } from '../services/apiHelpers'
import { getSchoolInformation } from '../services/schoolService'

const FALLBACK_NAME = 'Evolvu Smart School'

function getSchoolRecord(response) {
  let record = response

  while (record && typeof record === 'object') {
    if (Array.isArray(record)) {
      record = record[0]
      continue
    }

    const nestedRecord = record.data ?? record.school_information ?? record.school_info ?? record.school
    if (!nestedRecord || typeof nestedRecord !== 'object' || nestedRecord === record) {
      break
    }
    record = nestedRecord
  }

  return record
}

function getLogoUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return ''

  const url = value.trim()
  if (/^(https?:|data:|blob:)/i.test(url)) return url

  const apiOrigin = new URL(import.meta.env.VITE_API_BASE_URL || window.location.origin, window.location.origin).origin
  return new URL(url, apiOrigin).toString()
}

function SchoolIdentity({ imageClassName, nameClassName, subtitleClassName, containerClassName, subtitle = 'Online Admission Portal' }) {
  const [school, setSchool] = useState(null)
  const [imageSrc, setImageSrc] = useState(logo)

  useEffect(() => {
    let isMounted = true

    getSchoolInformation()
      .then((response) => {
        const record = getSchoolRecord(response)
        const name = record?.school_name ?? record?.schoolName ?? record?.name
        const schoolLogo =
          record?.school_logo ??
          record?.school_logo_url ??
          record?.school_logo_path ??
          record?.logo_url ??
          record?.logo

        if (typeof name !== 'string' && typeof schoolLogo !== 'string') {
          throw new Error('The school information response did not include a school name or logo.')
        }

        if (isMounted) {
          setSchool({
            name: typeof name === 'string' && name.trim() ? name.trim() : FALLBACK_NAME,
          })
          const logoUrl = getLogoUrl(schoolLogo)
          if (logoUrl) setImageSrc(logoUrl)
        }
      })
      .catch((error) => {
        if (isMounted) toast.error(getErrorMessage(error, 'Could not load school information.'))
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className={containerClassName}>
      <img
        src={imageSrc}
        alt={`${school?.name ?? FALLBACK_NAME} logo`}
        onError={() => setImageSrc(logo)}
        className={imageClassName}
      />
      <div className="leading-tight">
        <h1 className={nameClassName}>{school?.name ?? FALLBACK_NAME}</h1>
        {subtitle && <p className={subtitleClassName}>{subtitle}</p>}
      </div>
    </div>
  )
}

export default SchoolIdentity
