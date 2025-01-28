export const API_CONFIG = {
    BASE_GEO_API_URL: "https://wft-geo-db.p.rapidapi.com/v1/geo/cities",
    headers: {
        "x-rapidapi-key": process.env.REACT_APP_RAPIDAPI_KEY,
        "x-rapidapi-host": "wft-geo-db.p.rapidapi.com"
    },
};

export const fetchCities = async (query) => {
    try {
        const response = await fetch(
            `${API_CONFIG.BASE_GEO_API_URL}?minPopulation=1000000&namePrefix=${query}`,
            { method: "GET", headers: API_CONFIG.headers }
        );
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error("API fetch error:", error);
        throw error;
    }
};