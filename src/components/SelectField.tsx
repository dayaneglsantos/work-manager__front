'use client'

import { FilterListType } from '@/types/filterListType'
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useRef, useState } from 'react'

interface Option {
  label: string
  value: string
}

export default function SelectField({
  item,
  setFilters
}: {
  item: FilterListType
  setFilters: React.Dispatch<React.SetStateAction<any>>
}) {
  const [open, setOpen] = useState(false)
  const [selectedList, setSelectedList] = useState<Option[]>([])
  const selectRef = useRef<HTMLDivElement>(null)

  const handleSelect = (selected: Option) => {
    if (item?.multiple) {
      setSelectedList((prev) => {
        if (prev.some((item) => item.value === selected.value)) {
          return prev.filter((item) => item.value !== selected.value)
        } else {
          return [...prev, selected]
        }
      })
    } else {
      setSelectedList([selected])
      setOpen(false)
    }
  }

  useEffect(() => {
    if (selectedList.length > 0) {
      setFilters((prev: any) => [
        ...prev.filter((filter: any) => filter.name !== item.name),
        {
          name: item.name,
          value: item.multiple
            ? selectedList.map((item) => item.value)
            : selectedList[0].value
        }
      ])
    }
  }, [selectedList, item.multiple, item.name, setFilters])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node) // Verifica se o clique foi fora do selectRef
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className={`relative ${item?.style}`} ref={selectRef}>
      <div
        style={{ width: item?.width || 300, height: item?.height || 40 }}
        className="flex items-center justify-between border border-primary rounded-md p-2"
        onClick={() => setOpen(!open)}
      >
        <span className="text-gray-500">{item?.placeholder}</span>
        <FontAwesomeIcon
          icon={open ? faCaretUp : faCaretDown}
          className="text-gray-500"
        />
      </div>
      {open && (
        <div className="absolute z-10 bg-gray-100 dark:bg-gray-800 w-full max-h-[600px] overflow-y-auto">
          {item?.options?.map((option: Option) => (
            <div
              key={option.value}
              className="p-2 shadow-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md cursor-pointer"
              onClick={() => handleSelect(option)}
            >
              {item?.multiple && (
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={selectedList.some(
                    (item) => item.value === option.value
                  )}
                />
              )}
              <span>{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
