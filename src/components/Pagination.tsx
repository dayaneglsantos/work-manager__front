'use client'

import {
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({
  page,
  totalPages,
  onPageChange
}: PaginationProps) {
  if (totalPages <= 1) return null

  const firstPage = Math.max(1, Math.min(page - 2, totalPages - 4))
  const visiblePages = Array.from(
    { length: Math.min(5, totalPages) },
    (_, index) => firstPage + index
  )

  return (
    <nav
      aria-label="Paginação"
      className="mt-8 flex items-center justify-center gap-2"
    >
      <button
        type="button"
        aria-label="Página anterior"
        disabled={page === 1}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors enabled:cursor-pointer enabled:hover:border-primary enabled:hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 dark:border-dark-border dark:text-dark-muted"
        onClick={() => onPageChange(page - 1)}
      >
        <FontAwesomeIcon icon={faChevronLeft} className="h-3 w-3" />
      </button>

      {visiblePages.map((visiblePage) => (
        <button
          type="button"
          key={visiblePage}
          aria-label={`Página ${visiblePage}`}
          aria-current={visiblePage === page ? 'page' : undefined}
          className={`h-9 min-w-9 rounded-full px-2 text-sm font-semibold transition-colors ${
            visiblePage === page
              ? 'bg-primary text-white'
              : 'cursor-pointer text-gray-600 hover:bg-primary/10 hover:text-primary dark:text-dark-muted dark:hover:text-purple-200'
          }`}
          onClick={() => onPageChange(visiblePage)}
        >
          {visiblePage}
        </button>
      ))}

      <button
        type="button"
        aria-label="Próxima página"
        disabled={page === totalPages}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors enabled:cursor-pointer enabled:hover:border-primary enabled:hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 dark:border-dark-border dark:text-dark-muted"
        onClick={() => onPageChange(page + 1)}
      >
        <FontAwesomeIcon icon={faChevronRight} className="h-3 w-3" />
      </button>
    </nav>
  )
}
