import { Route, Routes } from 'react-router-dom'
import { NavLinks } from '@/app/components/molecules/NavLinks/NavLinks'

function App() {
  return <Layout />
}

function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f9fafb',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px',
      }}
    >
      Home page
    </main>
  )
}

function Layout() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
      <NavLinks />
    </div>
  )
}

export default App
