import { bbox, center, featureCollection } from '@turf/turf'
import type { LngLatBounds, PaddingOptions, Map as TMap } from 'mapbox-gl'
import { type LngLatLike } from 'mapbox-gl'
import type { RefObject } from 'react'
import { createRef, useEffect, useMemo, useRef, useState } from 'react'
import { useIntersection } from 'react-use'
import Map from '~/components/Map'

import day1geojson from '~/data/day1.json'
import day2geojson from '~/data/day2.json'
import day3geojson from '~/data/day3.json'
import day4geojson from '~/data/day4.json'
import day5geojson from '~/data/day5.json'

const daysSources = [
  { id: 'day-5', type: 'geojson', data: day5geojson },
  { id: 'day-4', type: 'geojson', data: day4geojson },
  { id: 'day-3', type: 'geojson', data: day3geojson },
  { id: 'day-2', type: 'geojson', data: day2geojson },
  { id: 'day-1', type: 'geojson', data: day1geojson },
]

const daysLayers = daysSources.flatMap((source) => [
  {
    id: `${source.id}-line`,
    type: 'line',
    source: source.id,
    paint: {
      'line-color': '#1e1e1e',
      'line-width': 4,
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

const centerOfDay1 = center(day1geojson)

type Section = {
  id: string
  title: string
  description?: string
  layerKeys?: string[]
  center?: LngLatLike
  bearing?: number
  pitch?: number
  zoom?: number
  bounds?: LngLatBounds
}
type SectionWithRef = Section & { ref: RefObject<HTMLDivElement> }
const sections: Section[] = [
  {
    id: 'intro',
    title: 'Introduction',
    center: centerOfAllFeatures.geometry.coordinates as LngLatLike,
    bearing: 90,
    pitch: 60,
    zoom: 11,
  },
  {
    id: 'day-1__all',
    title: 'Day 1',
    layerKeys: day1geojson.features.map((feature) => feature.properties?.key),
    center: centerOfDay1.geometry.coordinates as LngLatLike,
    bearing: 50,
    zoom: 11,
  },
  {
    id: 'day-2__all',
    title: 'Day 2',
    layerKeys: day2geojson.features.map((feature) => feature.properties?.key),
    center: center(day2geojson).geometry.coordinates as LngLatLike,
    bearing: 50,
    zoom: 11,
  },
  {
    id: 'day-3__all',
    title: 'Day 3',
    layerKeys: day3geojson.features.map((feature) => feature.properties?.key),
    center: center(day3geojson).geometry.coordinates as LngLatLike,
    bearing: 50,
    zoom: 11,
  },
  {
    id: 'day-4__all',
    title: 'Day 4',
    layerKeys: day4geojson.features.map((feature) => feature.properties?.key),
    center: center(day4geojson).geometry.coordinates as LngLatLike,
    bearing: 50,
    zoom: 11,
  },
  {
    id: 'day-5__all',
    title: 'Day 5',
    layerKeys: day5geojson.features.map((feature) => feature.properties?.key),
    center: center(day5geojson).geometry.coordinates as LngLatLike,
    bearing: 50,
    zoom: 11,
  },
]

export default function BaileysTraverseToOlympusHighRoute() {
  const [center, setCenter] = useState<LngLatLike | null>(
    centerOfAllFeatures.geometry.coordinates as LngLatLike
  )
  const [easeToDuration, setEaseToDuration] = useState(2000)
  const [mapPadding, setMapPadding] = useState<PaddingOptions>()
  const [pitch, setPitch] = useState<number>()
  const [bearing, setBearing] = useState<number>()
  const [zoom, setZoom] = useState<number>(14)

  const mapHandle = useRef<{ getMap: () => TMap | undefined }>()
  const getMap = mapHandle.current?.getMap || (() => undefined)

  useEffect(() => {
    const rightPadding = window.innerWidth * 0.5
    // @ts-expect-error
    setMapPadding({ right: rightPadding })
  }, [])

  const sectionRefs = useMemo(
    () =>
      sections.map((section) => ({
        ...section,
        ref: createRef<HTMLDivElement>(),
      })),
    []
  )

  const [visibleSections, setVisibleSections] = useState<SectionWithRef[]>([])
  const [visibleSection, setVisibleSection] = useState<SectionWithRef | null>(
    null
  )

  useEffect(() => {
    if (visibleSections.length > 0) {
      if (visibleSections.length === 1) {
        return setVisibleSection(visibleSections[0])
      }

      // sort by top position
      const sorted = visibleSections.sort((a, b) => {
        if (a.ref.current && b.ref.current) {
          return b.ref.current.offsetTop - a.ref.current.offsetTop
        } else {
          return 0
        }
      })
      setVisibleSection(sorted[0])
    }

    if (visibleSections.length === 0) {
      setVisibleSection(null)
    }
  }, [visibleSections])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const section = sectionRefs.find(
            (ref) => ref.ref.current === entry.target
          )

          if (entry.isIntersecting) {
            if (section) {
              setVisibleSections((prev) => [...prev, section])
            }
          }
          if (!entry.isIntersecting) {
            if (section) {
              setVisibleSections((prev) =>
                prev.filter((s) => s.id !== section.id)
              )
            }
          }
        })
      },
      {
        root: null,
        rootMargin: '0px 0px -50% 0px',
        threshold: 0,
      }
    )

    sectionRefs.forEach((ref) => {
      if (ref.ref.current) {
        observer.observe(ref.ref.current)
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [sectionRefs])

  useEffect(
    function updateMapLayersBasedOnVisibleSection() {
      if (visibleSection) {
        const section = sections.find((s) => s.id === visibleSection.id)
        if (section) {
          if (section.center) setCenter(section.center)
          if (section.bearing) setBearing(section.bearing)
          if (section.pitch) setPitch(section.pitch)
          if (section.zoom) setZoom(section.zoom)

          const map = getMap()
          if (map) {
            const [baseId] = section.id.split('__')
            const layer = map.getLayer(`${baseId}-line`)

            if (layer) {
              map.setPaintProperty(`${baseId}-line`, 'line-color', '#ff69b4')
              map.setPaintProperty(`${baseId}-line`, 'line-width', 6)
              daysSources
                .filter((source) => source.id !== baseId)
                .forEach((source) => {
                  map.setPaintProperty(
                    `${source.id}-line`,
                    'line-color',
                    '#1e1e1e'
                  )
                  map.setPaintProperty(`${source.id}-line`, 'line-width', 4)
                })
            } else {
              daysSources.forEach((source) => {
                map.setPaintProperty(
                  `${source.id}-line`,
                  'line-color',
                  '#1e1e1e'
                )
                map.setPaintProperty(`${source.id}-line`, 'line-width', 4)
              })
            }

            if (baseId === 'day-1' || baseId == 'day-5') {
              map.moveLayer(`${baseId}-line`)
            }
          }
        }
      }
    },
    [getMap, visibleSection]
  )

  return (
    <div className="flex w-screen flex-col overflow-x-clip">
      <pre className="fixed top-20 text-black right-0 p-3 bg-white text-sm z-50">
        <p>Visible section: {visibleSection?.id}</p>
      </pre>
      {/* <div className="fixed inset-0 flex z-50">
        <div className="flex flex-1 border-black border-r h-full flex-grow min-w-px" />
        <div className="flex flex-1 border-black border-r h-full flex-grow min-w-px" />
        <div className="flex flex-1 border-black border-r h-full flex-grow min-w-px" />
        <div className="flex flex-1 border-black border-r h-full flex-grow min-w-px" />
      </div>
      <div className="fixed inset-0 flex flex-col z-50">
        <div className="flex flex-1 border-black border-b w-full flex-grow min-h-px" />
        <div className="flex flex-1 border-black border-b w-full flex-grow min-h-px" />
      </div> */}
      <div className="flex flex-col gap-6 md:gap-8 flex-grow w-full items-center md:pb-5 pt-8 md:pt-14 h-[60vh]">
        <h1>Baileys Traverse to Olympus High Route</h1>
      </div>
      <div className="relative flex flex-col">
        <div className="flex flex-grow w-full h-screen border flex-col pointer-events-none z-10 sticky top-0">
          {center && (
            <Map
              ref={mapHandle}
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
        <div
          className="absolute top-0 left-0 right-0 w-full h-screen z-20 flex flex-col justify-center items-end pr-20"
          ref={sectionRefs[0].ref}
        >
          <div className="flex flex-col gap-4 p-5 bg-white rounded text-black min-w-[300px]">
            <h2 className="font-bold text-xl">Trip Details:</h2>
            <p>70 Miles</p>
            <p>28,000 Feet of Up</p>
          </div>
        </div>
        <div
          className="flex-col w-full z-20 p-5 flex gap-8 items-end min-h-screen border"
          ref={sectionRefs[1].ref}
        >
          <div className="flex flex-grow w-1/2 border p-5 bg-white text-black">
            <h2>Day 1</h2>
            <p>
              We walked from the Hoh River Visitors Center to the High Divide
              and camped at Bruce's Roost
            </p>
          </div>
        </div>
        <div
          className="flex-col w-full z-20 p-5 flex gap-8 items-end min-h-screen border"
          ref={sectionRefs[2].ref}
        >
          <div className="flex flex-grow w-1/2 border p-5 bg-white text-black">
            <h2>Day 2</h2>
            <p></p>
          </div>
        </div>
        <div
          className="flex-col w-full z-20 p-5 flex gap-8 items-end min-h-screen border"
          ref={sectionRefs[3].ref}
        >
          <div className="flex flex-grow w-1/2 border p-5 bg-white text-black">
            <h2>Day 3</h2>
            <p></p>
          </div>
        </div>
        <div
          className="flex-col w-full z-20 p-5 flex gap-8 items-end min-h-screen border"
          ref={sectionRefs[4].ref}
        >
          <div className="flex flex-grow w-1/2 border p-5 bg-white text-black">
            <h2>Day 4</h2>
            <p></p>
          </div>
        </div>
        <div
          className="flex-col w-full z-20 p-5 flex gap-8 items-end min-h-screen border"
          ref={sectionRefs[5].ref}
        >
          <div className="flex flex-grow w-1/2 border p-5 bg-white text-black">
            <h2>Day 5</h2>
            <p></p>
          </div>
        </div>
      </div>
    </div>
  )
}
