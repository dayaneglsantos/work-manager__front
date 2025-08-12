'use client'

import { FilterListType } from '@/types/filterListType'
import handleEscKey from '@/utils/handleEscKey'
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useRef, useState } from 'react'

interface Option {
  label: string
  value: string
}

export interface SelectFieldProps {
  options: Option[]
  setFilters?: React.Dispatch<React.SetStateAction<any>>
  multiple?: boolean
  value?: string | string[] | number | number[]
  onChange?: (value: string | string[] | number | number[]) => void
  placeholder?: string
  filter?: boolean
  name?: string
  className?: string
  width?: number
  height?: number
  setFiltersApplied?: React.Dispatch<React.SetStateAction<boolean>>
}

export default function SelectField({
  options,
  setFilters,
  value,
  multiple,
  onChange,
  placeholder = 'Selecione uma opção',
  filter = false,
  name,
  className,
  width,
  height,
  setFiltersApplied
}: SelectFieldProps) {
  const [open, setOpen] = useState(false)
  const [selectedList, setSelectedList] = useState<Option[]>([])
  const selectRef = useRef<HTMLDivElement>(null)

  const handleSelect = (selected: Option) => {
    if (multiple) {
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
    if (filter && setFiltersApplied) {
      setFiltersApplied(true)
    }
  }

  useEffect(() => {
    if (filter && setFilters) {
      setFilters((prev: any) => [
        ...prev.filter((filter: any) => filter.name !== name),
        {
          name,
          value: multiple
            ? selectedList.map((item) => item?.value)
            : selectedList[0]?.value
        }
      ])
    } else if (onChange) {
      onChange(
        multiple
          ? selectedList.map((item) => item?.value)
          : selectedList[0]?.value
      )
    }
  }, [selectedList])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node) // Verifica se o clique foi fora do selectRef
      ) {
        setOpen(false)
      }
    }
    const handleEsc = (e: KeyboardEvent) => {
      e.stopPropagation()
      handleEscKey(e, () => setOpen(false))
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEsc)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [])

  useEffect(() => {
    if (value) {
      const selectedValues = Array.isArray(value) ? value : [value]
      const newSelectedList = options.filter((option) =>
        selectedValues.includes(option.value)
      )
      setSelectedList(newSelectedList)
    }
  }, [value])

  return (
    <div className={`relative  ${className}`} ref={selectRef}>
      <div
        style={{ width: width || 300, height: height || 40 }}
        className="flex items-center justify-between border border-gray-400 rounded-md p-2 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        {selectedList.length > 0 ? (
          <span className="overflow-hidden text-ellipsis whitespace-nowrap">
            {selectedList.map((item) => item.label).join(', ')}
          </span>
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
        <FontAwesomeIcon
          icon={open ? faCaretUp : faCaretDown}
          className="text-gray-500"
        />
      </div>
      {open && (
        <div className="absolute z-10 bg-gray-100 dark:bg-primary-dark w-full max-h-[600px] overflow-y-auto rounded-md">
          {options?.map((option: Option) => (
            <div
              key={option.value}
              className="p-2 shadow-gray-400 hover:bg-gray-200 dark:hover:bg-primary-hover rounded-md cursor-pointer"
              onClick={() => handleSelect(option)}
            >
              {multiple && (
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={selectedList.some(
                    (item) => item.value === option.value
                  )}
                  onChange={() => handleSelect(option)}
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
