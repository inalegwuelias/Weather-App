/**
 * Weather App - Express Server
 * Backend API with mock data support (no API key required for demo)
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const hasValidApiKey = WEATHER_API_KEY && WEATHER_API_KEY !== 'your_api_key_here';

// Database path
const DB_PATH = path.join(__dirname, 'database.json');

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
}

// Initialize database
async function initDatabase() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify({ weatherRecords: [] }, null, 2));
  }
}

async function readDatabase() {
  const data = await fs.readFile(DB_PATH, 'utf8');
  return JSON.parse(data);
}

async function writeDatabase(data) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

// Mock data generators
function generateMockWeather(location, lat, lon) {
  const cityName = location || 'Demo City';
  const mockLat = lat ? parseFloat(lat) : 40.7128;
  const mockLon = lon ? parseFloat(lon) : -74.0060;
  const baseTemp = 15 + Math.random() * 15;
  
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
    sys: { country: 'US', sunrise: Math.floor(Date.now() / 1000) - 21600, sunset: Math.floor(Date.now() / 1000) + 21600 },
    timezone: -18000,
    name: cityName.split(',')[0].trim() || 'Demo City'
  };
}

function generateMockForecast(location, lat, lon) {
  const cityName = location || 'Demo City';
  const mockLat = lat ? parseFloat(lat) : 40.7128;
  const mockLon = lon ? parseFloat(lon) : -74.0060;
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
    city: { name: cityName.split(',')[0].trim() || 'Demo City', country: 'US', coord: { lat: mockLat, lon: mockLon } },
    list: forecastList
  };
}

// ==================== API ROUTES ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', mode: hasValidApiKey ? 'live' : 'demo', timestamp: new Date().toISOString() });
});

// Get current weather
app.get('/api/weather/current', async (req, res) => {
  try {
    const { location, lat, lon } = req.query;
    if (!location && (!lat || !lon)) {
      return res.status(400).json({ error: 'Location or coordinates required' });
    }

    if (!hasValidApiKey) {
      console.log('Using mock weather data');
      return res.json(generateMockWeather(location, lat, lon));
    }

    // Real API call would go here
    res.json(generateMockWeather(location, lat, lon));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Get 5-day forecast
app.get('/api/weather/forecast', async (req, res) => {
  try {
    const { location, lat, lon } = req.query;
    if (!location && (!lat || !lon)) {
      return res.status(400).json({ error: 'Location or coordinates required' });
    }

    if (!hasValidApiKey) {
      console.log('Using mock forecast data');
      return res.json(generateMockForecast(location, lat, lon));
    }

    res.json(generateMockForecast(location, lat, lon));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch forecast data' });
  }
});

// Geocode location
app.get('/api/geocode', async (req, res) => {
  try {
    const { location } = req.query;
    if (!location) {
      return res.status(400).json({ error: 'Location required' });
    }

    res.json([{
      name: location.split(',')[0].trim(),
      lat: 40.7128 + (Math.random() - 0.5) * 10,
      lon: -74.0060 + (Math.random() - 0.5) * 10,
      country: 'US',
      state: 'Demo State'
    }]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to geocode location' });
  }
});

// Reverse geocode
app.get('/api/reverse-geocode', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    res.json([{
      name: 'Demo City',
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      country: 'US',
      state: 'Demo State'
    }]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reverse geocode' });
  }
});

// ==================== CRUD ROUTES ====================

// Get all records
app.get('/api/weather/records', async (req, res) => {
  try {
    const db = await readDatabase();
    res.json(db.weatherRecords);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read records' });
  }
});

// Create record
app.post('/api/weather/records', async (req, res) => {
  try {
    const { location, startDate, endDate, temperature, weatherData } = req.body;
    
    if (!location || !startDate || !endDate) {
      return res.status(400).json({ error: 'Location, startDate, and endDate are required' });
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
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// Update record
app.put('/api/weather/records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await readDatabase();
    const index = db.weatherRecords.findIndex(r => r.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Record not found' });
    }

    db.weatherRecords[index] = {
      ...db.weatherRecords[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    await writeDatabase(db);
    
    res.json(db.weatherRecords[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update record' });
  }
});

// Delete record
app.delete('/api/weather/records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await readDatabase();
    const index = db.weatherRecords.findIndex(r => r.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Record not found' });
    }

    db.weatherRecords.splice(index, 1);
    await writeDatabase(db);
    
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

// ==================== EXPORT ROUTES ====================

// Export JSON
app.get('/api/export/json', async (req, res) => {
  try {
    const db = await readDatabase();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=weather-data.json');
    res.json(db.weatherRecords);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export JSON' });
  }
});

// Export CSV
app.get('/api/export/csv', async (req, res) => {
  try {
    const db = await readDatabase();
    if (db.weatherRecords.length === 0) {
      return res.status(404).json({ error: 'No records to export' });
    }

    const fields = ['id', 'location', 'startDate', 'endDate', 'temperature', 'createdAt', 'updatedAt'];
    let csv = fields.join(',') + '\n';
    db.weatherRecords.forEach(record => {
      const row = fields.map(f => `"${(record[f] || '').toString().replace(/"/g, '""')}"`).join(',');
      csv += row + '\n';
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=weather-data.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

// Export XML
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
    res.status(500).json({ error: 'Failed to export XML' });
  }
});

// Export Markdown
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
    res.status(500).json({ error: 'Failed to export Markdown' });
  }
});

// Additional APIs
app.get('/api/location/map', async (req, res) => {
  try {
    const { location, lat, lon } = req.query;
    const latitude = lat ? parseFloat(lat) : 40.7128;
    const longitude = lon ? parseFloat(lon) : -74.0060;
    
    res.json({
      location: location || 'Demo City',
      coordinates: { lat: latitude, lon: longitude },
      mapUrl: `https://www.google.com/maps?q=${latitude},${longitude}`
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch map data' });
  }
});

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Start server
await initDatabase();
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Mode: ${hasValidApiKey ? 'LIVE' : 'DEMO (Mock Data)'}`);
});
