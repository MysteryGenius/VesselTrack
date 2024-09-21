import { Request, Response } from 'express';
import { getAllVessels, startTracking, updateVesselInformation } from '../services/trackingService';

export const fetchVessels = (req: Request, res: Response) => {
  const vessels = getAllVessels();
  res.json(vessels);
}

export const trackVessels = (req: Request, res: Response) => {
  const vesselImos: number[] = req.body || [];
  startTracking(vesselImos);
  res.sendStatus(200);
};

export const updateVesselInfo = (req: Request, res: Response) => {
  const vesselInfo = req.body;
  updateVesselInformation(vesselInfo);
  res.sendStatus(200);
};
