import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Definimos la interfaz para tipear los datos del clima
export interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

@Injectable({
  providedIn: 'root' // Esto hace que el servicio esté disponible en toda la app
})
export class WeatherService {
  private apiUrl = 'http://localhost:3000/api/weather'; // URL de nuestro backend

  constructor(private http: HttpClient) {}

  // Método para obtener el clima de una ciudad
  getWeather(city: string): Observable<WeatherData> {
    return this.http.get<WeatherData>(`${this.apiUrl}/${city}`);
  }

  // Método para obtener el clima actual basado en coordenadas
  getCurrentWeather(lat: number, lon: number): Observable<WeatherData> {
    return this.http.get<WeatherData>(`${this.apiUrl}/coords/${lat}/${lon}`);
  }
}