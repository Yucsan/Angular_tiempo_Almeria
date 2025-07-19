import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WeatherService, WeatherData } from '../services/weather';

@Component({
  selector: 'app-weather',
  standalone: true, // Componente standalone (nueva forma en Angular 17+)
  imports: [CommonModule, FormsModule], // Importamos módulos necesarios
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.scss']
})
export class WeatherComponent implements OnInit {
  // Propiedades del componente
  weatherData: WeatherData | null = null;
  city: string = '';
  loading: boolean = false;
  error: string = '';

  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {
    // Este método se ejecuta cuando el componente se inicializa
    this.getCurrentLocation();
  }

  // Método para buscar clima por ciudad
  searchWeather(): void {
    if (!this.city.trim()) {
      this.error = 'Por favor ingresa una ciudad';
      return;
    }

    this.loading = true;
    this.error = '';

    this.weatherService.getWeather(this.city).subscribe({
      next: (data: WeatherData) => {
        this.weatherData = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al obtener el clima. Verifica el nombre de la ciudad.';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

  // Método para obtener ubicación actual
  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          this.getWeatherByCoords(lat, lon);
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          this.error = 'No se pudo obtener tu ubicación';
        }
      );
    }
  }

  // Método para obtener clima por coordenadas
  getWeatherByCoords(lat: number, lon: number): void {
    this.loading = true;
    this.weatherService.getCurrentWeather(lat, lon).subscribe({
      next: (data: WeatherData) => {
        this.weatherData = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al obtener el clima de tu ubicación';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

  // Método para limpiar la búsqueda
  clearSearch(): void {
    this.city = '';
    this.weatherData = null;
    this.error = '';
  }
}