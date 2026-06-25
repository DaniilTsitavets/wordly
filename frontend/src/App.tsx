import { AppRoutes } from './app/routes'
import { useTheme } from './shared/hooks/useTheme'

export default function App() {
  useTheme()
  return <AppRoutes />
}
