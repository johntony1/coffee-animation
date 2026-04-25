/* ─────────────────────────────────────────────────────────
 * ANIMATED SEAT ICON
 *
 *  ACTIVATE storyboard (gray → filled):
 *    0ms   icon snaps to scale 0.1, rotation −25°
 *    0ms   pulse ring expands from 0 → 2.4× (power2.out)
 *   55ms   icon rockets to scale 1.35, rotation +5° (back.out)
 *  180ms   icon settles to 1.0, 0° (elastic.out)
 *    0ms   color cross-fades gray → #171717
 *  380ms   ring fully faded out
 *
 *  DEACTIVATE storyboard (filled → gray):
 *    0ms   icon squishes to scale 0.82
 *  100ms   icon returns to scale 1.0
 *    0ms   color cross-fades #171717 → #D4D4D4
 * ───────────────────────────────────────────────────────── */

import { useEffect, useRef } from 'react'
import { Icon } from '@iconify/react'
import gsap from 'gsap'

const COLOR_ACTIVE   = '#171717'
const COLOR_INACTIVE = '#D4D4D4'

const ACTIVATE = {
  fromScale:      0.1,
  fromRotation:   -25,
  peakScale:      1.35,
  peakRotation:   5,
  peakDuration:   0.18,
  peakEase:       'back.out(1.5)',
  settleDuration: 0.42,
  settleEase:     'elastic.out(1.25, 0.45)',
  colorDuration:  0.2,
}

const RING = {
  targetScale: 2.4,
  duration:    0.38,
  ease:        'power2.out',
}

const DEACTIVATE = {
  squishScale:    0.82,
  squishDuration: 0.1,
  squishEase:     'power2.out',
  restoreDuration:0.28,
  restoreEase:    'power2.out',
  colorDuration:  0.18,
}

interface AnimatedSeatProps {
  isActive: boolean
  index:    number
  size?:    number
}

export function AnimatedSeat({ isActive, size = 40 }: AnimatedSeatProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const ringRef    = useRef<HTMLDivElement>(null)
  const prevActive = useRef(isActive)
  const mounted    = useRef(false)

  // Set initial color without animation
  useEffect(() => {
    if (!wrapperRef.current) return
    gsap.set(wrapperRef.current, { color: isActive ? COLOR_ACTIVE : COLOR_INACTIVE })
    mounted.current = true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!mounted.current || !wrapperRef.current) return

    const wasActive = prevActive.current
    if (wasActive === isActive) return
    prevActive.current = isActive

    gsap.killTweensOf(wrapperRef.current)

    if (isActive) {
      // Burst in
      const tl = gsap.timeline()
      tl
        .set(wrapperRef.current, { scale: ACTIVATE.fromScale, rotation: ACTIVATE.fromRotation })
        .to(wrapperRef.current, {
          scale:    ACTIVATE.peakScale,
          rotation: ACTIVATE.peakRotation,
          color:    COLOR_ACTIVE,
          duration: ACTIVATE.peakDuration,
          ease:     ACTIVATE.peakEase,
        })
        .to(wrapperRef.current, {
          scale:    1,
          rotation: 0,
          duration: ACTIVATE.settleDuration,
          ease:     ACTIVATE.settleEase,
        })

      // Pulse ring
      if (ringRef.current) {
        gsap.fromTo(
          ringRef.current,
          { scale: 0.5, opacity: 0.7 },
          { scale: RING.targetScale, opacity: 0, duration: RING.duration, ease: RING.ease }
        )
      }
    } else {
      // Deflate out
      const tl = gsap.timeline()
      tl
        .to(wrapperRef.current, {
          scale:    DEACTIVATE.squishScale,
          color:    COLOR_INACTIVE,
          duration: DEACTIVATE.squishDuration,
          ease:     DEACTIVATE.squishEase,
        })
        .to(wrapperRef.current, {
          scale:    1,
          duration: DEACTIVATE.restoreDuration,
          ease:     DEACTIVATE.restoreEase,
        })
    }
  }, [isActive])

  return (
    <div
      style={{
        position:        'relative',
        width:           size,
        height:          size,
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        flexShrink:      0,
      }}
    >
      {/* Pulse ring — expands and fades on activate */}
      <div
        ref={ringRef}
        style={{
          position:     'absolute',
          inset:        0,
          borderRadius: '50%',
          border:       '2px solid rgba(23,23,23,0.18)',
          pointerEvents:'none',
          opacity:      0,
          transformOrigin: 'center',
        }}
      />

      {/* Icon — GSAP drives scale, rotation, color */}
      <div
        ref={wrapperRef}
        style={{
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          color:           isActive ? COLOR_ACTIVE : COLOR_INACTIVE,
          transformOrigin: 'center',
          willChange:      'transform',
        }}
      >
        <Icon icon="mingcute:sofa-fill" width={size} height={size} />
      </div>
    </div>
  )
}
