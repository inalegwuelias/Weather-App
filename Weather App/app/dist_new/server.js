/**
 * Standalone Weather App Server
 * Minimal Express server with mock data (no external dependencies needed)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, 'database.json');

// MIME types for static files
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Initialize database
function initDatabase() {
  try {
    fs.accessSync(DB_PATH);
  } catch {
    fs.writeFileSync(DB_PATH, JSON.stringify({ weatherRecords: [] }, null, 2));
  }
}

function readDatabase() {
  const data = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(data);
}

function writeDatabase(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Mock weather data generators
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
    sys: {
      country: 'US',
      sunrise: Math.floor(Date.now() / 1000) - 21600,
      sunset: Math.floor(Date.now() / 1000) + 21600
    },
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
    city: {
      name: cityName.split(',')[0].trim() || 'Demo City',
      country: 'US',
      coord: { lat: mockLat, lon: mockLon }
    },
    list: forecastList
  };
}

// Parse query string
function parseQuery(queryString) {
  const params = {};
  if (!queryString) return params;
  
  queryString.split('&').forEach(pair => {
    const [key, value] = pair.split('=');
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    }
  });
  return params;
}

// CORS headers
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// API handlers
const apiHandlers = {
  'GET /api/health': (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'OK', mode: 'demo', timestamp: new Date().toISOString() }));
  },
  
  'GET /api/weather/current': (req, res, params) => {
    const { location, lat, lon } = params;
    if (!location && (!lat || !lon)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Location or coordinates required' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(generateMockWeather(location, lat, lon)));
  },
  
  'GET /api/weather/forecast': (req, res, params) => {
    const { location, lat, lon } = params;
    if (!location && (!lat || !lon)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Location or coordinates required' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(generateMockForecast(location, lat, lon)));
  },
  
  'GET /api/geocode': (req, res, params) => {
    const { location } = params;
    if (!location) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Location required' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([{
      name: location.split(',')[0].trim(),
      lat: 40.7128 + (Math.random() - 0.5) * 10,
      lon: -74.0060 + (Math.random() - 0.5) * 10,
      country: 'US',
      state: 'Demo State'
    }]));
  },
  
  'GET /api/reverse-geocode': (req, res, params) => {
    const { lat, lon } = params;
    if (!lat || !lon) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Latitude and longitude required' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([{
      name: 'Demo City',
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      country: 'US',
      state: 'Demo State'
    }]));
  },
  
  'GET /api/weather/records': (req, res) => {
    const db = readDatabase();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(db.weatherRecords));
  },
  
  'POST /api/weather/records': (req, res, params, body) => {
    try {
      const data = JSON.parse(body);
      const { location, startDate, endDate, temperature, weatherData } = data;
      
      if (!location || !startDate || !endDate) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Location, startDate, and endDate are required' }));
        return;
      }
      
      const db = readDatabase();
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
      writeDatabase(db);
      
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newRecord));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to create record' }));
    }
  },
  
  'PUT /api/weather/records': (req, res, params, body, pathParts) => {
    try {
      const id = pathParts[3];
      if (!id) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Record ID required' }));
        return;
      }
      
      const data = JSON.parse(body);
      const db = readDatabase();
      const index = db.weatherRecords.findIndex(r => r.id === id);
      
      if (index === -1) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Record not found' }));
        return;
      }
      
      db.weatherRecords[index] = {
        ...db.weatherRecords[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      writeDatabase(db);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(db.weatherRecords[index]));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to update record' }));
    }
  },
  
  'DELETE /api/weather/records': (req, res, params, body, pathParts) => {
    const id = pathParts[3];
    if (!id) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Record ID required' }));
      return;
    }
    
    const db = readDatabase();
    const index = db.weatherRecords.findIndex(r => r.id === id);
    
    if (index === -1) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Record not found' }));
      return;
    }
    
    db.weatherRecords.splice(index, 1);
    writeDatabase(db);
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Record deleted successfully' }));
  },
  
  'GET /api/export/json': (req, res) => {
    const db = readDatabase();
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename=weather-data.json'
    });
    res.end(JSON.stringify(db.weatherRecords, null, 2));
  },
  
  'GET /api/export/csv': (req, res) => {
    const db = readDatabase();
    if (db.weatherRecords.length === 0) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'No records to export' }));
      return;
    }
    
    const fields = ['id', 'location', 'startDate', 'endDate', 'temperature', 'createdAt', 'updatedAt'];
    let csv = fields.join(',') + '\n';
    db.weatherRecords.forEach(record => {
      const row = fields.map(f => `"${(record[f] || '').toString().replace(/"/g, '""')}"`).join(',');
      csv += row + '\n';
    });
    
    res.writeHead(200, {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=weather-data.csv'
    });
    res.end(csv);
  },
  
  'GET /api/export/xml': (req, res) => {
    const db = readDatabase();
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<weatherRecords>\n';
    db.weatherRecords.forEach(record => {
      xml += '  <record>\n';
      Object.entries(record).forEach(([key, value]) => {
        xml += `    <${key}>${value}</${key}>\n`;
      });
      xml += '  </record>\n';
    });
    xml += '</weatherRecords>';
    
    res.writeHead(200, {
      'Content-Type': 'application/xml',
      'Content-Disposition': 'attachment; filename=weather-data.xml'
    });
    res.end(xml);
  },
  
  'GET /api/export/markdown': (req, res) => {
    const db = readDatabase();
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
    
    res.writeHead(200, {
      'Content-Type': 'text/markdown',
      'Content-Disposition': 'attachment; filename=weather-data.md'
    });
    res.end(md);
  },
  
  'GET /api/location/videos': (req, res, params) => {
    const { location } = params;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      location: location || 'Demo',
      videos: [
        { title: `Exploring ${location || 'Demo City'}`, description: 'A beautiful journey', thumbnail: '', videoId: '1' },
        { title: `${location || 'Demo City'} Travel Guide`, description: 'Best places to visit', thumbnail: '', videoId: '2' }
      ]
    }));
  },
  
  'GET /api/location/map': (req, res, params) => {
    const { location, lat, lon } = params;
    const latitude = lat ? parseFloat(lat) : 40.7128;
    const longitude = lon ? parseFloat(lon) : -74.0060;
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      location: location || 'Demo City',
      coordinates: { lat: latitude, lon: longitude },
      mapUrl: `https://www.google.com/maps?q=${latitude},${longitude}`
    }));
  }
};

// Create server
const server = http.createServer((req, res) => {
  setCorsHeaders(res);
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;
  
  // API routes
  if (pathname.startsWith('/api/')) {
    const pathParts = pathname.split('/').filter(p => p);
    let routeKey = `${req.method} /${pathParts[0]}/${pathParts[1]}`;
    
    // Handle nested routes like /api/weather/records/:id
    if (pathParts[2]) {
      routeKey += `/${pathParts[2]}`;
    }
    
    const handler = apiHandlers[routeKey];
    
    if (handler) {
      if (req.method === 'POST' || req.method === 'PUT') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => handler(req, res, query, body, pathParts));
      } else {
        handler(req, res, query, null, pathParts);
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'API endpoint not found' }));
    }
    return;
  }
  
  // Static files
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(__dirname, filePath);
  
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Serve index.html for client-side routing
        fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
          if (err) {
            res.writeHead(500);
            res.end('Server Error');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
          }
        });
      } else {
        res.writeHead(500);
        res.end('Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

// Start server
initDatabase();
server.listen(PORT, () => {
  console.log(`Weather App Server running on port ${PORT}`);
  console.log(`Mode: DEMO (Mock Data)`);
  console.log(`Database: ${DB_PATH}`);
});
