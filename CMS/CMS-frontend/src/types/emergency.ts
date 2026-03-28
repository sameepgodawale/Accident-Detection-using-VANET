export type SeverityLevel = 'critical' | 'warning' | 'moderate';

export type AccidentStatus = 'new' | 'acknowledged' | 'dispatched' | 'resolved';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface VehicleData {
  id: string;
  type: string;
  speed: number;
  direction: number;
}

export interface AccidentAlert {
  id: string;
  severity: SeverityLevel;
  status: AccidentStatus;
  location: Coordinates;
  address: string;
  timestamp: Date;
  vehicle: VehicleData;
  dispatchETA: number; // in seconds
  description: string;
  nodeId: string;
  impactForce?: number;
  injuryLikelihood?: 'high' | 'medium' | 'low';
}

export interface SystemHealth {
  vanetConnectivity: number; // percentage
  databaseLatency: number; // milliseconds
  apiStatus: 'online' | 'degraded' | 'offline';
  lastUpdate: Date;
}
