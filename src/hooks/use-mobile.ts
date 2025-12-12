import { useEffect, useState } from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState<boolean>(false)

  useEffect(() => {
    // Check for touch capability
    const hasTouch = 'ontouchstart' in window || 
      navigator.maxTouchPoints > 0 ||
      // @ts-expect-error - msMaxTouchPoints is IE-specific
      navigator.msMaxTouchPoints > 0

    setIsTouch(hasTouch)
  }, [])

  return isTouch
}

export function useMobileDetection() {
  const isMobile = useIsMobile()
  const isTouch = useIsTouchDevice()

  return {
    isMobile,
    isTouch,
    // Show mobile controls if either mobile viewport OR touch device
    showMobileControls: isMobile || isTouch
  }
}
