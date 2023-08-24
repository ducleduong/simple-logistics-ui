import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (!config.url?.includes("login") || !config.url?.includes("register")) {
    const token = window.localStorage.getItem("access_token");
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use((config) => {
  return config;
}, (err) => {
    if (err.response.data.statusCode === 401) {
        window.location.href = '/login'
    }
});

export default api;
