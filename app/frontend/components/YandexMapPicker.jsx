import { useEffect, useRef, useState } from 'react'

const MOSCOW_CENTER = [55.75, 37.62]
const SCRIPT_ID = 'ymaps3-script'

export default function YandexMapPicker({ lat, lng, address, onChange, disabled, apiKey }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const listenerRef = useRef(null)
  const [displayAddress, setDisplayAddress] = useState(address || '')
  const [loading, setLoading] = useState(false)
  const [hasMarker, setHasMarker] = useState(!!(lat && lng))

  useEffect(() => {
    if (!apiKey) return

    const initMap = () => {
      window.ymaps3.ready.then(() => {
        if (!mapContainerRef.current) return

        const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker, YMapListener } = window.ymaps3

        const initialCenter = lat && lng ? [parseFloat(lng), parseFloat(lat)] : [MOSCOW_CENTER[1], MOSCOW_CENTER[0]]
        const initialZoom = lat && lng ? 14 : 10

        const map = new YMap(mapContainerRef.current, {
          location: {
            center: initialCenter,
            zoom: initialZoom,
          },
        })

        map.addChild(new YMapDefaultSchemeLayer())
        map.addChild(new YMapDefaultFeaturesLayer())

        mapRef.current = map

        if (lat && lng) {
          const element = document.createElement('div')
          element.innerHTML = '<div style="width:20px;height:20px;background:#2563eb;border:2px solid white;border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>'
          const marker = new YMapMarker({ coordinates: [parseFloat(lng), parseFloat(lat)] }, element)
          map.addChild(marker)
          markerRef.current = { marker, element }
        }

        if (!disabled) {
          const listener = new YMapListener({
            onClick: (obj, event) => {
              const coords = event.coordinates
              const newLng = coords[0]
              const newLat = coords[1]

              if (markerRef.current) {
                map.removeChild(markerRef.current.marker)
              }

              const el = document.createElement('div')
              el.innerHTML = '<div style="width:20px;height:20px;background:#2563eb;border:2px solid white;border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>'
              const newMarker = new YMapMarker({ coordinates: [newLng, newLat] }, el)
              map.addChild(newMarker)
              markerRef.current = { marker: newMarker, element: el }

              reverseGeocode(newLat, newLng, apiKey).then((addr) => {
                setDisplayAddress(addr)
                onChange(newLat, newLng, addr)
              })
            },
          })
          map.addChild(listener)
          listenerRef.current = listener
        }
      })
    }

    if (window.ymaps3) {
      initMap()
    } else if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement('script')
      script.id = SCRIPT_ID
      script.src = `https://api-maps.yandex.ru/3.0/?apikey=${apiKey}&lang=ru_RU`
      script.onload = initMap
      document.head.appendChild(script)
    } else {
      const existing = document.getElementById(SCRIPT_ID)
      existing.addEventListener('load', initMap)
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.destroy?.()
        mapRef.current = null
        markerRef.current = null
        listenerRef.current = null
      }
    }
  }, [apiKey])

  return (
    <div>
      <div
        ref={mapContainerRef}
        style={{ width: '100%', height: '300px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #d1d5db' }}
      />
      <p className="mt-2 text-sm text-gray-500">
        {displayAddress
          ? displayAddress
          : lat && lng
          ? `${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(6)}`
          : disabled
          ? 'Местоположение не указано'
          : 'Кликните на карте для выбора местоположения'}
      </p>
      {!apiKey && (
        <p className="mt-1 text-sm text-red-500">Ключ Яндекс Карт не настроен (YANDEX_MAPS_API_KEY)</p>
      )}
    </div>
  )
}

async function reverseGeocode(lat, lng, apiKey) {
  try {
    const resp = await fetch(
      `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&geocode=${lng},${lat}&format=json&lang=ru_RU&results=1`
    )
    const json = await resp.json()
    const members = json?.response?.GeoObjectCollection?.featureMember
    if (members && members.length > 0) {
      return members[0].GeoObject?.metaDataProperty?.GeocoderMetaData?.text || ''
    }
  } catch (e) {
    console.error('Geocode error', e)
  }
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
}
