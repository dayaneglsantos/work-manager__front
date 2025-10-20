import React from 'react'

interface TabProps {
  list: { value: string; label: string }[]
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>
  selectedTab: string
}

export default function Tabs({ list, setSelectedTab, selectedTab }: TabProps) {
  return (
    <div>
      {list.map((tab) => (
        <button
          key={tab.value}
          onClick={() => setSelectedTab(tab.value)}
          className={`px-2  mb-3 cursor-pointer ${selectedTab === tab.value ? ' border-b-2 dark:border-primary border-primary-dark' : ''}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
