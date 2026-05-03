"use client"

import { useEffect, useRef, useState } from "react"

export type FilterTab = "new" | "updated" | "all"

interface TabCounts {
  new: number
  updated: number
  all: number
}

interface Props {
  activeTab: FilterTab
  counts: TabCounts
  onTabChange: (tab: FilterTab) => void
}

const TABS: { key: FilterTab; label: string }[] = [
  { key: "new", label: "New" },
  { key: "updated", label: "Updated" },
  { key: "all", label: "All" }
]

// Mobile: horizontal sticky pill tabs with sliding highlight
export function MobileFilterTabs({ activeTab, counts, onTabChange }: Props) {
  const activeRef = useRef<HTMLButtonElement>(null)
  const [highlightStyle, setHighlightStyle] = useState({ left: 0, width: 0 })

  useEffect(() => {
    if (activeRef.current) {
      const btnRect = activeRef.current
      setHighlightStyle({
        left: btnRect.offsetLeft,
        width: btnRect.offsetWidth
      })
    }
  }, [activeTab])

  return (
    <div
      className="sticky top-0 z-10 flex gap-1 bg-gray-50 px-4 py-2 sm:hidden"
    >
      <div className="relative flex rounded-full bg-gray-200 p-1 gap-0">
        <div
          className="absolute top-1 bottom-1 rounded-full bg-white shadow transition-all duration-200 ease-in-out"
          style={{ left: highlightStyle.left, width: highlightStyle.width }}
        />
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            ref={activeTab === key ? activeRef : null}
            type="button"
            onClick={() => onTabChange(key)}
            className="relative rounded-full px-4 py-1 text-sm font-medium transition-colors duration-200"
          >
            {label} ({counts[key]})
          </button>
        ))}
      </div>
    </div>
  )
}

// Desktop: vertical sidebar menu with rectangular highlight
export function DesktopFilterTabs({ activeTab, counts, onTabChange }: Props) {
  return (
    <nav className="hidden sm:flex flex-col w-40 shrink-0 gap-1">
      {TABS.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onTabChange(key)}
          className={`text-left px-3 py-2 rounded text-sm font-medium transition-colors duration-150 ${
            activeTab === key
              ? "bg-gray-200 text-gray-900"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {label} ({counts[key]})
        </button>
      ))}
    </nav>
  )
}
