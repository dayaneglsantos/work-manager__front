import { TasksMetaType } from '@/types/taskType'
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { set } from 'date-fns'
import { useEffect, useRef, useState } from 'react'

interface PaginationProps {
  metaData: TasksMetaType
  updateList: (page: number) => Promise<void>
}

export default function Pagination({ metaData, updateList }: PaginationProps) {
  // ============= PAGINAÇÃO ==============
  const [page, setPage] = useState(metaData.page)
  const pagesPerGroup = 5
  const [groupStart, setGroupStart] = useState(1) // Qual página o grupo atual começa

  // Calcula as páginas do grupo atual
  const currentGroup = Array.from(
    { length: Math.min(pagesPerGroup, metaData.totalPages - groupStart + 1) },
    (_, i) => groupStart + i
  )

  const handlePrevGroup = () => {
    const prevStart = groupStart - pagesPerGroup
    if (groupStart > 1) {
      setGroupStart(prevStart > 0 ? prevStart : 1)
      setPage(prevStart > 0 ? prevStart : 1)
    }
  }

  const handleNextGroup = () => {
    const nextStart = groupStart + pagesPerGroup

    if (nextStart <= metaData.totalPages) {
      setGroupStart(nextStart)
      setPage(nextStart)
    }
  }

  const handleChangePage = (newPage: number) => {
    setPage(newPage)
    updateList(newPage)
  }

  return (
    <div className="w-48 mt-4 flex m-auto gap-2 items-center justify-center">
      <FontAwesomeIcon
        icon={faCaretLeft}
        className={`transition-transform duration-200 text-2xl ${
          groupStart === 1
            ? 'opacity-30 cursor-default'
            : 'hover:scale-125 cursor-pointer'
        }`}
        onClick={handlePrevGroup}
      />
      {currentGroup.map((pg) => (
        <span
          key={pg}
          onClick={() => handleChangePage(pg)}
          className={`text-center block w-6 h-6 rounded-full cursor-pointer ${page === pg ? 'bg-primary hover:bg-primary text-white' : 'bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 hover:dark:bg-gray-500'}`}
        >
          {pg}
        </span>
      ))}

      <FontAwesomeIcon
        icon={faCaretRight}
        className={`transition-transform duration-200 text-2xl ${
          groupStart + pagesPerGroup > metaData.totalPages
            ? 'opacity-30 cursor-default'
            : 'hover:scale-125 cursor-pointer'
        }`}
        onClick={handleNextGroup}
      />
    </div>
  )
}
