import mapboxgl from 'mapbox-gl'
import type {
  LayerSpecification,
  LngLatBounds,
  LngLatLike,
  PaddingOptions,
  SourceSpecification,
  Map as TMap,
} from 'mapbox-gl'
import type { Ref } from 'react'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

type ControlsEnum = 'navigation' | 'scale' | 'geolocate' | 'fullscreen'

type Source = {
  id: string
} & SourceSpecification

type MapProps = {
  height?: number
  width?: number
  center: LngLatLike
  easeToDuration?: number
  basemap?: string
  zoom?: number
  pitch?: number
  bearing?: number
  padding?: PaddingOptions
  controls?: ControlsEnum[]
  sources?: Source[]
  layers?: LayerSpecification[]
  terrainSource?: string
  children?: React.ReactNode
  initialBounds?: LngLatBounds
}

const Map = forwardRef(function Map(
  {
    height,
    width,
    center,
    pitch,
    padding,
    bearing,
    controls,
    sources,
    layers,
    terrainSource,
    children,
    easeToDuration = 500,
    zoom = 14,
    basemap = 'mapbox://styles/mapbox/streets-v11',
    initialBounds,
  }: MapProps,
  ref: Ref<{ getMap: () => TMap | undefined }>,
) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<TMap>()

  const [map, setMap] = useState<TMap>()

  useEffect(function initMapbox() {
    if (window.ENV?.MAPBOX_TOKEN && mapContainer.current) {
      mapboxgl.accessToken = window.ENV.MAPBOX_TOKEN

      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: basemap,
        center,
        zoom,
      })

      controls?.forEach((control) => {
        switch (control) {
          case 'navigation':
            map.addControl(new mapboxgl.NavigationControl())
            break
          case 'scale':
            const scale = new mapboxgl.ScaleControl({
              unit: 'imperial',
            })
            map.addControl(scale)
            break
          case 'geolocate':
            map.addControl(new mapboxgl.GeolocateControl())
            break
          case 'fullscreen':
            map.addControl(new mapboxgl.FullscreenControl())
            break
        }
      })

      map.on('load', () => {
        setMap(map)
        mapRef.current = map
      })

      return () => map.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      getMap: () => {
        return map
      },
    }),
    [map],
  )

  useEffect(
    function updateCamera() {
      if (map && (center || pitch || bearing || zoom || padding)) {
        map.easeTo({
          center,
          pitch,
          bearing,
          zoom,
          duration: easeToDuration,
          padding,
        })
      }
    },
    [map, center, pitch, bearing, zoom, easeToDuration, padding],
  )

  useEffect(
    function updateBounds() {
      if (map && initialBounds) {
        map.fitBounds(initialBounds, { padding: 100 })
      }
    },
    [map, initialBounds],
  )

  useEffect(
    function updateSourcesAndLayers() {
      const mapReady = map?.isStyleLoaded()

      if (map && mapReady && sources?.length && sources.length > 0) {
        sources.forEach((source) => {
          const { id, ...sourceSpec } = source

          if (map.getSource(id)) return

          map.addSource(id, sourceSpec)
        })
      }

      if (map && mapReady && layers?.length && layers.length > 0) {
        layers.forEach((layer) => {
          if (map.getLayer(layer.id)) {
            map.setFilter(layer.id, layer.filter ? layer.filter : null)
          } else {
            map.addLayer(layer)
          }
        })
      }

      if (map && mapReady && terrainSource) {
        map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 })
      }
    },
    [layers, map, sources, terrainSource],
  )

  return (
    <div
      ref={mapContainer}
      style={{ ...(height && { height }), ...(width && { width }) }}
      className="h-full w-full flex flex-grow"
    >
      {children}
    </div>
  )
})

export default Map
