import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development"
    ? "http://localhost:5001/api"   // Backend in dev mode
    : "https://chat-app-o7hz.onrender.com/api",// When deployed together
  withCredentials: true,            // Send cookies (for JWT auth)
  headers: {
    "Content-Type": "application/json"
  }
});
