import { useState } from 'react'
import type { InputHTMLAttributes } from 'react'
import { IconFont } from '@/components/atoms/IconFont'
import styles from './Input.module.scss'

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
            {showPassword ? (
              <IconFont name="cross2" size={20} color="#6A7282" decorative />
            ) : (
              <IconFont name="eye" size={20} color="#6A7282" decorative />
            )}
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
