import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WeatherService, WeatherData, ForecastData } from '../services/weather';

@Component({
  selector: 'app-weather',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.scss']
})
export class WeatherComponent implements OnInit {
  // Propiedades existentes
  weatherData: WeatherData | null = null;
  city: string = '';
  loading: boolean = false;
  error: string = '';

  // NUEVAS propiedades para funcionalidad extendida
  forecastData: ForecastData | null = null;
  loadingForecast: boolean = false;
  showDetailedView: boolean = false;
  showForecast: boolean = false;
  selectedDay: number = 0; // Para navegación entre días del pronóstico

  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {
    this.getCurrentLocation();
  }

  // Método existente mejorado
  searchWeather(): void {
    if (!this.city.trim()) {
      this.error = 'Por favor ingresa una ciudad';
      return;
    }

    this.loading = true;
    this.error = '';
    
    // Limpiar datos anteriores
    this.weatherData = null;
    this.forecastData = null;

    this.weatherService.getWeather(this.city).subscribe({
      next: (data: WeatherData) => {
        this.weatherData = data;
        this.loading = false;
        
        // Automáticamente cargar pronóstico si se obtiene el clima actual
        if (this.showForecast) {
          this.loadForecast();
        }
      },
      error: (err) => {
        this.error = 'Error al obtener el clima. Verifica el nombre de la ciudad.';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

  // NUEVO: Método para cargar pronóstico detallado
  loadForecast(): void {
    if (!this.city.trim()) return;

    this.loadingForecast = true;
    this.weatherService.getForecast(this.city).subscribe({
      next: (data: ForecastData) => {
        this.forecastData = data;
        this.loadingForecast = false;
      },
      error: (err) => {
        console.error('Error loading forecast:', err);
        this.loadingForecast = false;
      }
    });
  }

  // Método existente mejorado
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

  // Método existente mejorado
  getWeatherByCoords(lat: number, lon: number): void {
    this.loading = true;
    this.weatherData = null;
    this.forecastData = null;

    this.weatherService.getCurrentWeather(lat, lon).subscribe({
      next: (data: WeatherData) => {
        this.weatherData = data;
        this.loading = false;

        // Si está activado el pronóstico, cargarlo por coordenadas
        if (this.showForecast) {
          this.loadForecastByCoords(lat, lon);
        }
      },
      error: (err) => {
        this.error = 'Error al obtener el clima de tu ubicación';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

  // NUEVO: Cargar pronóstico por coordenadas
  loadForecastByCoords(lat: number, lon: number): void {
    this.loadingForecast = true;
    this.weatherService.getForecastByCoords(lat, lon).subscribe({
      next: (data: ForecastData) => {
        this.forecastData = data;
        this.loadingForecast = false;
      },
      error: (err) => {
        console.error('Error loading forecast by coords:', err);
        this.loadingForecast = false;
      }
    });
  }

  // Método existente
  clearSearch(): void {
    this.city = '';
    this.weatherData = null;
    this.forecastData = null;
    this.error = '';
    this.showDetailedView = false;
    this.showForecast = false;
    this.selectedDay = 0;
  }

  // NUEVOS: Métodos para controlar vistas
  toggleDetailedView(): void {
    this.showDetailedView = !this.showDetailedView;
  }

  toggleForecast(): void {
    this.showForecast = !this.showForecast;
    
    if (this.showForecast && this.weatherData && !this.forecastData) {
      // Cargar pronóstico si no está cargado
      if (this.city.trim()) {
        this.loadForecast();
      }
    }
  }

  // NUEVO: Navegar entre días del pronóstico
  selectDay(dayIndex: number): void {
    this.selectedDay = dayIndex;
  }

  // NUEVOS: Métodos auxiliares para el template
  getWindDescription(): string {
    if (!this.weatherData) return '';
    
    let description = `${this.weatherData.windSpeed} km/h`;
    if (this.weatherData.windDirection) {
      description += ` ${this.weatherData.windDirection}`;
    }
    if (this.weatherData.windGust) {
      description += ` (ráfagas ${this.weatherData.windGust} km/h)`;
    }
    return description;
  }

  getVisibilityText(): string {
    if (!this.weatherData?.visibility) return 'N/A';
    return `${this.weatherData.visibility} km`;
  }

  getPressureText(): string {
    if (!this.weatherData?.pressure) return 'N/A';
    return `${this.weatherData.pressure} hPa`;
  }

  // NUEVO: Obtener día seleccionado del pronóstico
  getSelectedDayForecast() {
    if (!this.forecastData?.dailySummary) return null;
    return this.forecastData.dailySummary[this.selectedDay] || null;
  }

  // NUEVO: Formatear fecha para mostrar
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Mañana';
    } else {
      return date.toLocaleDateString('es-ES', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      });
    }
  }

  // NUEVO: Formatear hora para mostrar (solo HH:mm)
  formatHour(dateTime: string): string {
    if (dateTime.includes('T')) {
      // Para formato ISO (new Date().toISOString())
      return dateTime.split('T')[1].substring(0, 5);
    }
    // Para formato normal "YYYY-MM-DD HH:mm:ss"
    return dateTime.split(' ')[1].substring(0, 5);
  }

  // NUEVO: Obtener horas filtradas del día seleccionado (filtrar horas pasadas para hoy)
  getFilteredHours() {
    const selectedDay = this.getSelectedDayForecast();
    if (!selectedDay?.hourlyData) return [];
    
    const now = new Date();
    const today = now.toDateString();
    const currentHour = now.getHours();
    
    // Si es el día de hoy (selectedDay === 0), filtrar horas pasadas
    if (this.selectedDay === 0) {
      const selectedDate = new Date(selectedDay.date);
      
      // Verificar si realmente es hoy
      if (selectedDate.toDateString() === today) {
        return selectedDay.hourlyData.filter(hour => {
          const hourTime = parseInt(hour.dateTime.split(' ')[1].split(':')[0]);
          return hourTime >= currentHour; // Solo mostrar hora actual y futuras
        });
      }
    }
    
    // Para otros días, mostrar todas las 24 horas
    return selectedDay.hourlyData;
  }

  // NUEVO: Estadísticas rápidas del día
  getDayStats() {
    const hours = this.getFilteredHours();
    if (hours.length === 0) return null;
    
    const temps = hours.map(h => h.temperature);
    const winds = hours.map(h => h.windSpeed);
    const humidity = hours.map(h => h.humidity);
    
    return {
      tempMin: Math.min(...temps),
      tempMax: Math.max(...temps),
      avgWind: Math.round(winds.reduce((a, b) => a + b, 0) / winds.length),
      maxWind: Math.max(...winds),
      avgHumidity: Math.round(humidity.reduce((a, b) => a + b, 0) / humidity.length)
    };
  }

  // NUEVO: Obtener hora actual formateada
  getCurrentHour(): string {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  }
}