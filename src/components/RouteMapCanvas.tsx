import type { StyleSpecification } from 'maplibre-gl'
import { useEffect, useRef } from 'preact/hooks'

const LIGHT_STYLE = 'https://tiles.openfreemap.org/styles/liberty'
const DARK_STYLE = 'https://tiles.openfreemap.org/styles/fiord'
const DEM_TILES =
  'https://elevation-tiles-prod.s3.amazonaws.com/terrarium/{z}/{x}/{y}.png'

// Topographic basemap — contours, trails, and hillshade baked in. Far more
// legible than the street basemap in remote mountain terrain (the Alps in
// particular). Raster, global, no API key. It has no dark variant, so it
// renders light in both themes (topo maps are conventionally light anyway).
const TOPO_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    opentopomap: {
      type: 'raster',
      tiles: [
        'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
        'https://b.tile.opentopomap.org/{z}/{x}/{y}.png',
        'https://c.tile.opentopomap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      maxzoom: 17,
      attribution:
        'Map data: © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Style: © <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
    },
  },
  layers: [{ id: 'opentopomap', type: 'raster', source: 'opentopomap' }],
}

type Basemap = 'default' | 'topo'

const TERRAIN_EXAGGERATION = 1.2

// 3D fits use flat-map math, but the terrain mesh lifts high ground up the
// screen — the far/high end of a route can rise right out of a symmetric
// frame. Extra top padding leaves headroom for that displacement.
const PADDING_3D = { top: 110, bottom: 40, left: 48, right: 48 }
const PADDING_2D = 48

interface Props {
  coords: [number, number][]
  basemap?: Basemap
  terrain?: boolean
  /** Camera tilt in 3D mode, degrees from overhead — lower shows more route */
  pitch?: number
  /** Map rotation, degrees clockwise from north — frame a route that runs
   * diagonally by aligning it with the card */
  bearing?: number
}

export default function RouteMapCanvas({
  coords,
  basemap = 'default',
  terrain = false,
  pitch = 55,
  bearing = 0,
}: Props) {
  const mapEl = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let map: import('maplibre-gl').Map | undefined
    let observer: MutationObserver | undefined
    let cancelled = false

    ;(async () => {
      const maplibregl = (await import('maplibre-gl')).default
      await import('maplibre-gl/dist/maplibre-gl.css')
      if (cancelled || !mapEl.current || coords.length < 2) return

      const lons = coords.map((c) => c[0])
      const lats = coords.map((c) => c[1])
      const bounds: [[number, number], [number, number]] = [
        [Math.min(...lons), Math.min(...lats)],
        [Math.max(...lons), Math.max(...lats)],
      ]
      const isDark = () => document.documentElement.classList.contains('dark')
      // topo has no dark variant, so its key ignores the theme — that keeps
      // the observer from reloading raster tiles on every dark/light toggle
      const styleKey = () =>
        basemap === 'topo' ? 'topo' : isDark() ? 'dark' : 'light'
      const styleFor = () =>
        basemap === 'topo' ? TOPO_STYLE : isDark() ? DARK_STYLE : LIGHT_STYLE

      let is3D = terrain

      map = new maplibregl.Map({
        container: mapEl.current,
        style: styleFor(),
        bounds,
        fitBoundsOptions: { padding: terrain ? PADDING_3D : PADDING_2D },
        pitch: terrain ? pitch : 0,
        bearing,
        maxPitch: 70,
        attributionControl: false,
        cooperativeGestures: true,
      })
      // dev-only handle for poking at the live camera from the console
      if (import.meta.env.DEV) {
        const w = window as unknown as Record<string, unknown>
        w.__routeMap = map
        w.__routeBounds = bounds
      }
      map.addControl(
        new maplibregl.NavigationControl({
          showCompass: terrain,
          visualizePitch: true,
        }),
      )
      // With the terrain mesh up, zoom is measured from the elevated ground,
      // so bounds-based fits stop matching what's actually on screen. This
      // re-frames in screen space instead: project the route (project() is
      // terrain-aware), then zoom/pan it into the padded viewport.
      const fitRouteToScreen = (duration = 600) => {
        if (!map) return
        const canvas = map.getCanvas()
        const W = canvas.clientWidth
        const H = canvas.clientHeight
        const step = Math.max(1, Math.floor(coords.length / 120))
        let minX = Infinity
        let maxX = -Infinity
        let minY = Infinity
        let maxY = -Infinity
        for (let i = 0; i < coords.length; i += step) {
          const p = map.project(coords[i])
          if (p.x < minX) minX = p.x
          if (p.x > maxX) maxX = p.x
          if (p.y < minY) minY = p.y
          if (p.y > maxY) maxY = p.y
        }
        const { top, bottom, left, right } = PADDING_3D
        const availW = W - left - right
        const availH = H - top - bottom
        const dz = Math.log2(
          Math.min(
            availW / Math.max(1, maxX - minX),
            availH / Math.max(1, maxY - minY),
          ),
        )
        map.easeTo({
          center: map.unproject([(minX + maxX) / 2, (minY + maxY) / 2]),
          zoom: map.getZoom() + dz,
          offset: [left + availW / 2 - W / 2, top + availH / 2 - H / 2],
          duration,
        })
      }

      // One 3D toggle instead of maplibre's TerrainControl: the stock control
      // only swaps the terrain mesh, leaving the camera flat-overhead — this
      // eases pitch and terrain together, the way most route maps behave
      if (terrain) {
        const container = document.createElement('div')
        container.className = 'maplibregl-ctrl maplibregl-ctrl-group'
        const btn = document.createElement('button')
        btn.type = 'button'
        btn.style.fontWeight = '600'
        const updateToggle = () => {
          btn.textContent = is3D ? '2D' : '3D'
          const label = is3D
            ? 'Switch to flat overhead view'
            : 'Switch to 3D terrain view'
          btn.title = label
          btn.setAttribute('aria-label', label)
        }
        updateToggle()
        btn.addEventListener('click', () => {
          if (!map) return
          is3D = !is3D
          // Re-fit the whole route for the new perspective — a plain pitch
          // ease keeps the old center/zoom, which can push the route offscreen.
          // Camera-from-bounds math is only trustworthy with the mesh OFF;
          // going 3D, the mesh lands after the ease and shifts the view (its
          // zoom now reads from elevated ground), so a terrain-aware
          // screen-space fit glides the route back into frame.
          if (is3D) {
            const camera = map.cameraForBounds(bounds, { padding: PADDING_3D })
            map.once('moveend', () => {
              if (!map || !is3D) return
              map.setTerrain({
                source: 'dem',
                exaggeration: TERRAIN_EXAGGERATION,
              })
              requestAnimationFrame(() => {
                if (map && is3D) fitRouteToScreen()
              })
            })
            map.easeTo({ ...camera, pitch, bearing, duration: 800 })
          } else {
            map.setTerrain(null)
            const camera = map.cameraForBounds(bounds, { padding: PADDING_2D })
            map.easeTo({ ...camera, pitch: 0, bearing, duration: 800 })
          }
          updateToggle()
        })
        container.appendChild(btn)
        map.addControl({
          onAdd: () => container,
          onRemove: () => container.remove(),
        })
      }
      const attrib = new maplibregl.AttributionControl({ compact: true })
      map.addControl(attrib, 'bottom-right')
      // start collapsed to just the info icon instead of the full credit line
      const attribEl = (attrib as unknown as { _container?: HTMLElement })
        ._container
      attribEl?.classList.add('maplibregl-compact')
      attribEl?.classList.remove('maplibregl-compact-show')

      // style.load fires on init and after every setStyle (theme swap), and
      // setStyle wipes custom sources/layers — so everything is added here
      map.on('style.load', () => {
        if (!map) return
        // the DEM drives both the hillshade layer and 3D terrain
        if (basemap !== 'topo' || terrain) {
          map.addSource('dem', {
            type: 'raster-dem',
            tiles: [DEM_TILES],
            encoding: 'terrarium',
            tileSize: 256,
            maxzoom: 15,
            attribution:
              'Terrain: <a href="https://registry.opendata.aws/terrain-tiles/">Mapzen/AWS</a>',
          })
        }
        // setStyle clears terrain along with sources, so re-enable it here —
        // tracking is3D, not the prop, so a theme swap respects the toggle
        if (is3D)
          map.setTerrain({ source: 'dem', exaggeration: TERRAIN_EXAGGERATION })
        // OpenTopoMap already bakes in hillshade + contours, so only the
        // street basemap needs our own DEM-derived hillshade layer
        if (basemap !== 'topo') {
          const firstSymbol = map
            .getStyle()
            .layers.find((l) => l.type === 'symbol')?.id
          map.addLayer(
            {
              id: 'hillshade',
              type: 'hillshade',
              source: 'dem',
              paint: {
                'hillshade-exaggeration': 0.35,
                'hillshade-shadow-color': isDark() ? '#000000' : '#473B24',
                'hillshade-highlight-color': isDark() ? '#33415555' : '#ffffff',
              },
            },
            firstSymbol,
          )
        }
        map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: coords },
          },
        })
        map.addLayer({
          id: 'route-casing',
          type: 'line',
          source: 'route',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': isDark() ? '#0f172a' : '#ffffff',
            'line-width': 6,
            'line-opacity': 0.85,
          },
        })
        map.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': '#f59432', 'line-width': 3 },
        })
        map.addSource('endpoints', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: { kind: 'start' },
                geometry: { type: 'Point', coordinates: coords[0] },
              },
              {
                type: 'Feature',
                properties: { kind: 'end' },
                geometry: {
                  type: 'Point',
                  coordinates: coords[coords.length - 1],
                },
              },
            ],
          },
        })
        map.addLayer({
          id: 'endpoints',
          type: 'circle',
          source: 'endpoints',
          paint: {
            'circle-radius': 5,
            'circle-color': [
              'match',
              ['get', 'kind'],
              'start',
              '#22c55e',
              '#ef4444',
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': isDark() ? '#0f172a' : '#ffffff',
          },
        })
      })

      let currentKey = styleKey()
      observer = new MutationObserver(() => {
        const next = styleKey()
        if (next === currentKey) return
        currentKey = next
        map?.setStyle(styleFor())
      })
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      })
    })()

    return () => {
      cancelled = true
      observer?.disconnect()
      map?.remove()
    }
  }, [])

  // mobile height tracks the (small) viewport so the whole card — title,
  // stats, map, footer — fits under the 57px nav even on short phones
  return (
    <div ref={mapEl} class="h-[clamp(220px,42svh,380px)] w-full sm:h-[340px]" />
  )
}
