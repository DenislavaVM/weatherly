import { useState } from "react";
import { fetchWeatherData, fetchForecastData } from "../api/weatherApi";
import { toast } from "react-toastify";

const useFetchWeather = () => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchWeather = async (lat, lon, units = "metric") => {
        setError(null);
        setLoading(true);
        try {
            const [currentWeather, forecast] = await Promise.all([
                fetchWeatherData(lat, lon, units),
                fetchForecastData(lat, lon, units),
            ]);

            setLoading(false);
            return { currentWeather, forecast };
        } catch (err) {
            setLoading(false);

            let errorMessage = "Something went wrong. Please try again.";

            if (err.response) {
                if (err.response.status === 404) {
                    errorMessage = "City not found. Please try another city.";
                } else if (err?.response?.status === 429) {
                    errorMessage = "API request limit exceeded. Try again later.";
                } else {
                    errorMessage = "Error fetching data. Please try again.";
                }
            } else if (err?.request) {
                errorMessage = "Network issue. Check your connection.";
            }

            setError(errorMessage);
            toast.error(errorMessage, { position: "top-right" });
            const level = err?.response ? "warn" : "error";
            console[level]("API Error:", {
                message: err?.message,
                status: err?.response?.status,
                data: err?.response?.data,
            });
            return { error: errorMessage };
        }
    };

    return { fetchWeather, error, loading };
};

export default useFetchWeather;