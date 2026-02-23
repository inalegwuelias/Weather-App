import { useState, useEffect } from 'react';
import { 
  getCurrentWeather, 
  getForecast, 
  createWeatherRecord, 
  getWeatherRecords, 
  updateWeatherRecord, 
  deleteWeatherRecord,
  exportToJSON,
  exportToCSV,
  exportToXML,
  exportToMarkdown,
} from './services/api';
import type { WeatherData, ForecastData, WeatherRecord } from './types/weather';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Thermometer, 
  Wind, 
  Droplets, 
  Eye, 
  Sunrise, 
  Sunset,
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Download,
  Save,
  Trash2,
  Edit2,
  Map,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

// UI Components
const Button = ({ children, onClick, disabled, variant = 'primary', className = '' }: any) => {
  const baseClass = "px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
    danger: "bg-red-500 text-white hover:bg-red-600"
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseClass} ${variants[variant as keyof typeof variants]} ${className}`}>
      {children}
    </button>
  );
};

const Input = ({ type = 'text', value, onChange, placeholder, className = '' }: any) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
  />
);

const Card = ({ children, className = '' }: any) => (
  <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }: any) => (
  <div className={`px-6 py-4 border-b border-gray-100 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = '' }: any) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children }: any) => (
  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
    {children}
  </span>
);

const Alert = ({ children, type = 'error' }: any) => {
  const colors = {
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800'
  };
  return (
    <div className={`p-4 rounded-lg border ${colors[type as keyof typeof colors]} mb-4 flex items-center gap-2`}>
      {type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
      {children}
    </div>
  );
};

function App() {
  // State
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [records, setRecords] = useState<WeatherRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'current' | 'forecast' | 'records'>('current');
  
  // Form state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editingRecord, setEditingRecord] = useState<WeatherRecord | null>(null);

  // Load records on mount
  useEffect(() => {
    loadRecords();
  }, []);

  // Clear messages
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const loadRecords = async () => {
    try {
      const data = await getWeatherRecords();
      setRecords(data);
    } catch (err) {
      console.error('Failed to load records:', err);
    }
  };

  const handleSearch = async () => {
    if (!location.trim()) {
      setError('Please enter a location');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [currentWeather, forecastData] = await Promise.all([
        getCurrentWeather(location),
        getForecast(location)
      ]);
      setWeather(currentWeather);
      setForecast(forecastData);
      setSuccess('Weather data loaded successfully!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const [currentWeather, forecastData] = await Promise.all([
            getCurrentWeather(undefined, latitude, longitude),
            getForecast(undefined, latitude, longitude)
          ]);
          setWeather(currentWeather);
          setLocation(currentWeather.name);
          setForecast(forecastData);
          setSuccess('Weather data for your location loaded!');
        } catch (err: any) {
          setError(err.response?.data?.error || 'Failed to fetch weather data');
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
        setError('Unable to retrieve your location. Check browser permissions.');
      }
    );
  };

  const handleSaveRecord = async () => {
    if (!weather || !startDate || !endDate) {
      setError('Please load weather data and select date range');
      return;
    }

    try {
      await createWeatherRecord({
        location: weather.name,
        startDate,
        endDate,
        temperature: weather.main.temp,
        weatherData: weather
      });
      setSuccess('Weather record saved successfully!');
      setStartDate('');
      setEndDate('');
      loadRecords();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save record');
    }
  };

  const handleUpdateRecord = async () => {
    if (!editingRecord) return;

    try {
      await updateWeatherRecord(editingRecord.id, {
        location: editingRecord.location,
        startDate: editingRecord.startDate,
        endDate: editingRecord.endDate,
        temperature: editingRecord.temperature
      });
      setSuccess('Record updated successfully!');
      setEditingRecord(null);
      loadRecords();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update record');
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      await deleteWeatherRecord(id);
      setSuccess('Record deleted successfully!');
      loadRecords();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete record');
    }
  };

  const getWeatherIcon = (iconCode: string, size: 'lg' | 'sm' = 'lg') => {
    const sizeClass = size === 'lg' ? 'w-20 h-20' : 'w-10 h-10';
    const iconMap: Record<string, React.ReactNode> = {
      '01d': <Sun className={`${sizeClass} text-yellow-500 animate-float`} />,
      '01n': <Sun className={`${sizeClass} text-gray-400`} />,
      '02d': <Cloud className={`${sizeClass} text-gray-500`} />,
      '02n': <Cloud className={`${sizeClass} text-gray-600`} />,
      '03d': <Cloud className={`${sizeClass} text-gray-400`} />,
      '03n': <Cloud className={`${sizeClass} text-gray-500`} />,
      '04d': <Cloud className={`${sizeClass} text-gray-600`} />,
      '04n': <Cloud className={`${sizeClass} text-gray-700`} />,
      '09d': <CloudRain className={`${sizeClass} text-blue-500`} />,
      '09n': <CloudRain className={`${sizeClass} text-blue-600`} />,
      '10d': <CloudRain className={`${sizeClass} text-blue-400`} />,
      '10n': <CloudRain className={`${sizeClass} text-blue-500`} />,
      '11d': <CloudLightning className={`${sizeClass} text-purple-500`} />,
      '11n': <CloudLightning className={`${sizeClass} text-purple-600`} />,
      '13d': <CloudSnow className={`${sizeClass} text-blue-300`} />,
      '13n': <CloudSnow className={`${sizeClass} text-blue-400`} />,
      '50d': <CloudFog className={`${sizeClass} text-gray-400`} />,
      '50n': <CloudFog className={`${sizeClass} text-gray-500`} />,
    };
    return iconMap[iconCode] || <Cloud className={`${sizeClass} text-gray-500`} />;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric'
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getDailyForecast = () => {
    if (!forecast) return [];
    
    const daily: Record<string, typeof forecast.list> = {};
    forecast.list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!daily[date]) daily[date] = [];
      daily[date].push(item);
    });
    
    return Object.entries(daily).slice(0, 5).map(([date, items]) => {
      const avgTemp = items.reduce((sum, item) => sum + item.main.temp, 0) / items.length;
      const mainWeather = items[Math.floor(items.length / 2)].weather[0];
      return { date, temp: Math.round(avgTemp), weather: mainWeather };
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            🌤️ Weather App
          </h1>
          <p className="text-gray-600">
            Technical Assessment for PM Accelerator
          </p>
          <a 
            href="https://www.linkedin.com/company/product-manager-accelerator" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm"
          >
            Learn more about PM Accelerator →
          </a>
        </div>

        {/* Alerts */}
        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        {/* Search Section */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Enter city, zip code, or coordinates..."
                  value={location}
                  onChange={(e: any) => setLocation(e.target.value)}
                  onKeyPress={(e: any) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSearch} disabled={loading}>
                  {loading ? 'Loading...' : 'Search'}
                </Button>
                <Button onClick={handleGetCurrentLocation} variant="outline" disabled={loading}>
                  <MapPin className="w-4 h-4 mr-2" />
                  My Location
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['current', 'forecast', 'records'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-medium capitalize transition-all ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab === 'current' ? 'Current Weather' : tab === 'forecast' ? '5-Day Forecast' : 'Saved Records'}
            </button>
          ))}
        </div>

        {/* Current Weather Tab */}
        {activeTab === 'current' && (
          <div className="space-y-6">
            {weather ? (
              <>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold">{weather.name}, {weather.sys.country}</h2>
                      <Badge>{formatDate(weather.dt)}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row items-center justify-between">
                      <div className="flex items-center gap-6">
                        {getWeatherIcon(weather.weather[0].icon)}
                        <div>
                          <div className="text-6xl font-bold">{Math.round(weather.main.temp)}°C</div>
                          <div className="text-gray-600 capitalize text-lg">{weather.weather[0].description}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6 mt-6 md:mt-0">
                        <div className="flex items-center gap-3">
                          <Thermometer className="w-6 h-6 text-orange-500" />
                          <div>
                            <div className="text-sm text-gray-500">Feels Like</div>
                            <div className="font-semibold text-lg">{Math.round(weather.main.feels_like)}°C</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Droplets className="w-6 h-6 text-blue-500" />
                          <div>
                            <div className="text-sm text-gray-500">Humidity</div>
                            <div className="font-semibold text-lg">{weather.main.humidity}%</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Wind className="w-6 h-6 text-gray-500" />
                          <div>
                            <div className="text-sm text-gray-500">Wind Speed</div>
                            <div className="font-semibold text-lg">{weather.wind.speed} m/s</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Eye className="w-6 h-6 text-purple-500" />
                          <div>
                            <div className="text-sm text-gray-500">Visibility</div>
                            <div className="font-semibold text-lg">{(weather.visibility / 1000).toFixed(1)} km</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t mt-6 pt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <Sunrise className="w-5 h-5 text-orange-400" />
                        <div>
                          <div className="text-sm text-gray-500">Sunrise</div>
                          <div className="font-semibold">{formatTime(weather.sys.sunrise)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sunset className="w-5 h-5 text-orange-600" />
                        <div>
                          <div className="text-sm text-gray-500">Sunset</div>
                          <div className="font-semibold">{formatTime(weather.sys.sunset)}</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Min Temp</div>
                        <div className="font-semibold">{Math.round(weather.main.temp_min)}°C</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Max Temp</div>
                        <div className="font-semibold">{Math.round(weather.main.temp_max)}°C</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Save Record Form */}
                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-bold">Save Weather Record</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <label className="text-sm text-gray-500 mb-1 block">Start Date</label>
                        <Input type="date" value={startDate} onChange={(e: any) => setStartDate(e.target.value)} />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm text-gray-500 mb-1 block">End Date</label>
                        <Input type="date" value={endDate} onChange={(e: any) => setEndDate(e.target.value)} />
                      </div>
                      <div className="flex items-end">
                        <Button onClick={handleSaveRecord}>
                          <Save className="w-4 h-4 mr-2" />
                          Save Record
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Map Link */}
                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Map className="w-5 h-5" />
                      Location Map
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <a 
                      href={`https://www.google.com/maps?q=${weather.coord.lat},${weather.coord.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View {weather.name} on Google Maps →
                    </a>
                    <p className="text-gray-500 text-sm mt-1">
                      Coordinates: {weather.coord.lat.toFixed(4)}, {weather.coord.lon.toFixed(4)}
                    </p>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-16">
                  <Cloud className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Search for a location to see current weather</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Forecast Tab */}
        {activeTab === 'forecast' && (
          <div>
            {forecast ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {getDailyForecast().map((day, index) => (
                  <Card key={index}>
                    <CardContent className="text-center py-6">
                      <div className="text-sm text-gray-500 mb-3">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex justify-center my-4">
                        {getWeatherIcon(day.weather.icon, 'sm')}
                      </div>
                      <div className="text-3xl font-bold mb-1">{day.temp}°C</div>
                      <div className="text-sm text-gray-600 capitalize">{day.weather.description}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-16">
                  <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Search for a location to see 5-day forecast</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Records Tab */}
        {activeTab === 'records' && (
          <div className="space-y-6">
            {/* Export Buttons */}
            <Card>
              <CardHeader>
                <h3 className="text-xl font-bold">Export Data</h3>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => window.open(exportToJSON(), '_blank')}>
                    <Download className="w-4 h-4 mr-2" /> JSON
                  </Button>
                  <Button variant="outline" onClick={() => window.open(exportToCSV(), '_blank')}>
                    <Download className="w-4 h-4 mr-2" /> CSV
                  </Button>
                  <Button variant="outline" onClick={() => window.open(exportToXML(), '_blank')}>
                    <Download className="w-4 h-4 mr-2" /> XML
                  </Button>
                  <Button variant="outline" onClick={() => window.open(exportToMarkdown(), '_blank')}>
                    <Download className="w-4 h-4 mr-2" /> Markdown
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Records List */}
            {records.length > 0 ? (
              <div className="grid gap-4">
                {records.map((record) => (
                  <Card key={record.id}>
                    <CardContent>
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <h3 className="font-semibold text-xl">{record.location}</h3>
                          <p className="text-gray-500">
                            {new Date(record.startDate).toLocaleDateString()} - {new Date(record.endDate).toLocaleDateString()}
                          </p>
                          {record.temperature && (
                            <p className="text-gray-600">Temperature: {record.temperature}°C</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => setEditingRecord(record)}
                          >
                            <Edit2 className="w-4 h-4 mr-2" /> Edit
                          </Button>
                          <Button 
                            variant="danger" 
                            onClick={() => handleDeleteRecord(record.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-16">
                  <Save className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No saved records yet. Save weather data from the Current Weather tab.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Edit Modal */}
        {editingRecord && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <h3 className="text-xl font-bold">Edit Record</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Location</label>
                  <Input
                    value={editingRecord.location}
                    onChange={(e: any) => setEditingRecord({ ...editingRecord, location: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Start Date</label>
                  <Input
                    type="date"
                    value={editingRecord.startDate}
                    onChange={(e: any) => setEditingRecord({ ...editingRecord, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">End Date</label>
                  <Input
                    type="date"
                    value={editingRecord.endDate}
                    onChange={(e: any) => setEditingRecord({ ...editingRecord, endDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Temperature</label>
                  <Input
                    type="number"
                    value={editingRecord.temperature || ''}
                    onChange={(e: any) => setEditingRecord({ ...editingRecord, temperature: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleUpdateRecord} className="flex-1">Update</Button>
                  <Button onClick={() => setEditingRecord(null)} variant="outline" className="flex-1">Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Weather App - Technical Assessment for PM Accelerator</p>
          <p className="mt-1">Built with React, TypeScript, Express, and Tailwind CSS</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
