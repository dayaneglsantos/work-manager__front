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
    <div className="flex items-center gap-2 flex-wrap">
      {list.map((item: FilterListType, index) => (
        <div key={index} className="flex flex-grow md:flex-grow-0">
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
              className={item.className}
              width={item.width}
            />
          )}
          {item.type === 'search' && (
            <SearchField
              defaultValue={
                typeof item.value === 'string' ? item.value : undefined
              }
              placeholder={item.placeholder}
              className={item.className}
              onChange={(value) => {
                setFiltersApplied(true)
                setFilters((previousFilters: any[]) => [
                  ...previousFilters.filter(
                    (filter) => filter.name !== item.name
                  ),
                  { name: item.name, value }
                ])
              }}
            />
          )}
        </div>
      ))}
    </div>
  )
}
