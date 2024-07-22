import { along, length, lineString } from '@turf/turf'
import { PaddingOptions, type LngLatLike } from 'mapbox-gl'
import { createRef, useEffect, useMemo, useRef, useState } from 'react'
import { useIntersection, useScrolling, useWindowScroll } from 'react-use'
import Map from '~/components/Map'
import day3GeoJson from '~/data/day-3.json'

const day3Feature = day3GeoJson.features[0]
const firstPoint = day3Feature.geometry.coordinates[0].slice(0, 2) as LngLatLike
const lastPoint = day3Feature.geometry.coordinates[
  day3Feature.geometry.coordinates.length - 1
].slice(0, 2) as LngLatLike

const day3Line = lineString(day3Feature.geometry.coordinates)
const day3Length = length(day3Line, { units: 'miles' })
const middlePoint = along(day3Line, day3Length / 2)

const sections = ['day-1']

export default function BaileysTraverseToOlympusHighRoute() {
  const [center, setCenter] = useState<LngLatLike | null>(firstPoint)
  const [easeToDuration, setEaseToDuration] = useState(2000)
  const [mapPadding, setMapPadding] = useState<PaddingOptions>()

  useEffect(() => {
    const rightPadding = window.innerWidth * 0.5
    setMapPadding({ right: rightPadding })
  }, [])

  const [scrollProgress, setScrollProgress] = useState<number>(0)
  const scrollState = useWindowScroll()

  const sectionRefs = useMemo(
    () =>
      sections.map((section) => ({
        heading: section,
        ref: createRef<HTMLDivElement>(),
      })),
    []
  )
  const sectionProgressList = useRef<number[]>([])

  useEffect(() => {
    if (scrollState) {
      const { y } = scrollState

      setScrollProgress(
        ((y + window.innerHeight) / document.documentElement.scrollHeight) * 100
      )

      if (sectionRefs.length > 0 && sectionRefs[0].ref.current) {
        const halfWindowHeight = window.innerHeight / 2
        const firstSectionStartPosition =
          sectionRefs[0].ref.current?.offsetTop - halfWindowHeight
        const firstSectionEndPosition =
          firstSectionStartPosition +
          (sectionRefs[0].ref.current?.scrollHeight - halfWindowHeight)

        const firstSectionProgress = Math.min(
          Math.max(
            (y - firstSectionStartPosition) /
              (firstSectionEndPosition - firstSectionStartPosition),
            0
          ),
          1
        )

        sectionProgressList.current = [firstSectionProgress]
        const distance = day3Length * firstSectionProgress
        const pointAlongDay3 = along(day3Line, distance, { units: 'miles' })
        setEaseToDuration(500)
        setCenter(pointAlongDay3.geometry.coordinates as LngLatLike)
      }
    }
  }, [scrollState, sectionRefs])

  return (
    <div className="flex w-screen flex-col overflow-x-clip">
      <pre className="fixed top-20 text-black right-0 p-3 bg-white text-sm z-50">
        <p>Scroll Progress: {scrollProgress.toFixed(2)}%</p>
        <div>
          {sectionProgressList.current?.map((ratio, index) => (
            <p key={index}>
              Section {index + 1} progress: {(ratio * 100).toFixed(2)}%
            </p>
          ))}
        </div>
      </pre>
      <div className="fixed inset-0 flex z-50">
        <div className="flex flex-1 border-black border-r h-full flex-grow min-w-px" />
        <div className="flex flex-1 border-black border-r h-full flex-grow min-w-px" />
        <div className="flex flex-1 border-black border-r h-full flex-grow min-w-px" />
        <div className="flex flex-1 border-black border-r h-full flex-grow min-w-px" />
      </div>
      <div className="fixed inset-0 flex flex-col z-50">
        <div className="flex flex-1 border-black border-b w-full flex-grow min-h-px" />
        <div className="flex flex-1 border-black border-b w-full flex-grow min-h-px" />
      </div>
      <div className="flex flex-col gap-6 md:gap-8 flex-grow w-full items-center pb-2 md:pb-5 pt-8 md:pt-14 min-h-[90vh]">
        <h1>Baileys Traverse to Olympus High Route</h1>
      </div>
      <div className="flex flex-grow w-full h-screen border flex-col pointer-events-none sticky top-0 z-10">
        {center && (
          <Map
            center={center}
            easeToDuration={easeToDuration}
            controls={['scale']}
            sources={[
              {
                id: 'mapbox-dem',
                type: 'raster-dem',
                url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
                tileSize: 512,
                maxZoom: 16,
              },
              {
                id: 'day-3',
                type: 'geojson',
                data: day3GeoJson,
              },
            ]}
            layers={[
              {
                id: 'sky',
                type: 'sky',
                paint: {
                  'sky-type': 'atmosphere',
                  'sky-atmosphere-sun': [0.0, 90.0],
                  'sky-atmosphere-sun-intensity': 15,
                },
              },
              {
                id: 'day-3-line',
                type: 'line',
                source: 'day-3',
                paint: {
                  'line-color': '#ff69b4',
                  'line-width': 6,
                },
              },
              {
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
              },
            ]}
            terrainSource="mapbox-dem"
            bearing={90}
            pitch={60}
            padding={mapPadding}
          ></Map>
        )}
      </div>
      <div
        className="flex-col w-full z-20 p-5 flex gap-8 items-end"
        ref={sectionRefs[0].ref}
      >
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            className="h-[200px] w-1/2 border p-5 bg-white text-black"
            key={index}
          >
            <h2>Section {index + 1}</h2>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam
              quos, voluptate, quas quia, quod iusto odit voluptas quibusdam
              dolorum doloremque doloribus. Quisquam quos, voluptate, quas quia,
              quod iusto odit voluptas quibusdam dolorum doloremque doloribus.
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
