import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaz actualizada para el clima actual con todos los nuevos campos
export interface WeatherData {
  location: string;
  temperature: number;
  feelsLike: number;           // NUEVO
  description: string;
  humidity: number;
  pressure: number;            // NUEVO
  windSpeed: number;
  windDirection: string;       // NUEVO
  windDegrees: number;         // NUEVO
  windGust: number | null;     // NUEVO
  visibility: number | null;   // NUEVO
  icon: string;
}

// NUEVAS interfaces para el pronóstico detallado
export interface HourlyForecast {
  dateTime: string;
  timestamp: number;
  temperature: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  description: string;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: string;
  windDegrees: number;
  windGust: number | null;
  visibility: number | null;
  cloudiness: number;
  precipitation: number;
  icon: string;
}

export interface DailySummary {
  date: string;
  tempMin: number;
  tempMax: number;
  avgHumidity: number;
  maxWindSpeed: number;
  maxWindGust: number | null;
  dominantDescription: string;
  hourlyData: HourlyForecast[];
}

export interface ForecastData {
  location: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  timezone: number;
  totalHours: number;
  totalDays: number;
  hourlyForecast: HourlyForecast[];
  dailySummary: DailySummary[];
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Métodos existentes actualizados
  getWeather(city: string): Observable<WeatherData> {
    return this.http.get<WeatherData>(`${this.apiUrl}/weather/${city}`);
  }

  getCurrentWeather(lat: number, lon: number): Observable<WeatherData> {
    return this.http.get<WeatherData>(`${this.apiUrl}/weather/coords/${lat}/${lon}`);
  }

  // NUEVOS métodos para pronóstico detallado
  getForecast(city: string): Observable<ForecastData> {
    return this.http.get<ForecastData>(`${this.apiUrl}/forecast/${city}`);
  }

  getForecastByCoords(lat: number, lon: number): Observable<ForecastData> {
    return this.http.get<ForecastData>(`${this.apiUrl}/forecast/coords/${lat}/${lon}`);
  }
}