import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spinner } from '@/components/atoms/Spinner'
import { IconFont } from '@/components/atoms/IconFont'
import { Button } from '@/components/atoms/Button'
import { ProgressBar } from '@/components/atoms/ProgressBar'
import { Tabs } from '@/components/molecules/Tabs'
import type { UpdateUserPayload, UserProfile } from '@/api/user'
import { useProfile } from './hooks/useProfile'
import styles from './ProfilePage.module.scss'

const PASSWORD_PLACEHOLDER = '••••••••••••••••'
const WORDS_LEARNED_STUB = 30
const DAILY_GOAL_MINUTES_STUDIED_STUB = 8
const DAILY_GOAL_TARGET_STUB = 10

type ColorTheme = UserProfile['color_theme']
const THEME_OPTIONS: ColorTheme[] = ['light', 'dark', 'system']

interface FormState {
  name: string
  surname: string
  email: string
  password: string
  color_theme: ColorTheme
}

type FormField = keyof FormState

function toForm(profile: UserProfile): FormState {
  return {
    name: profile.name,
    surname: profile.surname,
    email: profile.email,
    password: '',
    color_theme: profile.color_theme,
  }
}

export function ProfilePage() {
  const navigate = useNavigate()
  const { profile, isLoading, isSaving, error, saveError, updateProfile } = useProfile()

  if (isLoading && !profile) {
    return (
      <div className={styles.centered}>
        <Spinner />
      </div>
    )
  }

  if (error || !profile) {
    return <div className={styles.error}>{error ?? 'Profile not found'}</div>
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <IconFont name="arrow-back" size={22} decorative />
        </button>
        <h1 className={styles.title}>Profile &amp; Statistics</h1>
      </div>

      <ProfileHeaderCard profile={profile} />

      <Tabs
        tabs={[
          {
            id: 'personal',
            label: 'Personal info',
            content: (
              <PersonalInfoTab
                profile={profile}
                isSaving={isSaving}
                saveError={saveError}
                onSave={updateProfile}
              />
            ),
          },
          {
            id: 'statistics',
            label: 'My statistics',
            content: <StatisticsTab />,
          },
        ]}
      />
    </div>
  )
}

interface ProfileHeaderCardProps {
  profile: UserProfile
}

function ProfileHeaderCard({ profile }: ProfileHeaderCardProps) {
  const initial = (profile.name?.[0] ?? '?').toUpperCase()
  const fullName = [profile.name, profile.surname].filter(Boolean).join(' ') || 'User'

  return (
    <section className={styles.headerCard}>
      <div className={styles.identity}>
        <div className={styles.avatar} aria-hidden="true">
          {initial}
        </div>
        <div className={styles.identityText}>
          <p className={styles.userName}>{fullName}</p>
          <p className={styles.memberBadge}>Premium Member</p>
        </div>
      </div>

      <div className={styles.stats}>
        <StatCell
          icon={<IconFont name="diamond" size={28} color="#ff68e3" decorative />}
          value={profile.gems}
          label="Gems"
        />
        <StatCell
          icon={<IconFont name="fire" size={28} color="#ff6900" decorative />}
          value={profile.streak}
          label="Day Streak"
        />
        <StatCell
          icon={<IconFont name="star" size={28} color="#a239ff" decorative />}
          value={WORDS_LEARNED_STUB}
          label="Words"
        />
      </div>
    </section>
  )
}

interface StatCellProps {
  icon: React.ReactNode
  value: number | string
  label: string
}

function StatCell({ icon, value, label }: StatCellProps) {
  return (
    <div className={styles.statCell}>
      <span className={styles.statIcon}>{icon}</span>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  )
}

interface PersonalInfoTabProps {
  profile: UserProfile
  isSaving: boolean
  saveError: string | null
  onSave: (payload: UpdateUserPayload) => Promise<UserProfile | null>
}

function PersonalInfoTab({ profile, isSaving, saveError, onSave }: PersonalInfoTabProps) {
  const [form, setForm] = useState<FormState>(() => toForm(profile))
  const [editing, setEditing] = useState<Record<FormField, boolean>>({
    name: false,
    surname: false,
    email: false,
    password: false,
    color_theme: false,
  })
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    setForm(toForm(profile))
  }, [profile])

  const isDirty = useMemo(() => {
    return (
      form.name !== profile.name ||
      form.surname !== profile.surname ||
      form.email !== profile.email ||
      form.color_theme !== profile.color_theme ||
      form.password.length > 0
    )
  }, [form, profile])

  const toggleEdit = (field: FormField) => {
    setEditing((prev) => ({ ...prev, [field]: !prev[field] }))
    setSuccessMsg(null)
  }

  const handleChange =
    (field: FormField) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value
      setForm((prev) => ({ ...prev, [field]: value as FormState[typeof field] }))
      setSuccessMsg(null)
    }

  const handleSubmit = async () => {
    if (!isDirty || isSaving) return
    const payload: UpdateUserPayload = {}
    if (form.name !== profile.name) payload.name = form.name
    if (form.surname !== profile.surname) payload.surname = form.surname
    if (form.email !== profile.email) payload.email = form.email
    if (form.color_theme !== profile.color_theme) payload.color_theme = form.color_theme
    if (form.password.length > 0) payload.password = form.password

    const updated = await onSave(payload)
    if (updated) {
      setSuccessMsg('Profile updated')
      setForm((prev) => ({ ...prev, password: '' }))
      setEditing({
        name: false,
        surname: false,
        email: false,
        password: false,
        color_theme: false,
      })
    }
  }

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit()
      }}
    >
      <FieldRow
        label="Name"
        field="name"
        value={form.name}
        editing={editing.name}
        onToggle={() => toggleEdit('name')}
        onChange={handleChange('name')}
      />
      <FieldRow
        label="Surname"
        field="surname"
        value={form.surname}
        editing={editing.surname}
        onToggle={() => toggleEdit('surname')}
        onChange={handleChange('surname')}
      />
      <FieldRow
        label="Email"
        field="email"
        type="email"
        value={form.email}
        editing={editing.email}
        onToggle={() => toggleEdit('email')}
        onChange={handleChange('email')}
      />
      <FieldRow
        label="Password"
        field="password"
        type="password"
        value={editing.password ? form.password : PASSWORD_PLACEHOLDER}
        editing={editing.password}
        placeholder="Enter new password"
        onToggle={() => toggleEdit('password')}
        onChange={handleChange('password')}
      />
      <FieldRow
        label="Theme"
        field="color_theme"
        value={form.color_theme}
        editing={editing.color_theme}
        onToggle={() => toggleEdit('color_theme')}
        onChange={handleChange('color_theme')}
        options={THEME_OPTIONS}
      />

      {saveError && (
        <p className={styles.formError} role="alert">
          {saveError}
        </p>
      )}
      {successMsg && !saveError && <p className={styles.formSuccess}>{successMsg}</p>}

      <div className={styles.submitRow}>
        <Button
          type="submit"
          variant="gradient"
          size="lg"
          isLoading={isSaving}
          disabled={!isDirty}
          className={styles.submitBtn}
        >
          Update Profile
        </Button>
      </div>
    </form>
  )
}

interface FieldRowProps {
  label: string
  field: FormField
  value: string
  editing: boolean
  type?: string
  placeholder?: string
  options?: readonly string[]
  onToggle: () => void
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
}

function FieldRow({
  label,
  field,
  value,
  editing,
  type = 'text',
  placeholder,
  options,
  onToggle,
  onChange,
}: FieldRowProps) {
  const inputId = `profile-field-${field}`
  return (
    <div className={styles.field}>
      <div className={styles.fieldLabelRow}>
        <label htmlFor={inputId} className={styles.fieldLabel}>
          {label}
        </label>
        <button
          type="button"
          className={styles.editButton}
          onClick={onToggle}
          aria-label={editing ? `Stop editing ${label}` : `Edit ${label}`}
          aria-pressed={editing}
        >
          <IconFont name="edit" size={14} decorative />
        </button>
      </div>
      {options ? (
        <select
          id={inputId}
          className={styles.fieldInput}
          value={value}
          onChange={onChange}
          disabled={!editing}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={inputId}
          className={styles.fieldInput}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          readOnly={!editing}
        />
      )}
    </div>
  )
}

function StatisticsTab() {
  return (
    <div className={styles.statsTab}>
      <DailyGoalCard
        minutesStudied={DAILY_GOAL_MINUTES_STUDIED_STUB}
        target={DAILY_GOAL_TARGET_STUB}
      />
    </div>
  )
}

interface DailyGoalCardProps {
  minutesStudied: number
  target: number
}

function DailyGoalCard({ minutesStudied, target }: DailyGoalCardProps) {
  const progress = target > 0 ? Math.round((minutesStudied / target) * 100) : 0

  return (
    <section className={styles.dailyGoalCard}>
      <div className={styles.dailyGoalHeader}>
        <IconFont name="target" size={20} color="#1a1a1a" decorative />
        <h2 className={styles.dailyGoalTitle}>Daily Goal</h2>
      </div>

      <div className={styles.dailyGoalProgressRow}>
        <span className={styles.dailyGoalLabel}>Minutes studied</span>
        <span className={styles.dailyGoalValue}>
          {minutesStudied} / {target}
        </span>
      </div>

      <ProgressBar value={progress} color="purple" size="sm" />

      <Button variant="secondary" size="sm" className={styles.changeGoalBtn}>
        Change Goal
      </Button>
    </section>
  )
}
