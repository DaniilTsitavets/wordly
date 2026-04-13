import { AuthenticatedNav } from './AuthenticatedNav'
import { UnauthenticatedNav } from './UnauthenticatedNav'

interface NavLinksProps {
  isAuthenticated?: boolean
  stats?: {
    fire: number
    gems: number
  }
}

export const NavLinks = ({ isAuthenticated = true, stats }: NavLinksProps) => {
  return isAuthenticated ? <AuthenticatedNav stats={stats} /> : <UnauthenticatedNav />
}
