import apiClient from './apiClient'

let schoolInformationRequest

export function getSchoolInformation() {
  if (!schoolInformationRequest) {
    schoolInformationRequest = apiClient
      .get('/api/get_school_information')
      .then((response) => response.data)
      .catch((error) => {
        schoolInformationRequest = null
        throw error
      })
  }

  return schoolInformationRequest
}
