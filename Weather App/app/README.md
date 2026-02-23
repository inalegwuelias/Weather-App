# Weather App - Technical Assessment

A full-stack weather application built for the Product Manager Accelerator technical assessment. This application demonstrates both frontend and backend engineering capabilities.

## About PM Accelerator

[Product Manager Accelerator](https://www.linkedin.com/company/product-manager-accelerator) is a community dedicated to helping professionals accelerate their product management careers through hands-on experience, mentorship, and real-world projects.

## Features

### Frontend (Tech Assessment #1)

✅ **Location Input**: Users can enter locations via:
- City name (e.g., "London", "New York")
- Zip/Postal code (e.g., "10001")
- GPS coordinates (e.g., "40.7128,-74.0060")
- Landmarks

✅ **Current Weather Display**:
- Temperature (current, feels like, min/max)
- Weather conditions with animated icons
- Humidity, wind speed, visibility
- Sunrise/sunset times
- Pressure and cloud coverage

✅ **5-Day Forecast**: 
- Daily temperature averages
- Weather condition icons
- Responsive grid layout

✅ **Geolocation**: Get weather for user's current location

✅ **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

✅ **Error Handling**: Graceful error messages for:
- Invalid locations
- API failures
- Network issues
- Browser geolocation permission denied

✅ **Weather Icons**: Beautiful Lucide icons representing different weather conditions

### Backend (Tech Assessment #2)

✅ **CRUD Operations**:
- **CREATE**: Save weather records with location, date range, and temperature
- **READ**: View all saved weather records
- **UPDATE**: Edit existing records with validation
- **DELETE**: Remove records from database

✅ **Data Persistence**: JSON-based database for storing weather records

✅ **Data Export**: Export records to multiple formats:
- JSON
- CSV
- XML
- Markdown

✅ **Additional API Integrations**:
- Google Maps links for locations
- YouTube video placeholders for location content

✅ **Input Validation**:
- Date range validation
- Location existence verification
- Temperature validation

## Technology Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Lucide React** - Icons
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **CORS** - Cross-origin requests
- **JSON2CSV** - CSV export functionality
- **File System** - JSON database

### APIs
- **OpenWeatherMap API** - Weather data (free tier)
- **Google Maps** - Location mapping
- **YouTube Data API** - Location videos (placeholder)

## Project Structure

```
weather-app/
├── server/
│   ├── index.js          # Express server with all API routes
│   └── database.json     # JSON database (auto-created)
├── src/
│   ├── components/       # React components
│   ├── services/
│   │   └── api.ts        # API service functions
│   ├── types/
│   │   └── weather.ts    # TypeScript type definitions
│   ├── App.tsx           # Main application component
│   ├── App.css           # Application styles
│   └── main.tsx          # Entry point
├── .env                  # Environment variables
├── package.json
├── vite.config.ts
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd weather-app
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
1. Copy `.env.example` to `.env` (or create a new `.env` file)
2. Get a free API key from [OpenWeatherMap](https://openweathermap.org/api)
3. Add your API key to the `.env` file:
```
WEATHER_API_KEY=your_actual_api_key_here
```

### Step 4: Start the Application

**Option 1: Start both frontend and backend separately**

Terminal 1 - Backend:
```bash
npm run server
```

Terminal 2 - Frontend:
```bash
npm run dev
```

**Option 2: Start both with one command**
```bash
npm start
```

### Step 5: Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

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
| GET | `/api/weather/records/:id` | Get single record |
| PUT | `/api/weather/records/:id` | Update record |
| DELETE | `/api/weather/records/:id` | Delete record |

### Export Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/export/json` | Export as JSON |
| GET | `/api/export/csv` | Export as CSV |
| GET | `/api/export/xml` | Export as XML |
| GET | `/api/export/markdown` | Export as Markdown |

### Additional Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/location/videos` | Get location videos |
| GET | `/api/location/map` | Get map data |
| GET | `/api/health` | Health check |

## Usage Guide

### Getting Weather Information

1. **Search by Location**:
   - Enter a city name, zip code, or coordinates in the search box
   - Click "Search" or press Enter

2. **Use Current Location**:
   - Click "My Location" button
   - Allow browser location permission when prompted

3. **View Current Weather**:
   - See temperature, conditions, humidity, wind, etc.
   - View sunrise/sunset times

4. **View 5-Day Forecast**:
   - Click on the "5-Day Forecast" tab
   - See daily temperature and conditions

### Saving Weather Records

1. Load weather data for a location
2. Select start and end dates
3. Click "Save Record"
4. View saved records in the "Saved Records" tab

### Managing Records

- **Edit**: Click the "Edit" button on any record to modify it
- **Delete**: Click the "Delete" button to remove a record
- **Export**: Use export buttons to download data in various formats

## Responsive Design

The application is fully responsive and works on:
- **Desktop**: Full layout with side-by-side elements
- **Tablet**: Adjusted grid layouts
- **Mobile**: Stacked layout with optimized touch targets

## Error Handling

The application handles various error scenarios:
- Invalid location input
- Network connectivity issues
- API rate limiting
- Browser geolocation permission denied
- Invalid date ranges
- Missing required fields

## Future Enhancements

Potential improvements for production:
- Real database (PostgreSQL/MongoDB)
- User authentication
- Weather alerts and notifications
- Historical weather charts
- Multiple location favorites
- Weather maps integration
- Real YouTube API integration
- Caching layer (Redis)
- Unit and integration tests

## Assessment Completion

This project completes:
- ✅ **Tech Assessment #1** (Frontend) - All requirements met
- ✅ **Tech Assessment #2** (Backend) - All requirements met

## License

MIT License - Created for PM Accelerator Technical Assessment

## Author

Created as part of the Product Manager Accelerator technical assessment process.

---

**Note**: This application uses the free tier of OpenWeatherMap API, which has rate limits. For production use, consider upgrading to a paid plan or implementing caching mechanisms.
