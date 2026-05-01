export interface Conversation {
  id: number;
  trajetId: number;
  conducteurId: number;
  conducteurEmail: string;
  passagerId: number;
  passagerEmail: string;
  villeDepart: string;
  villeArrivee: string;
  createdAt: string;
}
