'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Thermometer, Sunrise, Sunset, MapPin } from 'lucide-react';

interface WeatherData {
  latitude: number;
  longitude: number;
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
  };
  current_units: {
    temperature_2m: string;
  };
  daily: {
    sunrise: string[];
    sunset: string[];
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
  };
}

interface WeatherDisplayProps {
  data: WeatherData;
}

// Helper function to validate weather data
function isValidWeatherData(data: any): data is WeatherData {
  return (
    data &&
    typeof data === 'object' &&
    data.current &&
    typeof data.current.temperature_2m === 'number' &&
    data.current_units &&
    data.daily &&
    Array.isArray(data.daily.sunrise) &&
    Array.isArray(data.daily.sunset) &&
    data.hourly &&
    Array.isArray(data.hourly.time) &&
    Array.isArray(data.hourly.temperature_2m)
  );
}

export function WeatherDisplay({ data }: WeatherDisplayProps) {
  // Validate the data structure
  if (!isValidWeatherData(data)) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            <Thermometer className="w-8 h-8 mx-auto mb-2" />
            <p>Unable to display weather data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentTemp = data.current.temperature_2m;
  const tempUnit = data.current_units.temperature_2m;
  const todaySunrise = data.daily.sunrise[0];
  const todaySunset = data.daily.sunset[0];

  // Get next few hours of temperature data (limit to available data)
  const maxHours = Math.min(8, data.hourly.time.length);
  const nextHours = data.hourly.time.slice(0, maxHours).map((time, index) => ({
    time,
    temp: data.hourly.temperature_2m[index],
  }));

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timeString: string) => {
    return new Date(timeString).toLocaleDateString([], {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="w-5 h-5" />
            Weather Information
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {data.timezone} • {formatDate(data.current.time)}
          </p>
        </CardHeader>
        <CardContent className="px-0 space-y-4">
          {/* Current Temperature */}
          <div className="flex items-center gap-3">
            <Thermometer className="w-8 h-8 text-orange-500" />
            <div>
              <div className="text-3xl font-bold">
                {Math.round(currentTemp)}{tempUnit}
              </div>
              <div className="text-sm text-muted-foreground">
                Current temperature
              </div>
            </div>
          </div>

          {/* Sunrise/Sunset */}
          {todaySunrise && todaySunset && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sunrise className="w-5 h-5 text-yellow-500" />
                <div>
                  <div className="font-medium">{formatTime(todaySunrise)}</div>
                  <div className="text-xs text-muted-foreground">Sunrise</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Sunset className="w-5 h-5 text-orange-500" />
                <div>
                  <div className="font-medium">{formatTime(todaySunset)}</div>
                  <div className="text-xs text-muted-foreground">Sunset</div>
                </div>
              </div>
            </div>
          )}

          {/* Hourly Forecast */}
          {nextHours.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Next {nextHours.length} Hours</h4>
              <div className="grid grid-cols-4 gap-2">
                {nextHours.map((hour, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-muted-foreground">
                      {formatTime(hour.time)}
                    </div>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {Math.round(hour.temp)}{tempUnit}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location Info */}
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Coordinates: {data.latitude.toFixed(4)}, {data.longitude.toFixed(4)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 