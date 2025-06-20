import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-control-geocoder/dist/Control.Geocoder.css'
import { Geocoder, geocoders } from 'leaflet-control-geocoder'

// Fix Leaflet's broken default marker icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface MapPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void
  onClose: () => void
  initialPosition?: { lat: number; lng: number }
}

function MapEvents({ onLocationSelect }: { onLocationSelect: (location: { lat: number; lng: number; address: string }) => void }) {
  const map = useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        )
        const data = await res.json()
        const address = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
        const location = { lat, lng, address }
        onLocationSelect(location)
        map.setView([lat, lng], map.getZoom())
      } catch (err) {
        console.error('Reverse geocoding error:', err)
        const location = { lat, lng, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` }
        onLocationSelect(location)
        map.setView([lat, lng], map.getZoom())
      }
    },
  })

  useEffect(() => {
    const geocoder = new Geocoder({
      defaultMarkGeocode: false,
      geocoder: new geocoders.Nominatim({
        geocodingQueryParams: {
          limit: 5
        }
      })
    })

    geocoder.on('markgeocode', (e) => {
      const { center, name } = e.geocode
      onLocationSelect({
        lat: center.lat,
        lng: center.lng,
        address: name
      })
      map.setView([center.lat, center.lng], map.getZoom())
    })

    geocoder.addTo(map)

    return () => {
      map.removeControl(geocoder)
    }
  }, [map, onLocationSelect])

  return null
}

export function MapPicker({
  onLocationSelect,
  onClose,
  initialPosition,
}: MapPickerProps) {
  const [position, setPosition] = useState<[number, number]>(
    initialPosition ? [initialPosition.lat, initialPosition.lng] : [13.0827, 80.2707]
  )
  const [selected, setSelected] = useState<{
    lat: number
    lng: number
    address: string
  } | null>(initialPosition ? { ...initialPosition, address: '' } : null)

  useEffect(() => {
    if (navigator.geolocation && !initialPosition) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude])
        },
        (err) => {
          console.warn('Geolocation failed:', err)
        }
      )
    }
  }, [initialPosition])

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setSelected(location)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-auto">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden border">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-foreground">Pick Location on Map</h2>
          <button
            onClick={onClose}
            className="text-xl text-muted-foreground hover:text-foreground"
          >
            &times;
          </button>
        </div>

        {/* Map */}
        <div className="p-4 grow">
          <div className="h-96 w-full rounded-md border overflow-hidden">
            <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapEvents onLocationSelect={handleLocationSelect} />
              {selected && <Marker position={[selected.lat, selected.lng]} />}
            </MapContainer>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-background">
          <p className="text-sm mb-3 text-foreground">
            <strong>Selected Location:</strong><br />
            {selected?.address || 'Click anywhere on the map to select a location'}
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-muted hover:bg-muted/80 text-foreground text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => selected && onLocationSelect(selected)}
              disabled={!selected}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50"
            >
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
