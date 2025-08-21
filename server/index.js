require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.OPENWEATHER_API_KEY) {
    console.warn("[WARN] OPENWEATHER_API_KEY is not set.");
};

if (!process.env.RAPIDAPI_KEY) {
    console.warn("[WARN] RAPIDAPI_KEY is not set (used by /api/cities).");
};

const allowedOrigins = new Set([
    "https://weatherly-tau-three.vercel.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]);

app.use((req, _res, next) => {
    console.log("[CORS] Origin:", req.headers.origin, "Path:", req.path);
    next();
});

const corsOptionsDelegate = (req, callback) => {
    const origin = req.header("Origin");

    if (!origin) {
        return callback(null, {
            origin: true,
            methods: ["GET", "OPTIONS", "HEAD"],
            maxAge: 86400,
            optionsSuccessStatus: 204,
        });
    };

    const isAllowed = allowedOrigins.has(origin);
    callback(null, {
        origin: isAllowed ? origin : false,
        methods: ["GET", "OPTIONS", "HEAD"],
        credentials: false,
        maxAge: 86400,
        optionsSuccessStatus: 204,
    });
};

app.use(cors(corsOptionsDelegate));
app.options("/api/*", cors(corsOptionsDelegate));

app.use(express.json());
app.use(express.static(path.join(__dirname, "../build")));

const handleError = (res, error, fallbackMessage) => {
    console.error(error?.message || error);
    const status = error?.response?.status || 500;
    const raw = error?.response?.data?.message ?? error?.message ?? fallbackMessage;
    const message = typeof raw === "string" ? raw : fallbackMessage;
    res.status(status).json({ error: message });
};

app.get("/api/weather", async (req, res) => {
    const { lat, lon, units } = req.query;
    const latN = Number(lat), lonN = Number(lon);
    if (
        !Number.isFinite(latN) ||
        !Number.isFinite(lonN) ||
        latN < -90 || latN > 90 ||
        lonN < -180 || lonN > 180
    ) {
        return res.status(400).json({ error: "Invalid coordinates" });
    };

    try {
        const response = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
            params: {
                lat: latN,
                lon: lonN,
                units: units === "imperial" ? "imperial" : "metric",
                appid: process.env.OPENWEATHER_API_KEY,
            },
            timeout: 10000,
        });

        res.json(response.data);
    } catch (error) {
        handleError(res, error, "Failed to fetch weather data");
    };
});

app.get("/api/forecast", async (req, res) => {
    const { lat, lon, units } = req.query;
    const latN = Number(lat), lonN = Number(lon);
    if (
        !Number.isFinite(latN) ||
        !Number.isFinite(lonN) ||
        latN < -90 || latN > 90 ||
        lonN < -180 || lonN > 180
    ) {
        return res.status(400).json({ error: "Invalid coordinates" });
    };

    try {
        const response = await axios.get("https://api.openweathermap.org/data/2.5/forecast", {
            params: {
                lat: latN,
                lon: lonN,
                units: units === "imperial" ? "imperial" : "metric",
                appid: process.env.OPENWEATHER_API_KEY,
            },
            timeout: 10000,
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
        const response = await axios.get("https://wft-geo-db.p.rapidapi.com/v1/geo/cities", {
            headers: {
                "x-rapidapi-key": process.env.RAPIDAPI_KEY,
                "x-rapidapi-host": "wft-geo-db.p.rapidapi.com",
            },
            params: {
                namePrefix: query,
                minPopulation: 1000000,
                limit: 10,
            },
            timeout: 10000,
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
    res.send(
        "Weatherly API is running. Visit the frontend at https://weatherly-tau-three.vercel.app/"
    );
});

app.get("/api/health", (req, res) => res.status(200).json({ ok: true }));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../build", "index.html"));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));