import { Route, Routes } from 'react-router-dom'

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

function NotFoundPage() {
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
      404 - Page not found
    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
