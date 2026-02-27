export type PointTransactionType =
  | 'BONUS_INSCRIPTION'
  | 'GAIN_CONDUCTEUR'
  | 'DEPENSE_PASSAGER'
  | 'REMBOURSEMENT_ANNULATION'
  | 'BONUS_NIVEAU';

export interface PointTransaction {
  id: number;
  type: PointTransactionType;
  amount: number;
  description: string;
  createdAt: string;
  trajetId: number | null;
}
