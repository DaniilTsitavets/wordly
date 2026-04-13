export type NavLink = {
  name: string
  path: string
  icon: string
}

export const NavLinksProps: NavLink[] = [
  { name: 'Daily Game', path: '/', icon: 'joystick' },
  { name: 'About Us', path: '/', icon: 'info' },
  { name: 'Vocabulary', path: '/', icon: 'book-colored' },
  { name: 'Recall', path: '/', icon: 'brain' },
  { name: 'Progress', path: '/', icon: 'increase' },
]
