import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/auth",
});

const PUBLIC_ROUTES = ["/login", "/signin", "/refresh"];

const isPublicRoute = (url) => PUBLIC_ROUTES.some((route) => url?.startsWith(route));

api.interceptors.request.use((config) => {
  if (!isPublicRoute(config.url)) {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (isPublicRoute(originalRequest?.url)) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refresh = localStorage.getItem("refresh_token");
        if (!refresh) throw new Error("Pas de refresh token");

        const res = await axios.post("http://localhost:8000/api/auth/refresh", {
          refresh,
        });

        localStorage.setItem("access_token", res.data.access);
        if (res.data.refresh) {
          localStorage.setItem("refresh_token", res.data.refresh);
        }
        originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        sessionStorage.setItem("logout_reason, expired")
        window.location.href = "/session-expired";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;