import fs from 'fs';
import path from 'path';
import { Vessel } from '../../../shared/types';

export function loadVesselData(): Vessel[] {
  const dataPath = path.join(__dirname, '..', '..', 'data.json');
  const rawData = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(rawData) as Vessel[];
}
