import express from 'express';
import { fetchVessels, trackVessels, updateVesselInfo } from '../controllers/vesselController';

const app = express();

app.get('/ping', (_, res) => {
  res.send('pong');
});
app.get('/fetch-vessels', fetchVessels);
app.post('/track', trackVessels);
app.post('/updated-vessel-information', updateVesselInfo);

export default app;
