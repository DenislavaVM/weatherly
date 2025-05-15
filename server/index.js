require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const handleError = (res, error, fallbackMessage) => {
    console.error(error.message || error);
    const status = error?.response?.status || 500;
    const message = error?.response?.data?.message || fallbackMessage;
    res.status(status).json({ error: message });
};

app.get("/api/weather", async (req, res) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
        return res.status(400).json({ error: "Latitude and longitude are required" });
    }

    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: {
                lat,
                lon,
                units: "metric",
                appid: process.env.OPENWEATHER_API_KEY,
            },
        });

        res.json(response.data);
    } catch (error) {
        handleError(res, error, "Failed to fetch weather data");
    }
});

app.get("/api/forecast", async (req, res) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
        return res.status(400).json({ error: "Latitude and longitude are required" });
    }

    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast`, {
            params: {
                lat,
                lon,
                units: "metric",
                appid: process.env.OPENWEATHER_API_KEY,
            },
        });

        res.json(response.data);
    } catch (error) {
        handleError(res, error, "Failed to fetch forecast data");
    }
});

app.get("/api/cities", async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ error: "City query is required" });
    }

    try {
        const response = await axios.get(`https://wft-geo-db.p.rapidapi.com/v1/geo/cities`, {
            headers: {
                "x-rapidapi-key": process.env.RAPIDAPI_KEY,
                "x-rapidapi-host": "wft-geo-db.p.rapidapi.com",
            },
            params: {
                namePrefix: query,
                minPopulation: 1000000,
                limit: 10,
            },
        });

        if (!response.data || !Array.isArray(response.data.data)) {
            return res.status(500).json({ error: "Unexpected API response format" });
        }

        res.json(response.data.data);
    } catch (error) {
        handleError(res, error, "Failed to fetch city data");
    }
});

app.get("/", (req, res) => {
  res.send("Weatherly API is running. Visit the frontend at https://weatherly-tau-three.vercel.app/");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));