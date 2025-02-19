require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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
        res.status(500).json({ error: "Failed to fetch weather data" });
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
        res.status(500).json({ error: "Failed to fetch forecast data" });
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
                minPopulation: 1000000,
                namePrefix: query,
            },
        });

        if (!response.data || !Array.isArray(response.data.data)) {
            console.error("Invalid API response format", response.data);
            return res.status(500).json({ error: "Unexpected API response format" });
        }

        res.json(response.data.data);
    } catch (error) {
        console.error("Error fetching city data:", error.message);
        if (error.response && error.response.status === 429) {
            return res.status(429).json({ error: "API Limit Reached. Try again later." });
        }
        res.status(500).json({ error: "Failed to fetch city data" });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
