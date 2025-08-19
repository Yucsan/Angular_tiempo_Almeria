// Serve.js - Backend actualizado para WeatherAPI.com
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API Key de WeatherAPI.com
const API_KEY = process.env.WEATHERAPI_KEY || 'ce43e96155294a8780f155344251308';
const BASE_URL = 'https://api.weatherapi.com/v1';

// Función para convertir grados de viento a dirección textual
function getWindDirection(degrees) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

// Función para formatear los datos del clima actual
function formatWeatherData(data) {
  return {
    location: `${data.location.name}, ${data.location.country}`,
    temperature: Math.round(data.current.temp_c),
    feelsLike: Math.round(data.current.feelslike_c),
    description: data.current.condition.text,
    humidity: data.current.humidity,
    pressure: Math.round(data.current.pressure_mb),
    windSpeed: Math.round(data.current.wind_kph),
    windDirection: getWindDirection(data.current.wind_degree),
    windDegrees: data.current.wind_degree,
    windGust: data.current.gust_kph ? Math.round(data.current.gust_kph) : null,
    visibility: Math.round(data.current.vis_km),
    icon: `https:${data.current.condition.icon}`.replace('64x64', '128x128') // Mejor resolución
  };
}

// Función para formatear datos del pronóstico por horas
function formatHourlyForecastData(hour, date) {
  return {
    dateTime: `${date} ${hour.time.split(' ')[1]}`,
    timestamp: new Date(`${date} ${hour.time.split(' ')[1]}`).getTime() / 1000,
    temperature: Math.round(hour.temp_c),
    feelsLike: Math.round(hour.feelslike_c),
    tempMin: Math.round(hour.temp_c), // WeatherAPI no da min/max por hora, usamos temp actual
    tempMax: Math.round(hour.temp_c),
    description: hour.condition.text,
    humidity: hour.humidity,
    pressure: Math.round(hour.pressure_mb),
    windSpeed: Math.round(hour.wind_kph),
    windDirection: getWindDirection(hour.wind_degree),
    windDegrees: hour.wind_degree,
    windGust: hour.gust_kph ? Math.round(hour.gust_kph) : null,
    visibility: Math.round(hour.vis_km),
    cloudiness: hour.cloud, // porcentaje
    precipitation: hour.precip_mm || 0,
    icon: `https:${hour.condition.icon}`.replace('64x64', '128x128')
  };
}

// Ruta para obtener clima por nombre de ciudad
app.get('/api/weather/:city', async (req, res) => {
  try {
    const { city } = req.params;
    
    const response = await axios.get(
      `${BASE_URL}/current.json?key=${API_KEY}&q=${city}&lang=es`
    );
    
    const weatherData = formatWeatherData(response.data);
    res.json(weatherData);
    
  } catch (error) {
    console.error('Error fetching weather:', error.message);
    
    if (error.response && error.response.status === 400) {
      res.status(404).json({ 
        error: 'Ciudad no encontrada. Verifica el nombre e intenta nuevamente.' 
      });
    } else {
      res.status(500).json({ 
        error: 'Error interno del servidor al obtener el clima' 
      });
    }
  }
});

// Ruta para obtener clima por coordenadas
app.get('/api/weather/coords/:lat/:lon', async (req, res) => {
  try {
    const { lat, lon } = req.params;
    
    const response = await axios.get(
      `${BASE_URL}/current.json?key=${API_KEY}&q=${lat},${lon}&lang=es`
    );
    
    const weatherData = formatWeatherData(response.data);
    res.json(weatherData);
    
  } catch (error) {
    console.error('Error fetching weather by coordinates:', error.message);
    res.status(500).json({ 
      error: 'Error al obtener el clima por coordenadas' 
    });
  }
});

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'API del clima con WeatherAPI funcionando correctamente! 🌤️' });
});

// Ruta para saludo
app.get('/api/saludo', (req, res) => {
  res.json({ mensaje: 'Hola! Bienvenido a la aplicación del clima de Almería 🌞' });
});

// Ruta para obtener pronóstico detallado de 5 días con datos por hora
app.get('/api/forecast/:city', async (req, res) => {
  try {
    const { city } = req.params;
    
    // WeatherAPI permite hasta 10 días de pronóstico, usamos 5
    const response = await axios.get(
      `${BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=5&lang=es&alerts=no`
    );
    
    const data = response.data;
    let allHourlyForecast = [];
    
    // Procesar cada día del pronóstico
    const dailyForecast = {};
    
    data.forecast.forecastday.forEach(day => {
      const date = day.date;
      
      // Procesar cada hora del día (24 horas)
      const dayHourlyData = day.hour.map(hour => 
        formatHourlyForecastData(hour, date)
      );
      
      allHourlyForecast = allHourlyForecast.concat(dayHourlyData);
      
      // Crear resumen diario
      const temperatures = dayHourlyData.map(h => h.temperature);
      const windSpeeds = dayHourlyData.map(h => h.windSpeed);
      const windGusts = dayHourlyData.filter(h => h.windGust).map(h => h.windGust);
      const humidities = dayHourlyData.map(h => h.humidity);
      const descriptions = dayHourlyData.map(h => h.description);
      
      dailyForecast[date] = {
        date: date,
        tempMin: Math.min(...temperatures),
        tempMax: Math.max(...temperatures),
        avgHumidity: Math.round(humidities.reduce((a, b) => a + b, 0) / humidities.length),
        maxWindSpeed: Math.max(...windSpeeds),
        maxWindGust: windGusts.length > 0 ? Math.max(...windGusts) : null,
        dominantDescription: descriptions.sort((a, b) => 
          descriptions.filter(v => v === a).length - descriptions.filter(v => v === b).length
        ).pop(),
        hourlyData: dayHourlyData
      };
    });
    
    // Crear resumen diario ordenado
    const dailySummary = Object.keys(dailyForecast).map(date => dailyForecast[date]);
    
    res.json({
      location: `${data.location.name}, ${data.location.country}`,
      coordinates: {
        lat: data.location.lat,
        lon: data.location.lon
      },
      timezone: data.location.tz_id,
      totalHours: allHourlyForecast.length,
      totalDays: dailySummary.length,
      hourlyForecast: allHourlyForecast,
      dailySummary: dailySummary
    });
    
  } catch (error) {
    console.error('Error fetching forecast:', error.message);
    
    if (error.response && error.response.status === 400) {
      res.status(404).json({ 
        error: 'Ciudad no encontrada para el pronóstico. Verifica el nombre e intenta nuevamente.' 
      });
    } else {
      res.status(500).json({ 
        error: 'Error al obtener el pronóstico detallado' 
      });
    }
  }
});

// Ruta para obtener pronóstico por coordenadas
app.get('/api/forecast/coords/:lat/:lon', async (req, res) => {
  try {
    const { lat, lon } = req.params;
    
    const response = await axios.get(
      `${BASE_URL}/forecast.json?key=${API_KEY}&q=${lat},${lon}&days=5&lang=es&alerts=no`
    );
    
    const data = response.data;
    let allHourlyForecast = [];
    
    // Procesar cada día del pronóstico
    const dailyForecast = {};
    
    data.forecast.forecastday.forEach(day => {
      const date = day.date;
      
      // Procesar cada hora del día (24 horas)
      const dayHourlyData = day.hour.map(hour => 
        formatHourlyForecastData(hour, date)
      );
      
      allHourlyForecast = allHourlyForecast.concat(dayHourlyData);
      
      // Crear resumen diario
      const temperatures = dayHourlyData.map(h => h.temperature);
      const windSpeeds = dayHourlyData.map(h => h.windSpeed);
      const windGusts = dayHourlyData.filter(h => h.windGust).map(h => h.windGust);
      
      dailyForecast[date] = {
        date: date,
        tempMin: Math.min(...temperatures),
        tempMax: Math.max(...temperatures),
        maxWindSpeed: Math.max(...windSpeeds),
        maxWindGust: windGusts.length > 0 ? Math.max(...windGusts) : null,
        hourlyData: dayHourlyData
      };
    });
    
    const dailySummary = Object.keys(dailyForecast).map(date => dailyForecast[date]);
    
    res.json({
      location: `${data.location.name}, ${data.location.country}`,
      coordinates: { lat: parseFloat(lat), lon: parseFloat(lon) },
      timezone: data.location.tz_id,
      totalHours: allHourlyForecast.length,
      totalDays: dailySummary.length,
      hourlyForecast: allHourlyForecast,
      dailySummary: dailySummary
    });
    
  } catch (error) {
    console.error('Error fetching forecast by coordinates:', error.message);
    res.status(500).json({ 
      error: 'Error al obtener el pronóstico por coordenadas' 
    });
  }
});

// Middleware para manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📡 API del clima con WeatherAPI disponible en http://localhost:${PORT}/api/weather`);
  console.log(`🌤️ Usando WeatherAPI.com con datos hora por hora`);
  
  if (!process.env.WEATHERAPI_KEY) {
    console.log('⚠️  IMPORTANTE: No se encontró WEATHERAPI_KEY en las variables de entorno');
    console.log('   Usando API key por defecto (recomendado: configurar en .env)');
  }
});