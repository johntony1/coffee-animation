/* ─────────────────────────────────────────────────────────
 * CLOCK DIGIT — slot-machine vertical scroll
 *
 *  STORYBOARD (on digit change):
 *    0ms   strip starts at current digit position
 *    0ms   GSAP animates y to new digit (elastic.out)
 *  420ms   digit settles with natural overshoot bounce
 *
 *  Direction: count↑ → strip scrolls up  (y decreases)
 *             count↓ → strip scrolls down (y increases)
 * ───────────────────────────────────────────────────────── */

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const SIZES = {
  lg: { h: 28, w: 12, fontSize: 16, fontWeight: 500 },
  sm: { h: 16, w: 8,  fontSize: 12, fontWeight: 500 },
}

const ANIM = {
  duration: 0.42,
  ease: 'elastic.out(1.05, 0.58)',
}

interface ClockDigitProps {
  digit: number
  size?: 'lg' | 'sm'
  color?: string
}

export function ClockDigit({ digit, size = 'lg', color = '#171717' }: ClockDigitProps) {
  const stripRef = useRef<HTMLDivElement>(null)
  const prevRef  = useRef<number>(digit)
  const initRef  = useRef(false)
  const { h, w, fontSize, fontWeight } = SIZES[size]

  // Position strip immediately on mount (no animation)
  useEffect(() => {
    if (!stripRef.current) return
    gsap.set(stripRef.current, { y: -digit * h })
    initRef.current = true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Animate on digit change
  useEffect(() => {
    if (!initRef.current || !stripRef.current || prevRef.current === digit) {
      prevRef.current = digit
      return
    }
    prevRef.current = digit

    gsap.to(stripRef.current, {
      y: -digit * h,
      duration: ANIM.duration,
      ease: ANIM.ease,
      overwrite: true,
    })
  }, [digit, h])

  return (
    <div style={{ height: h, width: w, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
      <div ref={stripRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%' }}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
          <div
            key={d}
            style={{
              height: h,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize,
              fontWeight,
              fontVariantNumeric: 'tabular-nums',
              color,
              lineHeight: 1,
              fontFamily: "'Inter', -apple-system, sans-serif",
              userSelect: 'none',
            }}
          >
            {d}
          </div>
        ))}
      </div>
    </div>
  )
}
