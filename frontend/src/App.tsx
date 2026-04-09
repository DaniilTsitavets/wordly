import { Button } from '@/components/atoms/Button'
import { IconButton } from '@/components/atoms/IconButton'
import { Card } from '@/components/atoms/Card'
import { ProgressBar } from '@/components/atoms/ProgressBar'
import { Input } from '@/components/atoms/Input'
import { useState } from 'react'
import { Modal } from '@/components/atoms/Modal'
import { RewardModal } from '@/components/molecules/RewardModal'
import { Spinner } from '@/components/atoms/Spinner'
import { IconFont } from '@/components/atoms/IconFont'

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
          <Button
            variant="primary"
            rightIcon={<IconFont name="arrow-right" size={18} decorative />}
          >
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
          <IconButton
            icon={<IconFont name="heart" size={18} color="currentColor" decorative />}
            variant="primary"
            aria-label="Like"
          />
          <IconButton
            icon={<IconFont name="progress" size={18} color="currentColor" decorative />}
            variant="ghost"
            aria-label="Volume"
          />
          <IconButton
            icon={<IconFont name="lock" size={18} color="currentColor" decorative />}
            variant="ghost"
            aria-label="Lock"
          />
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '24px 0 16px' }}>
          Icon Button Sizes
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <IconButton
            icon={<IconFont name="heart" size={14} color="currentColor" decorative />}
            size="sm"
            variant="primary"
            aria-label="Small like"
          />
          <IconButton
            icon={<IconFont name="heart" size={18} color="currentColor" decorative />}
            size="md"
            variant="primary"
            aria-label="Medium like"
          />
          <IconButton
            icon={<IconFont name="heart" size={22} color="currentColor" decorative />}
            size="lg"
            variant="primary"
            aria-label="Large like"
          />
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '24px 0 16px' }}>Icomoon Font</h3>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', color: '#6631db' }}>
          <IconFont name="diamond" size={32} ariaLabel="Diamond icon" />
          <IconFont name="fire" size={32} ariaLabel="Fire icon" />
          <IconFont name="star" size={32} ariaLabel="Star icon" />
          <IconFont name="target" size={32} ariaLabel="Target icon" />
        </div>
      </section>
      <section>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Plates</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          <Card
            variant="default"
            icon={<IconFont name="star" size={24} color="#6631db" decorative />}
            title="Default Card"
            description="Basic card with default styling"
          />
          <Card
            variant="outlined"
            icon={<IconFont name="target" size={24} color="#6631db" decorative />}
            title="Outlined Card"
            description="Card with prominent border"
          />
          <Card
            variant="elevated"
            icon={<IconFont name="progress" size={24} color="#6631db" decorative />}
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
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Spinner</h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Spinner />
          <Spinner size="sm" />
          <Spinner size="lg" />
        </div>
      </section>
    </main>
  )
}

export default App
