import { useState, useEffect, useCallback, useRef } from 'react';
import useSWR from 'swr';
import Layout from './components/Layout/Layout'
import { Vessel } from '../../shared/types';

const WS_URL = import.meta.env.VITE_WS_URL!
const INITIAL_TIMER = 120000; // 5 seconds for testing (should be 120000 for 2 minutes)
const ADDITIONAL_TIMER = 60000; // 3 seconds for testing (should be 60000 for 1 minute)

function App() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [, setUpdatedVessels] = useState<number[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const isAdditionalTimerActive = useRef(false);

  // @ts-expect-error - Ignore TS error for fetcher function
  const fetcher = (...args: unknown[]) => fetch(...args).then((res) => res.json());

  const { data: initialVessels, error, isValidating } = useSWR(`${import.meta.env.VITE_BASE_URL!}/fetch-vessels`, fetcher);

  useEffect(() => {
    if (initialVessels) {
      setVessels(initialVessels);
    }
  }, [initialVessels]);

  const sendTrackingRequest = useCallback(async (vessels: number[]) => {
    if (vessels.length === 0) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL!}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vessels)
      });

      if (!response.ok) throw new Error('Failed to send tracking request');

      console.log('Tracking request sent successfully');
    } catch (error) {
      console.error('Error sending tracking request:', error);
    }
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTimeLeft(INITIAL_TIMER);
    isAdditionalTimerActive.current = false;
    setUpdatedVessels([]);

    timerRef.current = setTimeout(() => {
      setUpdatedVessels(currentUpdatedVessels => {
        if (currentUpdatedVessels.length === 0) {
          // No updates received, wait for an additional time
          setTimeLeft(ADDITIONAL_TIMER);
          isAdditionalTimerActive.current = true;
          timerRef.current = setTimeout(() => {
            setUpdatedVessels(finalUpdatedVessels => {
              sendTrackingRequest(finalUpdatedVessels);
              return [];
            });
            wsRef.current?.close();
            setIsTracking(false);
          }, ADDITIONAL_TIMER);
        } else {
          sendTrackingRequest(currentUpdatedVessels);
          wsRef.current?.close();
          setIsTracking(false);
        }
        return currentUpdatedVessels;
      });
    }, INITIAL_TIMER);
  }, [sendTrackingRequest]);

  // Handle WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      wsRef.current = new WebSocket(WS_URL);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
      };

      wsRef.current.onmessage = (event) => {
        const updatedVessel: Vessel = JSON.parse(event.data);
        console.log("Received update for vessel:", updatedVessel.imo);
        setVessels(prevVessels =>
          prevVessels.map(vessel =>
            vessel.imo === updatedVessel.imo ? { ...vessel, ...updatedVessel } : vessel
          )
        );
        setUpdatedVessels(prev => {
          if (prev.includes(updatedVessel.imo)) {
            return prev;
          } else {
            return [...prev, updatedVessel.imo];
          }
        });

        // If we're in the additional timer period and this is the first update,
        // send tracking request immediately
        if (isAdditionalTimerActive.current) {
          if (timerRef.current) clearTimeout(timerRef.current);
          sendTrackingRequest([updatedVessel.imo]);
          wsRef.current?.close();
          setIsTracking(false);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected.');
        if (isTracking) {
          setTimeout(connectWebSocket, 3000);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        wsRef.current?.close();
      };
    };

    if (isTracking) {
      connectWebSocket();
    } else {
      wsRef.current?.close();
    }

    return () => {
      wsRef.current?.close();
    };
  }, [isTracking, sendTrackingRequest]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timeLeft !== null && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => (prevTime !== null ? prevTime - 1000 : null));
      }, 1000);
    } else if (timeLeft === 0) {
      setTimeLeft(null);
    }
    return () => clearInterval(interval);
  }, [timeLeft]);

  const startTracking = useCallback(() => {
    setIsTracking(true);
    startTimer();
  }, [startTimer]);

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold leading-6 text-gray-900">Vessels</h1>
            <p className="mt-2 text-sm text-gray-700">
              Click 'Start tracking' to begin receiving live updates for all vessels.
            </p>
            {/* <p>Currently tracking: {updatedVessels.join(', ')}</p> */}
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 flex space-x-2">
            {timeLeft !== null && (
              <div className="mt-4 text-sm text-gray-500">
                Next update in: {Math.floor(timeLeft / 1000)} seconds
              </div>
            )}
            <button
              type="button"
              onClick={startTracking}
              disabled={isTracking}
              className={`block rounded-md px-3 py-2 text-center text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${isTracking
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-500 focus-visible:outline-red-600'
                }`}
            >
              {isTracking ? 'Tracking...' : 'Start tracking'}
            </button>
          </div>
        </div>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Name
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        IMO
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Lat
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Lng
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Destination
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {error && <tr><td colSpan={5} className="px-4 py-4 text-sm text-red-600">{error.message}</td></tr>}
                    {isValidating && <tr><td colSpan={5} className="px-4 py-4 text-sm text-gray-500">Loading...</td></tr>}
                    {vessels.map((vessel: Vessel) => (
                      <tr key={vessel.imo}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {vessel.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{vessel.imo}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{vessel.lat}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{vessel.lng}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{vessel.destination}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default App
