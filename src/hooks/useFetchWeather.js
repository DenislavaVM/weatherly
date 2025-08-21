import { useState } from "react";
import { fetchWeatherData, fetchForecastData } from "../api/weatherApi";
import { toast } from "react-toastify";

const useFetchWeather = () => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const parseFetchError = (err) => {
        if (err?.name === "AbortError") return "Request aborted.";
        if (typeof err?.status === "number") {
            if (err.status === 404) return "City not found. Please try another city.";
            if (err.status === 429) return "API request limit exceeded. Try again later.";
            if (err.status >= 500) return "Upstream service error. Please try again.";
        }
        if (/NetworkError|Failed to fetch|network/i.test(err?.message || "")) {
            return "Network issue. Check your connection.";
        }
        return err?.message || "Error fetching data. Please try again.";
    };

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
            const errorMessage = parseFetchError(err);
            setError(errorMessage);
            toast.error(errorMessage, { position: "top-right" });
            console.error("API Error:", {
                message: err?.message,
                status: err?.status,
                body: err?.body,
            });
            return { error: errorMessage };
        };
    };

    return { fetchWeather, error, loading };
};

export default useFetchWeather;