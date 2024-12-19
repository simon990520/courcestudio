"use client";
import axios from "axios";

// Cache para almacenar resultados y evitar peticiones repetidas
const cache = new Map();

const getVideos = async (query) => {
  try {
    // Verificar el cache primero
    const cacheKey = query.toLowerCase().trim();
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    // Hacer la petición a nuestro endpoint
    const response = await axios.get(`/api/youtube?q=${encodeURIComponent(query)}`);
    const results = response.data.items;

    // Guardar en cache
    cache.set(cacheKey, results);
    
    return results;
  } catch (error) {
    console.error("Error al buscar videos:", {
      message: error.message,
      query,
    });
    
    // En caso de error, retornar un resultado vacío pero válido
    return [{
      id: { videoId: "" },
      snippet: {
        title: "",
        thumbnails: {
          default: { url: "" }
        }
      }
    }];
  }
};

// Limpiar el cache cada hora
const clearCacheInterval = 3600000;
setInterval(() => {
  cache.clear();
}, clearCacheInterval);

export default {
  getVideos,
};
