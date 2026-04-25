/* ─────────────────────────────────────────────────────────
 * ANIMATED COFFEE ICON
 *
 *  ACTIVATE storyboard (gray → filled):
 *    0ms   icon snaps to scale 0.1, rotation −25°
 *    0ms   pulse ring expands from 0 → 2.4× (power2.out)
 *   55ms   icon rockets to scale 1.35, rotation +5° (back.out)
 *  180ms   icon settles to 1.0, 0° (elastic.out)
 *    0ms   color cross-fades gray → #171717
 *  100ms   steam wisps draw upward (pathLength 0→1, staggered 80ms)
 *  380ms   ring fully faded out
 *
 *  DEACTIVATE storyboard (filled → gray):
 *    0ms   icon squishes to scale 0.82
 *  100ms   icon returns to scale 1.0
 *    0ms   color cross-fades #171717 → #D4D4D4
 *    0ms   steam wisps retract into cup (pathLength 1→0, ease-in)
 * ───────────────────────────────────────────────────────── */

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
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
}

const STEAM = {
  drawDuration:    0.55,
  drawEase:        [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  drawDelay:       0.1,   // delay after cup burst before steam starts drawing
  stagger:         0.08,  // delay between wisp 1 and wisp 2
  retractDuration: 0.3,
  retractEase:     [0.4, 0, 0.8, 1] as [number, number, number, number],
  opacity:         0.7,
}

interface AnimatedCoffeeProps {
  isActive: boolean
  index:    number
  size?:    number
}

export function AnimatedCoffee({ isActive, size = 40 }: AnimatedCoffeeProps) {
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
      gsap.timeline()
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

      if (ringRef.current) {
        gsap.fromTo(
          ringRef.current,
          { scale: 0.5, opacity: 0.7 },
          { scale: RING.targetScale, opacity: 0, duration: RING.duration, ease: RING.ease }
        )
      }
    } else {
      gsap.timeline()
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

  // Opacity stays constant — pathLength alone controls visibility on both enter and exit
  const steamTarget = { pathLength: isActive ? 1 : 0 }

  return (
    <div
      style={{
        position:       'relative',
        width:          size,
        height:         size,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        flexShrink:     0,
      }}
    >
      {/* Pulse ring — expands and fades on activate */}
      <div
        ref={ringRef}
        style={{
          position:        'absolute',
          inset:           0,
          borderRadius:    '50%',
          border:          '2px solid rgba(23,23,23,0.18)',
          pointerEvents:   'none',
          opacity:         0,
          transformOrigin: 'center',
        }}
      />

      {/* GSAP drives scale, rotation, color on this wrapper */}
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
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">

          {/* ── Cup rim ─────────────────────────────────── */}
          <path
            fill="currentColor"
            d="M 6 13 Q 6 12 7 12 L 25 12 Q 26 12 26 13 L 26 15 L 6 15 Z"
          />

          {/* ── Cup body ─────────────────────────────────── */}
          <path
            fill="currentColor"
            d="M 7 15 L 25 15 L 24 27.5 Q 24 28.5 22.5 28.5 L 9.5 28.5 Q 8 28.5 8 27.5 Z"
          />

          {/* ── Handle ───────────────────────────────────── */}
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            d="M 25 17 Q 30 17 30 22 Q 30 27 25 27"
          />

          {/* ── Steam wisp 1 (left) — draws up on activate, retracts on deactivate ── */}
          <motion.path
            d="M 11 12 C 9 8.5 13 5.5 11 2"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            style={{ opacity: STEAM.opacity }}
            initial={false}
            animate={steamTarget}
            transition={{
              pathLength: isActive
                ? { duration: STEAM.drawDuration, ease: STEAM.drawEase, delay: STEAM.drawDelay }
                : { duration: STEAM.retractDuration, ease: STEAM.retractEase },
            }}
          />

          {/* ── Steam wisp 2 (right) — staggered 80ms after wisp 1 ── */}
          <motion.path
            d="M 21 12 C 23 8.5 19 5.5 21 2"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            style={{ opacity: STEAM.opacity }}
            initial={false}
            animate={steamTarget}
            transition={{
              pathLength: isActive
                ? { duration: STEAM.drawDuration, ease: STEAM.drawEase, delay: STEAM.drawDelay + STEAM.stagger }
                : { duration: STEAM.retractDuration, ease: STEAM.retractEase },
            }}
          />

        </svg>
      </div>
    </div>
  )
}
