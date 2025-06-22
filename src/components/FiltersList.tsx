import { FilterListType } from '@/types/filterListType'
import SelectField from './SelectField'
import SearchField from './SearchField'
import React from 'react'

interface FiltersListProps {
  list: FilterListType[]
  setFilters: React.Dispatch<React.SetStateAction<any>>
}

export default function FiltersList({ list, setFilters }: FiltersListProps) {
  return (
    <div className="flex items-center gap-2">
      {list.map((item: FilterListType, index) => (
        <>
          {item.type === 'select' && (
            <SelectField key={1} item={item} setFilters={setFilters} />
          )}
          {item.type === 'search' && (
            <SearchField key={2} item={item} setFilters={setFilters} />
          )}
        </>
      ))}
    </div>
  )
}
