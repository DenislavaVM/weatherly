import { useState } from "react";
import { fetchWeatherData, fetchForecastData } from "../api/weatherApi";
import { toast } from "react-toastify";

const useFetchWeather = () => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchWeather = async (lat, lon) => {
        setError(null);
        setLoading(true);
        try {
            const [currentWeather, forecast] = await Promise.all([
                fetchWeatherData(lat, lon),
                fetchForecastData(lat, lon),
            ]);

            setLoading(false);
            return { currentWeather, forecast };
        } catch (err) {
            setLoading(false);

            let errorMessage = "Something went wrong. Please try again.";

            if (err.response) {
                if (err.response.status === 404) {
                    errorMessage = "City not found. Please try another city.";
                } else if (err.response.status === 429) {
                    errorMessage = "API request limit exceeded. Try again later.";
                } else {
                    errorMessage = "Error fetching data. Please try again.";
                }
            } else if (err.request) {
                errorMessage = "Network issue. Check your connection.";
            }

            setError(errorMessage);
            toast.error(errorMessage, { position: "top-right" });
            console.error("API Error:", err);
            return { error: errorMessage };
        }
    };

    return { fetchWeather, error, loading };
};

export default useFetchWeather;