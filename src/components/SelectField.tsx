'use client'

import handleEscKey from '@/utils/handleEscKey'
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useId, useRef, useState } from 'react'
import Avatar from './Avatar'

export interface SelectOption {
  label: string
  value: string | number
  avatar?: string
}

export interface SelectFieldProps {
  options: SelectOption[]
  setFilters?: React.Dispatch<React.SetStateAction<any>>
  multiple?: boolean
  value?: string | number | Array<string | number>
  onChange?: (value: string | number | Array<string | number>) => void
  placeholder?: string
  filter?: boolean
  name?: string
  className?: string
  width?: number
  height?: number
  setFiltersApplied?: React.Dispatch<React.SetStateAction<boolean>>
  required?: boolean
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
  setFiltersApplied,
  required
}: SelectFieldProps) {
  const [open, setOpen] = useState(false)
  const [selectedList, setSelectedList] = useState<SelectOption[]>([])
  const selectRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()
  const [optionsPosition, setOptionsPosition] = useState<'up' | 'down'>('down')
  const optionsKey = options.map((option) => option.value).join('|')

  const calculatePosition = () => {
    if (selectRef.current) {
      const inputRect = selectRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - inputRect.bottom

      if (spaceBelow < 250) {
        setOptionsPosition('up')
      } else {
        setOptionsPosition('down')
      }
    }
  }

  const optionsClasses =
    optionsPosition === 'up'
      ? 'bottom-full mb-1 left-0'
      : 'top-full mt-0.5 left-0'

  const notifySelectionChange = (nextSelection: SelectOption[]) => {
    if (filter && setFiltersApplied) {
      setFiltersApplied(true)
    }
    if (filter && setFilters) {
      setFilters((prev: any) => [
        ...prev.filter((filter: any) => filter.name !== name),
        {
          name,
          value: multiple
            ? nextSelection.map((item) => item.value)
            : nextSelection[0]?.value
        }
      ])
    } else if (onChange) {
      onChange(
        multiple
          ? nextSelection.map((item) => item.value)
          : nextSelection[0]?.value
      )
    }
  }

  const handleSelect = (selected: SelectOption) => {
    const nextSelection = multiple
      ? selectedList.some((item) => item.value === selected.value)
        ? selectedList.filter((item) => item.value !== selected.value)
        : [...selectedList, selected]
      : [selected]

    setSelectedList(nextSelection)
    notifySelectionChange(nextSelection)

    if (!multiple) {
      setOpen(false)
    }
  }

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
    if (value !== undefined) {
      const selectedValues = Array.isArray(value) ? value : [value]
      const newSelectedList = options.filter((option) =>
        selectedValues.includes(option.value)
      )
      setSelectedList(newSelectedList)
    }
  }, [optionsKey, value])

  return (
    <div
      className={`relative min-w-0 ${className ?? ''}`}
      ref={selectRef}
    >
      <div
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-required={required}
        tabIndex={0}
        style={{
          maxWidth: '100%',
          width: width ? `${width}px` : '100%',
          height: height || 40
        }}
        className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border bg-white px-3 text-sm text-primary-dark transition-colors dark:bg-dark-surface dark:text-dark-text ${
          open
            ? 'border-primary ring-2 ring-primary/15 dark:border-primary-light'
            : 'border-gray-200 hover:border-primary/40 dark:border-dark-border dark:hover:border-primary-light/40'
        }`}
        onClick={() => {
          setOpen(!open)
          calculatePosition()
        }}
      >
        {selectedList.length > 0 ? (
          <span className="overflow-hidden text-ellipsis whitespace-nowrap">
            {selectedList.map((item) => item.label).join(', ')}
          </span>
        ) : (
          <span className="truncate text-gray-400 dark:text-dark-muted/70">
            {placeholder}
          </span>
        )}
        <FontAwesomeIcon
          icon={open ? faCaretUp : faCaretDown}
          className="h-4 w-4 shrink-0 text-gray-500 dark:text-dark-muted"
        />
      </div>
      {open && (
        <div
          id={listboxId}
          role="listbox"
          className={`absolute z-20 max-h-72 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-1 shadow-xl shadow-primary-dark/10 dark:border-dark-border dark:bg-dark-surface dark:shadow-black/30 ${optionsClasses}`}
        >
          {options.length > 0 ? (
            options?.map((option: SelectOption) => (
              <div
                key={option.value}
                className="cursor-pointer rounded-lg p-2 text-sm text-primary-dark transition-colors hover:bg-purple-50 dark:text-dark-text dark:hover:bg-dark-surface-hover"
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
                <div className="flex items-center gap-1">
                  {option.avatar && (
                    <Avatar src={option.avatar} size="sm" className="mr-2" />
                  )}
                  <span>{option.label}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-2 text-sm text-gray-500 dark:text-dark-muted">
              Sem opções disponíveis
            </div>
          )}
        </div>
      )}
    </div>
  )
}
