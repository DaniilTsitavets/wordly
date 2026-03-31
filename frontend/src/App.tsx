import { ArrowRight, Heart, Volume2, Lock } from 'lucide-react'
import { Button } from './components/atoms/Button'
import { IconButton } from './components/atoms/IconButton'
import { Card } from './components/atoms/Card'
import { StarIcon, TrophyIcon, TrendingIcon } from './assets/icons'
import { ProgressBar } from './components/atoms/ProgressBar'
import { Input } from './components/atoms/Input'
import { useState } from 'react'
import { Modal } from './components/atoms/Modal'
import { RewardModal } from './components/molecules/RewardModal'

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRewardOpen, setIsRewardOpen] = useState(false)
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
            icon={<StarIcon />}
            title="Default Card"
            description="Basic card with default styling"
          />
          <Card
            variant="outlined"
            icon={<TrophyIcon />}
            title="Outlined Card"
            description="Card with prominent border"
          />
          <Card
            variant="elevated"
            icon={<TrendingIcon />}
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
    </main>
  )
}

export default App
