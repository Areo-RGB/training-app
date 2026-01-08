import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  showValue?: boolean
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, showValue = false, value, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <div className="flex justify-between text-sm font-bold text-text-secondary mb-2 uppercase tracking-wider">
            <span>{label}</span>
            {showValue && <span>{value}</span>}
          </div>
        )}
        <input
          type="range"
          className={cn(
            'w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-blue-500',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-dark-900',
            className
          )}
          ref={ref}
          value={value}
          {...props}
        />
      </div>
    )
  }
)
Slider.displayName = 'Slider'

export { Slider }
