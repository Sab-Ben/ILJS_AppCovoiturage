import { Component, Input, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { GeocodingService } from '../../services/geocoding.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `<div id="map" class="map-container"></div>`,
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit, OnChanges {
  @Input() villeDepart: string = '';
  @Input() villeArrivee: string = '';

  private map: L.Map | undefined;
  private markers: L.Marker[] = [];
  private routeLine: L.Polyline | undefined;

  private defaultIcon = L.icon({
    iconUrl: 'assets/marker-icon.png', // Todo ajouter une icone
    shadowUrl: 'assets/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  });

  constructor(private geocodingService: GeocodingService) {
    const iconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
    const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
    const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';
    const iconDefault = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['villeDepart'] || changes['villeArrivee']) && this.map) {
      this.updateRoute();
    }
  }

  private initMap(): void {
    this.map = L.map('map').setView([46.603354, 1.888334], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.updateRoute();
  }

  private updateRoute(): void {
    if (!this.villeDepart || !this.villeArrivee || !this.map) return;

    this.markers.forEach(m => this.map?.removeLayer(m));
    this.markers = [];
    if (this.routeLine) {
      this.map.removeLayer(this.routeLine);
    }

    this.geocodingService.getCoordinates(this.villeDepart).subscribe(coordDepart => {
      this.geocodingService.getCoordinates(this.villeArrivee).subscribe(coordArrivee => {

        if (coordDepart && coordArrivee && this.map) {
          const markerDep = L.marker(coordDepart).addTo(this.map).bindPopup(`Départ: ${this.villeDepart}`).openPopup();
          const markerArr = L.marker(coordArrivee).addTo(this.map).bindPopup(`Arrivée: ${this.villeArrivee}`);
          this.markers.push(markerDep, markerArr);

          const latlngs: L.LatLngExpression[] = [coordDepart, coordArrivee];
          this.routeLine = L.polyline(latlngs, { color: 'blue', weight: 4 }).addTo(this.map);

          this.map.fitBounds(L.latLngBounds(latlngs), { padding: [50, 50] });
        }
      });
    });
  }
}