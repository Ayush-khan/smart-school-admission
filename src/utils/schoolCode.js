// School short names typed after the site address,
// e.g. https://admtest.evolvu.in/SACS  ->  opens the SACS school.
// The same code is sent to the backend in the "X-School-Code" header
// (see apiClient.js); the backend maps it to the school's database.
export const SCHOOL_CODES = ['SACS', 'STCS', 'JPS', 'HSCS']

// First part of the URL that matches a school code (case-insensitive), returned in
// the exact spelling above, so /hscs and /HSCS both give 'HSCS'.
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
