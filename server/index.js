require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = new Set([
    "https://weatherly-tau-three.vercel.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]);

const vercelPreview = /^https?:\/\/([a-z0-9-]+\.)*vercel\.app$/i;

if (process.env.NODE_ENV === "production") {
    app.use(
        cors({
            origin(origin, callback) {
                if (!origin) return callback(null, true);

                if (allowedOrigins.has(origin) || vercelPreview.test(origin)) {
                    return callback(null, true);
                }

                return callback(null, false);
            },
            methods: ["GET", "OPTIONS"],
            optionsSuccessStatus: 204,
            maxAge: 86400,
        }),
    );
} else {
    app.use(cors({ origin: true }));
};

app.options("*", cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../build")));

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

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../build", "index.html"));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));