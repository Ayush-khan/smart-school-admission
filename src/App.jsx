import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AddressDetails from './pages/AddressDetails'
import Login from './pages/Login'
import VerifyOtp from './pages/VerifyOtp'
import Dashboard from './pages/Dashboard'
import ClassInstructions from './pages/ClassInstructions'
import ClassStudentDetails from './pages/ClassStudentDetails'
import ApplicationStatus from './pages/ApplicationStatus'
import StudentDetails from './pages/StudentDetails'
import ParentDetails from './pages/ParentDetails'
import ClassAddressDetails from './pages/ClassAddressDetails'
import ClassParentDetails from './pages/ClassParentDetails'
import ClassSiblingDetails from './pages/ClassSiblingDetails'
import ClassAcademicDetails from './pages/ClassAcademicDetails'
import ClassAdditionalInfo from './pages/ClassAdditionalInfo'
import ClassDocuments from './pages/ClassDocuments'
import ClassReview from './pages/ClassReview'
import ClassDeclaration from './pages/ClassDeclaration'
import ClassPayment from './pages/ClassPayment'
import ClassReceipt from './pages/ClassReceipt'
import ClassStatus from './pages/ClassStatus'
import ClassConfirmation from './pages/ClassConfirmation'
import PaymentResult from './pages/PaymentResult'


function App() {
  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/application/student" element={<StudentDetails />} />
      <Route path="/application/status" element={<ApplicationStatus />} />
      <Route path="/application/address" element={<AddressDetails />} />
      <Route path="/application/parents" element={<ParentDetails />} />
      <Route path="/class/:classId/instructions" element={<ClassInstructions />} />
      <Route path="/class/:classId/application/student" element={<ClassStudentDetails />} />
      <Route path="/class/:classId/application/address" element={<ClassAddressDetails />} />
      <Route path="/class/:classId/application/parents" element={<ClassParentDetails />} />
      <Route path="/class/:classId/application/siblings" element={<ClassSiblingDetails />} />
      <Route path="/class/:classId/application/academic" element={<ClassAcademicDetails />} />
      <Route path="/class/:classId/application/additional" element={<ClassAdditionalInfo />} />
      <Route path="/class/:classId/application/documents" element={<ClassDocuments />} />
      <Route path="/class/:classId/application/review" element={<ClassReview />} />
      <Route path="/class/:classId/application/declaration" element={<ClassDeclaration />} />
      <Route path="/class/:classId/application/payment" element={<ClassPayment />} />
      <Route path="/class/:classId/application/payment-result" element={<PaymentResult />} />
      <Route path="/class/:classId/application/receipt" element={<ClassReceipt />} />
      <Route path="/class/:classId/status" element={<ClassStatus />} />
      <Route path="/class/:classId/application/confirmation" element={<ClassConfirmation />} />
      </Routes>
    </>
  )
}

export default App