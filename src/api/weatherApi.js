import { fetchData } from "./apiClient";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const fetchWeatherData = async (lat, lon) => {
    return fetchData(`${BASE_URL}/api/weather?lat=${lat}&lon=${lon}`);
};

export const fetchForecastData = async (lat, lon) => {
    return fetchData(`${BASE_URL}/api/forecast?lat=${lat}&lon=${lon}`);
};