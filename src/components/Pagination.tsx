import { TasksMetaType } from '@/types/taskType'
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'

interface PaginationProps {
  metaData: TasksMetaType
  updateList: (page: number) => Promise<void>
}

export default function Pagination({ metaData, updateList }: PaginationProps) {
  // ============= PAGINAÇÃO ==============
  const [page, setPage] = useState(metaData.page)
  const pagesPerGroup = 5
  // const totalTasks = metaData.totalCount
  // const totalPages = Math.ceil(totalTasks / 10) // Math.ceil arredondar para cima.
  const [groupStart, setGroupStart] = useState(1) // Qual página o grupo atual começa

  // Calcula as páginas do grupo atual
  const currentGroup = Array.from(
    { length: Math.min(pagesPerGroup, metaData.totalPages - groupStart + 1) },
    (_, i) => groupStart + i
  )

  const handlePrevGroup = () => {
    if (groupStart > 1) {
      setGroupStart(groupStart - pagesPerGroup)
      setPage(groupStart - pagesPerGroup > 0 ? groupStart - pagesPerGroup : 1)
    }
  }

  const handleNextGroup = () => {
    if (groupStart + pagesPerGroup <= metaData.totalPages) {
      setGroupStart(groupStart + pagesPerGroup)
      setPage(groupStart + pagesPerGroup)
    }
  }

  useEffect(() => {
    updateList(page)
  }, [page])

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
          onClick={() => setPage(pg)}
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
