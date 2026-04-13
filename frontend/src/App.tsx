import { ArrowRight, Heart, Volume2, Lock } from 'lucide-react'
import { Button } from './components/atoms/Button'
import { IconButton } from './components/atoms/IconButton'
import { Card } from './components/atoms/Card'
import { IconFont } from './components/atoms/IconFont'
import { ProgressBar } from './components/atoms/ProgressBar'
import { Input } from './components/atoms/Input'
import { useState } from 'react'
import { Modal } from './components/atoms/Modal'
import { RewardModal } from './components/molecules/RewardModal'
import { Tabs } from './components/molecules/Tabs'
import { Spinner } from './components/atoms/Spinner'
import { PaginationDots } from './components/atoms/PaginationDots'
import { StatsDisplay } from './components/molecules/StatsDisplay'
import { NavIconButton } from './components/atoms/NavIconButton'
import { StatButton } from './components/atoms/StatButton'
import { Header } from './components/organisms/Header'
import { Avatar } from './components/atoms/Avatar'
import { LetterTile } from './components/atoms/LetterTile'
import { MatchCard } from './components/atoms/MatchCard'
import { Route, Routes } from 'react-router-dom'
import { NavLinks } from './components/molecules/NavLinks/NavLinks'
import { AuthModal } from '@/components/organisms/AuthModal'

function App() {
  return <Layout />
}

function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRewardOpen, setIsRewardOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login')
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
      <Header streak={0} points={50} onAvatarClick={() => console.log('profile clicked')} />
      {/* Buttons */}
      <section>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Buttons</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <Button variant="primary" rightIcon={<ArrowRight size={18} />}>
            Primary Button
          </Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="gradient">Gradient Button</Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
      </section>

      {/* Button States */}
      <section>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
          Button States
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <Button variant="primary">Default</Button>
          <Button variant="primary" isLoading>
            Loading
          </Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
      </section>

      {/* Icon Buttons */}
      <section>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Icon Buttons</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <IconButton icon={<Heart size={18} />} variant="primary" aria-label="Like" />
          <IconButton icon={<Volume2 size={18} />} variant="ghost" aria-label="Volume" />
          <IconButton icon={<Lock size={18} />} variant="ghost" aria-label="Lock" />
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '24px 0 16px' }}>
          Icon Button Sizes
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <IconButton
            icon={<Heart size={14} />}
            size="sm"
            variant="primary"
            aria-label="Small like"
          />
          <IconButton
            icon={<Heart size={18} />}
            size="md"
            variant="primary"
            aria-label="Medium like"
          />
          <IconButton
            icon={<Heart size={22} />}
            size="lg"
            variant="primary"
            aria-label="Large like"
          />
        </div>
      </section>
      <section>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Plates</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          <Card
            variant="default"
            icon={<IconFont name="star" />}
            title="Default Card"
            description="Basic card with default styling"
          />
          <Card
            variant="outlined"
            icon={<IconFont name="trophey" />}
            title="Outlined Card"
            description="Card with prominent border"
          />
          <Card
            variant="elevated"
            icon={<IconFont name="increase" />}
            title="Elevated Card"
            description="Card with shadow elevation"
          />
        </div>
      </section>
      <section>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
          Progress Bars
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1024px' }}>
          <ProgressBar value={75} color="purple" size="sm" label="Progress" showValue />
          <ProgressBar value={75} color="green" size="sm" />
          <ProgressBar value={40} color="orange" size="xs" />
          <ProgressBar value={90} color="pink" size="md" label="Progress" showValue />
        </div>
      </section>
      <section>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Inputs</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Email" placeholder="your.email@example.com" type="email" />
          <Input label="Password" placeholder="Enter your password" showPasswordToggle />
          <Input
            label="With Helper Text"
            placeholder="Type something..."
            helperText="This is a helpful message"
          />
          <Input
            label="With Error"
            placeholder="Invalid input"
            errorText="This field is required"
          />
        </div>
      </section>
      <section>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Modal</h2>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          Open Modal
        </Button>
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} ariaLabel="Example modal">
          <p style={{ color: '#1a1a1a' }}>Modal content goes here</p>
        </Modal>
      </section>
      <section>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Modal</h2>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            Open Empty Modal
          </Button>
          <Button variant="gradient" onClick={() => setIsRewardOpen(true)}>
            Open Reward Modal
          </Button>
        </div>
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} ariaLabel="Example modal">
          <p style={{ color: '#1a1a1a' }}>Modal content goes here</p>
        </Modal>
        <RewardModal
          isOpen={isRewardOpen}
          onClose={() => setIsRewardOpen(false)}
          onCollect={() => setIsRewardOpen(false)}
          level={1}
          reward="+10 Gems"
        />
      </section>
      <section>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Tabs</h2>
        <Tabs
          tabs={[
            {
              id: 'personal',
              label: 'Personal info',
              content:
                'This is the overview tab content. Tabs provide a way to organize related content and make it easy to switch between different views.',
            },
            { id: 'statistics', label: 'My statistics', content: 'Statistics content goes here.' },
          ]}
        />
      </section>

      <section>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
          Loading Spinner
        </h2>
        <div style={{ display: 'flex', gap: '48px', alignItems: 'center' }}>
          <Spinner size="sm" label="Small" />
          <Spinner size="md" label="Medium" />
          <Spinner size="lg" label="Large" />
        </div>
      </section>
      <section>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
          Pagination Dots
        </h2>
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}
        >
          <PaginationDots total={3} color="mixed" label="Mixed Colors" />
          <PaginationDots total={3} color="purple" label="Purple" />
          <PaginationDots total={3} color="pink" label="Pink" />
        </div>
      </section>
      <section>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
          Statistics Display
        </h2>
        <StatsDisplay />
      </section>
      <section>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
          Navigation Components
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <p style={{ fontWeight: '600', marginBottom: '12px' }}>Navigation Icon Buttons</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <NavIconButton icon={<IconFont name="book-colored" />} aria-label="Books" />
              <NavIconButton icon={<IconFont name="planet" />} aria-label="Globe" />
              <NavIconButton icon={<IconFont name="increase" />} aria-label="Trending" />
              <NavIconButton
                icon={<IconFont name="trophey" size={20} color="#F0B100" />}
                aria-label="Trophy"
                isActive
              />
            </div>
          </div>

          <div>
            <p style={{ fontWeight: '600', marginBottom: '12px' }}>Stat Buttons</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <StatButton icon={<IconFont name="fire" />} value={0} background="#FCEDE3" />
              <StatButton
                icon={<IconFont name="trophey" size={16} color="#F0B100" />}
                value={50}
                background="#FFFDF0"
              />
              <StatButton icon={<IconFont name="lightning" />} value={120} background="#F3F4F6" />
              <StatButton icon={<IconFont name="star" />} value={5} isActive />
            </div>
          </div>
        </div>
      </section>
      <section>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Avatar</h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Avatar size="sm" fallback="JD" />
          <Avatar size="md" fallback="AB" />
          <Avatar size="lg" fallback="CD" />
          <Avatar size="xl" fallback="EF" />
        </div>
      </section>
      <section>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
          Game Components
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <p style={{ fontWeight: '600', marginBottom: '12px' }}>Letter Tiles</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <LetterTile letter="H" state="default" />
              <LetterTile letter="e" state="default" />
              <LetterTile letter="l" state="correct" />
              <LetterTile letter="l" state="incorrect" />
              <LetterTile letter="e" state="default" />
            </div>
          </div>

          <div>
            <p style={{ fontWeight: '600', marginBottom: '12px' }}>Match Cards</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <MatchCard state="correct">Please</MatchCard>
              <MatchCard state="default">Please</MatchCard>
              <MatchCard state="default">Пожалуйста</MatchCard>
              <MatchCard state="incorrect">Please</MatchCard>
            </div>
          </div>
        </div>
      </section>
      <section>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Auth Modal</h2>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Button
            variant="secondary"
            onClick={() => {
              setAuthTab('login')
              setIsAuthOpen(true)
            }}
          >
            Open Login
          </Button>
          <Button
            variant="gradient"
            onClick={() => {
              setAuthTab('signup')
              setIsAuthOpen(true)
            }}
          >
            Open Sign Up
          </Button>
        </div>
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} defaultTab={authTab} />
      </section>
    </main>
  )
}

function Layout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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
