import { Component, Input, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { GeocodingService } from '../../services/geocoding.service';
import { RoutingService } from '../../services/routing.service';
import { forkJoin, of, switchMap, map } from 'rxjs';

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

  @Input() coordsDepart?: [number, number];
  @Input() coordsArrivee?: [number, number];

  private map: L.Map | undefined;
  private markers: L.Marker[] = [];
  private routeLayer: L.Layer | undefined;


  // Départ : Vert
  private startIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // Arrivée : Rouge
  private endIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // Étapes : Or
  private stepIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  constructor(
      private geocodingService: GeocodingService,
      private routingService: RoutingService
  ) {}

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.map && (
        changes['villeDepart'] || changes['villeArrivee'] || changes['etapes'] ||
        changes['coordsDepart'] || changes['coordsArrivee']
    )) {
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
    console.log('UpdateRoute - Etapes reçues:', this.etapes);
    if (!this.map) return;

    this.markers.forEach(m => this.map?.removeLayer(m));
    this.markers = [];
    if (this.routeLayer) this.map.removeLayer(this.routeLayer);

    const pointsConfig = [
      { type: 'DEPART', nom: this.villeDepart, coords: this.coordsDepart },
      ...(this.etapes || []).map(e => ({ type: 'ETAPE', nom: e, coords: undefined })),
      { type: 'ARRIVEE', nom: this.villeArrivee, coords: this.coordsArrivee }
    ];

    const observables = pointsConfig.map(point => {
      if (point.coords) {
        return of({ ...point, latLng: point.coords as [number, number] });
      } else {
        if (!point.nom) return of({ ...point, latLng: null });

        return this.geocodingService.getCoordinates(point.nom).pipe(
            map(coords => ({ ...point, latLng: coords }))
        );
      }
    });

    forkJoin(observables).pipe(
        switchMap(resultats => {
          const pointsTrouves = resultats.filter(p => p.latLng !== null) as { type: string, nom: string, latLng: [number, number] }[];

          this.placerMarqueurs(pointsTrouves);

          const coordsSeules = pointsTrouves.map(p => p.latLng);
          if (coordsSeules.length > 1) {
            return this.routingService.getRouteData(coordsSeules);
          } else {
            return of(null);
          }
        })
    ).subscribe({
      next: (routeResult) => {
        if (routeResult && routeResult.geometry && this.map) {
          this.routeLayer = L.geoJSON(routeResult.geometry, {
            style: { color: '#007bff', weight: 5, opacity: 0.7 }
          }).addTo(this.map);

          // @ts-ignore
          if (this.routeLayer.getBounds) {
            // @ts-ignore
            this.map.fitBounds(this.routeLayer.getBounds(), { padding: [50, 50] });
          }
        }
      },
      error: (err) => console.error('Erreur Map:', err)
    });
  }

  private placerMarqueurs(points: { type: string, nom: string, latLng: [number, number] }[]): void {
    points.forEach((point) => {
      let label = '';
      let iconToUse: L.Icon;
      let zIndex = 0;

      // SELECTION DE L'ICÔNE, DU LABEL ET DE LA PRIORITÉ
      if (point.type === 'DEPART') {
        label = `<strong>Départ 🏁</strong><br>${point.nom}`;
        iconToUse = this.startIcon; // Vert
        zIndex = 1000;
      } else if (point.type === 'ARRIVEE') {
        label = `<strong>Arrivée 🏁</strong><br>${point.nom}`;
        iconToUse = this.endIcon;   // Rouge
        zIndex = 1000;
      } else {
        label = `<strong>Étape ☕</strong><br>${point.nom}`;
        iconToUse = this.stepIcon;  // Or
        zIndex = 500; //
      }

      const marker = L.marker(point.latLng, {
        icon: iconToUse,
        zIndexOffset: zIndex
      })
          .addTo(this.map!)
          .bindPopup(label);

      this.markers.push(marker);
    });
  }
}