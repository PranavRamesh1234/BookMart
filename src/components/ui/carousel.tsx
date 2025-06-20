import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CarouselProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
  className?: string
  autoPlay?: boolean
  interval?: number
  itemsPerView?: number
}

export function Carousel<T>({
  items,
  renderItem,
  className,
  autoPlay = false,
  interval = 3000,
  itemsPerView = 3,
}: CarouselProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Create a duplicated array for infinite scroll
  const duplicatedItems = [...items, ...items]

  useEffect(() => {
    if (!autoPlay || isPaused) return

    const timer = setInterval(() => {
      handleNext()
    }, interval)

    return () => clearInterval(timer)
  }, [autoPlay, interval, isPaused])

  const handlePrevious = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex((prev) => {
      const newIndex = prev - 1
      if (newIndex < 0) {
        // When reaching the start, jump to the end of the first set
        setTimeout(() => {
          setCurrentIndex(items.length - 1)
          setIsTransitioning(false)
        }, 500) // Match transition duration
        return 0
      }
      setIsTransitioning(false)
      return newIndex
    })
  }

  const handleNext = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex((prev) => {
      const newIndex = prev + 1
      if (newIndex >= items.length) {
        // When reaching the end, jump to the start of the second set
        setTimeout(() => {
          setCurrentIndex(0)
          setIsTransitioning(false)
        }, 500) // Match transition duration
        return items.length
      }
      setIsTransitioning(false)
      return newIndex
    })
  }

  const handleMouseEnter = () => setIsPaused(true)
  const handleMouseLeave = () => setIsPaused(false)

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className={cn('relative w-full', className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${(currentIndex * 100) / itemsPerView}%)`,
              width: `${(duplicatedItems.length * 100) / itemsPerView}%`,
            }}
          >
            {duplicatedItems.map((item, index) => (
              <div
                key={index}
                className="flex-shrink-0 px-2"
                style={{ width: `${100 / itemsPerView}%` }}
              >
                {renderItem(item)}
              </div>
            ))}
          </div>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/95 hover:bg-background border shadow-sm"
          onClick={handlePrevious}
        >
          <span className="text-lg font-bold text-foreground">&lt;</span>
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/95 hover:bg-background border shadow-sm"
          onClick={handleNext}
        >
          <span className="text-lg font-bold text-foreground">&gt;</span>
        </Button>
      </div>

      <div className="flex justify-center space-x-2">
        {items.map((_, index) => (
          <button
            key={index}
            className={cn(
              'w-2 h-2 rounded-full transition-colors',
              index === currentIndex % items.length 
                ? 'bg-primary' 
                : 'bg-gray-200 dark:bg-gray-700'
            )}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  )
}
