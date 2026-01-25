import { Component, Input, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { GeocodingService } from '../../services/geocoding.service';
import { forkJoin } from 'rxjs'; // <--- Import nécessaire pour gérer plusieurs requêtes

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
  @Input() etapes: string[] = [];

  private map: L.Map | undefined;
  private markers: L.Marker[] = [];
  private routeLine: L.Polyline | undefined;

  private defaultIcon = L.icon({
    iconUrl: 'assets/marker-icon.png',
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
    if ((changes['villeDepart'] || changes['villeArrivee'] || changes['etapes']) && this.map) {
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

    const villesA_Geocoder = [
      this.villeDepart,
      ...(this.etapes || []),
      this.villeArrivee
    ];

    const requetes = villesA_Geocoder.map(ville => this.geocodingService.getCoordinates(ville));

    forkJoin(requetes).subscribe(resultats => {
      const pointsValides: L.LatLngExpression[] = [];
      const bounds = L.latLngBounds([]);

      resultats.forEach((coord, index) => {
        if (coord) {
          pointsValides.push(coord);
          bounds.extend(coord);

          let label = '';
          if (index === 0) label = `Départ: ${villesA_Geocoder[index]}`;
          else if (index === resultats.length - 1) label = `Arrivée: ${villesA_Geocoder[index]}`;
          else label = `Étape: ${villesA_Geocoder[index]}`;

          const marker = L.marker(coord).addTo(this.map!).bindPopup(label);

          if (index === 0 || index === resultats.length - 1) {
            marker.openPopup();
          }

          this.markers.push(marker);
        }
      });

      if (pointsValides.length > 1 && this.map) {
        this.routeLine = L.polyline(pointsValides, { color: 'blue', weight: 4 }).addTo(this.map);
        this.map.fitBounds(bounds, { padding: [50, 50] });
      }
    });
  }
}