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
  exportToMarkdown
} from '@/services/api';
import type { WeatherData, ForecastData, WeatherRecord } from '@/types/weather';
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
  Video,
  Map,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import './App.css';

function App() {
  // State
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [records, setRecords] = useState<WeatherRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('current');
  
  // Form state for creating records
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editingRecord, setEditingRecord] = useState<WeatherRecord | null>(null);

  // Load records on mount
  useEffect(() => {
    loadRecords();
  }, []);

  // Clear messages after 5 seconds
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
    setWeather(null);
    setForecast(null);

    try {
      // Get current weather
      const currentWeather = await getCurrentWeather(location);
      setWeather(currentWeather);

      // Get forecast
      const forecastData = await getForecast(location);
      setForecast(forecastData);

      setSuccess('Weather data loaded successfully!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch weather data. Please check the location and try again.');
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
          const currentWeather = await getCurrentWeather(undefined, latitude, longitude);
          setWeather(currentWeather);
          setLocation(currentWeather.name);

          const forecastData = await getForecast(undefined, latitude, longitude);
          setForecast(forecastData);

          setSuccess('Weather data for your location loaded successfully!');
        } catch (err: any) {
          setError(err.response?.data?.error || 'Failed to fetch weather data for your location.');
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
        setError('Unable to retrieve your location. Please check your browser permissions.');
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

  const getWeatherIcon = (iconCode: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      '01d': <Sun className="w-16 h-16 text-yellow-500" />,
      '01n': <Sun className="w-16 h-16 text-gray-400" />,
      '02d': <Cloud className="w-16 h-16 text-gray-500" />,
      '02n': <Cloud className="w-16 h-16 text-gray-600" />,
      '03d': <Cloud className="w-16 h-16 text-gray-400" />,
      '03n': <Cloud className="w-16 h-16 text-gray-500" />,
      '04d': <Cloud className="w-16 h-16 text-gray-600" />,
      '04n': <Cloud className="w-16 h-16 text-gray-700" />,
      '09d': <CloudRain className="w-16 h-16 text-blue-500" />,
      '09n': <CloudRain className="w-16 h-16 text-blue-600" />,
      '10d': <CloudRain className="w-16 h-16 text-blue-400" />,
      '10n': <CloudRain className="w-16 h-16 text-blue-500" />,
      '11d': <CloudLightning className="w-16 h-16 text-purple-500" />,
      '11n': <CloudLightning className="w-16 h-16 text-purple-600" />,
      '13d': <CloudSnow className="w-16 h-16 text-blue-300" />,
      '13n': <CloudSnow className="w-16 h-16 text-blue-400" />,
      '50d': <CloudFog className="w-16 h-16 text-gray-400" />,
      '50n': <CloudFog className="w-16 h-16 text-gray-500" />,
    };
    return iconMap[iconCode] || <Cloud className="w-16 h-16 text-gray-500" />;
  };

  const getSmallWeatherIcon = (iconCode: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      '01d': <Sun className="w-8 h-8 text-yellow-500" />,
      '01n': <Sun className="w-8 h-8 text-gray-400" />,
      '02d': <Cloud className="w-8 h-8 text-gray-500" />,
      '02n': <Cloud className="w-8 h-8 text-gray-600" />,
      '03d': <Cloud className="w-8 h-8 text-gray-400" />,
      '03n': <Cloud className="w-8 h-8 text-gray-500" />,
      '04d': <Cloud className="w-8 h-8 text-gray-600" />,
      '04n': <Cloud className="w-8 h-8 text-gray-700" />,
      '09d': <CloudRain className="w-8 h-8 text-blue-500" />,
      '09n': <CloudRain className="w-8 h-8 text-blue-600" />,
      '10d': <CloudRain className="w-8 h-8 text-blue-400" />,
      '10n': <CloudRain className="w-8 h-8 text-blue-500" />,
      '11d': <CloudLightning className="w-8 h-8 text-purple-500" />,
      '11n': <CloudLightning className="w-8 h-8 text-purple-600" />,
      '13d': <CloudSnow className="w-8 h-8 text-blue-300" />,
      '13n': <CloudSnow className="w-8 h-8 text-blue-400" />,
      '50d': <CloudFog className="w-8 h-8 text-gray-400" />,
      '50n': <CloudFog className="w-8 h-8 text-gray-500" />,
    };
    return iconMap[iconCode] || <Cloud className="w-8 h-8 text-gray-500" />;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Group forecast by day
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
      return {
        date,
        temp: Math.round(avgTemp),
        weather: mainWeather,
        items
      };
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            Weather App
          </h1>
          <p className="text-gray-600">
            Created for Product Manager Accelerator Technical Assessment
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Search Section */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Enter city, zip code, or coordinates (e.g., London, 10001, 40.7128,-74.0060)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSearch} disabled={loading} className="flex-1 md:flex-none">
                  {loading ? 'Loading...' : 'Search'}
                </Button>
                <Button onClick={handleGetCurrentLocation} variant="outline" disabled={loading} className="flex-1 md:flex-none">
                  <MapPin className="w-4 h-4 mr-2" />
                  My Location
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="current">Current Weather</TabsTrigger>
            <TabsTrigger value="forecast">5-Day Forecast</TabsTrigger>
            <TabsTrigger value="records">Saved Records</TabsTrigger>
          </TabsList>

          {/* Current Weather Tab */}
          <TabsContent value="current" className="space-y-4">
            {weather ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{weather.name}, {weather.sys.country}</span>
                      <Badge variant="secondary">{formatDate(weather.dt)}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getWeatherIcon(weather.weather[0].icon)}
                        <div>
                          <div className="text-5xl font-bold">{Math.round(weather.main.temp)}°C</div>
                          <div className="text-gray-600 capitalize">{weather.weather[0].description}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-6 md:mt-0">
                        <div className="flex items-center gap-2">
                          <Thermometer className="w-5 h-5 text-orange-500" />
                          <div>
                            <div className="text-sm text-gray-500">Feels Like</div>
                            <div className="font-semibold">{Math.round(weather.main.feels_like)}°C</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Droplets className="w-5 h-5 text-blue-500" />
                          <div>
                            <div className="text-sm text-gray-500">Humidity</div>
                            <div className="font-semibold">{weather.main.humidity}%</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Wind className="w-5 h-5 text-gray-500" />
                          <div>
                            <div className="text-sm text-gray-500">Wind Speed</div>
                            <div className="font-semibold">{weather.wind.speed} m/s</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye className="w-5 h-5 text-purple-500" />
                          <div>
                            <div className="text-sm text-gray-500">Visibility</div>
                            <div className="font-semibold">{(weather.visibility / 1000).toFixed(1)} km</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    <CardTitle>Save Weather Record</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <label className="text-sm text-gray-500 mb-1 block">Start Date</label>
                        <Input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm text-gray-500 mb-1 block">End Date</label>
                        <Input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button onClick={handleSaveRecord} className="w-full md:w-auto">
                          <Save className="w-4 h-4 mr-2" />
                          Save Record
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Video className="w-5 h-5" />
                        Location Videos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm">
                        YouTube videos for {weather.name} would be displayed here. 
                        (Requires YouTube Data API integration)
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Map className="w-5 h-5" />
                        Location Map
                      </CardTitle>
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
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <Cloud className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Search for a location to see current weather</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Forecast Tab */}
          <TabsContent value="forecast">
            {forecast ? (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {getDailyForecast().map((day, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6 text-center">
                      <div className="text-sm text-gray-500 mb-2">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex justify-center my-4">
                        {getSmallWeatherIcon(day.weather.icon)}
                      </div>
                      <div className="text-2xl font-bold mb-1">{day.temp}°C</div>
                      <div className="text-sm text-gray-600 capitalize">{day.weather.description}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Search for a location to see 5-day forecast</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Records Tab */}
          <TabsContent value="forecast">
            {forecast ? (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {getDailyForecast().map((day, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6 text-center">
                      <div className="text-sm text-gray-500 mb-2">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex justify-center my-4">
                        {getSmallWeatherIcon(day.weather.icon)}
                      </div>
                      <div className="text-2xl font-bold mb-1">{day.temp}°C</div>
                      <div className="text-sm text-gray-600 capitalize">{day.weather.description}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Search for a location to see 5-day forecast</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Records Tab */}
          <TabsContent value="records" className="space-y-4">
            {/* Export Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Export Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => window.open(exportToJSON(), '_blank')}>
                    <Download className="w-4 h-4 mr-2" />
                    JSON
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.open(exportToCSV(), '_blank')}>
                    <Download className="w-4 h-4 mr-2" />
                    CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.open(exportToXML(), '_blank')}>
                    <Download className="w-4 h-4 mr-2" />
                    XML
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.open(exportToMarkdown(), '_blank')}>
                    <Download className="w-4 h-4 mr-2" />
                    Markdown
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Records List */}
            {records.length > 0 ? (
              <div className="grid gap-4">
                {records.map((record) => (
                  <Card key={record.id}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <h3 className="font-semibold text-lg">{record.location}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(record.startDate).toLocaleDateString()} - {new Date(record.endDate).toLocaleDateString()}
                          </p>
                          {record.temperature && (
                            <p className="text-sm text-gray-600">
                              Temperature: {record.temperature}°C
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setEditingRecord(record)}>
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Record</DialogTitle>
                              </DialogHeader>
                              {editingRecord && (
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm text-gray-500 mb-1 block">Location</label>
                                    <Input
                                      value={editingRecord.location}
                                      onChange={(e) => setEditingRecord({ ...editingRecord, location: e.target.value })}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm text-gray-500 mb-1 block">Start Date</label>
                                    <Input
                                      type="date"
                                      value={editingRecord.startDate}
                                      onChange={(e) => setEditingRecord({ ...editingRecord, startDate: e.target.value })}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm text-gray-500 mb-1 block">End Date</label>
                                    <Input
                                      type="date"
                                      value={editingRecord.endDate}
                                      onChange={(e) => setEditingRecord({ ...editingRecord, endDate: e.target.value })}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm text-gray-500 mb-1 block">Temperature</label>
                                    <Input
                                      type="number"
                                      value={editingRecord.temperature || ''}
                                      onChange={(e) => setEditingRecord({ ...editingRecord, temperature: parseFloat(e.target.value) })}
                                    />
                                  </div>
                                  <Button onClick={handleUpdateRecord} className="w-full">
                                    Update Record
                                  </Button>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteRecord(record.id)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <Save className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No saved records yet. Save weather data from the Current Weather tab.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Weather App - Technical Assessment for PM Accelerator</p>
          <p className="mt-1">Built with React, TypeScript, Express, and OpenWeatherMap API</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
