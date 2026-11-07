import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import Layout from '../components/layout/Layout'
import LoginPage from '../pages/LoginPage'
import OrganizerDashboard from '../pages/organizer/OrganizerDashboard'
import CreateEvent from '../pages/organizer/CreateEvent'
import Participants from '../pages/organizer/Participants'
import StudentDashboard from '../pages/student/StudentDashboard'
import StudentProfile from '../pages/student/StudentProfile'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<LoginPage />} />
          <Route element={<ProtectedRoute allowedRole="student" />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<StudentProfile />} />
          </Route>
          <Route element={<ProtectedRoute allowedRole="organizer" />}>
            <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
            <Route path="/organizer/create-event" element={<CreateEvent />} />
            <Route path="/organizer/events/:eventId/edit" element={<CreateEvent />} />
            <Route path="/organizer/participants" element={<Participants />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
