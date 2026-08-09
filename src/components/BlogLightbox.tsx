/**
 * Group-scoped photo lightbox for blog post images.
 *
 * Clicking a photo opens a viewer chosen by pointer type: fine pointers
 * (desktop) get the zoom-in-place viewer below; coarse pointers (phones,
 * tablets) get the immersive carousel (see lightbox/CarouselViewer).
 *
 * Zoom-in-place: the photo lifts out of the article toward the viewport
 * center while the article scrolls to center its spot — the page stays
 * readable behind a faint scrim. Stepping runs the same shared timeline:
 * the article scrolls to center the next photo's spot while the current
 * photo flies home and the next lifts out of its own. Both flights are
 * computed in document space each frame so they stay glued to the page as
 * it moves. Wheel or a vertical touch drag closes, and the user's scroll
 * continues naturally.
 *
 * Contiguous BlogImage/ImageRow elements with no prose between them form a
 * group; ←/→ steps within it and paging past either end closes (the edge
 * chevron renders as an ✕). Single-image groups get a corner ✕ instead of
 * chevrons. Group detection lives in lightbox/shared.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks'
import type { RefObject } from 'preact'
import {
  EASE,
  Chevron,
  XIcon,
  type Item,
  type Media,
  type ViewerProps,
  detectGroups,
  isTouch,
  naturalSize,
  srcOf,
  useViewerKeys,
} from './lightbox/shared'
import CarouselViewer from './lightbox/CarouselViewer'

// ---------- geometry / animation helpers ----------

type Box = { left: number; top: number; width: number; height: number }

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// transform that makes an element laid out at `base` appear at `desired`
function boxTransform(desired: Box, base: Box) {
  return `translate(${desired.left - base.left}px, ${desired.top - base.top}px) scale(${desired.width / base.width}, ${desired.height / base.height})`
}

function flipOut(el: HTMLElement, to: Box) {
  if (reducedMotion()) {
    return el.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 150,
      fill: 'forwards',
    })
  }
  el.style.transformOrigin = 'top left'
  return el.animate(
    [
      { transform: 'none' },
      { transform: boxTransform(to, el.getBoundingClientRect()) },
    ],
    { duration: 280, easing: EASE, fill: 'forwards' },
  )
}

// Explicit pixel size so the overlay media has a known rect before load
function fitSize(el: Media, wFrac: number, hFrac: number) {
  const { w: nw, h: nh } = naturalSize(el)
  const s = Math.min(
    (window.innerWidth * wFrac) / nw,
    (window.innerHeight * hFrac) / nh,
  )
  return { width: Math.round(nw * s), height: Math.round(nh * s) }
}

function easeOutCubic(p: number) {
  return 1 - Math.pow(1 - p, 3)
}

function lerpBox(a: Box, b: Box, t: number): Box {
  return {
    left: a.left + (b.left - a.left) * t,
    top: a.top + (b.top - a.top) * t,
    width: a.width + (b.width - a.width) * t,
    height: a.height + (b.height - a.height) * t,
  }
}

// element position in document coordinates (scroll-independent)
function docBox(el: HTMLElement): Box {
  const r = el.getBoundingClientRect()
  const scrollTop = document.scrollingElement?.scrollTop ?? 0
  return {
    left: r.left,
    top: r.top + scrollTop,
    width: r.width,
    height: r.height,
  }
}

// document-space box rendered into viewport coordinates at a given scroll
function boxAt(doc: Box, scrollTop: number): Box {
  return { ...doc, top: doc.top - scrollTop }
}

// scroll position that centers an element's spot in the viewport (clamped)
function centerScrollTarget(el: Media) {
  const scroller = document.scrollingElement
  if (!scroller) return null
  const r = el.getBoundingClientRect()
  const max = scroller.scrollHeight - window.innerHeight
  return {
    scroller,
    start: scroller.scrollTop,
    target: Math.max(
      0,
      Math.min(
        max,
        scroller.scrollTop + r.top + r.height / 2 - window.innerHeight / 2,
      ),
    ),
  }
}

// rAF timeline; cancel() stops without firing onDone
function driveFrames(
  duration: number,
  onFrame: (eased: number) => void,
  onDone: () => void,
) {
  let raf = 0
  const t0 = performance.now()
  const tick = (now: number) => {
    const p = Math.min(1, (now - t0) / duration)
    onFrame(easeOutCubic(p))
    if (p < 1) raf = requestAnimationFrame(tick)
    else onDone()
  }
  raf = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(raf)
}

// ---------- viewer hooks ----------

// upgrade the overlay to a higher-res srcset candidate once it's decoded
function useHiRes(item: Item, sizes: string) {
  const [hiRes, setHiRes] = useState<string | null>(null)
  useEffect(() => {
    setHiRes(null)
    if (item.kind !== 'image') return
    const source = item.el as HTMLImageElement
    if (!source.srcset) return
    let cancelled = false
    const probe = new Image()
    probe.srcset = source.srcset
    probe.sizes = sizes
    probe
      .decode()
      .then(() => {
        if (
          !cancelled &&
          probe.currentSrc &&
          probe.currentSrc !== srcOf(source)
        ) {
          setHiRes(probe.currentSrc)
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [item])
  return hiRes
}

// move focus into the dialog, restore on close
function useDialogFocus(rootRef: RefObject<HTMLDivElement>) {
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    rootRef.current?.focus()
    return () => prev?.focus?.()
  }, [])
}

// refit the image when the viewport changes
function useViewportRefit() {
  const [, bump] = useState(0)
  useEffect(() => {
    const onResize = () => bump((n) => n + 1)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
}

// ---------- chrome ----------

// At the group edge the chevron becomes an ✕ — paging past the end closes
function NavButton(props: {
  side: 'left' | 'right'
  atEdge: boolean
  onClick: () => void
}) {
  const pos = props.side === 'left' ? 'left-3 md:left-6' : 'right-3 md:right-6'
  return (
    <button
      data-chrome
      aria-label={
        props.atEdge
          ? 'Close'
          : props.side === 'left'
            ? 'Previous image'
            : 'Next image'
      }
      class={`absolute z-20 top-1/2 -translate-y-1/2 ${pos} rounded-full p-2.5 transition-opacity duration-150 bg-card/85 text-foreground border border-border/60 shadow-md hover:bg-card`}
      onClick={(e) => {
        e.stopPropagation()
        props.onClick()
      }}
    >
      {props.atEdge ? <XIcon class="h-6 w-6" /> : <Chevron dir={props.side} />}
    </button>
  )
}

// top-right corner: photo counter + external link (url-wrapped images) + ✕
function CornerActions(props: {
  item: Item
  index: number
  total: number
  onClose: () => void
}) {
  return (
    <div
      data-chrome
      class="absolute z-20 top-4 right-4 flex items-center gap-2 transition-opacity duration-150"
    >
      {props.total > 1 && (
        <div class="rounded-full bg-card/85 border border-border/60 px-2.5 py-1 shadow-md">
          <span class="text-[10px] font-mono text-muted">
            {props.index + 1}/{props.total}
          </span>
        </div>
      )}
      {props.item.url && (
        <a
          href={props.item.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open linked page"
          class="rounded-full p-2.5 bg-card/85 text-foreground border border-border/60 shadow-md hover:bg-card"
          onClick={(e) => e.stopPropagation()}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="h-5 w-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      )}
      <button
        aria-label="Close"
        class="rounded-full p-2.5 bg-card/85 text-foreground border border-border/60 shadow-md hover:bg-card"
        onClick={(e) => {
          e.stopPropagation()
          props.onClose()
        }}
      >
        <XIcon class="h-5 w-5" />
      </button>
    </div>
  )
}

// ---------- zoom-in-place viewer (desktop) ----------

function ZoomViewer({ group, index, setIndex, onClose }: ViewerProps) {
  const item = group[index]
  const rootRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<Media>(null)
  const scrimRef = useRef<HTMLDivElement>(null)
  const closing = useRef(false)
  const mounted = useRef(false)
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  // transition handed from step() to the index layout effect
  const pending = useRef<null | {
    clone: HTMLElement
    cloneBase: Box
    curImg: Media
    curHomeDoc: Box
    nextSrcDoc: Box
    scroll: { scroller: Element; start: number; target: number }
  }>(null)
  // cancel fn that also jumps the in-flight animation to its end state
  const settleNav = useRef<(() => void) | null>(null)

  useDialogFocus(rootRef)
  const hiRes = useHiRes(item, '97vw')
  useViewportRefit()

  // pause any in-article videos while the lightbox owns them, and restore
  // every article element's visibility on unmount (covers mid-animation exits)
  useEffect(() => {
    group.forEach((it) => {
      if (it.kind === 'video') (it.el as HTMLVideoElement).pause()
    })
    return () => {
      group.forEach((it) => {
        it.el.style.visibility = ''
      })
    }
  }, [])

  // open and step share the coordinated treatment: the article scrolls to
  // center the photo's spot on the same timeline as the photo's flight(s)
  useLayoutEffect(() => {
    const el = imgRef.current
    if (!el) return
    item.el.style.visibility = 'hidden'

    if (!mounted.current) {
      // open: lift the clicked photo out of its spot while centering it
      mounted.current = true
      const scroll = centerScrollTarget(item.el)
      const srcDoc = docBox(item.el)
      scrimRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 200,
      })
      if (reducedMotion() || !scroll) {
        if (scroll) scroll.scroller.scrollTop = scroll.target
        el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150 })
        return
      }
      const finalBox = el.getBoundingClientRect()
      el.style.transformOrigin = 'top left'
      el.style.transform = boxTransform(boxAt(srcDoc, scroll.start), finalBox)
      const settle = () => {
        scroll.scroller.scrollTop = scroll.target
        el.style.transform = ''
        settleNav.current = null
      }
      const cancel = driveFrames(
        380,
        (e) => {
          const s = scroll.start + (scroll.target - scroll.start) * e
          scroll.scroller.scrollTop = s
          el.style.transform = boxTransform(
            lerpBox(boxAt(srcDoc, s), finalBox, e),
            finalBox,
          )
        },
        settle,
      )
      settleNav.current = () => {
        cancel()
        settle()
      }
      return
    }

    // step: current photo flies home while the next lifts out of its spot
    const t = pending.current
    pending.current = null
    if (!t) return
    if (reducedMotion()) {
      t.scroll.scroller.scrollTop = t.scroll.target
      t.clone.remove()
      t.curImg.style.visibility = ''
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150 })
      return
    }
    const finalBox = el.getBoundingClientRect()
    el.style.transformOrigin = 'top left'
    t.clone.style.transformOrigin = 'top left'
    // place the lifting photo over its article spot before first paint
    el.style.transform = boxTransform(
      boxAt(t.nextSrcDoc, t.scroll.start),
      finalBox,
    )
    const settle = () => {
      t.scroll.scroller.scrollTop = t.scroll.target
      t.clone.remove()
      t.curImg.style.visibility = ''
      el.style.transform = ''
      settleNav.current = null
    }
    const cancel = driveFrames(
      380,
      (e) => {
        const s = t.scroll.start + (t.scroll.target - t.scroll.start) * e
        t.scroll.scroller.scrollTop = s
        t.clone.style.transform = boxTransform(
          lerpBox(t.cloneBase, boxAt(t.curHomeDoc, s), e),
          t.cloneBase,
        )
        el.style.transform = boxTransform(
          lerpBox(boxAt(t.nextSrcDoc, s), finalBox, e),
          finalBox,
        )
      },
      settle,
    )
    settleNav.current = () => {
      cancel()
      settle()
    }
  }, [index])

  const step = (delta: number) => {
    if (closing.current) return
    const next = index + delta
    if (next < 0 || next >= group.length) {
      requestClose()
      return
    }
    const el = imgRef.current
    const scroll = centerScrollTarget(group[next].el)
    if (!el || !scroll) {
      setIndex(next)
      return
    }
    settleNav.current?.()
    // snapshot the on-screen photo; it flies home while the next lifts up
    const base = el.getBoundingClientRect()
    const clone = el.cloneNode(true) as HTMLImageElement
    Object.assign(clone.style, {
      position: 'fixed',
      left: `${base.left}px`,
      top: `${base.top}px`,
      width: `${base.width}px`,
      height: `${base.height}px`,
      margin: '0',
      zIndex: '5',
      transform: 'none',
      pointerEvents: 'none',
    })
    rootRef.current?.appendChild(clone)
    pending.current = {
      clone,
      cloneBase: base,
      curImg: item.el,
      curHomeDoc: docBox(item.el),
      nextSrcDoc: docBox(group[next].el),
      scroll,
    }
    setIndex(next)
  }

  const requestClose = () => {
    if (closing.current) return
    closing.current = true
    settleNav.current?.()
    const el = imgRef.current
    if (!el) return onClose()
    scrimRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 220,
      easing: 'ease-in',
      fill: 'forwards',
    })
    rootRef.current
      ?.querySelectorAll<HTMLElement>('[data-chrome]')
      .forEach((n) => {
        n.style.opacity = '0'
      })
    flipOut(el, item.el.getBoundingClientRect()).onfinish = onClose
  }

  useViewerKeys({ step, close: requestClose })

  // no scroll lock here — a wheel tick or vertical touch drag closes, then
  // the user's scroll continues naturally on the page
  const closeRef = useRef(requestClose)
  closeRef.current = requestClose
  useEffect(() => {
    const onWheel = () => closeRef.current()
    window.addEventListener('wheel', onWheel, { passive: true })
    return () => window.removeEventListener('wheel', onWheel)
  }, [])

  const size = fitSize(item.el, 0.97, 0.97)

  return (
    <div
      ref={rootRef}
      tabindex={-1}
      class="fixed inset-0 z-[150] outline-none"
      role="dialog"
      aria-modal="true"
      aria-label={item.alt}
      onTouchStart={(e) => {
        const t = e.touches[0]
        touchStart.current = { x: t.clientX, y: t.clientY }
      }}
      onTouchMove={(e) => {
        const start = touchStart.current
        if (!start) return
        const t = e.touches[0]
        const dx = t.clientX - start.x
        const dy = t.clientY - start.y
        if (Math.abs(dy) > 24 && Math.abs(dy) > Math.abs(dx)) requestClose()
      }}
      onTouchEnd={(e) => {
        const start = touchStart.current
        touchStart.current = null
        if (!start) return
        const t = e.changedTouches[0]
        const dx = t.clientX - start.x
        const dy = t.clientY - start.y
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5)
          step(dx < 0 ? 1 : -1)
      }}
    >
      <div
        ref={scrimRef}
        class="absolute inset-0 bg-background/30"
        onClick={requestClose}
      />
      <div class="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        {item.kind === 'video' ? (
          <video
            key={index}
            ref={imgRef as RefObject<HTMLVideoElement>}
            src={srcOf(item.el)}
            poster={(item.el as HTMLVideoElement).poster || undefined}
            controls
            autoplay
            playsinline
            style={{ width: `${size.width}px`, height: `${size.height}px` }}
            class="rounded-md shadow-2xl pointer-events-auto bg-black"
          />
        ) : (
          <img
            key={index}
            ref={imgRef as RefObject<HTMLImageElement>}
            src={hiRes ?? srcOf(item.el)}
            alt={item.alt}
            style={{ width: `${size.width}px`, height: `${size.height}px` }}
            class="rounded-md shadow-2xl pointer-events-auto cursor-zoom-out"
            onClick={requestClose}
          />
        )}
      </div>
      <CornerActions
        item={item}
        index={index}
        total={group.length}
        onClose={requestClose}
      />
      {item.caption && (
        <div
          data-chrome
          class="absolute z-20 bottom-6 inset-x-0 flex justify-center pointer-events-none transition-opacity duration-150"
        >
          <div class="flex items-center rounded-full bg-card/90 border border-border/60 px-3 py-1.5 shadow-md">
            <span class="text-xs text-foreground/90">{item.caption}</span>
          </div>
        </div>
      )}
      {group.length > 1 && (
        <>
          <NavButton
            side="left"
            atEdge={index === 0}
            onClick={() => step(-1)}
          />
          <NavButton
            side="right"
            atEdge={index === group.length - 1}
            onClick={() => step(1)}
          />
        </>
      )}
    </div>
  )
}

// ---------- root ----------

export default function BlogLightbox() {
  const [groups, setGroups] = useState<Item[][]>([])
  const [open, setOpen] = useState<{ g: number; i: number } | null>(null)

  useEffect(() => {
    const detected = detectGroups()
    // Trip-report hero lives outside the .blog container, so detectGroups
    // never sees it; prepend it as its own solo group when marked.
    const hero = document.querySelector<HTMLImageElement>(
      'img[data-hero-lightbox]',
    )
    const all = hero
      ? [[{ el: hero, kind: 'image', alt: hero.alt } satisfies Item], ...detected]
      : detected
    setGroups(all)
    const cleanups: (() => void)[] = []
    all.forEach((group, g) => {
      group.forEach((item, i) => {
        // videos keep their native controls and play inline; they're reached
        // by stepping within a group, not by clicking to open
        if (item.kind === 'video') return
        // capture clicks even when BlogImage wraps the img in an external
        // link (the url stays reachable via the button inside the viewer)
        const onClick = (e: Event) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen({ g, i })
        }
        item.el.style.cursor = 'zoom-in'
        item.el.addEventListener('click', onClick)
        cleanups.push(() => {
          item.el.style.cursor = ''
          item.el.removeEventListener('click', onClick)
        })
      })
    })
    return () => cleanups.forEach((fn) => fn())
  }, [])

  if (!open || !groups[open.g]) return null
  // coarse pointers get the immersive carousel; fine pointers keep the
  // zoom-in-place treatment
  const Viewer = isTouch() ? CarouselViewer : ZoomViewer
  return (
    <Viewer
      key={open.g}
      group={groups[open.g]}
      index={open.i}
      setIndex={(i) => setOpen({ g: open.g, i })}
      onClose={() => setOpen(null)}
    />
  )
}
