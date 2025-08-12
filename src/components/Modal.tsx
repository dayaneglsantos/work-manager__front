import handleEscKey from '@/utils/handleEscKey'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export default function Modal({
  open,
  onClose,
  children,
  className
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => handleEscKey(e, onClose)

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return (
    <div
      className={` fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-screen w-screen bg-black/40 ${open ? 'block' : 'hidden'} flex items-center justify-center`}
      onClick={onClose}
    >
      <div
        className={`bg-gray-100 dark:bg-[#181C14] fixed md:w-6/12 h-10/12 rounded-2xl p-3 ${className}`}
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <FontAwesomeIcon
          icon={faXmark}
          className="p-1 bg-primary-dark rounded-sm text-white cursor-pointer absolute top-3 right-3 h-5 w-5"
          onClick={onClose}
        />
        {children}
      </div>
    </div>
  )
}
