require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1);

if (!process.env.OPENWEATHER_API_KEY) {
    console.warn("[WARN] OPENWEATHER_API_KEY is not set.");
}
if (!process.env.RAPIDAPI_KEY) {
    console.warn("[WARN] RAPIDAPI_KEY is not set (used by /api/cities).");
}

const allowedOrigins = new Set([
    "https://weatherly-tau-three.vercel.app",
    "https://weatherly-x2x7.onrender.com",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]);

app.use((req, res, next) => {
    res.setHeader(
        "Vary",
        ["Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"].join(", ")
    );
    next();
});

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (process.env.NODE_ENV === "production") {
        try {
            const host = origin ? new URL(origin).hostname : "∅";
            console.log("[CORS]", { host, path: req.path });
        } catch {
            console.log("[CORS]", { host: "invalid", path: req.path });
        }
    } else {
        console.log("[CORS] Origin:", origin, "Path:", req.path);
    }
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
    }

    const isAllowed = allowedOrigins.has(origin);
    callback(null, {
        origin: isAllowed ? origin : false,
        methods: ["GET", "OPTIONS", "HEAD"],
        credentials: false,
        maxAge: 86400,
        optionsSuccessStatus: 204,
    });
};

app.use(
    helmet({
        crossOriginResourcePolicy: false,
        contentSecurityPolicy: false,
    })
);
app.use(compression());
app.use(cors(corsOptionsDelegate));
app.options("/api/*", cors(corsOptionsDelegate));

app.use("/api", (req, res, next) => {
    const origin = req.headers.origin;
    if (origin && !allowedOrigins.has(origin)) {
        return res.status(403).json({ error: { code: "CORS_FORBIDDEN", message: "Origin is not allowed" } });
    }
    next();
});

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false });
app.use("/api/", limiter);

const citiesLimiter = rateLimit({ windowMs: 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false });
app.use("/api/cities", citiesLimiter);

app.use(express.json());

const buildPath = path.join(__dirname, "../build");
const hasBuild = fs.existsSync(buildPath);
if (hasBuild) {
    app.use(
        express.static(buildPath, {
            maxAge: "7d",
            setHeaders: (res, filePath) => {
                if (filePath.endsWith(".html")) {
                    res.setHeader("Cache-Control", "no-cache");
                } else {
                    res.setHeader("Cache-Control", "public, max-age=604800, immutable");
                }
            },
        })
    );
};

const cache = new Map();

const handleError = (res, error, fallbackMessage) => {
    const requestId = Math.random().toString(36).slice(2, 10);
    console.error(`[ERR ${requestId}]`, error?.message || error);
    const status = error?.response?.status || 500;
    const code = error?.code || error?.response?.data?.cod || "SERVER_ERROR";
    const message = error?.response?.data?.message || fallbackMessage;
    res.status(status).json({ error: { code, message, requestId, ts: new Date().toISOString() } });
};

app.get("/api/weather", async (req, res) => {
    const { lat, lon, units } = req.query;
    const latN = Number(lat),
        lonN = Number(lon);
    const unitsSafe = units === "imperial" || units === "metric" ? units : "metric";

    if (
        !Number.isFinite(latN) ||
        !Number.isFinite(lonN) ||
        latN < -90 ||
        latN > 90 ||
        lonN < -180 ||
        lonN > 180
    ) {
        return res.status(400).json({ error: { code: "INVALID_COORDS", message: "Invalid coordinates" } });
    }

    try {
        const lang = (typeof req.acceptsLanguages === "function" ? req.acceptsLanguages() : [])[0]?.slice(0, 2) || "en";

        const key = `weather:${latN}:${lonN}:${unitsSafe}:${lang}`;
        const cached = cache.get(key);
        if (cached && cached.expires > Date.now()) {
            res.setHeader("Cache-Control", "public, max-age=60");
            return res.json(cached.data);
        }

        const response = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
            params: {
                lat: latN,
                lon: lonN,
                units: unitsSafe,
                lang,
                appid: process.env.OPENWEATHER_API_KEY,
            },
            timeout: 10000,
        });

        cache.set(key, { data: response.data, expires: Date.now() + 60 * 1000 });
        res.setHeader("Cache-Control", "public, max-age=60");
        res.json(response.data);
    } catch (error) {
        handleError(res, error, "Failed to fetch weather data");
    }
});

app.get("/api/forecast", async (req, res) => {
    const { lat, lon, units } = req.query;
    const latN = Number(lat),
        lonN = Number(lon);
    const unitsSafe = units === "imperial" || units === "metric" ? units : "metric";

    if (
        !Number.isFinite(latN) ||
        !Number.isFinite(lonN) ||
        latN < -90 ||
        latN > 90 ||
        lonN < -180 ||
        lonN > 180
    ) {
        return res.status(400).json({ error: { code: "INVALID_COORDS", message: "Invalid coordinates" } });
    }

    try {
        const lang = (typeof req.acceptsLanguages === "function" ? req.acceptsLanguages() : [])[0]?.slice(0, 2) || "en";

        const key = `forecast:${latN}:${lonN}:${unitsSafe}:${lang}`;
        const cached = cache.get(key);
        if (cached && cached.expires > Date.now()) {
            res.setHeader("Cache-Control", "public, max-age=60");
            return res.json(cached.data);
        }

        const response = await axios.get("https://api.openweathermap.org/data/2.5/forecast", {
            params: {
                lat: latN,
                lon: lonN,
                units: unitsSafe,
                lang,
                appid: process.env.OPENWEATHER_API_KEY,
            },
            timeout: 10000,
        });

        cache.set(key, { data: response.data, expires: Date.now() + 60 * 1000 });
        res.setHeader("Cache-Control", "public, max-age=60");
        res.json(response.data);
    } catch (error) {
        handleError(res, error, "Failed to fetch forecast data");
    }
});

app.get("/api/cities", async (req, res) => {
    const { query } = req.query;
    const DEFAULT_MIN_POP = Number(process.env.MIN_CITY_POP || 200000);
    const userMin = Number(req.query.minPop);
    const minPopulation = Number.isFinite(userMin) && userMin >= 0 ? userMin : DEFAULT_MIN_POP;

    if (!query) {
        return res.status(400).json({ error: { code: "MISSING_QUERY", message: "City query is required" } });
    };
    if (String(query).trim().length < 2) {
        return res.status(400).json({ error: { code: "QUERY_TOO_SHORT", message: "Query must be at least 2 characters" } });
    };

    try {
        const response = await axios.get("https://wft-geo-db.p.rapidapi.com/v1/geo/cities", {
            headers: {
                "x-rapidapi-key": process.env.RAPIDAPI_KEY,
                "x-rapidapi-host": "wft-geo-db.p.rapidapi.com",
            },
            params: {
                namePrefix: query,
                minPopulation,
                limit: 10,
            },
            timeout: 10000,
        });

        if (!response.data || !Array.isArray(response.data.data)) {
            return res.status(500).json({ error: { code: "BAD_UPSTREAM", message: "Unexpected API response format" } });
        };

        res.json(response.data.data);
    } catch (error) {
        handleError(res, error, "Failed to fetch city data");
    };
});

app.get("/", (req, res) => {
    if (hasBuild) return res.redirect(302, "/index.html");
    res.send("Weatherly API is running.");
});

app.get("/api/health", (req, res) => res.status(200).json({ ok: true }));

app.get("/api/version", (req, res) => {
    res.json({
        name: "weatherly-server",
        node: process.versions.node,
        env: process.env.NODE_ENV || "development",
        allowlistCount: allowedOrigins.size,
        time: new Date().toISOString(),
    });
});

if (hasBuild) {
    app.get("*", (req, res) => {
        res.sendFile(path.join(buildPath, "index.html"));
    });
};

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));