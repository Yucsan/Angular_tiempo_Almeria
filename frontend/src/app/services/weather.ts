import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaz actualizada para el clima actual con WeatherAPI
export interface WeatherData {
  location: string;
  temperature: number;
  feelsLike: number;
  description: string;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: string;
  windDegrees: number;
  windGust: number | null;
  visibility: number;
  icon: string;
}

// Interfaces para el pronóstico detallado con datos hora por hora
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
  visibility: number;
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
  timezone: string;
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

  // Métodos para clima actual
  getWeather(city: string): Observable<WeatherData> {
    return this.http.get<WeatherData>(`${this.apiUrl}/weather/${city}`);
  }

  getCurrentWeather(lat: number, lon: number): Observable<WeatherData> {
    return this.http.get<WeatherData>(`${this.apiUrl}/weather/coords/${lat}/${lon}`);
  }

  // Métodos para pronóstico detallado (5 días, 24 horas por día)
  getForecast(city: string): Observable<ForecastData> {
    return this.http.get<ForecastData>(`${this.apiUrl}/forecast/${city}`);
  }

  getForecastByCoords(lat: number, lon: number): Observable<ForecastData> {
    return this.http.get<ForecastData>(`${this.apiUrl}/forecast/coords/${lat}/${lon}`);
  }

  // NUEVOS métodos de utilidad para trabajar con datos hora por hora
  
  // Obtener horas de un día específico
  getHoursForDay(forecastData: ForecastData, dayIndex: number): HourlyForecast[] {
    if (!forecastData?.dailySummary[dayIndex]) return [];
    return forecastData.dailySummary[dayIndex].hourlyData;
  }

  // Obtener datos de una hora específica
  getHourData(forecastData: ForecastData, dayIndex: number, hour: number): HourlyForecast | null {
    const dayHours = this.getHoursForDay(forecastData, dayIndex);
    return dayHours.find(h => parseInt(h.dateTime.split(' ')[1].split(':')[0]) === hour) || null;
  }

  // Filtrar horas por rango (ej: 6:00 - 18:00 para horario diurno)
  getHoursByRange(forecastData: ForecastData, dayIndex: number, startHour: number, endHour: number): HourlyForecast[] {
    const dayHours = this.getHoursForDay(forecastData, dayIndex);
    return dayHours.filter(h => {
      const hour = parseInt(h.dateTime.split(' ')[1].split(':')[0]);
      return hour >= startHour && hour <= endHour;
    });
  }

  // Obtener temperaturas máxima y mínima de un día específico
  getDayTemperatureRange(forecastData: ForecastData, dayIndex: number): {min: number, max: number} {
    const dayHours = this.getHoursForDay(forecastData, dayIndex);
    if (dayHours.length === 0) return {min: 0, max: 0};
    
    const temps = dayHours.map(h => h.temperature);
    return {
      min: Math.min(...temps),
      max: Math.max(...temps)
    };
  }

  // Obtener hora con mayor viento del día
  getMaxWindHour(forecastData: ForecastData, dayIndex: number): HourlyForecast | null {
    const dayHours = this.getHoursForDay(forecastData, dayIndex);
    if (dayHours.length === 0) return null;
    
    return dayHours.reduce((max, current) => 
      current.windSpeed > max.windSpeed ? current : max
    );
  }
}