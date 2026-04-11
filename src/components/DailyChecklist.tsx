'use client'

import { useState } from 'react'

interface DailyChecklistProps {
  items: {
    id: string
    label: string
    checked: boolean
    hasTimer?: boolean
    icon: string
  }[]
  onToggle: (id: string) => void
}

export default function DailyChecklist({ items, onToggle }: DailyChecklistProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onToggle(item.id)}
          className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all
            ${item.checked 
              ? 'bg-green-500 border-green-500 text-white' 
              : 'bg-white border-gray-200 text-gray-700 hover:border-green-300'
            }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{item.icon}</span>
            <span className="font-medium text-lg">{item.label}</span>
          </div>
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center
            ${item.checked 
              ? 'bg-white border-white' 
              : 'border-gray-300'
            }`}>
            {item.checked && (
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}
