import { fetchData } from "./apiClient";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const fetchCities = async (query, signal) => {
    try {
        const response = await fetchData(`${BASE_URL}/api/cities?query=${encodeURIComponent(query)}`, {}, 6, signal, 800);

        if (!response || !Array.isArray(response)) {
            console.error("Unexpected API response format:", response);
            throw new Error("Invalid API response structure");
        };

        if (response.length === 0) {
            return [{ name: "No Cities Found", countryCode: "N/A" }];
        };

        return response;
    } catch (error) {
        if (error.name === "AbortError") {
            return [];
        };

        console.error("Error in fetchCities:", error);
        return [{ name: "Failed to Load Cities", countryCode: "Error" }];
    }
};