import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8084',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fetch congestion data by PNR
export const getCongestionByPnr = async (pnr) => {
  const response = await API.get(`/pnr/${pnr}`);
  return response.data;
};

// Fetch all stations
export const getStations = async () => {
  const response = await API.get('/stations');
  return response.data;
};

// Fetch all trains
export const getTrains = async () => {
  const response = await API.get('/trains');
  return response.data;
};

// Fetch congestion by station and date
export const getCongestionByStationAndDate = async (stationId, date) => {
  const response = await API.get('/api/congestion', {
    params: { stationId, date },
  });
  return response.data;
};

export default API;
