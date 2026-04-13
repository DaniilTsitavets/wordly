import { useState } from 'react'
import { Modal } from '@/components/atoms/Modal'
import { Input } from '@/components/atoms/Input'
import { Button } from '@/components/atoms/Button'
import { IconFont } from '@/components/atoms/IconFont'
import { WordlyLogo } from '@/assets/icons'
import styles from './AuthModal.module.scss'

type AuthTab = 'login' | 'signup'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: AuthTab
}

export const AuthModal = ({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) => {
  const [activeTab, setActiveTab] = useState<AuthTab>(defaultTab)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel={activeTab === 'login' ? 'Вход в аккаунт' : 'Регистрация'}
    >
      <div className={styles.header}>
        <WordlyLogo />
        <p className={styles.subtitle}>
          {activeTab === 'login' ? 'Start your learning journey' : 'Create your account'}
        </p>
      </div>

      <div className={styles.tabs} role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'login'}
          className={`${styles.tab} ${activeTab === 'login' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('login')}
        >
          Login
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'signup'}
          className={`${styles.tab} ${activeTab === 'signup' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('signup')}
        >
          Sign Up
        </button>
      </div>

      {activeTab === 'login' ? <LoginForm /> : <SignupForm />}
    </Modal>
  )
}

const LoginForm = () => {
  return (
    <div className={styles.form}>
      <Input
        label="Email"
        type="email"
        placeholder="your.email@example.com"
        className={styles.input}
      />
      <Input
        label="Password"
        placeholder="Enter your password"
        showPasswordToggle
        className={styles.input}
      />

      <div className={styles.forgotRow}>
        <a href="#" className={styles.forgotLink}>
          Forgot password?
        </a>
      </div>

      <Button variant="gradient" size="md" className={styles.submitBtn}>
        Login
      </Button>

      <SocialDivider label="or continue with" />
      <SocialButtons />
    </div>
  )
}

const SignupForm = () => {
  return (
    <div className={styles.form}>
      <Input
        label="Email"
        type="email"
        placeholder="your.email@example.com"
        className={styles.input}
      />
      <Input
        label="Password"
        placeholder="Create a strong password"
        showPasswordToggle
        className={styles.input}
      />
      <Input
        label="Confirm Password"
        placeholder="Re-enter your password"
        showPasswordToggle
        className={styles.input}
      />

      <p className={styles.terms}>
        I agree to the{' '}
        <a href="#" className={styles.termsLink}>
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="#" className={styles.termsLink}>
          Privacy Policy
        </a>
      </p>

      <Button variant="gradient" size="md" className={styles.submitBtn}>
        Create Account
      </Button>

      <SocialDivider label="or sign up with" />
      <SocialButtons />
    </div>
  )
}

const SocialDivider = ({ label }: { label: string }) => (
  <div className={styles.divider}>
    <span className={styles.dividerLine} />
    <span className={styles.dividerText}>{label}</span>
    <span className={styles.dividerLine} />
  </div>
)

const SocialButtons = () => (
  <div className={styles.socialGrid}>
    <button className={styles.socialBtn}>
      <IconFont name="google" size={20} decorative />
      Google
    </button>
    <button className={styles.socialBtn}>
      <IconFont name="github" size={20} decorative />
      GitHub
    </button>
  </div>
)

//usage
// import { AuthModal } from '@/components/organisms/AuthModal'

// <AuthModal isOpen={isOpen} onClose={() => setIsOpen(false)} defaultTab="login" />
