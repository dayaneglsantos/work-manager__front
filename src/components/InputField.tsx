import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { useState } from 'react'

interface InputFieldProps {
  type: string
  placeholder: string
  value: any
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string | undefined
}

export default function InputField({
  type,
  placeholder,
  value,
  onChange,
  error
}: InputFieldProps) {
  const [currentType, setCurrentType] = useState(type)
  const [showPassword, setShowPassword] = useState(false)

  const toggleShowPassword = () => {
    setCurrentType(currentType === 'password' ? 'text' : 'password')
    setShowPassword(!showPassword)
  }

  return (
    <div className="flex flex-col w-full mb-3">
      <div className="relative p-3 bg-gray-50 rounded-2xl text-primary-dark border-primary-light border-1 w-full mt-3">
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
