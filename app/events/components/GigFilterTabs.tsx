"use client"

import { useLayoutEffect, useRef } from "react"

export type FilterTab = "new" | "updated" | "all"

interface TabCounts {
  new: number | undefined
  updated: number | undefined
  all: number
}

interface TabsProps {
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
export function MobileFilterTabs({ activeTab, counts, onTabChange }: TabsProps) {
  const activeRef = useRef<HTMLButtonElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (activeRef.current && highlightRef.current && containerRef.current) {
      // we highlight the active tab during SSR, and once this effect runs
      // we remove that highlight. the absolute-positioned highlight remains
      // and we use this effect to animate its position.
      activeRef.current.style.background = "transparent"
      activeRef.current.style.boxShadow = "none"
      const buttonRect = activeRef.current.getBoundingClientRect()
      const containerRect = containerRef.current.getBoundingClientRect()
      highlightRef.current.style.left = `${buttonRect.left - containerRect.left}px`
      highlightRef.current.style.width = `${buttonRect.width}px`
    }
  }, [activeTab])

  return (
    <div
      className="sticky top-0 z-10 flex gap-1 bg-inherit px-4 py-2 sm:hidden"
    >
      <div ref={containerRef} className="relative flex rounded-full bg-gray-200 p-1 gap-0">
        <div
          ref={highlightRef}
          className="absolute top-1 bottom-1 rounded-full bg-white shadow transition-all duration-200 ease-in-out"
        />
        {TABS.map(({ key, label }) => {
          const count = counts[key]
          return (
            <button
              key={key}
              ref={activeTab === key ? activeRef : null}
              type="button"
              onClick={() => onTabChange(key)}
              className={`relative rounded-full px-4 py-1 text-sm font-medium transition-colors duration-200 ${activeTab === key ? "bg-white shadow" : ""}`}
            >
              {label}{" "}
              <span className={count === undefined ? "invisible" : ""}>
                ({count ?? 0})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  )
}

// Desktop: vertical sidebar menu with rectangular highlight
export function DesktopFilterTabs({ activeTab, counts, onTabChange }: TabsProps) {
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
          {label}{" "}
          <span className={counts[key] === undefined ? "invisible" : ""}>
            ({counts[key] ?? 0})
          </span>
        </button>
      ))}
    </nav>
  )
}
