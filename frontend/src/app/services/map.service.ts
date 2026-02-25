import { Injectable } from '@angular/core';
import * as L from 'leaflet';

@Injectable({ providedIn: 'root' })
export class MapService {
  private map?: L.Map;
  private routeLayer?: L.Polyline;
  private markers: L.Marker[] = [];

  initMap(containerId: string, center: L.LatLngExpression = [48.8566, 2.3522], zoom = 12): void {
    // si déjà init, on nettoie
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }

    this.map = L.map(containerId).setView(center, zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);
  }

  async drawRoute(fromLat: number, fromLng: number, toLat: number, toLng: number): Promise<void> {
    if (!this.map) throw new Error('Map non initialisée');

    // cleanup anciens tracés
    this.clearRoute();

    // marqueurs
    const fromMarker = L.marker([fromLat, fromLng]);
    const toMarker = L.marker([toLat, toLng]);
    this.markers.push(fromMarker, toMarker);
    fromMarker.addTo(this.map);
    toMarker.addTo(this.map);

    // OSRM route
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Impossible de calculer l’itinéraire');
    const data = await res.json();

    const coords: [number, number][] = data.routes?.[0]?.geometry?.coordinates;
    if (!coords || coords.length === 0) throw new Error('Itinéraire introuvable');

    // GeoJSON coords = [lng,lat] -> Leaflet = [lat,lng]
    const latLngs = coords.map(([lng, lat]) => [lat, lng] as [number, number]);

    this.routeLayer = L.polyline(latLngs).addTo(this.map);

    // fit bounds
    const bounds = this.routeLayer.getBounds();
    this.map.fitBounds(bounds, { padding: [30, 30] });
  }

  clearRoute(): void {
    if (!this.map) return;

    if (this.routeLayer) {
      this.routeLayer.removeFrom(this.map);
      this.routeLayer = undefined;
    }

    this.markers.forEach(m => m.removeFrom(this.map!));
    this.markers = [];
  }
}
