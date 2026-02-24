import express from 'express';
import cors from 'cors';
import axios from 'axios';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// OpenWeatherMap API Key - Free tier
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_BASE_URL = 'https://api.openweathermap.org/geo/1.0';

// Check if we have a valid API key
const hasValidApiKey = WEATHER_API_KEY && WEATHER_API_KEY !== 'demo_key' && WEATHER_API_KEY !== 'your_api_key_here';

// Database file path
const DB_PATH = path.join(__dirname, 'database.json');

app.use(cors());
app.use(express.json());

// Serve static files from the dist folder
app.use(express.static(path.join(__dirname, '..')));

// Initialize database if it doesn't exist
async function initDatabase() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify({ weatherRecords: [] }, null, 2));
  }
}

// Read database
async function readDatabase() {
  const data = await fs.readFile(DB_PATH, 'utf8');
  return JSON.parse(data);
}

// Write database
async function writeDatabase(data) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

// ==================== MOCK DATA FOR DEMO MODE ====================

function generateMockWeather(location, lat, lon) {
  const cityName = location || 'Demo City';
  const mockLat = lat || 40.7128;
  const mockLon = lon || -74.0060;
  
  // Generate somewhat realistic but random weather data
  const baseTemp = 15 + Math.random() * 15; // 15-30°C
  const weatherTypes = [
    { id: 800, main: 'Clear', description: 'clear sky', icon: '01d' },
    { id: 802, main: 'Clouds', description: 'scattered clouds', icon: '03d' },
    { id: 500, main: 'Rain', description: 'light rain', icon: '10d' },
    { id: 801, main: 'Clouds', description: 'few clouds', icon: '02d' }
  ];
  const weather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
  
  return {
    coord: { lon: mockLon, lat: mockLat },
    weather: [weather],
    main: {
      temp: Math.round(baseTemp * 10) / 10,
      feels_like: Math.round((baseTemp + Math.random() * 4 - 2) * 10) / 10,
      temp_min: Math.round((baseTemp - 5) * 10) / 10,
      temp_max: Math.round((baseTemp + 5) * 10) / 10,
      pressure: 1000 + Math.floor(Math.random() * 30),
      humidity: 40 + Math.floor(Math.random() * 50)
    },
    visibility: 10000,
    wind: { speed: Math.round(Math.random() * 10 * 10) / 10, deg: Math.floor(Math.random() * 360) },
    clouds: { all: Math.floor(Math.random() * 100) },
    dt: Math.floor(Date.now() / 1000),
    sys: {
      country: 'US',
      sunrise: Math.floor(Date.now() / 1000) - 21600,
      sunset: Math.floor(Date.now() / 1000) + 21600
    },
    timezone: -18000,
    name: cityName.split(',')[0].trim()
  };
}

function generateMockForecast(location, lat, lon) {
  const cityName = location || 'Demo City';
  const mockLat = lat || 40.7128;
  const mockLon = lon || -74.0060;
  
  const forecastList = [];
  const now = Math.floor(Date.now() / 1000);
  
  for (let i = 0; i < 40; i++) {
    const baseTemp = 15 + Math.random() * 15;
    const weatherTypes = [
      { id: 800, main: 'Clear', description: 'clear sky', icon: '01d' },
      { id: 802, main: 'Clouds', description: 'scattered clouds', icon: '03d' },
      { id: 500, main: 'Rain', description: 'light rain', icon: '10d' },
      { id: 801, main: 'Clouds', description: 'few clouds', icon: '02d' }
    ];
    const weather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
    
    forecastList.push({
      dt: now + (i * 3 * 3600),
      main: {
        temp: Math.round(baseTemp * 10) / 10,
        feels_like: Math.round((baseTemp + Math.random() * 4 - 2) * 10) / 10,
        temp_min: Math.round((baseTemp - 3) * 10) / 10,
        temp_max: Math.round((baseTemp + 3) * 10) / 10,
        pressure: 1000 + Math.floor(Math.random() * 30),
        humidity: 40 + Math.floor(Math.random() * 50)
      },
      weather: [weather],
      clouds: { all: Math.floor(Math.random() * 100) },
      wind: { speed: Math.round(Math.random() * 10 * 10) / 10, deg: Math.floor(Math.random() * 360) },
      visibility: 10000,
      pop: Math.random(),
      dt_txt: new Date((now + (i * 3 * 3600)) * 1000).toISOString().slice(0, 19).replace('T', ' ')
    });
  }
  
  return {
    city: {
      name: cityName.split(',')[0].trim(),
      country: 'US',
      coord: { lat: mockLat, lon: mockLon }
    },
    list: forecastList
  };
}

function generateMockGeocode(location) {
  return [{
    name: location.split(',')[0].trim(),
    lat: 40.7128 + (Math.random() - 0.5) * 10,
    lon: -74.0060 + (Math.random() - 0.5) * 10,
    country: 'US',
    state: 'Demo State'
  }];
}

// ==================== WEATHER API ROUTES ====================

// Get current weather by location (city name, zip, coordinates)
app.get('/api/weather/current', async (req, res) => {
  try {
    const { location, lat, lon, units = 'metric' } = req.query;
    
    if (!location && (!lat || !lon)) {
      return res.status(400).json({ error: 'Location or coordinates required' });
    }

    // Use mock data if no valid API key
    if (!hasValidApiKey) {
      console.log('Using mock weather data (no API key configured)');
      return res.json(generateMockWeather(location, lat, lon));
    }

    let url;
    if (lat && lon) {
      url = `${WEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=${units}`;
    } else {
      url = `${WEATHER_BASE_URL}/weather?q=${encodeURIComponent(location)}&appid=${WEATHER_API_KEY}&units=${units}`;
    }

    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error('Weather API Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || 'Failed to fetch weather data'
    });
  }
});

// Get 5-day forecast
app.get('/api/weather/forecast', async (req, res) => {
  try {
    const { location, lat, lon, units = 'metric' } = req.query;
    
    if (!location && (!lat || !lon)) {
      return res.status(400).json({ error: 'Location or coordinates required' });
    }

    // Use mock data if no valid API key
    if (!hasValidApiKey) {
      console.log('Using mock forecast data (no API key configured)');
      return res.json(generateMockForecast(location, lat, lon));
    }

    let url;
    if (lat && lon) {
      url = `${WEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=${units}`;
    } else {
      url = `${WEATHER_BASE_URL}/forecast?q=${encodeURIComponent(location)}&appid=${WEATHER_API_KEY}&units=${units}`;
    }

    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error('Forecast API Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || 'Failed to fetch forecast data'
    });
  }
});

// Geocode location (get coordinates from location name)
app.get('/api/geocode', async (req, res) => {
  try {
    const { location } = req.query;
    if (!location) {
      return res.status(400).json({ error: 'Location required' });
    }

    // Use mock data if no valid API key
    if (!hasValidApiKey) {
      console.log('Using mock geocode data (no API key configured)');
      return res.json(generateMockGeocode(location));
    }

    const url = `${GEO_BASE_URL}/direct?q=${encodeURIComponent(location)}&limit=5&appid=${WEATHER_API_KEY}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error('Geocode API Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || 'Failed to geocode location'
    });
  }
});

// Reverse geocode (get location name from coordinates)
app.get('/api/reverse-geocode', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    // Use mock data if no valid API key
    if (!hasValidApiKey) {
      console.log('Using mock reverse geocode data (no API key configured)');
      return res.json([{
        name: 'Demo City',
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        country: 'US',
        state: 'Demo State'
      }]);
    }

    const url = `${GEO_BASE_URL}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${WEATHER_API_KEY}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error('Reverse Geocode API Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || 'Failed to reverse geocode'
    });
  }
});

// ==================== CRUD ROUTES ====================

// CREATE - Store weather record
app.post('/api/weather/records', async (req, res) => {
  try {
    const { location, startDate, endDate, temperature, weatherData } = req.body;
    
    // Validation
    if (!location || !startDate || !endDate) {
      return res.status(400).json({ error: 'Location, startDate, and endDate are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    if (start > end) {
      return res.status(400).json({ error: 'Start date must be before end date' });
    }

    const db = await readDatabase();
    const newRecord = {
      id: Date.now().toString(),
      location,
      startDate,
      endDate,
      temperature: temperature || null,
      weatherData: weatherData || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.weatherRecords.push(newRecord);
    await writeDatabase(db);
    
    res.status(201).json(newRecord);
  } catch (error) {
    console.error('Create Record Error:', error.message);
    res.status(500).json({ error: 'Failed to create weather record' });
  }
});

// READ - Get all weather records
app.get('/api/weather/records', async (req, res) => {
  try {
    const db = await readDatabase();
    res.json(db.weatherRecords);
  } catch (error) {
    console.error('Read Records Error:', error.message);
    res.status(500).json({ error: 'Failed to read weather records' });
  }
});

// READ - Get single weather record
app.get('/api/weather/records/:id', async (req, res) => {
  try {
    const db = await readDatabase();
    const record = db.weatherRecords.find(r => r.id === req.params.id);
    
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    res.json(record);
  } catch (error) {
    console.error('Read Record Error:', error.message);
    res.status(500).json({ error: 'Failed to read weather record' });
  }
});

// UPDATE - Update weather record
app.put('/api/weather/records/:id', async (req, res) => {
  try {
    const { location, startDate, endDate, temperature, weatherData } = req.body;
    const db = await readDatabase();
    const recordIndex = db.weatherRecords.findIndex(r => r.id === req.params.id);
    
    if (recordIndex === -1) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Validate dates if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
      }

      if (start > end) {
        return res.status(400).json({ error: 'Start date must be before end date' });
      }
    }

    db.weatherRecords[recordIndex] = {
      ...db.weatherRecords[recordIndex],
      location: location || db.weatherRecords[recordIndex].location,
      startDate: startDate || db.weatherRecords[recordIndex].startDate,
      endDate: endDate || db.weatherRecords[recordIndex].endDate,
      temperature: temperature !== undefined ? temperature : db.weatherRecords[recordIndex].temperature,
      weatherData: weatherData || db.weatherRecords[recordIndex].weatherData,
      updatedAt: new Date().toISOString()
    };

    await writeDatabase(db);
    res.json(db.weatherRecords[recordIndex]);
  } catch (error) {
    console.error('Update Record Error:', error.message);
    res.status(500).json({ error: 'Failed to update weather record' });
  }
});

// DELETE - Delete weather record
app.delete('/api/weather/records/:id', async (req, res) => {
  try {
    const db = await readDatabase();
    const recordIndex = db.weatherRecords.findIndex(r => r.id === req.params.id);
    
    if (recordIndex === -1) {
      return res.status(404).json({ error: 'Record not found' });
    }

    db.weatherRecords.splice(recordIndex, 1);
    await writeDatabase(db);
    
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Delete Record Error:', error.message);
    res.status(500).json({ error: 'Failed to delete weather record' });
  }
});

// ==================== EXPORT ROUTES ====================

// Export to JSON
app.get('/api/export/json', async (req, res) => {
  try {
    const db = await readDatabase();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=weather-data.json');
    res.json(db.weatherRecords);
  } catch (error) {
    console.error('Export JSON Error:', error.message);
    res.status(500).json({ error: 'Failed to export JSON' });
  }
});

// Export to CSV
app.get('/api/export/csv', async (req, res) => {
  try {
    const db = await readDatabase();
    if (db.weatherRecords.length === 0) {
      return res.status(404).json({ error: 'No records to export' });
    }

    const fields = ['id', 'location', 'startDate', 'endDate', 'temperature', 'createdAt', 'updatedAt'];
    
    // Simple CSV generation
    const escapeCsv = (value) => {
      const str = String(value ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };
    
    let csv = fields.join(',') + '\n';
    db.weatherRecords.forEach(record => {
      const row = fields.map(field => escapeCsv(record[field])).join(',');
      csv += row + '\n';
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=weather-data.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export CSV Error:', error.message);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

// Export to XML
app.get('/api/export/xml', async (req, res) => {
  try {
    const db = await readDatabase();
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<weatherRecords>\n';
    
    db.weatherRecords.forEach(record => {
      xml += '  <record>\n';
      Object.entries(record).forEach(([key, value]) => {
        xml += `    <${key}>${value}</${key}>\n`;
      });
      xml += '  </record>\n';
    });
    
    xml += '</weatherRecords>';
    
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', 'attachment; filename=weather-data.xml');
    res.send(xml);
  } catch (error) {
    console.error('Export XML Error:', error.message);
    res.status(500).json({ error: 'Failed to export XML' });
  }
});

// Export to Markdown
app.get('/api/export/markdown', async (req, res) => {
  try {
    const db = await readDatabase();
    let md = '# Weather Data Records\n\n';
    
    db.weatherRecords.forEach((record, index) => {
      md += `## Record ${index + 1}\n\n`;
      md += `- **ID:** ${record.id}\n`;
      md += `- **Location:** ${record.location}\n`;
      md += `- **Date Range:** ${record.startDate} to ${record.endDate}\n`;
      md += `- **Temperature:** ${record.temperature || 'N/A'}\n`;
      md += `- **Created:** ${record.createdAt}\n`;
      md += `- **Updated:** ${record.updatedAt}\n\n`;
    });
    
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', 'attachment; filename=weather-data.md');
    res.send(md);
  } catch (error) {
    console.error('Export Markdown Error:', error.message);
    res.status(500).json({ error: 'Failed to export Markdown' });
  }
});

// ==================== ADDITIONAL API INTEGRATIONS ====================

// Get YouTube videos for location (using mock data since YouTube API requires key)
app.get('/api/location/videos', async (req, res) => {
  try {
    const { location } = req.query;
    if (!location) {
      return res.status(400).json({ error: 'Location required' });
    }

    // Mock response - in production, integrate with YouTube Data API
    const mockVideos = [
      {
        title: `Exploring ${location}`,
        description: `A beautiful journey through ${location}`,
        thumbnail: 'https://via.placeholder.com/320x180',
        videoId: 'mock-video-1'
      },
      {
        title: `${location} Travel Guide`,
        description: `Best places to visit in ${location}`,
        thumbnail: 'https://via.placeholder.com/320x180',
        videoId: 'mock-video-2'
      }
    ];

    res.json({ location, videos: mockVideos });
  } catch (error) {
    console.error('Videos API Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Get map data for location
app.get('/api/location/map', async (req, res) => {
  try {
    const { location, lat, lon } = req.query;
    
    // Return coordinates for frontend map integration
    if (lat && lon) {
      res.json({
        location: location || 'Unknown',
        coordinates: { lat: parseFloat(lat), lon: parseFloat(lon) },
        mapUrl: `https://www.google.com/maps?q=${lat},${lon}`
      });
    } else if (location) {
      // Geocode first
      const geoUrl = `${GEO_BASE_URL}/direct?q=${encodeURIComponent(location)}&limit=1&appid=${WEATHER_API_KEY}`;
      const geoResponse = await axios.get(geoUrl);
      
      if (geoResponse.data.length === 0) {
        return res.status(404).json({ error: 'Location not found' });
      }
      
      const { lat, lon, name } = geoResponse.data[0];
      res.json({
        location: name,
        coordinates: { lat, lon },
        mapUrl: `https://www.google.com/maps?q=${lat},${lon}`
      });
    } else {
      res.status(400).json({ error: 'Location or coordinates required' });
    }
  } catch (error) {
    console.error('Map API Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch map data' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    apiMode: hasValidApiKey ? 'live' : 'demo'
  });
});

// Catch-all route to serve the React app
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Initialize and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Database initialized at ${DB_PATH}`);
    console.log(`API Mode: ${hasValidApiKey ? 'LIVE (OpenWeatherMap)' : 'DEMO (Mock Data)'}`);
  });
});
