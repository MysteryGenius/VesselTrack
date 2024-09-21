// src/index.js
import express, { Express } from "express";
import cors from "cors";
import http from 'http';
import dotenv from "dotenv";

import routes from './routes/api';
import { initializeWebSocket } from "./services/websocketService";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);

// Initialize WebSocket server
const wss = initializeWebSocket(server);

// Middlewares
app.use(cors()); // Enable CORS
app.use(express.json()) // for parsing application/json

// Routes
app.use('/api', routes);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export { wss };
