// School short names that can be typed after the site address,
// e.g. https://admtest.evolvu.in/SACS  ->  opens the SACS school.
export const SCHOOL_CODES = ['SACS', 'STCS', 'JPS', 'HSCS']

// Reads the school code from the first part of the URL (case-insensitive).
// Returns '' when the URL has no school code (normal link, nothing changes).
export const getSchoolCode = () => {
  const first = window.location.pathname.split('/')[1] || ''
  return SCHOOL_CODES.find((c) => c.toLowerCase() === first.toLowerCase()) || ''
}

// Path prefix for the router, e.g. '/SACS' or '' (no school code).
export const getSchoolBasePath = () => {
  const code = getSchoolCode()
  return code ? `/${code}` : ''
}
