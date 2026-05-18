import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/molecules/Layout'
import { routesConfig } from './RoutesConfig'
import { AdminLayout } from '@/features/admin/components/AdminLayout/AdminLayout'
import { AdminDashboard } from '@/features/admin/components/AdminDashboard/AdminDashboard'
import { AdminTopics } from '@/features/admin/components/AdminTopics/AdminTopics'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {routesConfig.map(({ path, element, isProtected }) => (
          <Route
            key={path}
            path={path}
            element={isProtected ? <Navigate to="/login" /> : element}
          />
        ))}
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="topics" element={<AdminTopics />} />
      </Route>
    </Routes>
  )
}
