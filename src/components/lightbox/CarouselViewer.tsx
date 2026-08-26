/**
 * Immersive carousel — the photo viewer for touch devices.
 *
 * Full takeover on black: drag-follow swiping between the photos of a
 * group (rubber-banding at the ends), swipe down to close with the
 * backdrop fading as you drag. Pinch or double-tap zooms the current
 * photo (1×–4×); while zoomed one finger pans and swiping can't step or
 * dismiss until you zoom back out. Tap on the photo toggles the chrome,
 * tap outside it closes. Desktop fallbacks exist (chevrons, click zones,
 * double-click zoom) but desktop photo clicks normally open the
 * zoom-in-place viewer instead — see BlogLightbox.
 */
import { useEffect, useRef, useState } from 'preact/hooks'
import {
  EASE,
  Chevron,
  XIcon,
  type ViewerProps,
  fitTo,
  isTouch,
  naturalSize,
  srcOf,
  useResizeBump,
  useScrollLock,
  useViewerKeys,
  viewportSize,
} from './shared'

export default function CarouselViewer({
  group,
  index,
  setIndex,
  onClose,
}: ViewerProps) {
  const item = group[index]
  const rootRef = useRef<HTMLDivElement>(null)
  const closing = useRef(false)
  const lastTouch = useRef(0)
  const gesture = useRef<null | {
    x0: number
    y0: number
    t0: number
    axis: 'h' | 'v' | null
    dx: number
    dy: number
    onPhoto: boolean
  }>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [chrome, setChrome] = useState(true)
  // pinch / double-tap zoom on the current photo
  const [zoom, setZoom] = useState({ s: 1, x: 0, y: 0 })
  const [zoomAnim, setZoomAnim] = useState(false)
  const zoomRef = useRef(zoom)
  zoomRef.current = zoom
  const pinch = useRef<null | {
    d0: number
    s0: number
    tx0: number
    ty0: number
    mx0: number
    my0: number
  }>(null)
  const panZ = useRef<null | {
    x0: number
    y0: number
    tx0: number
    ty0: number
    moved: boolean
  }>(null)
  const lastTap = useRef(0)
  const chromeTimer = useRef<number | null>(null)
  useScrollLock()
  useResizeBump()

  const clampZoom = (z: { s: number; x: number; y: number }) => {
    const { w: vw, h: vh } = viewportSize()
    const size = fitTo(item.el, vw, vh)
    const maxX = Math.max(0, (size.width * z.s - vw) / 2)
    const maxY = Math.max(0, (size.height * z.s - vh) / 2)
    return {
      s: z.s,
      x: Math.max(-maxX, Math.min(maxX, z.x)),
      y: Math.max(-maxY, Math.min(maxY, z.y)),
    }
  }

  const resetZoom = (animated = true) => {
    setZoomAnim(animated)
    setZoom({ s: 1, x: 0, y: 0 })
  }

  const zoomInAt = (clientX: number, clientY: number) => {
    const { w: vw, h: vh } = viewportSize()
    setZoomAnim(true)
    setZoom(
      clampZoom({
        s: 2.5,
        x: (clientX - vw / 2) * -1.5,
        y: (clientY - vh / 2) * -1.5,
      }),
    )
  }

  // rotation / viewport change: zoom back to fit
  useEffect(() => {
    const on = () => setZoom({ s: 1, x: 0, y: 0 })
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])

  // fade/scale in on open
  useEffect(() => {
    rootRef.current?.animate(
      [
        { opacity: 0, transform: 'scale(0.96)' },
        { opacity: 1, transform: 'none' },
      ],
      { duration: 220, easing: EASE },
    )
  }, [])

  const requestClose = () => {
    if (closing.current) return
    closing.current = true
    if (chromeTimer.current) clearTimeout(chromeTimer.current)
    const el = rootRef.current
    if (!el) return onClose()
    el.animate(
      [
        { opacity: 1 },
        {
          opacity: 0,
          transform: `translateY(${offset.y || 40}px) scale(0.95)`,
        },
      ],
      { duration: 200, easing: 'ease-in', fill: 'forwards' },
    ).onfinish = onClose
  }

  const step = (d: number) => {
    const next = index + d
    if (next < 0 || next >= group.length) {
      requestClose()
      return
    }
    resetZoom(false)
    setIndex(next)
  }

  useViewerKeys({ step, close: requestClose })

  // single tap toggles chrome after a beat; a second tap within the window
  // cancels it and zooms instead
  const scheduleChromeToggle = () => {
    chromeTimer.current = window.setTimeout(() => {
      setChrome((c) => !c)
      chromeTimer.current = null
    }, 300)
  }
  const cancelChromeToggle = () => {
    if (chromeTimer.current) {
      clearTimeout(chromeTimer.current)
      chromeTimer.current = null
    }
  }

  const onTouchStart = (e: TouchEvent) => {
    // let native video controls own touches that land on a video
    if ((e.target as Element | null)?.closest('video')) return
    if (e.touches.length === 2) {
      // pinch begins: cancel any swipe in progress so it can't dismiss
      gesture.current = null
      setDragging(false)
      setOffset({ x: 0, y: 0 })
      setZoomAnim(false)
      const [a, b] = [e.touches[0], e.touches[1]]
      const { w: vw, h: vh } = viewportSize()
      const cur = zoomRef.current
      pinch.current = {
        d0: Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY),
        s0: cur.s,
        tx0: cur.x,
        ty0: cur.y,
        mx0: (a.clientX + b.clientX) / 2 - vw / 2,
        my0: (a.clientY + b.clientY) / 2 - vh / 2,
      }
      return
    }
    if (e.touches.length !== 1) return
    const t = e.touches[0]
    if (zoomRef.current.s > 1) {
      // zoomed: one finger pans the photo instead of swiping the strip
      const cur = zoomRef.current
      panZ.current = {
        x0: t.clientX,
        y0: t.clientY,
        tx0: cur.x,
        ty0: cur.y,
        moved: false,
      }
      setZoomAnim(false)
      return
    }
    gesture.current = {
      x0: t.clientX,
      y0: t.clientY,
      t0: performance.now(),
      axis: null,
      dx: 0,
      dy: 0,
      onPhoto: (e.target as Element | null)?.tagName === 'IMG',
      // note: touches on <video> return early above, so onPhoto covers imgs
    }
    setDragging(true)
  }

  const onTouchMove = (e: TouchEvent) => {
    if (pinch.current && e.touches.length === 2) {
      const p = pinch.current
      const [a, b] = [e.touches[0], e.touches[1]]
      const { w: vw, h: vh } = viewportSize()
      const d = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY)
      const mx = (a.clientX + b.clientX) / 2 - vw / 2
      const my = (a.clientY + b.clientY) / 2 - vh / 2
      const s = Math.max(1, Math.min(4, (p.s0 * d) / p.d0))
      setZoom(
        clampZoom({
          s,
          x: mx - (p.mx0 - p.tx0) * (s / p.s0),
          y: my - (p.my0 - p.ty0) * (s / p.s0),
        }),
      )
      return
    }
    if (panZ.current && e.touches.length === 1) {
      const g = panZ.current
      const dx = e.touches[0].clientX - g.x0
      const dy = e.touches[0].clientY - g.y0
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) g.moved = true
      setZoom(clampZoom({ s: zoomRef.current.s, x: g.tx0 + dx, y: g.ty0 + dy }))
      return
    }
    const g = gesture.current
    if (!g) return
    const t = e.touches[0]
    g.dx = t.clientX - g.x0
    g.dy = t.clientY - g.y0
    if (!g.axis && (Math.abs(g.dx) > 8 || Math.abs(g.dy) > 8))
      g.axis = Math.abs(g.dx) > Math.abs(g.dy) ? 'h' : 'v'
    if (g.axis === 'h') {
      const rubber =
        (index === 0 && g.dx > 0) || (index === group.length - 1 && g.dx < 0)
      setOffset({ x: rubber ? g.dx / 3 : g.dx, y: 0 })
    } else if (g.axis === 'v') {
      setOffset({ x: 0, y: g.dy })
    }
  }

  const onTouchEnd = (e: TouchEvent) => {
    lastTouch.current = performance.now()
    if (pinch.current) {
      if (e.touches.length >= 2) return
      pinch.current = null
      if (zoomRef.current.s < 1.05) {
        resetZoom()
      } else if (e.touches.length === 1) {
        // one finger stayed down: hand off to panning
        const t = e.touches[0]
        const cur = zoomRef.current
        panZ.current = {
          x0: t.clientX,
          y0: t.clientY,
          tx0: cur.x,
          ty0: cur.y,
          moved: true,
        }
      }
      return
    }
    if (panZ.current) {
      if (e.touches.length > 0) return
      const g = panZ.current
      panZ.current = null
      if (!g.moved) {
        // tap while zoomed: double-tap zooms back out
        const now = performance.now()
        if (now - lastTap.current < 300) {
          lastTap.current = 0
          resetZoom()
        } else {
          lastTap.current = now
        }
      }
      return
    }
    const g = gesture.current
    gesture.current = null
    setDragging(false)
    if (!g) return
    if (!g.axis) {
      if (g.onPhoto) {
        const now = performance.now()
        if (now - lastTap.current < 300) {
          // double-tap on the photo: zoom in at the tap point
          lastTap.current = 0
          cancelChromeToggle()
          zoomInAt(g.x0, g.y0)
        } else {
          lastTap.current = now
          scheduleChromeToggle()
        }
      } else {
        // tap outside the photo closes
        requestClose()
      }
      setOffset({ x: 0, y: 0 })
      return
    }
    if (g.axis === 'h') {
      const vw = window.innerWidth
      const velocity = Math.abs(g.dx) / Math.max(1, performance.now() - g.t0)
      const commit = Math.abs(g.dx) > vw * 0.25 || velocity > 0.5
      const next = index + (g.dx < 0 ? 1 : -1)
      if (commit && next >= 0 && next < group.length) {
        resetZoom(false)
        setIndex(next)
      }
      setOffset({ x: 0, y: 0 })
    } else {
      if (Math.abs(g.dy) > 90) requestClose()
      else setOffset({ x: 0, y: 0 })
    }
  }

  const dim = 1 - Math.min(Math.abs(offset.y) / 400, 0.5)
  const shrink = 1 - Math.min(Math.abs(offset.y) / 1200, 0.12)

  return (
    <div
      ref={rootRef}
      tabindex={-1}
      class="fixed inset-0 z-[150] outline-none"
      role="dialog"
      aria-modal="true"
      aria-label={item.alt}
      style={{ touchAction: 'none' }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={() => {
        // desktop: click backdrop closes (ignore synthesized post-touch clicks)
        if (performance.now() - lastTouch.current > 500) requestClose()
      }}
    >
      <div
        class="absolute inset-0 bg-zinc-950"
        style={{
          opacity: dim,
          transition: dragging ? 'none' : 'opacity 300ms',
        }}
      />
      <div
        class="absolute inset-0 flex"
        style={{
          transform: `translate(calc(${-index * 100}% + ${offset.x}px), ${offset.y}px) scale(${shrink})`,
          transition: dragging ? 'none' : `transform 300ms ${EASE}`,
        }}
      >
        {group.map((it, i) => {
          const { w: nw, h: nh } = naturalSize(it.el)
          const ratio = nw > 0 ? { aspectRatio: `${nw} / ${nh}` } : undefined
          if (it.kind === 'video') {
            return (
              <div class="w-full h-full shrink-0 flex items-center justify-center overflow-hidden">
                <video
                  src={srcOf(it.el)}
                  poster={(it.el as HTMLVideoElement).poster || undefined}
                  controls
                  playsinline
                  autoplay={i === index}
                  muted={i === index}
                  class="max-w-full max-h-full object-contain bg-black"
                  style={ratio}
                />
              </div>
            )
          }
          return (
            <div class="w-full h-full shrink-0 flex items-center justify-center overflow-hidden">
              <img
                src={srcOf(it.el)}
                srcset={(it.el as HTMLImageElement).srcset}
                sizes="100vw"
                alt={it.alt}
                class="max-w-full max-h-full object-contain"
                draggable={false}
                style={{
                  // explicit ratio: iOS Safari squishes flex images that are
                  // capped by both max-width and max-height without it
                  ...ratio,
                  ...(i === index
                    ? {
                        transform: `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.s})`,
                        transition: zoomAnim ? `transform 250ms ${EASE}` : 'none',
                      }
                    : null),
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  if (performance.now() - lastTouch.current < 500) return
                  // desktop: single click toggles chrome unless a double-click
                  // (zoom) lands within the window
                  if (chromeTimer.current) cancelChromeToggle()
                  else scheduleChromeToggle()
                }}
                onDblClick={(e) => {
                  e.stopPropagation()
                  if (performance.now() - lastTouch.current < 500) return
                  cancelChromeToggle()
                  if (zoomRef.current.s > 1) resetZoom()
                  else zoomInAt(e.clientX, e.clientY)
                }}
              />
            </div>
          )
        })}
      </div>
      <div
        class={`absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),0.75rem)] pb-8 bg-gradient-to-b from-black/60 to-transparent transition-opacity duration-200 ${chrome ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <span class="text-xs font-mono text-white/80">
          {index + 1} / {group.length}
        </span>
        <button
          aria-label="Close"
          class="rounded-full p-2 text-white/90 bg-white/10 hover:bg-white/20"
          onClick={(e) => {
            e.stopPropagation()
            requestClose()
          }}
        >
          <XIcon />
        </button>
      </div>
      {item.caption && (
        <div
          class={`absolute bottom-0 inset-x-0 z-20 px-5 pt-12 pb-[max(env(safe-area-inset-bottom),1rem)] bg-gradient-to-t from-black/70 to-transparent pointer-events-none transition-opacity duration-200 ${chrome ? 'opacity-100' : 'opacity-0'}`}
        >
          <p class="text-sm text-white/90 text-center">{item.caption}</p>
        </div>
      )}
      {!isTouch() &&
        group.length > 1 &&
        (['left', 'right'] as const).map((side) => (
          <button
            aria-label={side === 'left' ? 'Previous' : 'Next'}
            class={`absolute z-20 top-1/2 -translate-y-1/2 ${side === 'left' ? 'left-4' : 'right-4'} rounded-full p-2.5 text-white/90 bg-white/10 hover:bg-white/20`}
            onClick={(e) => {
              e.stopPropagation()
              step(side === 'left' ? -1 : 1)
            }}
          >
            <Chevron dir={side} />
          </button>
        ))}
    </div>
  )
}
