import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { useState } from 'react'

interface InputFieldProps {
  type: 'password' | 'text'
  placeholder: string
  value: any
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string | undefined
  transparentUntilFocus?: boolean
}

export default function InputField({
  type,
  placeholder,
  value,
  onChange,
  error,
  transparentUntilFocus = false
}: InputFieldProps) {
  const [currentType, setCurrentType] = useState(type)
  const [showPassword, setShowPassword] = useState(false)

  const toggleShowPassword = () => {
    setCurrentType(currentType === 'password' ? 'text' : 'password')
    setShowPassword(!showPassword)
  }

  return (
    <div className="flex flex-col grow mb-3">
      <div
        className={`relative p-3 rounded-[8px] w-full mt-3 ${transparentUntilFocus ? 'transition-all duration-300 dark:focus-within:bg-gray-700 focus-within:bg-gray-200 dark:focus-within:text-white' : 'bg-gray-50  dark:bg-gray-800 border-primary-light border-1'} `}
      >
        <input
          type={currentType}
          placeholder={placeholder}
          className="w-11/12 outline-0"
          value={value}
          onChange={onChange}
        />
        {type === 'password' && !showPassword && (
          <FontAwesomeIcon
            icon={faEye}
            className="absolute right-4 top-4 cursor-pointer h-4"
            onClick={toggleShowPassword}
          />
        )}
        {currentType === 'text' && showPassword && (
          <FontAwesomeIcon
            icon={faEyeSlash}
            className="absolute right-4 top-4 cursor-pointer h-4"
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
