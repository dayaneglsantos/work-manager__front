'use client'

import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

export interface ActionMenuItem {
  label: string
  icon?: IconProp
  href?: string
  onClick?: () => void
  disabled?: boolean
}

interface ActionMenuProps {
  label: string
  items: ActionMenuItem[]
}

export default function ActionMenu({ label, items }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [openDirection, setOpenDirection] = useState<'up' | 'down'>('down')
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const toggleMenu = () => {
    if (isOpen) {
      setIsOpen(false)
      return
    }

    if (triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const estimatedMenuHeight = items.length * 44 + 16
      const spaceBelow = window.innerHeight - triggerRect.bottom
      const spaceAbove = triggerRect.top

      setOpenDirection(
        spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow
          ? 'up'
          : 'down'
      )
    }

    setIsOpen(true)
  }

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)

    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  const itemClassName =
    'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors'

  return (
    <div ref={menuRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary dark:border-dark-border dark:text-dark-muted dark:hover:text-purple-200"
        onClick={toggleMenu}
      >
        <FontAwesomeIcon icon={faEllipsisVertical} className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className={`absolute right-0 z-20 w-52 rounded-xl border border-gray-200 bg-gray-50 p-1 shadow-xl shadow-primary-dark/10 dark:border-dark-border dark:bg-dark-surface-hover dark:shadow-black/30 ${
            openDirection === 'up' ? 'bottom-12' : 'top-12'
          }`}
        >
          {items.map((item) => {
            const content = (
              <>
                {item.icon && (
                  <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
                )}
                <span>{item.label}</span>
              </>
            )

            if (item.href && !item.disabled) {
              return (
                <Link
                  role="menuitem"
                  key={item.label}
                  href={item.href}
                  className={`${itemClassName} text-primary-dark hover:bg-purple-50 dark:text-dark-text dark:hover:bg-dark-surface-hover`}
                  onClick={() => setIsOpen(false)}
                >
                  {content}
                </Link>
              )
            }

            return (
              <button
                type="button"
                role="menuitem"
                key={item.label}
                disabled={item.disabled}
                className={`${itemClassName} ${item.disabled ? 'cursor-not-allowed text-gray-400 opacity-60 dark:text-dark-muted' : 'cursor-pointer text-primary-dark hover:bg-purple-50 dark:text-dark-text dark:hover:bg-dark-surface-hover'}`}
                onClick={() => {
                  item.onClick?.()
                  setIsOpen(false)
                }}
              >
                {content}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
