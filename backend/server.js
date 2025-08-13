// Serve.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API Key de OpenWeatherMap (necesitas registrarte en openweathermap.org)
const API_KEY = process.env.OPENWEATHER_API_KEY || 'tu_api_key_aqui';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Función para convertir grados de viento a dirección textual
function getWindDirection(degrees) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

// Función para formatear los datos del clima actual
function formatWeatherData(data) {
  return {
    location: `${data.name}, ${data.sys.country}`,
    temperature: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    description: data.weather[0].description,
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    windSpeed: Math.round(data.wind.speed * 3.6), // Convertir de m/s a km/h
    windDirection: data.wind.deg ? getWindDirection(data.wind.deg) : 'N/A',
    windDegrees: data.wind.deg || 0,
    windGust: data.wind.gust ? Math.round(data.wind.gust * 3.6) : null,
    visibility: data.visibility ? Math.round(data.visibility / 1000) : null, // en km
    icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
  };
}

// Función para formatear datos del pronóstico por horas
function formatHourlyForecastData(item) {
  return {
    dateTime: item.dt_txt,
    timestamp: item.dt,
    temperature: Math.round(item.main.temp),
    feelsLike: Math.round(item.main.feels_like),
    tempMin: Math.round(item.main.temp_min),
    tempMax: Math.round(item.main.temp_max),
    description: item.weather[0].description,
    humidity: item.main.humidity,
    pressure: item.main.pressure,
    windSpeed: Math.round(item.wind.speed * 3.6), // km/h
    windDirection: item.wind.deg ? getWindDirection(item.wind.deg) : 'N/A',
    windDegrees: item.wind.deg || 0,
    windGust: item.wind.gust ? Math.round(item.wind.gust * 3.6) : null, // km/h
    visibility: item.visibility ? Math.round(item.visibility / 1000) : null, // km
    cloudiness: item.clouds.all, // porcentaje
    precipitation: item.rain ? item.rain['3h'] || 0 : item.snow ? item.snow['3h'] || 0 : 0,
    icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`
  };
}

// Ruta para obtener clima por nombre de ciudad
app.get('/api/weather/:city', async (req, res) => {
  try {
    const { city } = req.params;
    
    const response = await axios.get(
      `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric&lang=es`
    );
    
    const weatherData = formatWeatherData(response.data);
    res.json(weatherData);
    
  } catch (error) {
    console.error('Error fetching weather:', error.message);
    
    if (error.response && error.response.status === 404) {
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
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`
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
  res.json({ message: 'API del clima funcionando correctamente! 🌤️' });
});

// Ruta para obtener pronóstico detallado de 5 días por horas
app.get('/api/forecast/:city', async (req, res) => {
  try {
    const { city } = req.params;
    
    const response = await axios.get(
      `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=es`
    );
    
    // Formatear datos del pronóstico por horas
    const hourlyForecast = response.data.list.map(formatHourlyForecastData);
    
    // Agrupar por días para resumen diario
    const dailyForecast = {};
    hourlyForecast.forEach(item => {
      const date = item.dateTime.split(' ')[0];
      if (!dailyForecast[date]) {
        dailyForecast[date] = {
          date: date,
          temperatures: [],
          descriptions: [],
          windSpeeds: [],
          windGusts: [],
          humidity: [],
          items: []
        };
      }
      dailyForecast[date].temperatures.push(item.temperature);
      dailyForecast[date].descriptions.push(item.description);
      dailyForecast[date].windSpeeds.push(item.windSpeed);
      if (item.windGust) dailyForecast[date].windGusts.push(item.windGust);
      dailyForecast[date].humidity.push(item.humidity);
      dailyForecast[date].items.push(item);
    });
    
    // Crear resumen diario
    const dailySummary = Object.keys(dailyForecast).map(date => {
      const day = dailyForecast[date];
      return {
        date: date,
        tempMin: Math.min(...day.temperatures),
        tempMax: Math.max(...day.temperatures),
        avgHumidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
        maxWindSpeed: Math.max(...day.windSpeeds),
        maxWindGust: day.windGusts.length > 0 ? Math.max(...day.windGusts) : null,
        dominantDescription: day.descriptions.sort((a,b) => 
          day.descriptions.filter(v => v === a).length - day.descriptions.filter(v => v === b).length
        ).pop(),
        hourlyData: day.items
      };
    });
    
    res.json({
      location: `${response.data.city.name}, ${response.data.city.country}`,
      coordinates: {
        lat: response.data.city.coord.lat,
        lon: response.data.city.coord.lon
      },
      timezone: response.data.city.timezone,
      totalHours: hourlyForecast.length,
      totalDays: Object.keys(dailyForecast).length,
      hourlyForecast: hourlyForecast,
      dailySummary: dailySummary
    });
    
  } catch (error) {
    console.error('Error fetching forecast:', error.message);
    
    if (error.response && error.response.status === 404) {
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
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`
    );
    
    const hourlyForecast = response.data.list.map(formatHourlyForecastData);
    
    // Agrupar por días para resumen diario
    const dailyForecast = {};
    hourlyForecast.forEach(item => {
      const date = item.dateTime.split(' ')[0];
      if (!dailyForecast[date]) {
        dailyForecast[date] = {
          date: date,
          temperatures: [],
          windSpeeds: [],
          windGusts: [],
          items: []
        };
      }
      dailyForecast[date].temperatures.push(item.temperature);
      dailyForecast[date].windSpeeds.push(item.windSpeed);
      if (item.windGust) dailyForecast[date].windGusts.push(item.windGust);
      dailyForecast[date].items.push(item);
    });
    
    const dailySummary = Object.keys(dailyForecast).map(date => {
      const day = dailyForecast[date];
      return {
        date: date,
        tempMin: Math.min(...day.temperatures),
        tempMax: Math.max(...day.temperatures),
        maxWindSpeed: Math.max(...day.windSpeeds),
        maxWindGust: day.windGusts.length > 0 ? Math.max(...day.windGusts) : null,
        hourlyData: day.items
      };
    });
    
    res.json({
      location: `${response.data.city.name}, ${response.data.city.country}`,
      coordinates: { lat: parseFloat(lat), lon: parseFloat(lon) },
      hourlyForecast: hourlyForecast,
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
  console.log(`📡 API del clima disponible en http://localhost:${PORT}/api/weather`);
  
  if (!process.env.OPENWEATHER_API_KEY) {
    console.log('⚠️  IMPORTANTE: No se encontró OPENWEATHER_API_KEY en las variables de entorno');
    console.log('   Obtén tu API key gratuita en: https://openweathermap.org/api');
  }
});