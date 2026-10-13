import { saveStudentDetails } from '../services/applicationService'
import { getSessionInfo } from './session'
import { getFormId, getFormIdFromResponse, saveFormId } from './formId'

export async function saveAdmissionSection(classId, sectionData) {
  const formId = getFormId(classId)
  const { narId } = getSessionInfo()
  if (!formId || !narId) {
    throw new Error('Could not find your admission form. Please complete Student Details first.')
  }

  const result = await saveStudentDetails({
    ...sectionData,
    form_id: formId,
    nar_id: narId,
  })
  if (!result?.success) {
    throw new Error(result?.message || 'The server did not confirm that this section was saved.')
  }

  const updatedFormId = getFormIdFromResponse(result)
  if (updatedFormId) saveFormId(classId, updatedFormId)
  return result
}
