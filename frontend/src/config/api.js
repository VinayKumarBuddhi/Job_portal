// API base URL configuration for Create React App
const BASE_URL = process.env.NODE_ENV === "development"
  ? "http://localhost:5000/api"
  : "/api";

export { BASE_URL }; 