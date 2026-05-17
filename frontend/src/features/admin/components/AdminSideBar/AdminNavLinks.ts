export type AdminPanelNavLink = {
  icon: string
  name: string
  path: string
}

export const AdminPanelNavLinks: AdminPanelNavLink[] = [
  {
    icon: '📊',
    name: 'Dashboard',
    path: '/admin/dashboard',
  },
  {
    icon: '📚',
    name: 'Topics',
    path: '/admin/topics',
  },
  {
    icon: '📑',
    name: 'Subtopics',
    path: '/admin/subtopics',
  },
  {
    icon: '📝',
    name: 'Words',
    path: '/admin/words',
  },
]
