import { fetchData } from "./api/apiClient";

export const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5";
export const fetchWeatherData = async (lat, lon) => {
    return fetchData(`/api/weather?lat=${lat}&lon=${lon}`);
};


export const GEO_API_URL = "https://wft-geo-db.p.rapidapi.com/v1/geo";
export const GEO_API_HEADERS = {
    "x-rapidapi-key": process.env.REACT_APP_RAPIDAPI_KEY,
    "x-rapidapi-host": "wft-geo-db.p.rapidapi.com",
};