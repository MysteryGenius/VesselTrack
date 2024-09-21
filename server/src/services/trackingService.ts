import { Vessel, VesselUpdate } from '../../../shared/types';
import { broadcastUpdate } from './websocketService';
import { loadVesselData } from '../utils/dataUtil';

let vessels: Vessel[] = loadVesselData();

export const startTracking = (vesselImos: number[]) => {
  console.log('Started tracking vessels:', vesselImos);
  console.log('Current timestamp:', new Date().toISOString());
  let trackedVessels = vessels
  if (vesselImos.length > 0) {
    trackedVessels = vessels.filter(vessel => vessel.imo);
  }
  return trackedVessels;
};

export const updateVesselInformation = (vesselInfo: VesselUpdate) => {
  const index = vessels.findIndex(v => v?.imo === vesselInfo?.imo);
  if (index !== -1) {
    vessels[index] = { ...vessels[index], ...vesselInfo };
    broadcastUpdate(vessels[index]);
  }
};

export const getAllVessels = (): Vessel[] => {
  return vessels;
};
