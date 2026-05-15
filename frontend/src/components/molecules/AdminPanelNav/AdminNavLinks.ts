export type AdminPanelNavLink = {
  name: string
  path: string
}

export const AdminPanelNavLinks: AdminPanelNavLink[] = [
  {
    name: 'Dashboard',
    path: '/admin/dashboard',
  },
  {
    name: 'Topics',
    path: '/admin/topics',
  },
  {
    name: 'Subtopics',
    path: '/admin/subtopics',
  },
  {
    name: 'Words',
    path: '/admin/words',
  },
]
