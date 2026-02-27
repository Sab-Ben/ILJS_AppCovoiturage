export interface Trajet {
    id?: number;
    villeDepart: string;
    villeArrivee: string;
    etapes?: string[];
    dateHeureDepart: string;
    placesDisponibles: number;
    distanceKm: number;
    dureeEstimee: string;
    latitudeDepart?: number;
    longitudeDepart?: number;
    latitudeArrivee?: number;
    longitudeArrivee?: number;
    prixPoints?: number;
}