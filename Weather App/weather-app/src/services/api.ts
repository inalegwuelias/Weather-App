import axios from 'axios';
import type { WeatherData, ForecastData, WeatherRecord, MapData } from '@/types/weather';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Weather API
export const getCurrentWeather = async (location?: string, lat?: number, lon?: number): Promise<WeatherData> => {
  const params: Record<string, string | number> = {};
  if (location) params.location = location;
  if (lat !== undefined) params.lat = lat;
  if (lon !== undefined) params.lon = lon;
  
  const response = await api.get('/weather/current', { params });
  return response.data;
};

export const getForecast = async (location?: string, lat?: number, lon?: number): Promise<ForecastData> => {
  const params: Record<string, string | number> = {};
  if (location) params.location = location;
  if (lat !== undefined) params.lat = lat;
  if (lon !== undefined) params.lon = lon;
  
  const response = await api.get('/weather/forecast', { params });
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

export const updateWeatherRecord = async (id: string, record: Partial<WeatherRecord>): Promise<WeatherRecord> => {
  const response = await api.put(`/weather/records/${id}`, record);
  return response.data;
};

export const deleteWeatherRecord = async (id: string): Promise<void> => {
  await api.delete(`/weather/records/${id}`);
};

// Export Operations
export const exportToJSON = (): string => `${API_BASE_URL}/export/json`;
export const exportToCSV = (): string => `${API_BASE_URL}/export/csv`;
export const exportToXML = (): string => `${API_BASE_URL}/export/xml`;
export const exportToMarkdown = (): string => `${API_BASE_URL}/export/markdown`;

// Additional APIs
export const getMapData = async (location?: string, lat?: number, lon?: number): Promise<MapData> => {
  const params: Record<string, string | number> = {};
  if (location) params.location = location;
  if (lat !== undefined) params.lat = lat;
  if (lon !== undefined) params.lon = lon;
  
  const response = await api.get('/location/map', { params });
  return response.data;
};

export default api;
