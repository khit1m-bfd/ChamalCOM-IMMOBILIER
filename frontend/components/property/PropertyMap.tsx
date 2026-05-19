'use client'

import React, { useEffect, useRef } from 'react'

interface Props {
  lat:   number
  lng:   number
  title: string
}

export function PropertyMap({ lat, lng, title }: Props) {
  const mapRef      = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current) return

    let cancelled = false
    const container = mapRef.current

    const init = async () => {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')

      if (cancelled || !container) return

      // Leaflet leaves _leaflet_id on the DOM after .remove() — clear it first
      if ((container as any)._leaflet_id) {
        (container as any)._leaflet_id = null
      }

      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(container, {
        center:          [lat, lng],
        zoom:            14,
        scrollWheelZoom: false,
        zoomControl:     true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      const icon = L.divIcon({
        html: `<div style="
          width:40px;height:40px;background:linear-gradient(135deg,#1a78e8,#069880);
          border-radius:50% 50% 50% 0;transform:rotate(-45deg);
          border:3px solid white;box-shadow:0 4px 12px rgba(26,120,232,0.4);
        "></div>`,
        className: '',
        iconSize:    [40, 40],
        iconAnchor:  [20, 40],
      })

      L.marker([lat, lng], { icon })
        .addTo(map)
        .bindPopup(title, { closeButton: false })
        .openPopup()

      instanceRef.current = map
    }

    init()

    return () => {
      cancelled = true
      instanceRef.current?.remove()
      instanceRef.current = null
      // Clear Leaflet's container marker so the next mount can re-init cleanly
      if ((container as any)._leaflet_id) {
        (container as any)._leaflet_id = null
      }
    }
  }, [lat, lng, title])

  return (
    <div
      ref={mapRef}
      className="w-full h-64 rounded-2xl overflow-hidden border border-border z-0"
    />
  )
}
