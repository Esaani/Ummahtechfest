import { Route, Routes } from 'react-router-dom'
import AdminGate from '../../components/admin/AdminGate.jsx'
import AdminLayout from '../../components/admin/AdminLayout.jsx'
import AdminRoute from '../../components/admin/AdminRoute.jsx'
import {
  PERM_CMS_MANAGE,
  PERM_SUBMISSIONS_MANAGE,
  PERM_USERS_MANAGE,
} from '../../config/adminPermissions.js'
import AdminDashboard from './AdminDashboard.jsx'
import AdminPasses from './AdminPasses.jsx'
import AdminSchedule from './AdminSchedule.jsx'
import AdminSubmissions from './AdminSubmissions.jsx'
import AdminSpeakers from './AdminSpeakers.jsx'
import AdminSponsors from './AdminSponsors.jsx'
import AdminUsers from './AdminUsers.jsx'

export default function AdminPortal() {
  return (
    <AdminGate>
      {() => (
        <Routes>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route
              path="speakers"
              element={
                <AdminRoute permission={PERM_CMS_MANAGE}>
                  <AdminSpeakers />
                </AdminRoute>
              }
            />
            <Route
              path="sponsors"
              element={
                <AdminRoute permission={PERM_CMS_MANAGE}>
                  <AdminSponsors />
                </AdminRoute>
              }
            />
            <Route
              path="passes"
              element={
                <AdminRoute permission={PERM_CMS_MANAGE}>
                  <AdminPasses />
                </AdminRoute>
              }
            />
            <Route
              path="schedule"
              element={
                <AdminRoute permission={PERM_CMS_MANAGE}>
                  <AdminSchedule />
                </AdminRoute>
              }
            />
            <Route
              path="submissions"
              element={
                <AdminRoute permission={PERM_SUBMISSIONS_MANAGE}>
                  <AdminSubmissions />
                </AdminRoute>
              }
            />
            <Route
              path="users"
              element={
                <AdminRoute permission={PERM_USERS_MANAGE}>
                  <AdminUsers />
                </AdminRoute>
              }
            />
          </Route>
        </Routes>
      )}
    </AdminGate>
  )
}
