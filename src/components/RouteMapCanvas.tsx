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

interface Props {
  coords: [number, number][]
  basemap?: Basemap
}

export default function RouteMapCanvas({ coords, basemap = 'default' }: Props) {
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
      const styleKey = () => (basemap === 'topo' ? 'topo' : isDark() ? 'dark' : 'light')
      const styleFor = () =>
        basemap === 'topo' ? TOPO_STYLE : isDark() ? DARK_STYLE : LIGHT_STYLE

      map = new maplibregl.Map({
        container: mapEl.current,
        style: styleFor(),
        bounds,
        fitBoundsOptions: { padding: 48 },
        attributionControl: false,
        cooperativeGestures: true,
      })
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }))
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
        // OpenTopoMap already bakes in hillshade + contours, so only the
        // street basemap needs our own DEM-derived hillshade layer
        if (basemap !== 'topo') {
          map.addSource('dem', {
            type: 'raster-dem',
            tiles: [DEM_TILES],
            encoding: 'terrarium',
            tileSize: 256,
            maxzoom: 15,
            attribution:
              'Terrain: <a href="https://registry.opendata.aws/terrain-tiles/">Mapzen/AWS</a>',
          })
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
