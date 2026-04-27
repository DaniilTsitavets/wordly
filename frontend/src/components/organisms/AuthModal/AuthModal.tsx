import { useState } from 'react'
import { Modal } from '@/components/atoms/Modal'
import { Input } from '@/components/atoms/Input'
import { Button } from '@/components/atoms/Button'
import { IconFont } from '@/components/atoms/IconFont'
import { WordlyLogo } from '@/assets/icons'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setLoading, setError, loginSuccess } from '@/store/slices/authSlice'
import { login, register } from '@/api/auth'
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

      {activeTab === 'login' ? (
        <LoginForm onSuccess={onClose} />
      ) : (
        <SignupForm onSuccess={onClose} />
      )}
    </Modal>
  )
}

const LoginForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const dispatch = useAppDispatch()
  const { isLoading, error } = useAppSelector((state) => state.auth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async () => {
    dispatch(setLoading(true))
    try {
      const { access_token, user } = await login({ email, password })
      dispatch(loginSuccess({ token: access_token, user }))
      onSuccess()
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : 'Login failed'))
    }
  }

  return (
    <div className={styles.form}>
      <Input
        label="Email"
        type="email"
        placeholder="your.email@example.com"
        className={styles.input}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        label="Password"
        placeholder="Enter your password"
        showPasswordToggle
        className={styles.input}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className={styles.forgotRow}>
        <a href="#" className={styles.forgotLink}>
          Forgot password?
        </a>
      </div>

      {error && <p className={styles.errorMsg}>{error}</p>}

      <Button
        variant="gradient"
        size="md"
        className={styles.submitBtn}
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? 'Loading…' : 'Login'}
      </Button>

      <SocialDivider label="or continue with" />
      <SocialButtons />
    </div>
  )
}

const SignupForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const dispatch = useAppDispatch()
  const { isLoading, error } = useAppSelector((state) => state.auth)
  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState('')

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match')
      return
    }
    setLocalError('')
    dispatch(setLoading(true))
    try {
      const { access_token, user } = await register({ name, surname, email, password })
      dispatch(loginSuccess({ token: access_token, user }))
      onSuccess()
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : 'Registration failed'))
    }
  }

  const displayError = localError || error

  return (
    <div className={styles.form}>
      <Input
        label="Name"
        placeholder="Your first name"
        className={styles.input}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        label="Surname"
        placeholder="Your last name"
        className={styles.input}
        value={surname}
        onChange={(e) => setSurname(e.target.value)}
      />
      <Input
        label="Email"
        type="email"
        placeholder="your.email@example.com"
        className={styles.input}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        label="Password"
        placeholder="Create a strong password"
        showPasswordToggle
        className={styles.input}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Input
        label="Confirm Password"
        placeholder="Re-enter your password"
        showPasswordToggle
        className={styles.input}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
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

      {displayError && <p className={styles.errorMsg}>{displayError}</p>}

      <Button
        variant="gradient"
        size="md"
        className={styles.submitBtn}
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? 'Loading…' : 'Create Account'}
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
