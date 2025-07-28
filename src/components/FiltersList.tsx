import { FilterListType } from '@/types/filterListType'
import SelectField from './SelectField'
import SearchField from './SearchField'
import React from 'react'

interface FiltersListProps {
  list: FilterListType[]
  setFilters: React.Dispatch<React.SetStateAction<any>>
  setFiltersApplied: React.Dispatch<React.SetStateAction<boolean>>
}

export default function FiltersList({
  list,
  setFilters,
  setFiltersApplied
}: FiltersListProps) {
  return (
    <div className="flex items-center gap-2 ">
      {list.map((item: FilterListType, index) => (
        <div key={index}>
          {item.type === 'select' && (
            <SelectField
              options={item.options ?? []}
              filter
              setFilters={setFilters}
              multiple={item.multiple}
              name={item.name}
              placeholder={item.placeholder}
              value={item.value}
              setFiltersApplied={setFiltersApplied}
            />
          )}
          {item.type === 'search' && (
            <SearchField
              item={item}
              setFilters={setFilters}
              setFiltersApplied={setFiltersApplied}
            />
          )}
        </div>
      ))}
    </div>
  )
}
