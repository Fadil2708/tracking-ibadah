'use client'

import { useState, useCallback } from 'react'

interface DzikirCounterProps {
  label: string
  value: number
  target?: number
  onChange: (value: number) => void
  color?: string
}

export default function DzikirCounter({
  label,
  value,
  target = 100,
  onChange,
  color = 'green',
}: DzikirCounterProps) {
  const [isPressed, setIsPressed] = useState(false)

  const handleIncrement = useCallback(() => {
    setIsPressed(true)
    onChange(value + 1)
    setTimeout(() => setIsPressed(false), 150)
  }, [value, onChange])

  const handleReset = useCallback(() => {
    onChange(0)
  }, [onChange])

  const progress = Math.min((value / target) * 100, 100)
  const isComplete = value >= target

  const colorClasses = {
    green: {
      bg: isComplete ? 'bg-green-500' : 'bg-green-100',
      border: 'border-green-300',
      text: 'text-green-700',
      button: isComplete ? 'bg-green-600' : 'bg-green-500 hover:bg-green-600',
      ring: 'ring-green-500',
    },
    blue: {
      bg: isComplete ? 'bg-blue-500' : 'bg-blue-100',
      border: 'border-blue-300',
      text: 'text-blue-700',
      button: isComplete ? 'bg-blue-600' : 'bg-blue-500 hover:bg-blue-600',
      ring: 'ring-blue-500',
    },
  }

  const colors = colorClasses[color as keyof typeof colorClasses] || colorClasses.green

  return (
    <div className={`rounded-xl p-6 ${colors.bg} border ${colors.border} transition-all`}>
      <div className="flex flex-col items-center">
        <h3 className={`text-lg font-semibold ${colors.text} mb-2`}>{label}</h3>
        
        <div className="text-4xl font-bold mb-4">
          <span className={isComplete ? 'text-white' : colors.text}>{value}</span>
          <span className={`text-lg ${isComplete ? 'text-white/80' : 'text-gray-500'} ml-1`}>
            / {target}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/50 rounded-full h-2 mb-4">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${isComplete ? 'bg-white' : 'bg-white'}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Counter Button */}
        <button
          onClick={handleIncrement}
          className={`w-20 h-20 rounded-full ${colors.button} text-white text-3xl font-bold 
            transition-all active:scale-95 shadow-lg ${isPressed ? 'scale-95' : ''}
            ${isComplete ? 'opacity-75' : ''}`}
        >
          +
        </button>

        {/* Reset Button */}
        {value > 0 && (
          <button
            onClick={handleReset}
            className={`mt-3 text-sm ${isComplete ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-gray-800'} 
              underline`}
          >
            Reset
          </button>
        )}

        {isComplete && (
          <div className="mt-2 text-white text-sm font-medium">✓ Selesai</div>
        )}
      </div>
    </div>
  )
}
