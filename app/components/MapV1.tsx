import { useRef, useEffect, useState } from 'react'
import { useGeolocation } from 'react-use'
import mapboxgl from 'mapbox-gl'
import type { Map } from 'mapbox-gl'
import day3GeoJson from '~/data/day-3.json'
import ReactDOM from 'react-dom'

export default function MapboxMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<Map | null>(null)
  const popupRef = useRef(new mapboxgl.Popup({ offset: 15 }))

  const { loading, latitude, longitude } = useGeolocation()

  useEffect(() => {
    if (window.ENV?.MAPBOX_TOKEN && mapContainer.current) {
      mapboxgl.accessToken = window.ENV?.MAPBOX_TOKEN
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-123.719835, 47.907878],
        zoom: 14,
        pitch: 60,
      })

      mapRef.current.on('load', () => {
        if (mapRef.current) {
          mapRef.current.addSource('mapbox-dem', {
            type: 'raster-dem',
            url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
            tileSize: 512,
            maxZoom: 16,
          })
          mapRef.current.setTerrain({ source: 'mapbox-dem' })
          mapRef.current.addLayer({
            id: 'sky',
            type: 'sky',
            paint: {
              'sky-type': 'atmosphere',
              'sky-atmosphere-sun': [0.0, 90.0],
              'sky-atmosphere-sun-intensity': 15,
            },
          })

          mapRef.current.addSource('day-3', {
            type: 'geojson',
            data: day3GeoJson,
          })
          mapRef.current.addLayer({
            id: 'day-3-line',
            type: 'line',
            source: 'day-3',
            paint: {
              'line-color': '#ff69b4',
              'line-width': 6,
            },
          })
          mapRef.current.addLayer({
            id: 'day-3-label',
            type: 'symbol',
            source: 'day-3',
            layout: {
              'text-field': '{name} Start',
              'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
              'text-size': 14,
            },
            paint: {
              'text-color': '#fff',
              'text-halo-color': '#333333',
              'text-halo-width': 1,
            },
          })
        }
      })

      mapRef.current.on('click', (e) => {
        const features = mapRef.current?.queryRenderedFeatures(e.point, {
          layers: ['day-3-line'],
        })

        if (features && features.length > 0 && mapRef.current) {
          const feature = features[0]
          const popupNode = document.createElement('div')
          ReactDOM.render(
            <Popup
              title={feature.properties?.name}
              details={feature.properties?.details}
            />,
            popupNode
          )
          popupRef.current
            .setLngLat(e.lngLat)
            .setDOMContent(popupNode)
            .addTo(mapRef.current)
        }
      })
    }
    return () => mapRef.current?.remove()
  }, [])

  const [showDay3, setShowDay3] = useState(true)

  useEffect(
    function handleDay3Visibility() {
      const day3Line = mapRef.current?.getLayer('day-3-line')

      if (mapRef.current && day3Line) {
        mapRef.current?.setLayoutProperty(
          'day-3-line',
          'visibility',
          showDay3 ? 'visible' : 'none'
        )
      }
    },
    [showDay3]
  )

  return (
    <div className="flex w-full h-full flex-col gap-4 flex-grow">
      <button
        type="button"
        onClick={() => setShowDay3((prev) => !prev)}
        className="border rounded py-1 px-3 w-fit"
      >
        Day 3 {showDay3 ? 'Visible' : 'Not Visible'}
      </button>
      <div ref={mapContainer} className="flex h-full w-full flex-grow border" />
    </div>
  )
}

function Popup({ title, details }: { title: string; details: string }) {
  return (
    <div className="border rounded p-3 flex flex-col gap-2 text-black">
      <h2 className="font-bold">{title}</h2>
      <p>{details}</p>
    </div>
  )
}
