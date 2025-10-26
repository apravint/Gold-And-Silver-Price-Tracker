
export enum Metal {
  Gold = 'Gold',
  Silver = 'Silver',
}

export interface CommodityPrice {
  metal: Metal;
  price: number;
  currency: string;
  unit: string;
  change: number;
}
