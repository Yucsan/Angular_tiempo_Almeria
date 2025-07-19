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

// Función para formatear los datos del clima
function formatWeatherData(data) {
  return {
    location: `${data.name}, ${data.sys.country}`,
    temperature: Math.round(data.main.temp),
    description: data.weather[0].description,
    humidity: data.main.humidity,
    windSpeed: Math.round(data.wind.speed * 3.6), // Convertir de m/s a km/h
    icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
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

// Ruta para obtener pronóstico de 5 días (opcional)
app.get('/api/forecast/:city', async (req, res) => {
  try {
    const { city } = req.params;
    
    const response = await axios.get(
      `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=es`
    );
    
    // Formatear datos del pronóstico
    const forecastData = response.data.list.map(item => ({
      date: item.dt_txt,
      temperature: Math.round(item.main.temp),
      description: item.weather[0].description,
      icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`
    }));
    
    res.json({
      city: `${response.data.city.name}, ${response.data.city.country}`,
      forecast: forecastData
    });
    
  } catch (error) {
    console.error('Error fetching forecast:', error.message);
    res.status(500).json({ 
      error: 'Error al obtener el pronóstico' 
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