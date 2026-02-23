# Weather App - PM Accelerator Technical Assessment

A full-stack weather application built for the Product Manager Accelerator technical assessment. This project demonstrates both frontend and backend engineering capabilities with a modern React + TypeScript frontend and Express.js backend.

## About PM Accelerator

[Product Manager Accelerator](https://www.linkedin.com/company/product-manager-accelerator) is a community dedicated to helping professionals accelerate their product management careers through hands-on experience, mentorship, and real-world projects.

---

## Features

### ✅ Tech Assessment #1 (Frontend)

| Feature | Status |
|---------|--------|
| Location Input (city, zip, coordinates) | ✅ Complete |
| Current Weather Display | ✅ Complete |
| 5-Day Forecast | ✅ Complete |
| Geolocation Support | ✅ Complete |
| Responsive Design (Mobile/Tablet/Desktop) | ✅ Complete |
| Error Handling | ✅ Complete |
| Weather Icons | ✅ Complete |

### ✅ Tech Assessment #2 (Backend)

| Feature | Status |
|---------|--------|
| CRUD Operations (Create, Read, Update, Delete) | ✅ Complete |
| Data Persistence (JSON Database) | ✅ Complete |
| Export to JSON | ✅ Complete |
| Export to CSV | ✅ Complete |
| Export to XML | ✅ Complete |
| Export to Markdown | ✅ Complete |
| Google Maps Integration | ✅ Complete |
| Input Validation | ✅ Complete |

---

## Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **CORS** - Cross-origin requests
- **File System** - JSON database

### APIs
- **OpenWeatherMap API** - Weather data (optional, demo mode available)
- **Google Maps** - Location mapping

---

## Project Structure

```
weather-app/
├── server/
│   ├── index.js          # Express server with all API routes
│   └── database.json     # JSON database (auto-created)
├── src/
│   ├── services/
│   │   └── api.ts        # API service functions
│   ├── types/
│   │   └── weather.ts    # TypeScript type definitions
│   ├── App.tsx           # Main React component
│   ├── main.tsx          # React entry point
│   └── index.css         # Global styles
├── index.html            # HTML template
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript config
├── vite.config.ts        # Vite config
├── tailwind.config.js    # Tailwind CSS config
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

---

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Step 1: Clone the Repository

```bash
git clone <your-github-repo-url>
cd weather-app
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables (Optional)

The app works in **demo mode** without an API key. To use real weather data:

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Get a free API key from [OpenWeatherMap](https://openweathermap.org/api)

3. Add your API key to the `.env` file:
   ```
   WEATHER_API_KEY=your_actual_api_key_here
   ```

### Step 4: Start the Application

**Development Mode (Recommended for development):**

```bash
# This starts both the backend server and frontend dev server
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

**Production Mode:**

```bash
# Build the frontend
npm run build

# Start the production server
npm start
```

---

## Usage Guide

### Getting Weather Information

1. **Search by Location:**
   - Enter a city name (e.g., "London", "New York", "Tokyo")
   - Click "Search" or press Enter

2. **Use Current Location:**
   - Click "My Location" button
   - Allow browser location permission when prompted

3. **View Current Weather:**
   - See temperature, conditions, humidity, wind, visibility
   - View sunrise/sunset times

4. **View 5-Day Forecast:**
   - Click on the "5-Day Forecast" tab
   - See daily temperature and conditions

### Saving Weather Records

1. Load weather data for a location
2. Select start and end dates
3. Click "Save Record"
4. View saved records in the "Saved Records" tab

### Managing Records

- **Edit:** Click the "Edit" button on any record to modify it
- **Delete:** Click the "Delete" button to remove a record
- **Export:** Use export buttons to download data in various formats

---

## API Endpoints

### Weather Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/weather/current` | Get current weather |
| GET | `/api/weather/forecast` | Get 5-day forecast |
| GET | `/api/geocode` | Geocode location name |
| GET | `/api/reverse-geocode` | Reverse geocode coordinates |

### CRUD Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/weather/records` | Create weather record |
| GET | `/api/weather/records` | Get all records |
| PUT | `/api/weather/records/:id` | Update record |
| DELETE | `/api/weather/records/:id` | Delete record |

### Export Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/export/json` | Export as JSON |
| GET | `/api/export/csv` | Export as CSV |
| GET | `/api/export/xml` | Export as XML |
| GET | `/api/export/markdown` | Export as Markdown |

---

## Responsive Design

The application is fully responsive and works on:
- **Desktop:** Full layout with side-by-side elements
- **Tablet:** Adjusted grid layouts
- **Mobile:** Stacked layout with optimized touch targets

---

## Demo Mode

The app includes a **demo mode** that generates realistic mock weather data when no API key is configured. This allows the app to work immediately without any external API setup.

To switch to live mode:
1. Get an OpenWeatherMap API key
2. Add it to your `.env` file
3. Restart the server

---

## Assessment Completion

| Assessment | Status |
|------------|--------|
| Tech Assessment #1 (Frontend) | ✅ Complete |
| Tech Assessment #2 (Backend) | ✅ Complete |

---

## License

MIT License - Created for PM Accelerator Technical Assessment

---

## Author

Created as part of the Product Manager Accelerator technical assessment process.

---

## Support

For questions or issues, please refer to the PM Accelerator LinkedIn page or contact the assessment team.
