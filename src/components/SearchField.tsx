'use client'

import { FilterListType } from '@/types/filterListType'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'

export default function SearchField({
  item,
  setFilters
}: {
  item: FilterListType
  setFilters: React.Dispatch<React.SetStateAction<any>>
}) {
  const [focused, setFocused] = useState(false)
  const [debouncedValue, setDebouncedValue] = useState('')

  const handleChange = (value: string) => {
    setDebouncedValue(value)
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters((prev: any) => [
        ...prev.filter((filter: any) => filter.name !== item.name),
        {
          name: item.name,
          value: debouncedValue
        }
      ])
    }, 500)

    return () => clearTimeout(timeout)
  }, [debouncedValue, item.name, setFilters])

  return (
    <div
      style={{ width: item?.width || 300, height: item?.height || 40 }}
      className={`flex items-center justify-between border-gray-400 border rounded-md p-1.5 ${focused ? 'bg-gray-100 dark:bg-gray-800' : ''} ${item?.className}`}
    >
      <input
        type="text"
        placeholder={item?.placeholder}
        className={`w-full outline-none`}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => handleChange(e.target.value)}
      />
      <FontAwesomeIcon icon={faMagnifyingGlass} className="text-gray-500" />
    </div>
  )
}
