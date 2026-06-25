import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/molecules/Layout'
import { routesConfig } from './RoutesConfig'
import { ProtectedRoute } from './ProtectedRoute'
import { GameRoute } from './GameRoute'
import { AdminRoute } from './AdminRoute'
import { AdminLayout } from '@/features/admin/components/AdminLayout/AdminLayout'
import { AdminDashboard } from '@/features/admin/components/AdminDashboard/AdminDashboard'
import { AdminTopics } from '@/features/admin/components/AdminTopics/AdminTopics'
import { AdminWords } from '@/features/admin/components/AdminWords/AdminWords'
import { AdminSubtopics } from '@/features/admin/components/AdminSubtopics/AdminSubtopics'

function wrapWithGuard(element: React.ReactNode, access: string) {
  switch (access) {
    case 'protected':
      return <ProtectedRoute>{element}</ProtectedRoute>
    case 'game':
      return <GameRoute>{element}</GameRoute>
    default:
      return element
  }
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {routesConfig.map(({ path, element, access }) => (
          <Route key={path} path={path} element={wrapWithGuard(element, access)} />
        ))}
      </Route>

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="topics" element={<AdminTopics />} />
        <Route path="subtopics" element={<AdminSubtopics />} />
        <Route path="words" element={<AdminWords />} />
      </Route>
    </Routes>
  )
}
