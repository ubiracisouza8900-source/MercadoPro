import axios from "axios";

/**
 * Instância única do Axios usada em todas as páginas
 * para comunicação com o backend.
 */

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:3333/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("mercadopro_token");

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log("➡️ API:", config.method?.toUpperCase(), config.url);

  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(
      "⬅️ API:",
      response.status,
      response.config.url
    );

    return response;
  },
  (error) => {
    console.error("❌ ERRO API");

    console.error("URL:", error.config?.url);
    console.error("Método:", error.config?.method);
    console.error("Status:", error.response?.status);
    console.error("Resposta:", error.response?.data);

    return Promise.reject(error);
  }
);

export default api;