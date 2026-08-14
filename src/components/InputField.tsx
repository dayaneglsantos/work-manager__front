import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { useState } from 'react'

interface InputFieldProps {
  title?: string
  type: 'password' | 'text'
  placeholder: string
  value: any
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string | undefined
  invalid?: boolean
  transparentUntilFocus?: boolean
  forceLightAppearance?: boolean
}

export default function InputField({
  title,
  type,
  placeholder,
  value,
  onChange,
  error,
  invalid = false,
  transparentUntilFocus = false,
  forceLightAppearance = false
}: InputFieldProps) {
  const [currentType, setCurrentType] = useState(type)
  const [showPassword, setShowPassword] = useState(false)
  const hasError = Boolean(error) || invalid
  const appearanceClasses = transparentUntilFocus
    ? `transition-all duration-300 dark:focus-within:bg-gray-700 focus-within:bg-gray-200 dark:focus-within:text-white ${hasError ? 'border-error border-1' : ''}`
    : forceLightAppearance
      ? `input-field--light bg-white text-black border-1 ${hasError ? 'border-error' : 'border-primary-light'}`
      : `bg-gray-50 dark:bg-gray-800 border-1 ${hasError ? 'border-error' : 'border-primary-light'}`

  const toggleShowPassword = () => {
    setCurrentType(currentType === 'password' ? 'text' : 'password')
    setShowPassword(!showPassword)
  }

  return (
    <div className="flex flex-col grow mb-3">
      {title && (
        <label className="text-start font-medium text-gray-700 dark:text-gray-300">
          {title}
        </label>
      )}
      <div
        className={`relative p-3 rounded-[8px] w-full mt-3 ${appearanceClasses}`}
      >
        <input
          type={currentType}
          placeholder={placeholder}
          className="w-11/12 bg-transparent outline-0"
          value={value}
          onChange={onChange}
        />
        {type === 'password' && !showPassword && (
          <FontAwesomeIcon
            icon={faEye}
            className="absolute right-4 top-4 cursor-pointer h-4 text-gray-400"
            onClick={toggleShowPassword}
          />
        )}
        {currentType === 'text' && showPassword && (
          <FontAwesomeIcon
            icon={faEyeSlash}
            className="absolute right-4 top-4 cursor-pointer h-4 text-gray-400"
            onClick={toggleShowPassword}
          />
        )}
      </div>
      {error && (
        <span className="text-error text-sm w-full text-start ml-4 mt-1">
          {error}
        </span>
      )}
    </div>
  )
}
