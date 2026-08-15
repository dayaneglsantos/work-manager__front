import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: readonly BreadcrumbItem[]
  className?: string
}

export default function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Navegação estrutural"
      className={`overflow-x-auto ${className ?? ''}`}
    >
      <ol className="flex min-w-max items-center gap-2 text-sm">
        {items.map((item, index) => {
          const isCurrentPage = index === items.length - 1

          return (
            <li
              key={`${item.label}-${item.href ?? 'current'}`}
              className="flex items-center gap-2"
            >
              {item.href && !isCurrentPage ? (
                <Link
                  href={item.href}
                  className="rounded-sm text-gray-500 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:text-dark-muted dark:hover:text-purple-200"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isCurrentPage ? 'page' : undefined}
                  className="font-semibold text-primary-dark dark:text-dark-text"
                >
                  {item.label}
                </span>
              )}

              {!isCurrentPage && (
                <FontAwesomeIcon
                  icon={faChevronRight}
                  aria-hidden="true"
                  className="h-2 w-2 text-gray-400 dark:text-dark-muted"
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
