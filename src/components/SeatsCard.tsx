/* ─────────────────────────────────────────────────────────
 * COFFEE CARD  — full animation storyboard
 *
 *  MOUNT:
 *    0ms   card fades in, scale 0.96 → 1.0 (spring)
 *   80ms   coffee icons stagger in (40ms each)
 *  380ms   stepper slides up
 *  480ms   footer fades in
 *
 *  ADD COFFEE:
 *    0ms   new coffee icon bursts in (see AnimatedCoffee)
 *    0ms   counter digit scrolls up (slot-machine)
 *    0ms   badge clock digit ticks down
 *    0ms   plus button squishes + springs back (GSAP)
 *    0ms   fill pill grows right → count/MAX width (spring)
 *
 *  REMOVE COFFEE:
 *    0ms   coffee icon deflates gray (see AnimatedCoffee)
 *    0ms   counter digit scrolls down
 *    0ms   badge clock digit ticks up
 *    0ms   minus button squishes + springs back (GSAP)
 *    0ms   fill pill shrinks left → count/MAX width (spring)
 * ───────────────────────────────────────────────────────── */

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'
import gsap from 'gsap'

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path fill="currentColor" d="M10.5 20a1.5 1.5 0 0 0 3 0v-6.5H20a1.5 1.5 0 0 0 0-3h-6.5V4a1.5 1.5 0 0 0-3 0v6.5H4a1.5 1.5 0 0 0 0 3h6.5z"/>
  </svg>
)

const MinusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path fill="currentColor" d="M4 10.5a1.5 1.5 0 0 0 0 3h16a1.5 1.5 0 0 0 0-3H4z"/>
  </svg>
)

import { AnimatedCoffee } from './AnimatedCoffee'
import { ClockDigit }   from './ClockDigit'

// ─── config ───────────────────────────────────────────────

const MAX_COFFEES = 6

const TIMING = {
  seatStagger:  0.04,   // seconds between each seat mount
  stepperDelay: 0.38,   // seconds before stepper slides in
  footerDelay:  0.48,   // seconds before footer fades in
}

const CARD = {
  spring: { type: 'spring' as const, stiffness: 320, damping: 28 },
}

const SEAT_ROW = {
  spring: { type: 'spring' as const, stiffness: 420, damping: 22 },
}

const STEPPER = {
  spring: { type: 'spring' as const, stiffness: 380, damping: 24 },
}

const FOOTER = {
  ease:     [0.2, 0, 0, 1] as const,
  duration: 0.3,
}

// Fill pill: grows from left edge, proportional to count/MAX
// scaleX = count/MAX, transformOrigin = left
const FILL_PILL = {
  spring: { type: 'spring' as const, stiffness: 360, damping: 30 },
}

const BTN = {
  pressScale:      0.82,
  pressDuration:   0.1,
  pressEase:       'power2.out',
  springEase:      'elastic.out(1.3, 0.5)',
  springDuration:  0.45,
}

// ─── shadows matching Figma exactly ──────────────────────

const CARD_SHADOW = [
  '0px 0px 0px 1px rgba(51,51,51,0.04)',
  '0px 16px 8px -8px rgba(51,51,51,0.01)',
  '0px 12px 6px -6px rgba(51,51,51,0.02)',
  '0px 5px 5px -2.5px rgba(51,51,51,0.08)',
  '0px 1px 3px -1.5px rgba(51,51,51,0.16)',
].join(', ')

const INNER_SHADOW = 'inset 0px -0.5px 0.5px 0px rgba(51,51,51,0.08)'

const BTN_SHADOW = [
  '0px 1px 3px 0px rgba(14,18,27,0.12)',
  '0px 0px 0px 1px #ebebeb',
].join(', ')

// ─── book seat button ─────────────────────────────────────

// Hand-crafted positions — groups: up-left, up-right, straight up, falling sides, far reach
const CONFETTI_PIECES = [
  // up-left
  { x: -120, y: -110, r:  45, color: '#1fc16b', w: 16, h:  7, d: 0      },
  { x:  -80, y: -135, r: -30, color: '#fa7319', w: 11, h: 18, d: 0.02   },
  { x:  -45, y: -100, r: 135, color: '#f5c028', w: 18, h:  8, d: 0.05   },
  { x: -170, y:  -70, r:  80, color: '#b197fc', w: 13, h: 13, d: 0.04   },
  { x: -210, y:  -35, r: -70, color: '#f5c028', w:  9, h: 17, d: 0.055  },
  { x: -240, y:   15, r:  30, color: '#1fc16b', w: 14, h:  7, d: 0.03   },
  // up-right
  { x:  105, y: -120, r: -48, color: '#1fc16b', w: 13, h: 20, d: 0.01   },
  { x:  165, y:  -85, r:  60, color: '#fa7319', w: 20, h:  9, d: 0.03   },
  { x:   62, y: -140, r: -90, color: '#b197fc', w: 13, h: 13, d: 0.04   },
  { x:  215, y:  -50, r:  95, color: '#f5c028', w:  9, h: 18, d: 0.025  },
  { x:  195, y:  -12, r: -55, color: '#1fc16b', w: 18, h:  8, d: 0.05   },
  { x:  250, y:   22, r:  40, color: '#fa7319', w: 12, h:  7, d: 0.035  },
  // straight up
  { x:  -22, y: -165, r: 200, color: '#fa7319', w: 15, h: 15, d: 0.015  },
  { x:   22, y: -180, r:-160, color: '#f5c028', w:  9, h: 19, d: 0.035  },
  { x:  -72, y: -118, r:  90, color: '#b197fc', w: 21, h:  8, d: 0.025  },
  { x:   72, y: -122, r: -20, color: '#1fc16b', w: 13, h: 16, d: 0.045  },
  { x:   -8, y: -205, r:  70, color: '#1fc16b', w: 10, h: 10, d: 0.01   },
  { x:   32, y: -148, r: -45, color: '#fa7319', w: 16, h:  8, d: 0.04   },
  // gravity-falling sides
  { x: -135, y:   62, r:-120, color: '#fa7319', w: 15, h: 13, d: 0.01   },
  { x:  128, y:   78, r: 170, color: '#1fc16b', w: 19, h:  8, d: 0.038  },
  { x:  -68, y:   98, r:-100, color: '#b197fc', w: 11, h: 19, d: 0.028  },
  { x:   62, y:  108, r: 250, color: '#f5c028', w: 17, h: 15, d: 0.018  },
  { x: -178, y:   32, r: -85, color: '#1fc16b', w: 13, h:  9, d: 0.048  },
  { x:  182, y:   52, r: 140, color: '#fa7319', w:  9, h: 17, d: 0.032  },
  // far reach
  { x: -268, y:  -18, r:  60, color: '#b197fc', w: 14, h:  8, d: 0.02   },
  { x:  272, y:  -28, r: -80, color: '#1fc16b', w: 12, h: 14, d: 0.015  },
  { x: -198, y: -115, r: 120, color: '#fa7319', w: 10, h: 16, d: 0.045  },
  { x:  205, y: -105, r:-120, color: '#f5c028', w: 16, h:  9, d: 0.04   },
  { x:  -92, y:  135, r:  85, color: '#1fc16b', w:  8, h: 16, d: 0.055  },
  { x:   95, y:  128, r: -65, color: '#fa7319', w: 14, h:  8, d: 0.025  },
  // fill gaps
  { x: -148, y: -155, r:  22, color: '#f5c028', w: 12, h: 12, d: 0.012  },
  { x:  152, y: -160, r: -35, color: '#1fc16b', w:  9, h: 18, d: 0.028  },
  { x:  -30, y: -230, r: 110, color: '#fa7319', w: 17, h:  7, d: 0.018  },
  { x:   35, y: -220, r: -95, color: '#b197fc', w: 11, h: 11, d: 0.042  },
  { x: -310, y:  -55, r:  75, color: '#1fc16b', w: 13, h:  7, d: 0.022  },
  { x:  315, y:  -45, r: -75, color: '#fa7319', w:  8, h: 15, d: 0.033  },
  { x: -255, y: -130, r: 155, color: '#f5c028', w: 15, h:  8, d: 0.048  },
  { x:  258, y: -125, r:-155, color: '#1fc16b', w: 10, h: 14, d: 0.038  },
  { x: -112, y:  168, r: -40, color: '#fa7319', w: 18, h:  8, d: 0.014  },
  { x:  115, y:  172, r:  50, color: '#b197fc', w:  9, h: 17, d: 0.044  },
  { x:  -52, y:  195, r: 200, color: '#f5c028', w: 14, h: 14, d: 0.026  },
  { x:   55, y:  188, r:-200, color: '#1fc16b', w: 16, h:  7, d: 0.036  },
  { x: -335, y:   38, r:  90, color: '#b197fc', w: 11, h:  9, d: 0.052  },
  { x:  338, y:   42, r: -90, color: '#f5c028', w: 13, h: 11, d: 0.016  },
  { x: -225, y:  110, r: -30, color: '#1fc16b', w:  9, h: 16, d: 0.046  },
  { x:  228, y:  115, r:  30, color: '#fa7319', w: 15, h:  9, d: 0.034  },
  { x:  -18, y: -260, r: -70, color: '#1fc16b', w:  8, h: 13, d: 0.008  },
  { x:   22, y: -255, r:  80, color: '#f5c028', w: 12, h:  8, d: 0.058  },
  { x: -170, y:  -40, r: 165, color: '#fa7319', w: 19, h:  8, d: 0.006  },
  { x:  172, y:  -35, r:-165, color: '#b197fc', w:  8, h: 18, d: 0.054  },
]

function ConfettiBurst() {
  return (
    <div
      aria-hidden
      style={{ position: 'absolute', left: '50%', top: '50%', pointerEvents: 'none', zIndex: 9999 }}
    >
      {CONFETTI_PIECES.map((p, i) => (
        <motion.div
          key={i}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.4, rotate: p.r }}
          transition={{
            duration: 1.1,
            delay:    p.d,
            ease:     [0.15, 0.5, 0.25, 1],
            opacity:  { delay: p.d + 0.62, duration: 0.48, ease: 'easeIn' },
          }}
          style={{
            position:        'absolute',
            width:           p.w,
            height:          p.h,
            borderRadius:    3,
            backgroundColor: p.color,
            marginLeft:      -p.w / 2,
            marginTop:       -p.h / 2,
          }}
        />
      ))}
    </div>
  )
}

type BookingState = 'idle' | 'loading' | 'success'

function BookSeatButton() {
  const [state, setState] = useState<BookingState>('idle')
  const shakeRef = useRef<HTMLDivElement>(null)

  const handleClick = () => {
    if (state !== 'idle') return
    setState('loading')
    setTimeout(() => setState('success'), 1500)
  }

  // Scale thump → horizontal rattle when confetti fires
  useEffect(() => {
    if (state !== 'success' || !shakeRef.current) return
    gsap.timeline()
      .to(shakeRef.current, { scale: 1.05, duration: 0.07, ease: 'power2.out' })
      .to(shakeRef.current, { scale: 0.97, duration: 0.07, ease: 'power2.in'  })
      .to(shakeRef.current, { scale: 1,    x:  4, duration: 0.05, ease: 'none' })
      .to(shakeRef.current, {              x: -4, duration: 0.05, ease: 'none' })
      .to(shakeRef.current, {              x:  3, duration: 0.04, ease: 'none' })
      .to(shakeRef.current, {              x: -2, duration: 0.04, ease: 'none' })
      .to(shakeRef.current, {              x:  0, duration: 0.05, ease: 'power2.out' })
  }, [state])

  return (
    <div style={{ position: 'relative', width: '100%' }}>

      {state === 'success' && <ConfettiBurst />}

      {/* shakeRef wrapper — GSAP owns transform here; motion.button handles background */}
      <div ref={shakeRef} style={{ width: '100%' }}>
      <motion.button
        whileTap={state === 'idle' ? { scale: 0.97 } : undefined}
        animate={{ background: state === 'success' ? '#f0fdf4' : '#ffffff' }}
        transition={{
          default:    { type: 'spring', stiffness: 320, damping: 28 },
          background: { duration: 0.4, ease: [0.2, 0, 0, 1] },
        }}
        onClick={handleClick}
        style={{
          width:               '100%',
          height:              44,
          background:          '#ffffff',
          border:              'none',
          borderRadius:        16,
          fontSize:            14,
          fontWeight:          500,
          color:               '#5c5c5c',
          cursor:              state === 'idle' ? 'pointer' : 'default',
          boxShadow:           BTN_SHADOW,
          fontFamily:          'inherit',
          letterSpacing:       '-0.084px',
          fontFeatureSettings: "'ss11' 1, 'calt' 0, 'liga' 0",
          outline:             'none',
          display:             'flex',
          alignItems:          'center',
          justifyContent:      'center',
          overflow:            'hidden',
          position:            'relative',
        }}
      >
        {/* Ripple — clipped by button's overflow:hidden, expands from center and fades */}
        {state === 'success' && (
          <motion.span
            initial={{ scale: 0, opacity: 0.22 }}
            animate={{ scale: 7,  opacity: 0    }}
            transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
            style={{
              position:      'absolute',
              width:         60,
              height:        60,
              borderRadius:  '50%',
              background:    '#16a34a',
              top:           '50%',
              left:          '50%',
              marginTop:     -30,
              marginLeft:    -30,
              pointerEvents: 'none',
            }}
          />
        )}

        <AnimatePresence mode="wait" initial={false}>

          {state === 'idle' && (
            <motion.span
              key="idle"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12, ease: [0.2, 0, 0, 1] }}
            >
              Buy your coffee
            </motion.span>
          )}

          {state === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: [0.2, 0, 0, 1] }}
              style={{ display: 'flex', gap: 5, alignItems: 'center' }}
            >
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                  transition={{ duration: 0.75, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                  style={{ width: 5, height: 5, borderRadius: '50%', background: '#5c5c5c' }}
                />
              ))}
            </motion.div>
          )}

          {state === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#16a34a' }}
            >
              <motion.div
                initial={{ scale: 0.6 }}
                animate={{ scale: [0.6, 1.1, 1] }}
                transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <Icon icon="mingcute:check-fill" width={16} height={16} />
              </motion.div>
              <span>Ordered!</span>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.button>
      </div>
    </div>
  )
}

// ─── component ────────────────────────────────────────────

export function SeatsCard() {
  const [count, setCount] = useState(3)
  const [trackW, setTrackW] = useState(0) // measured after mount; 0 keeps pill hidden until ready

  const minusRef   = useRef<HTMLButtonElement>(null)
  const plusRef    = useRef<HTMLButtonElement>(null)
  const stepperRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (stepperRef.current) setTrackW(stepperRef.current.offsetWidth - 8)
  }, [])

  const remaining = MAX_COFFEES - count
  const tens      = Math.floor(count / 10)
  const units     = count % 10
  const remTens   = Math.floor(remaining / 10)
  const remUnits  = remaining % 10

  const pressButton = (el: HTMLButtonElement | null) => {
    if (!el) return
    gsap.killTweensOf(el)
    gsap
      .timeline()
      .to(el, { scale: BTN.pressScale,  duration: BTN.pressDuration, ease: BTN.pressEase })
      .to(el, { scale: 1,               duration: BTN.springDuration, ease: BTN.springEase })
  }

  const handleAdd = () => {
    if (count >= MAX_COFFEES) return
    setCount(c => c + 1)
    pressButton(plusRef.current)
  }

  const handleRemove = () => {
    if (count <= 0) return
    setCount(c => c - 1)
    pressButton(minusRef.current)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1,  scale: 1,    y: 0 }}
      transition={CARD.spring}
      style={{
        background:    '#f7f7f7',
        borderRadius:  24,
        padding:       '12px 8px 4px',
        width:         400,
        display:       'flex',
        flexDirection: 'column',
        gap:           12,
        userSelect:    'none',
      }}
    >
      {/* ── Header ──────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px' }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: '#171717', letterSpacing: '-0.084px' }}>
          Coffee
        </span>

        {/* Badge */}
        <div
          style={{
            display:      'flex',
            alignItems:   'center',
            gap:          2,
            background:   '#c0d5ff',
            borderRadius: 999,
            padding:      '2px 8px 2px 4px',
          }}
        >
          <span style={{ color: '#122368', display: 'flex', alignItems: 'center' }}>
            <Icon icon="mingcute:coffee-fill" width={14} height={14} />
          </span>
          <div style={{ display: 'flex', alignItems: 'center', color: '#122368', gap: 0 }}>
            {remaining >= 10 && <ClockDigit digit={remTens} size="sm" color="#122368" />}
            <ClockDigit digit={remUnits} size="sm" color="#122368" />
            <span style={{ fontSize: 12, fontWeight: 500, color: '#122368', marginLeft: 2, whiteSpace: 'nowrap' }}>
              left
            </span>
          </div>
        </div>
      </div>

      {/* ── Inner white card ────────────────────────────── */}
      <div
        style={{
          background:    '#ffffff',
          borderRadius:  20,
          padding:       20,
          display:       'flex',
          flexDirection: 'column',
          gap:           24,
          alignItems:    'center',
          position:      'relative',
          boxShadow:     `${CARD_SHADOW}, ${INNER_SHADOW}`,
        }}
      >
        {/* ── Coffee icons row ──────────────────────────── */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
          {Array.from({ length: MAX_COFFEES }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ ...SEAT_ROW.spring, delay: i * TIMING.seatStagger }}
            >
              <AnimatedCoffee isActive={i < count} index={i} size={32} />
            </motion.div>
          ))}
        </div>

        {/* ── Stepper ───────────────────────────────────── */}
        <motion.div
          ref={stepperRef}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...STEPPER.spring, delay: TIMING.stepperDelay }}
          style={{
            background:     '#f7f7f7',
            borderRadius:   16,
            padding:        '4px',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            width:          '100%',
            height:         52,
            position:       'relative',
          }}
        >
          {/* ── Fill pill — clipped independently so button press animations aren't cut off ── */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: 16, overflow: 'hidden', pointerEvents: 'none' }}>
            <motion.div
              initial={false}
              animate={{
                width:   count === 0 ? 0 : (count / MAX_COFFEES) * trackW,
                opacity: count === 0 ? 0 : 1,
              }}
              transition={FILL_PILL.spring}
              style={{
                position:     'absolute',
                top:          4,
                left:         4,
                height:       44,
                borderRadius: 12,
                background:   '#ebebeb',
              }}
            />
          </div>

          {/* Minus button */}
          <button
            ref={minusRef}
            onClick={handleRemove}
            disabled={count <= 0}
            aria-label="Remove coffee"
            style={{
              position:       'relative',
              zIndex:         1,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              width:          44,
              height:         44,
              background:     'transparent',
              border:         'none',
              borderRadius:   12,
              cursor:         count > 0 ? 'pointer' : 'not-allowed',
              color:          '#5c5c5c',
              opacity:        count > 0 ? 1 : 0.35,
              transition:     'opacity 0.15s ease',
              flexShrink:     0,
              outline:        'none',
            }}
          >
            <MinusIcon />
          </button>

          {/* Counter */}
          <div
            style={{
              position:       'relative',
              zIndex:         1,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              minWidth:       32,
              height:         30,
              overflow:       'hidden',
            }}
          >
            {count >= 10 && <ClockDigit digit={tens} size="lg" />}
            <ClockDigit digit={units} size="lg" />
          </div>

          {/* Plus button */}
          <button
            ref={plusRef}
            onClick={handleAdd}
            disabled={count >= MAX_COFFEES}
            aria-label="Add coffee"
            style={{
              position:       'relative',
              zIndex:         1,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              width:          44,
              height:         44,
              background:     'transparent',
              border:         'none',
              borderRadius:   12,
              cursor:         count < MAX_COFFEES ? 'pointer' : 'not-allowed',
              color:          '#5c5c5c',
              opacity:        count < MAX_COFFEES ? 1 : 0.35,
              transition:     'opacity 0.15s ease',
              flexShrink:     0,
              outline:        'none',
            }}
          >
            <PlusIcon />
          </button>
        </motion.div>

        {/* ── Footer ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: FOOTER.duration, delay: TIMING.footerDelay, ease: FOOTER.ease }}
          style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', width: '100%' }}
        >
          <p
            style={{
              fontSize:            13,
              fontWeight:          400,
              color:               '#5c5c5c',
              letterSpacing:       '-0.078px',
              margin:              0,
              textAlign:           'center',
              fontFeatureSettings: "'ss11' 1, 'calt' 0, 'liga' 0",
              // @ts-expect-error textWrap not yet in React's CSSProperties
              textWrap:            'pretty',
            }}
          >
            Choose the drinks you'd like to order
          </p>

          <BookSeatButton />
        </motion.div>
      </div>
    </motion.div>
  )
}
