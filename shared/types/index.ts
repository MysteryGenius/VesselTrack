export interface Vessel {
  id: number;
  name: string;
  imo: number;
  lat: number;
  lng: number;
  destination: string;
}

export interface VesselUpdate {
  imo: number;
  lat: number;
  lng: number;
  destination: string;
}
