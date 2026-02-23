import axios from 'axios';
import type { WeatherData, ForecastData, GeocodeResult, WeatherRecord, LocationVideo, MapData } from '@/types/weather';

// Use relative URL since the Express server serves both frontend and backend
const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Weather API
export const getCurrentWeather = async (location?: string, lat?: number, lon?: number, units = 'metric'): Promise<WeatherData> => {
  const params: Record<string, string | number> = { units };
  if (location) params.location = location;
  if (lat !== undefined) params.lat = lat;
  if (lon !== undefined) params.lon = lon;
  
  const response = await api.get('/weather/current', { params });
  return response.data;
};

export const getForecast = async (location?: string, lat?: number, lon?: number, units = 'metric'): Promise<ForecastData> => {
  const params: Record<string, string | number> = { units };
  if (location) params.location = location;
  if (lat !== undefined) params.lat = lat;
  if (lon !== undefined) params.lon = lon;
  
  const response = await api.get('/weather/forecast', { params });
  return response.data;
};

export const geocodeLocation = async (location: string): Promise<GeocodeResult[]> => {
  const response = await api.get('/geocode', { params: { location } });
  return response.data;
};

export const reverseGeocode = async (lat: number, lon: number): Promise<GeocodeResult[]> => {
  const response = await api.get('/reverse-geocode', { params: { lat, lon } });
  return response.data;
};

// CRUD Operations
export const createWeatherRecord = async (record: Omit<WeatherRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<WeatherRecord> => {
  const response = await api.post('/weather/records', record);
  return response.data;
};

export const getWeatherRecords = async (): Promise<WeatherRecord[]> => {
  const response = await api.get('/weather/records');
  return response.data;
};

export const getWeatherRecord = async (id: string): Promise<WeatherRecord> => {
  const response = await api.get(`/weather/records/${id}`);
  return response.data;
};

export const updateWeatherRecord = async (id: string, record: Partial<WeatherRecord>): Promise<WeatherRecord> => {
  const response = await api.put(`/weather/records/${id}`, record);
  return response.data;
};

export const deleteWeatherRecord = async (id: string): Promise<void> => {
  await api.delete(`/weather/records/${id}`);
};

// Export Operations
export const exportToJSON = (): string => `/api/export/json`;
export const exportToCSV = (): string => `/api/export/csv`;
export const exportToXML = (): string => `/api/export/xml`;
export const exportToMarkdown = (): string => `/api/export/markdown`;

// Additional APIs
export const getLocationVideos = async (location: string): Promise<{ location: string; videos: LocationVideo[] }> => {
  const response = await api.get('/location/videos', { params: { location } });
  return response.data;
};

export const getMapData = async (location?: string, lat?: number, lon?: number): Promise<MapData> => {
  const params: Record<string, string | number> = {};
  if (location) params.location = location;
  if (lat !== undefined) params.lat = lat;
  if (lon !== undefined) params.lon = lon;
  
  const response = await api.get('/location/map', { params });
  return response.data;
};

export default api;
