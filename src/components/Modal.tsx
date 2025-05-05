import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

export default function Modal({ open, onClose, children }: ModalProps) {
  return (
    <div
      className={` fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-screen w-screen bg-black/40 ${open ? 'block' : 'hidden'} flex items-center justify-center`}
      onClick={onClose}
    >
      <div
        className={`bg-gray-100 fixed md:w-6/12 h-10/12 rounded-2xl p-3`}
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
