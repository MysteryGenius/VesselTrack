# Vessel Tracking System

![image](https://github.com/user-attachments/assets/cf34014b-d10d-4b90-9176-07e73729cf83)


This is the server for the vessel tracking system. It is built using Node.js and Express on the backend. The server exposes three endpoints:

- `/fetch-vessels` - returns a list of vessels
- `/track` - logs which vessel is being tracked and the timestamp
- `/updated-vessel-information` - updates the information of a vessel

## Running the server

To run the server, you need to have Node.js installed. You can install Node.js from [here](https://nodejs.org/).

After installing Node.js, you can run the server by running the following commands:

```bash
cd server
npm install
npm dev
```

This will start the server on `http://localhost:3000`.

## Running the client

To run the client, you also need to have Node.js installed. You can install Node.js from [here](https://nodejs.org/).

After installing Node.js, you can run the client by running the following commands:

```bash
cd client
npm install
npm dev
```

This will start the client on `http://localhost:5173`.

## What to expect

The client is a simple React application that fetches a list of vessels from the server and displays them in a table. You can start the tracking process by clicking on the "Track" button. This will start live tracking of the vessels and once the timer reaches 0, the tracking will stop and the vessels that were updated will be POSTed to the server.

## Assumptions

- The table is prepopulated with a list of vessels, assuming it is a short list so no pagination was implemented.

## Docker

- its not working as expected, I am still working on it.
