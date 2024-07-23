import {
  along,
  bbox,
  center,
  feature,
  featureCollection,
  length,
  lineString,
} from '@turf/turf'
import classNames from 'classnames'
import type { PaddingOptions } from 'mapbox-gl'
import { type LngLatLike } from 'mapbox-gl'
import { createRef, useEffect, useMemo, useRef, useState } from 'react'
import { useIntersection, useWindowScroll } from 'react-use'
import Map from '~/components/Map'

import day1geojson from '~/data/day1.json'
import day2geojson from '~/data/day2.json'
import day3geojson from '~/data/day3.json'
import day4geojson from '~/data/day4.json'
import day5geojson from '~/data/day5.json'

const daysSources = [
  { id: 'day-1', type: 'geojson', data: day1geojson },
  { id: 'day-2', type: 'geojson', data: day2geojson },
  { id: 'day-3', type: 'geojson', data: day3geojson },
  { id: 'day-4', type: 'geojson', data: day4geojson },
  { id: 'day-5', type: 'geojson', data: day5geojson },
]

const daysLayers = daysSources.flatMap((source) => [
  {
    id: `${source.id}-line`,
    type: 'line',
    source: source.id,
    paint: {
      'line-color': '#ff69b4',
      'line-width': 6,
    },
  },
  {
    id: `${source.id}-label`,
    type: 'symbol',
    source: source.id,
    layout: {
      'text-field': '{title}: {description}',
      'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
      'text-size': 14,
    },
    paint: {
      'text-color': '#fff',
      'text-halo-color': '#333333',
      'text-halo-width': 1,
    },
  },
])

const allFeatureCollections = featureCollection(
  daysSources.flatMap((source) => source.data.features)
)
const centerOfAllFeatures = center(allFeatureCollections)
const bounds = bbox(allFeatureCollections)

const sections = ['day-1']

export default function BaileysTraverseToOlympusHighRoute() {
  const [center, setCenter] = useState<LngLatLike | null>(
    centerOfAllFeatures.geometry.coordinates as LngLatLike
  )
  const [easeToDuration, setEaseToDuration] = useState(2000)
  const [mapPadding, setMapPadding] = useState<PaddingOptions>()
  const [pitch, setPitch] = useState<number>()
  const [bearing, setBearing] = useState<number>()
  const [zoom, setZoom] = useState<number>(14)
  const [mapSticky, setMapSticky] = useState<boolean>(true)

  useEffect(() => {
    const rightPadding = window.innerWidth * 0.5
    // @ts-expect-error
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

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapIntersection = useIntersection(mapContainerRef, {
    root: null,
    rootMargin: '0px',
    threshold: 1,
  })
  useEffect(
    function updateMapWhenFullyVisible() {
      if (mapIntersection?.intersectionRatio === 1) {
        setPitch(60)
        setBearing(90)
        setZoom(11)
      }
    },
    [mapIntersection]
  )

  const footerRef = useRef<HTMLDivElement>(null)
  const footerIntersection = useIntersection(footerRef, {
    root: null,
    rootMargin: '0px',
    threshold: 0.01,
  })
  useEffect(
    function updateMapSticky() {
      if (footerIntersection?.intersectionRatio === 0) {
        setMapSticky(true)
      } else {
        setMapSticky(false)
      }
    },
    [footerIntersection]
  )

  // useEffect(() => {
  //   if (scrollState) {
  //     const { y } = scrollState

  //     setScrollProgress(
  //       ((y + window.innerHeight) / document.documentElement.scrollHeight) * 100
  //     )

  //     if (sectionRefs.length > 0 && sectionRefs[0].ref.current) {
  //       const halfWindowHeight = window.innerHeight / 2
  //       const firstSectionStartPosition =
  //         sectionRefs[0].ref.current?.offsetTop - halfWindowHeight
  //       const firstSectionEndPosition =
  //         firstSectionStartPosition +
  //         (sectionRefs[0].ref.current?.scrollHeight - halfWindowHeight)

  //       const firstSectionProgress = Math.min(
  //         Math.max(
  //           (y - firstSectionStartPosition) /
  //             (firstSectionEndPosition - firstSectionStartPosition),
  //           0
  //         ),
  //         1
  //       )

  //       sectionProgressList.current = [firstSectionProgress]
  //       const distance = day3Length * firstSectionProgress
  //       const pointAlongDay3 = along(day3Line, distance, { units: 'miles' })
  //       setEaseToDuration(500)
  //       setCenter(pointAlongDay3.geometry.coordinates as LngLatLike)
  //     }
  //   }
  // }, [scrollState, sectionRefs])

  return (
    <div className="flex w-screen flex-col overflow-x-clip">
      {/* <pre className="fixed top-20 text-black right-0 p-3 bg-white text-sm z-50">
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
      </div> */}
      <div className="flex flex-col gap-6 md:gap-8 flex-grow w-full items-center md:pb-5 pt-8 md:pt-14 mb-96">
        <h1>Baileys Traverse to Olympus High Route</h1>
      </div>
      <div className="relative flex flex-col w-full">
        <div
          className={classNames(
            'flex flex-grow w-full h-screen border flex-col pointer-events-none z-10',
            mapSticky && 'sticky top-0',
            !mapSticky && 'absolute bottom-0'
          )}
          ref={mapContainerRef}
        >
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
                ...daysSources,
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
                ...daysLayers,
              ]}
              terrainSource="mapbox-dem"
              bearing={bearing}
              pitch={pitch}
              zoom={zoom}
              padding={mapPadding}
              initialBounds={bounds}
            ></Map>
          )}
        </div>
        <div className="absolute top-0 left-0 right-0 w-full h-screen z-20 flex flex-col justify-center items-end pr-20">
          <div className="flex flex-col gap-4 p-5 bg-white rounded text-black min-w-[300px]">
            <h2 className="font-bold text-xl">Trip Details:</h2>
            <p>70 Miles</p>
            <p>28,000 Feet of Up</p>
          </div>
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
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Quisquam quos, voluptate, quas quia, quod iusto odit voluptas
                quibusdam dolorum doloremque doloribus. Quisquam quos,
                voluptate, quas quia, quod iusto odit voluptas quibusdam dolorum
                doloremque doloribus.
              </p>
            </div>
          ))}
        </div>
      </div>
      <div
        className="flex flex-col w-full items-center h-[600px]"
        ref={footerRef}
      >
        footer
      </div>
    </div>
  )
}
