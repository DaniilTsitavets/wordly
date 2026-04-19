import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/molecules/Layout'
import { routesConfig } from './RoutesConfig'

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
    </Routes>
  )
}
