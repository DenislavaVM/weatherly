import { fetchData } from "./apiClient";

export const fetchWeatherData = async (lat, lon) => {
    return fetchData(`http://localhost:5000/api/weather?lat=${lat}&lon=${lon}`);
};

export const fetchForecastData = async (lat, lon) => {
    return fetchData(`http://localhost:5000/api/forecast?lat=${lat}&lon=${lon}`);
};
