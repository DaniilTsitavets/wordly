import { useState } from 'react'
import type { InputHTMLAttributes } from 'react'
import styles from './Input.module.scss'

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M1.71835 10.2901C1.6489 10.103 1.6489 9.89715 1.71835 9.71006C2.39476 8.06993 3.54294 6.66759 5.01732 5.6808C6.4917 4.69402 8.22588 4.16724 10 4.16724C11.7741 4.16724 13.5083 4.69402 14.9827 5.6808C16.4571 6.66759 17.6053 8.06993 18.2817 9.71006C18.3511 9.89715 18.3511 10.103 18.2817 10.2901C17.6053 11.9302 16.4571 13.3325 14.9827 14.3193C13.5083 15.3061 11.7741 15.8329 10 15.8329C8.22588 15.8329 6.4917 15.3061 5.01732 14.3193C3.54294 13.3325 2.39476 11.9302 1.71835 10.2901Z"
      stroke="#6A7282"
      strokeWidth="1.66667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z"
      stroke="#6A7282"
      strokeWidth="1.66667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 3L17 17M8.68 8.68A3 3 0 0 0 10 13a3 3 0 0 0 2.32-4.32M6.61 6.61C4.91 7.66 3.53 9.17 2.72 10c.87 1.9 3.13 5 7.28 5 1.55 0 2.93-.47 4.1-1.18M9.88 4.13C9.92 4.13 9.96 4.12 10 4.12c4.15 0 6.41 3.1 7.28 5-.4.87-1.01 1.9-1.84 2.78"
      stroke="#6A7282"
      strokeWidth="1.66667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  errorText?: string
  showPasswordToggle?: boolean
}

export const Input = ({
  label,
  helperText,
  errorText,
  showPasswordToggle = false,
  type = 'text',
  id,
  className = '',
  ...props
}: InputProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  const hasError = !!errorText
  const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.inputWrapper}>
        <input
          id={inputId}
          type={inputType}
          className={`${styles.input} ${hasError ? styles.error : ''} ${showPasswordToggle ? styles.withIcon : ''}`}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      {helperText && !hasError && (
        <span id={`${inputId}-helper`} className={styles.helperText}>
          {helperText}
        </span>
      )}
      {hasError && (
        <span id={`${inputId}-error`} className={styles.errorText} role="alert">
          {errorText}
        </span>
      )}
    </div>
  )
}
